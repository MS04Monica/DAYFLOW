"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  getAllLeaveRequests,
  updateLeaveDecision,
} from "@/app/actions/admin-leave";

type EmployeeProfile = {
  employee_id: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
};

type LeaveRequest = {
  id: number;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  profiles: EmployeeProfile[] | EmployeeProfile | null;
};

type Filter =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

function getEmployeeProfile(
  profiles: LeaveRequest["profiles"]
): EmployeeProfile | null {
  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
}

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selected, setSelected] =
    useState<LeaveRequest | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [adminComment, setAdminComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRequests() {
    setLoading(true);
    setError("");

    const result = await getAllLeaveRequests();

    if (result.success) {
      setRequests(
        (result.data ?? []) as unknown as LeaveRequest[]
      );
    } else {
      setError(result.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = requests.filter(
    (request) =>
      request.status.toUpperCase() === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) =>
      request.status.toUpperCase() === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) =>
      request.status.toUpperCase() === "REJECTED"
  ).length;

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status = request.status.toUpperCase();
      const employee = getEmployeeProfile(
        request.profiles
      );

      const matchesFilter =
        filter === "ALL" || status === filter;

      const searchable = [
        employee?.name,
        employee?.employee_id,
        employee?.email,
        employee?.department,
        employee?.designation,
        request.leave_type,
        request.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        (!query || searchable.includes(query))
      );
    });
  }, [requests, search, filter]);

  async function handleDecision(
    decision: "APPROVED" | "REJECTED"
  ) {
    if (!selected) return;

    setProcessing(true);
    setMessage("");
    setError("");

    const result = await updateLeaveDecision({
      leaveId: selected.id,
      decision,
      adminComment: adminComment.trim(),
    });

    if (result.success) {
      setMessage(result.message);
      setSelected(null);
      setAdminComment("");

      await loadRequests();
    } else {
      setError(result.message);
    }

    setProcessing(false);
  }

  const initials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((part) => part.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px]">

        {/* HEADER */}

        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
            Workforce operations
          </p>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Leave Requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Review employee leave applications and make
                approval decisions from one centralized workspace.
              </p>
            </div>

            <button
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
            >
              <Clock3 size={16} />

              {loading
                ? "Refreshing..."
                : "Refresh requests"}
            </button>
          </div>
        </header>

        {/* FEEDBACK */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Clock3 size={18} />}
            label="Pending"
            value={pendingCount}
            description="Awaiting admin decision"
            type="warning"
          />

          <StatCard
            icon={<Check size={18} />}
            label="Approved"
            value={approvedCount}
            description="Approved requests"
            type="success"
          />

          <StatCard
            icon={<X size={18} />}
            label="Rejected"
            value={rejectedCount}
            description="Rejected requests"
            type="danger"
          />
        </section>

        {/* REQUESTS */}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)]">

          {/* TOOLBAR */}

          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <FileText size={17} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Applications
                  </h2>

                  <p className="text-xs text-slate-400">
                    {filteredRequests.length} request
                    {filteredRequests.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search employee or leave type..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>
            </div>

            {/* FILTERS */}

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["ALL", "All"],
                  ["PENDING", "Pending"],
                  ["APPROVED", "Approved"],
                  ["REJECTED", "Rejected"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                    filter === value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText size={23} />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No leave requests found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are no requests matching your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Leave
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Duration
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((request) => {
                    const employee =
                      getEmployeeProfile(
                        request.profiles
                      );

                    return (
                      <tr
                        key={request.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        {/* EMPLOYEE */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                              {initials(
                                employee?.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {employee?.name ??
                                  "Unknown employee"}
                              </p>

                              <p className="mt-1 font-mono text-[10px] font-bold text-cyan-600">
                                {employee?.employee_id ??
                                  request.employee_id}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* LEAVE */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                              <CalendarDays size={15} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {request.leave_type}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {employee?.department ??
                                  "No department"}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* DURATION */}

                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-slate-700">
                            {request.start_date}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            to {request.end_date}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={request.status}
                          />
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() =>
                              setSelected(request)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            Review
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}
        </section>
      </div>

      {/* REVIEW DRAWER */}

      {selected && (
        <div className="fixed inset-0 z-50">

          <button
            aria-label="Close review"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-[#f8fafc] shadow-2xl">

            {/* DRAWER HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-xl">

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">
                  Leave application
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Review request
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelected(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* EMPLOYEE */}

              <section className="rounded-[24px] bg-slate-950 p-6 text-white">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-lg font-black text-slate-950">
                    {initials(
                      getEmployeeProfile(
                        selected.profiles
                      )?.name
                    )}
                  </div>

                  <div>

                    <p className="text-lg font-black">
                      {getEmployeeProfile(
                        selected.profiles
                      )?.name ??
                        "Unknown employee"}
                    </p>

                    <p className="mt-1 font-mono text-[10px] font-bold text-cyan-300">
                      {getEmployeeProfile(
                        selected.profiles
                      )?.employee_id ??
                        selected.employee_id}
                    </p>

                  </div>

                </div>

              </section>

              {/* DETAILS */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">
                  Request details
                </p>

                <div className="mt-5 space-y-4">

                  <DetailRow
                    icon={<CalendarDays size={16} />}
                    label="Leave type"
                    value={selected.leave_type}
                  />

                  <DetailRow
                    icon={<Clock3 size={16} />}
                    label="Duration"
                    value={`${selected.start_date} → ${selected.end_date}`}
                  />

                  <DetailRow
                    icon={<UserRound size={16} />}
                    label="Designation"
                    value={
                      getEmployeeProfile(
                        selected.profiles
                      )?.designation ??
                      "Not assigned"
                    }
                  />

                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Employee reason
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selected.reason}
                  </p>

                </div>

              </section>

              {/* ADMIN COMMENT */}

              {selected.status.toUpperCase() ===
                "PENDING" && (
                <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                  <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Admin comment
                  </label>

                  <textarea
                    value={adminComment}
                    onChange={(event) =>
                      setAdminComment(
                        event.target.value
                      )
                    }
                    maxLength={500}
                    rows={4}
                    placeholder="Optional note for the employee..."
                    className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />

                  <p className="mt-2 text-right text-[10px] text-slate-400">
                    {adminComment.length}/500
                  </p>

                </section>
              )}

              {/* DECISION */}

              {selected.status.toUpperCase() ===
              "PENDING" ? (
                <div className="grid gap-3 sm:grid-cols-2">

                  <button
                    disabled={processing}
                    onClick={() =>
                      handleDecision("REJECTED")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    <X size={17} />

                    {processing
                      ? "Processing..."
                      : "Reject"}
                  </button>

                  <button
                    disabled={processing}
                    onClick={() =>
                      handleDecision("APPROVED")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Check size={17} />

                    {processing
                      ? "Processing..."
                      : "Approve"}
                  </button>

                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Current decision
                  </p>

                  <div className="mt-3">
                    <StatusBadge
                      status={selected.status}
                    />
                  </div>

                  {selected.admin_comment && (
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {selected.admin_comment}
                    </p>
                  )}

                </div>
              )}

            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
  description,
  type,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  type: "warning" | "success" | "danger";
}) {
  const styles = {
    warning: "bg-amber-50 text-amber-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[type]}`}
        >
          {icon}
        </div>

        <p className="text-3xl font-black tracking-[-0.05em] text-slate-950">
          {value}
        </p>

      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();

  const styles =
    normalized === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "REJECTED"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black capitalize ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.toLowerCase()}
    </span>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <div>

        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}