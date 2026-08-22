"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";

import { getMyProfile } from "@/app/actions/profile";
import { getMyAttendance } from "@/app/actions/attendance-history";
import { getMyPayroll } from "@/app/actions/payroll";

type Profile = {
  name: string;
  email: string;
  employee_id: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
};

type Attendance = {
  id: number;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
};

type Salary = {
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
};

function formatTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function formatWorkingTime(hours: number | null | undefined) {
  if (!hours || hours <= 0) {
    return "0 min";
  }

  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0
    ? `${wholeHours}h ${minutes}m`
    : `${wholeHours}h`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

export default function EmployeeOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const [
        profileResult,
        attendanceResult,
        payrollResult,
      ] = await Promise.all([
        getMyProfile(),
        getMyAttendance(),
        getMyPayroll(),
      ]);

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data as Profile);
      }

      if (attendanceResult.success && attendanceResult.data) {
        setAttendance(attendanceResult.data as Attendance[]);
      }

      if (payrollResult.success && payrollResult.data) {
        setSalary(payrollResult.data as Salary);
      }

      const errors = [
        !profileResult.success ? profileResult.message : "",
        !attendanceResult.success ? attendanceResult.message : "",
        !payrollResult.success ? payrollResult.message : "",
      ].filter(Boolean);

      setMessage(errors.join(" "));
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const todayAttendance = useMemo(
    () => attendance.find((item) => item.date === today),
    [attendance, today]
  );

  const totalHours = useMemo(() => {
    return attendance.reduce(
      (sum, record) =>
        sum + Number(record.working_hours ?? 0),
      0
    );
  }, [attendance]);

  const presentDays = useMemo(() => {
    return attendance.filter((record) => {
      const status = record.status.toLowerCase();

      return (
        status === "present" ||
        status === "half-day"
      );
    }).length;
  }, [attendance]);

  const recentAttendance = attendance.slice(0, 5);

  const attendanceRate =
    attendance.length > 0
      ? Math.round((presentDays / attendance.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  const firstName =
    profile?.name?.split(" ")[0] || "there";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fb]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="absolute left-1/3 top-[500px] h-[300px] w-[300px] rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
              Employee workspace
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#08111f] sm:text-5xl">
              {getGreeting()}, {firstName}.
            </h1>

            <p className="mt-3 max-w-xl text-[15px] leading-6 text-slate-500">
              Your workday at a glance. Track attendance,
              leave, payroll and your employee profile from
              one place.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Today
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {new Intl.DateTimeFormat("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
        </header>

        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {message && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {message}
          </div>
        )}

        {/* =====================================================
            HERO + PROFILE
        ===================================================== */}

        <section className="grid gap-5 xl:grid-cols-[1.65fr_0.8fr]">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-[30px] bg-[#07111f] p-7 text-white shadow-[0_25px_70px_rgba(8,17,31,0.16)] sm:p-9">

            <div className="absolute right-[-100px] top-[-130px] h-[330px] w-[330px] rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] blur-sm" />

            <div className="absolute bottom-[-160px] left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="relative">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Today&apos;s attendance
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                    {todayAttendance?.check_in
                      ? "Your workday is in motion."
                      : "Ready to start your day?"}
                  </h2>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    todayAttendance?.check_in
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      todayAttendance?.check_in
                        ? "bg-emerald-400"
                        : "bg-slate-500"
                    }`}
                  />

                  {todayAttendance?.check_in
                    ? "Present"
                    : "Not checked in"}
                </div>
              </div>

              {/* Attendance stats */}
              <div className="mt-10 grid gap-8 sm:grid-cols-3">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Check in
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatTime(
                      todayAttendance?.check_in ?? null
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Check out
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatTime(
                      todayAttendance?.check_out ?? null
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Hours today
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatWorkingTime(
                      todayAttendance?.working_hours
                    )}
                  </p>
                </div>

              </div>

              {/* CTA */}
              <div className="mt-9 flex flex-wrap items-center gap-3">

                <a
                  href="/employee/attendance"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_8px_30px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-[0_12px_35px_rgba(34,211,238,0.18)]"
                  style={{ color: "#07111f" }}
                >
                  <span>Open attendance</span>

                  <ArrowUpRight
                    className="h-4 w-4 text-slate-950 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

                <span className="text-xs text-slate-500">
                  Manage check-in and check-out
                </span>

              </div>
            </div>
          </div>

          {/* PROFILE */}
          <div className="rounded-[30px] border border-slate-200/80 bg-white p-7 shadow-[0_15px_50px_rgba(15,23,42,0.06)]">

            <div className="flex items-start justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#07111f] text-lg font-semibold text-white shadow-lg">
                {firstName.slice(0, 2).toUpperCase()}
              </div>

              <a
                href="/employee/profile"
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>

            </div>

            <h3 className="mt-7 text-xl font-semibold tracking-[-0.02em] text-slate-900">
              {profile?.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {profile?.designation || "Employee"}
            </p>

            <div className="mt-7 space-y-3 border-t border-slate-100 pt-5">

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-400">
                  Employee ID
                </span>

                <span className="font-medium text-slate-700">
                  {profile?.employee_id || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-400">
                  Department
                </span>

                <span className="font-medium text-slate-700">
                  {profile?.department || "—"}
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            METRICS
        ===================================================== */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            label="Present days"
            value={presentDays.toString()}
            caption="Recorded attendance"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <MetricCard
            label="Working hours"
            value={`${totalHours.toFixed(1)}h`}
            caption="Across available records"
            icon={<Clock3 className="h-5 w-5" />}
          />

          <MetricCard
            label="Net payroll"
            value={
              salary
                ? formatMoney(salary.net_salary)
                : "—"
            }
            caption="Current salary information"
            icon={<WalletCards className="h-5 w-5" />}
            accent
          />

          <MetricCard
            label="Attendance rate"
            value={
              attendance.length
                ? `${attendanceRate}%`
                : "—"
            }
            caption="Based on available records"
            icon={<TrendingUp className="h-5 w-5" />}
          />

        </section>

        {/* =====================================================
            LOWER CONTENT
        ===================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">

          {/* ATTENDANCE */}
          <div className="rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:p-7">

            <div className="flex items-end justify-between gap-4">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Recent activity
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  Attendance history
                </h2>
              </div>

              <a
                href="/employee/attendance"
                className="hidden items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900 sm:flex"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </a>

            </div>

            {/* Attendance list */}

            <div className="mt-7">

              {recentAttendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">

                  <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No attendance records yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your attendance activity will appear here.
                  </p>

                </div>
              ) : (
                <div className="divide-y divide-slate-100">

                  {recentAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">

                          {record.status.toLowerCase() ===
                          "present" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <CalendarDays className="h-4 w-4" />
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {formatDate(record.date)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(record.check_in)}{" "}
                            →{" "}
                            {formatTime(record.check_out)}
                          </p>

                        </div>
                      </div>

                      <div className="text-right">

                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          {record.status}
                        </span>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatWorkingTime(
                            record.working_hours
                          )}
                        </p>

                      </div>
                    </div>
                  ))}

                </div>
              )}

              {/* =================================================
                  ATTENDANCE ANALYTICS
              ================================================= */}

              <AttendanceChart
                attendance={attendance}
              />

            </div>
          </div>

          {/* =====================================================
              PAYROLL
          ===================================================== */}

          <div className="rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:p-7">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Compensation
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  Payroll
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <CreditCard className="h-5 w-5" />
              </div>

            </div>

            {salary ? (
              <>
                <div className="mt-8 rounded-2xl bg-[#07111f] p-6 text-white">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Net salary
                  </p>

                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {formatMoney(salary.net_salary)}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">

                    <span className="text-slate-500">
                      Current payroll
                    </span>

                    <span className="font-medium text-cyan-300">
                      Updated
                    </span>

                  </div>
                </div>

                <div className="mt-5 space-y-3">

                  <PayrollRow
                    label="Basic salary"
                    value={formatMoney(
                      salary.basic_salary
                    )}
                  />

                  <PayrollRow
                    label="Allowances"
                    value={`+ ${formatMoney(
                      salary.allowances
                    )}`}
                  />

                  <PayrollRow
                    label="Deductions"
                    value={`- ${formatMoney(
                      salary.deductions
                    )}`}
                  />

                </div>

                <a
                  href="/employee/payroll"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4" />
                  Open payroll
                </a>
              </>
            ) : (
              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">

                <WalletCards className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Payroll unavailable
                </p>

              </div>
            )}
          </div>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200/70 pt-5 text-xs text-slate-400 sm:flex-row">

          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            {profile?.email}
          </div>

          <span>
            Dayflow People OS
          </span>

        </footer>

      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  label,
  value,
  caption,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">

      <div className="flex items-start justify-between">

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            accent
              ? "bg-violet-50 text-violet-600"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-6 truncate text-2xl font-semibold tracking-[-0.035em] text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {caption}
      </p>

    </div>
  );
}

/* ============================================================
   PAYROLL ROW
============================================================ */

function PayrollRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}

/* ============================================================
   ATTENDANCE CHART
============================================================ */

function AttendanceChart({
  attendance,
}: {
  attendance: Attendance[];
}) {
  const getLastSevenDays = () => {
    const days: {
      date: string;
      label: string;
      hours: number;
      record?: Attendance;
    }[] = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(date);

      const record = attendance.find(
        (item) => item.date === dateString
      );

      const label = new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      }).format(date);

      days.push({
        date: dateString,
        label,
        hours: Number(record?.working_hours ?? 0),
        record,
      });
    }

    return days;
  };

  const data = getLastSevenDays();

  const chartWidth = 760;
  const chartHeight = 310;

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 45;

  const graphWidth =
    chartWidth - paddingLeft - paddingRight;

  const graphHeight =
    chartHeight - paddingTop - paddingBottom;

  const maxHours = 8;

  const getY = (hours: number) => {
    const clamped = Math.min(hours, maxHours);

    return (
      paddingTop +
      graphHeight -
      (clamped / maxHours) * graphHeight
    );
  };

  const getX = (index: number) => {
    return (
      paddingLeft +
      (index + 0.5) *
        (graphWidth / data.length)
    );
  };

  const barWidth = Math.min(
    46,
    graphWidth / data.length - 28
  );

  const todayString = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
    }
  ).format(new Date());

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* =====================================================
          CHART HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Performance
            </p>

          </div>

          <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-slate-900">
            Working hours
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Daily working hours for the last 7 days
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* Target */}
          <div className="flex items-center gap-2">
            <span className="h-px w-5 border-t border-dashed border-slate-400" />

            <span className="text-[11px] font-medium text-slate-400">
              8h target
            </span>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {data
                .reduce(
                  (sum, item) =>
                    sum + item.hours,
                  0
                )
                .toFixed(1)}
              h
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          CHART
      ===================================================== */}

      <div className="px-4 pb-5 pt-4 sm:px-6">

        <div className="w-full overflow-x-auto">

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-auto min-w-[650px] w-full"
            role="img"
            aria-label="Working hours chart for the last seven days"
          >

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <rect
              x={paddingLeft}
              y={paddingTop}
              width={graphWidth}
              height={graphHeight}
              rx="12"
              fill="#fafbfd"
            />

            {/* =================================================
                GRID + Y AXIS
            ================================================= */}

            {[0, 2, 4, 6, 8].map(
              (value) => {
                const y = getY(value);

                return (
                  <g key={value}>

                    {/* Grid */}
                    <line
                      x1={paddingLeft}
                      x2={chartWidth - paddingRight}
                      y1={y}
                      y2={y}
                      stroke="#e8edf3"
                      strokeWidth="1"
                    />

                    {/* Y label */}
                    <text
                      x={paddingLeft - 14}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="500"
                      fill="#94a3b8"
                    >
                      {value}h
                    </text>

                  </g>
                );
              }
            )}

            {/* =================================================
                8 HOUR TARGET LINE
            ================================================= */}

            <line
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={getY(8)}
              y2={getY(8)}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.7"
            />

            {/* =================================================
                BARS
            ================================================= */}

            {data.map((item, index) => {
              const x =
                getX(index) - barWidth / 2;

              const barHeight =
                item.hours > 0
                  ? Math.max(
                      8,
                      (Math.min(
                        item.hours,
                        maxHours
                      ) /
                        maxHours) *
                        graphHeight
                    )
                  : 3;

              const y =
                paddingTop +
                graphHeight -
                barHeight;

              const isToday =
                item.date === todayString;

              return (
                <g key={item.date}>

                  {/* TODAY BACKGROUND */}
                  {isToday && (
                    <rect
                      x={
                        x -
                        Math.max(
                          12,
                          barWidth * 0.45
                        )
                      }
                      y={paddingTop}
                      width={
                        barWidth +
                        Math.max(
                          24,
                          barWidth * 0.9
                        )
                      }
                      height={graphHeight}
                      rx="14"
                      fill="#ecfeff"
                    />
                  )}

                  {/* EMPTY DAY TRACK */}
                  <rect
                    x={x}
                    y={paddingTop + 8}
                    width={barWidth}
                    height={graphHeight - 8}
                    rx="10"
                    fill="#f1f5f9"
                  />

                  {/* ACTUAL BAR */}
                  {item.hours > 0 && (
                    <>
                      <defs>
                        <linearGradient
                          id={`bar-${item.date}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#22d3ee"
                          />

                          <stop
                            offset="100%"
                            stopColor="#0891b2"
                          />
                        </linearGradient>
                      </defs>

                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="10"
                        fill={`url(#bar-${item.date})`}
                      />

                      {/* TOP HIGHLIGHT */}
                      <rect
                        x={x + 5}
                        y={y + 4}
                        width={barWidth - 10}
                        height="3"
                        rx="2"
                        fill="rgba(255,255,255,0.35)"
                      />

                      {/* TOOLTIP */}
                      <g className="opacity-0 transition-opacity hover:opacity-100">

                        <rect
                          x={x + barWidth / 2 - 31}
                          y={Math.max(
                            2,
                            y - 38
                          )}
                          width="62"
                          height="27"
                          rx="8"
                          fill="#07111f"
                        />

                        <text
                          x={x + barWidth / 2}
                          y={Math.max(
                            2,
                            y - 21
                          )}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="white"
                        >
                          {item.hours.toFixed(1)}h
                        </text>

                      </g>
                    </>
                  )}

                  {/* X AXIS LABEL */}
                  <text
                    x={getX(index)}
                    y={
                      chartHeight -
                      paddingBottom +
                      25
                    }
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={
                      isToday ? "700" : "500"
                    }
                    fill={
                      isToday
                        ? "#0891b2"
                        : "#94a3b8"
                    }
                  >
                    {item.label}
                  </text>

                  {/* DATE NUMBER */}
                  <text
                    x={getX(index)}
                    y={
                      chartHeight -
                      paddingBottom +
                      40
                    }
                    textAnchor="middle"
                    fontSize="9"
                    fill="#cbd5e1"
                  >
                    {item.date.slice(8)}
                  </text>

                </g>
              );
            })}

            {/* =================================================
                AXIS
            ================================================= */}

            <line
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={paddingTop + graphHeight}
              y2={paddingTop + graphHeight}
              stroke="#dbe3ec"
              strokeWidth="1"
            />

          </svg>

        </div>

        {/* =====================================================
            LEGEND
        ===================================================== */}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">

          <div className="flex items-center gap-5">

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

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

          <p className="text-[11px] text-slate-400">
            Hover over a bar for details
          </p>

        </div>

      </div>
    </div>
  );
}