"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { handleAttendance } from "@/app/actions/attendance";
import { getMyAttendance } from "@/app/actions/attendance-history";

type AttendanceRecord = {
  id: number;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<
    "check_in" | "check_out" | null
  >(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);

    const result = await getMyAttendance();

    if (result.success) {
      setRecords((result.data ?? []) as AttendanceRecord[]);
      setError("");
    } else {
      setError(result.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const todayRecord = records.find(
    (record) => record.date === today
  );

  const checkedIn = Boolean(todayRecord?.check_in);
  const checkedOut = Boolean(todayRecord?.check_out);

  const handleAction = async (
    action: "check_in" | "check_out"
  ) => {
    setActionLoading(action);
    setMessage("");
    setError("");

    const result = await handleAttendance({ action });

    if (result.success) {
      setMessage(result.message);
      await loadAttendance();
    } else {
      setError(result.message);
    }

    setActionLoading(null);
  };

  const presentDays = records.filter(
    (record) => record.status === "Present"
  ).length;

  const totalHours = records.reduce(
    (total, record) =>
      total + Number(record.working_hours ?? 0),
    0
  );

  const averageHours =
    records.length > 0
      ? totalHours / records.length
      : 0;

  const attendancePercentage =
    records.length > 0
      ? Math.round(
          (presentDays / records.length) * 100
        )
      : 0;

  const formatTime = (value?: string | null) => {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  };

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${value}T00:00:00`));
  };

  const statusClass = (status: string) => {
    if (status === "Present") {
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (status === "Half-day") {
      return "border-amber-100 bg-amber-50 text-amber-700";
    }

    return "border-rose-100 bg-rose-50 text-rose-700";
  };

  /*
   * Always generate seven calendar positions.
   *
   * This is important because if the employee has only one
   * attendance record, we still want Mon-Sun displayed.
   */
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();

      date.setDate(
        date.getDate() - (6 - index)
      );

      const dateString =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(date);

      const record = records.find(
        (item) => item.date === dateString
      );

      return {
        date: dateString,
        record,
        hours: Number(
          record?.working_hours ?? 0
        ),
        label: new Intl.DateTimeFormat(
          "en-IN",
          {
            weekday: "short",
            timeZone: "Asia/Kolkata",
          }
        ).format(date),
        day: new Intl.DateTimeFormat(
          "en-IN",
          {
            day: "numeric",
            timeZone: "Asia/Kolkata",
          }
        ).format(date),
      };
    });
  }, [records]);

  const weeklyTotal = weeklyData.reduce(
    (sum, day) => sum + day.hours,
    0
  );

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            PAGE HEADER
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
              Attendance
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Track your daily attendance, working hours,
              and attendance performance from one place.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Today
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    timeZone: "Asia/Kolkata",
                  }
                ).format(new Date())}
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
            TODAY HERO
        ====================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[32px] bg-[#06101f] shadow-[0_25px_70px_rgba(15,23,42,0.16)]">

          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_430px] lg:items-center">

            {/* LEFT */}

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-black tracking-[0.15em] text-cyan-300">

                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

                TODAY'S ATTENDANCE

              </div>

              <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-5xl">

                {checkedOut
                  ? "Your workday is complete."
                  : checkedIn
                  ? "You're currently working."
                  : "Start your workday."}

              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">

                {checkedOut
                  ? "Your attendance for today has been successfully recorded."
                  : checkedIn
                  ? `Checked in at ${formatTime(
                      todayRecord?.check_in
                    )}. Remember to check out when you're done.`
                  : "Check in when you begin work. Your working hours will be calculated automatically when you check out."}

              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    handleAction("check_in")
                  }
                  disabled={
                    checkedIn ||
                    Boolean(actionLoading)
                  }
                  className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LogIn size={19} />

                  {actionLoading === "check_in"
                    ? "Checking in..."
                    : "Check in"}
                </button>

                <button
                  onClick={() =>
                    handleAction("check_out")
                  }
                  disabled={
                    !checkedIn ||
                    checkedOut ||
                    Boolean(actionLoading)
                  }
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LogOut size={19} />

                  {actionLoading === "check_out"
                    ? "Checking out..."
                    : "Check out"}
                </button>

              </div>

            </div>

            {/* TODAY RECORD */}

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">

              <div className="mb-6 flex items-center justify-between">

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Today's record
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
                    checkedOut
                      ? "bg-emerald-400/10 text-emerald-300"
                      : checkedIn
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {checkedOut
                    ? "COMPLETED"
                    : checkedIn
                    ? "WORKING"
                    : "NOT STARTED"}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <TimeCard
                  label="Check in"
                  value={formatTime(
                    todayRecord?.check_in
                  )}
                  icon={<LogIn size={16} />}
                />

                <TimeCard
                  label="Check out"
                  value={formatTime(
                    todayRecord?.check_out
                  )}
                  icon={<LogOut size={16} />}
                />

              </div>

              <div className="mt-3 rounded-2xl bg-cyan-400/10 p-5">

                <div className="mb-2 flex items-center gap-2 text-cyan-300">

                  <Clock3 size={16} />

                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Working hours
                  </span>

                </div>

                <p className="text-3xl font-black text-white">

                  {Number(
                    todayRecord?.working_hours ?? 0
                  ).toFixed(2)}

                  <span className="ml-1 text-base font-semibold text-slate-500">
                    hrs
                  </span>

                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <section className="mb-6 grid gap-4 md:grid-cols-3">

          <StatCard
            label="Present days"
            value={String(presentDays)}
            description="Recorded attendance"
            icon={<CheckCircle2 size={19} />}
          />

          <StatCard
            label="Attendance rate"
            value={`${attendancePercentage}%`}
            description="Based on recorded days"
            icon={<TrendingUp size={19} />}
          />

          <StatCard
            label="Average hours"
            value={`${averageHours.toFixed(1)}h`}
            description="Average per recorded day"
            icon={<Clock3 size={19} />}
          />

        </section>

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">

          {/* GRAPH */}

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Performance
                  </p>

                </div>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                  Working hours
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your attendance performance over the last 7 days.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="hidden items-center gap-2 sm:flex">

                  <span className="h-px w-5 border-t border-dashed border-cyan-400" />

                  <span className="text-[10px] font-semibold text-slate-400">
                    8h target
                  </span>

                </div>

                <div className="rounded-xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700">
                  Last 7 days
                </div>

              </div>

            </div>

            <div className="px-5 pb-6 pt-5 sm:px-8">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Total recorded
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {weeklyTotal.toFixed(2)}h
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-xs font-semibold text-slate-400">
                    Daily target
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    8.00h
                  </p>

                </div>

              </div>

              {/* CHART */}

              <div className="relative h-[350px] rounded-[22px] bg-[#fafcfe] p-4 sm:p-6">

                {/* GRID */}

                <div className="absolute inset-x-12 bottom-16 top-8 flex flex-col justify-between">

                  {[8, 6, 4, 2, 0].map(
                    (hour) => (
                      <div
                        key={hour}
                        className="relative flex items-center"
                      >

                        <span className="absolute -left-9 w-7 text-right text-[10px] font-semibold text-slate-400">
                          {hour}h
                        </span>

                        <div className="h-px w-full bg-slate-200/80" />

                      </div>
                    )
                  )}

                  {/* TARGET */}

                  <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-cyan-400/70" />

                </div>

                {/* BARS */}

                <div className="absolute inset-x-12 bottom-16 top-8 flex items-end justify-between gap-2">

                  {weeklyData.map(
                    (day) => {

                      const hours = day.hours;

                      const barHeight =
                        hours > 0
                          ? Math.max(
                              10,
                              Math.min(
                                100,
                                (hours / 8) *
                                  100
                              )
                            )
                          : 3;

                      const isToday =
                        day.date === today;

                      return (
                        <div
                          key={day.date}
                          className="group relative flex h-full flex-1 flex-col justify-end"
                        >

                          {/* TODAY HIGHLIGHT */}

                          {isToday && (
                            <div className="absolute inset-x-[-8px] top-[-8px] bottom-[-8px] rounded-2xl bg-cyan-50/70" />
                          )}

                          {/* TOOLTIP */}

                          {hours > 0 && (
                            <div
                              className="absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100"
                              style={{
                                bottom: `calc(${barHeight}% + 8px)`,
                              }}
                            >
                              {hours.toFixed(2)}h
                            </div>
                          )}

                          {/* BAR */}

                          <div
                            className={`relative z-10 mx-auto w-full max-w-[46px] rounded-t-[12px] transition-all duration-300 group-hover:scale-[1.04] ${
                              hours > 0
                                ? "bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-300 shadow-[0_8px_20px_rgba(6,182,212,0.22)]"
                                : "bg-slate-200"
                            }`}
                            style={{
                              height: `${barHeight}%`,
                            }}
                          >

                            {hours > 0 && (
                              <div className="absolute left-1.5 right-1.5 top-1.5 h-1 rounded-full bg-white/40" />
                            )}

                          </div>

                          {/* DAY LABEL */}

                          <div className="relative z-10 mt-4 text-center">

                            <p
                              className={`text-[11px] font-bold ${
                                isToday
                                  ? "text-cyan-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {day.label}
                            </p>

                            <p className="mt-1 text-[9px] font-medium text-slate-300">
                              {day.day}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* LEGEND */}

              <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-5">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />

                    <span className="text-[11px] font-medium text-slate-500">
                      Working hours
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

                    <span className="text-[11px] font-medium text-slate-400">
                      No record
                    </span>

                  </div>

                </div>

                <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                  Hover a bar for details
                </p>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="relative overflow-hidden rounded-[30px] bg-[#07111f] p-7 text-white shadow-[0_20px_60px_rgba(7,17,31,0.15)] sm:p-8">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Attendance summary
                </p>

                <TrendingUp
                  size={18}
                  className="text-cyan-400"
                />

              </div>

              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">
                Your performance
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                A quick overview of your recorded attendance and working hours.
              </p>

              <div className="mt-8 space-y-5">

                <SummaryRow
                  label="Recorded days"
                  value={String(records.length)}
                />

                <SummaryRow
                  label="Present days"
                  value={String(presentDays)}
                />

                <SummaryRow
                  label="Total hours"
                  value={`${totalHours.toFixed(2)}h`}
                />

                <SummaryRow
                  label="Average hours"
                  value={`${averageHours.toFixed(2)}h`}
                />

                <SummaryRow
                  label="Attendance rate"
                  value={`${attendancePercentage}%`}
                />

              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                    <Check size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Attendance is synced
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your records are securely connected to Dayflow.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ATTENDANCE HISTORY
        ====================================================== */}

        <section className="rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Recent activity
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                Attendance history
              </h2>

            </div>

            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
              {records.length} records
            </span>

          </div>

          {loading ? (

            <div className="space-y-4 p-6 sm:p-8">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}

            </div>

          ) : records.length > 0 ? (

            <div className="divide-y divide-slate-100">

              {records.map((record) => (

                <div
                  key={record.id}
                  className="grid gap-5 px-6 py-6 transition hover:bg-slate-50 sm:grid-cols-[1.3fr_1fr_1fr_1fr_0.7fr] sm:items-center sm:px-8"
                >

                  {/* DATE */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">

                      {record.status ===
                      "Present" ? (
                        <Check size={19} />
                      ) : (
                        <CalendarDays
                          size={19}
                        />
                      )}

                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-950">
                        {formatDate(
                          record.date
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Attendance record
                      </p>

                    </div>

                  </div>

                  {/* CHECK IN */}

                  <div>

                    <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Check in
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {formatTime(
                        record.check_in
                      )}
                    </p>

                  </div>

                  {/* CHECK OUT */}

                  <div>

                    <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Check out
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {formatTime(
                        record.check_out
                      )}
                    </p>

                  </div>

                  {/* HOURS */}

                  <div>

                    <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Working hours
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {record.working_hours !=
                      null
                        ? `${Number(
                            record.working_hours
                          ).toFixed(2)}h`
                        : "—"}
                    </p>

                  </div>

                  {/* STATUS */}

                  <div className="sm:text-right">

                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="p-12 text-center">

              <CalendarDays
                className="mx-auto mb-4 text-slate-300"
                size={36}
              />

              <h3 className="font-bold text-slate-800">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your attendance records will appear here.
              </p>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

/* ============================================================
   TIME CARD
============================================================ */

function TimeCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-5">

      <div className="mb-3 flex items-center gap-2 text-slate-500">

        {icon}

        <span className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>

      </div>

      <p className="text-xl font-black text-white">
        {value}
      </p>

    </div>
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

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-black text-white">
        {value}
      </span>

    </div>
  );
}