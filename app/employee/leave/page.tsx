"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Send,
  XCircle,
} from "lucide-react";

import { getMyLeaveRequests } from "@/app/actions/leave-history";
import { submitLeave } from "@/app/actions/leave";

type LeaveRecord = {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at?: string;
};

export default function LeavePage() {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLeaves = async () => {
    setLoading(true);

    const result = await getMyLeaveRequests();

    if (result.success) {
      setRecords((result.data ?? []) as LeaveRecord[]);
      setError("");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const pending = records.filter(
    (record) => record.status.toLowerCase() === "pending"
  ).length;

  const approved = records.filter(
    (record) => record.status.toLowerCase() === "approved"
  ).length;

  const rejected = records.filter(
    (record) => record.status.toLowerCase() === "rejected"
  ).length;

  const leaveDays = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference < 0) return 0;

    return (
      Math.floor(difference / (1000 * 60 * 60 * 24)) + 1
    );
  }, [startDate, endDate]);

  const submitLeaveRequest = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!startDate || !endDate) {
      setError("Please select the leave dates.");
      return;
    }

    if (leaveDays <= 0) {
      setError("End date must be after the start date.");
      return;
    }

    setSubmitting(true);

    const result = await submitLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim(),
    });

    if (result.success) {
      setMessage(
        result.message || "Leave request submitted successfully."
      );

      setLeaveType("Casual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");

      await loadLeaves();
    } else {
      setError(result.message);
    }

    setSubmitting(false);
  };

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${value}T00:00:00`));
  };

  const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "approved") {
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "rejected") {
      return "border-rose-100 bg-rose-50 text-rose-700";
    }

    return "border-amber-100 bg-amber-50 text-amber-700";
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <button
              onClick={() => window.history.back()}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
              Employee workspace
            </p>

            <h1 className="text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Leave
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Request time off, track approval status,
              and review your leave history.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Requests
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {records.length} total
              </p>
            </div>

          </div>

        </header>

        {/* =====================================================
            FEEDBACK
        ====================================================== */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            <XCircle size={19} />
            {error}
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <section className="mb-6 grid gap-4 md:grid-cols-3">

          <StatCard
            label="Pending"
            value={String(pending)}
            description="Awaiting approval"
            icon={<Clock3 size={19} />}
          />

          <StatCard
            label="Approved"
            value={String(approved)}
            description="Approved requests"
            icon={<CheckCircle2 size={19} />}
          />

          <StatCard
            label="Rejected"
            value={String(rejected)}
            description="Rejected requests"
            icon={<XCircle size={19} />}
          />

        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">

          {/* ===================================================
              APPLY FORM
          =================================================== */}

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">

            <div className="mb-7">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Plus size={21} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                New request
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                Apply for leave
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit your leave request for manager approval.
              </p>

            </div>

            <form
              onSubmit={submitLeaveRequest}
              className="space-y-5"
            >

              {/* LEAVE TYPE */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Leave type
                </label>

                <select
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                >
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Earned Leave</option>
                  <option>Unpaid Leave</option>
                </select>

              </div>

              {/* DATES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Start date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    End date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                    required
                  />

                </div>

              </div>

              {/* DURATION */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-semibold text-slate-400">
                    Leave duration
                  </span>

                  <span className="text-sm font-black text-slate-900">
                    {leaveDays > 0
                      ? `${leaveDays} ${
                          leaveDays === 1
                            ? "day"
                            : "days"
                        }`
                      : "Select dates"}
                  </span>

                </div>

              </div>

              {/* REASON */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Briefly explain the reason for your leave..."
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                />

                <p className="mt-1 text-right text-[10px] text-slate-400">
                  {reason.length}/500
                </p>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Send size={17} />

                {submitting
                  ? "Submitting request..."
                  : "Submit leave request"}

              </button>

            </form>

          </div>

          {/* ===================================================
              HISTORY
          =================================================== */}

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">

            <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:p-8">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Request history
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                  My leave requests
                </h2>

              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 sm:flex">
                <FileText size={19} />
              </div>

            </div>

            {loading ? (

              <div className="space-y-4 p-6 sm:p-8">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}

              </div>

            ) : records.length > 0 ? (

              <div className="divide-y divide-slate-100">

                {records.map((record) => (

                  <div
                    key={record.id}
                    className="p-6 transition hover:bg-slate-50 sm:p-7"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                          <CalendarDays size={18} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-black text-slate-900">
                              {record.leave_type}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>

                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-700">
                            {formatDate(record.start_date)}{" "}
                            →{" "}
                            {formatDate(record.end_date)}
                          </p>

                          {record.reason && (
                            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
                              {record.reason}
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="shrink-0 text-left sm:text-right">

                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Request
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          #{record.id}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="p-12 text-center sm:p-16">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <CalendarDays size={28} />
                </div>

                <h3 className="mt-5 font-black text-slate-800">
                  No leave requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  When you submit a leave request, its approval
                  status and details will appear here.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-5 flex items-center justify-between">

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>

        <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 transition group-hover:scale-105">
          {icon}
        </div>

      </div>

      <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400">
        {description}
      </p>

    </div>
  );
}