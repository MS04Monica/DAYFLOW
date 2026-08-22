"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { getEmployees } from "@/app/actions/employees";
import {
  getEmployeeAttendanceByDateRange,
} from "@/app/actions/attendance-history";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
};

type Attendance = {
  id: number;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  working_hours: number | null;
};

type AttendanceResponse = {
  employee: Employee;
  startDate: string;
  endDate: string;
  attendance: Attendance[];
};

export default function AdminAttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  const firstDay = new Date();
  firstDay.setDate(1);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [attendance, setAttendance] = useState<
    Attendance[]
  >([]);

  const [startDate, setStartDate] = useState(
    firstDay.toISOString().split("T")[0]
  );

  const [endDate, setEndDate] = useState(today);

  const [search, setSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] =
    useState("");

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

  const [showEmployeeList, setShowEmployeeList] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  useEffect(() => {
    async function loadEmployees() {
      setLoadingEmployees(true);

      const result = await getEmployees();

      if (result.success) {
        const data = result.data as Employee[];

        setEmployees(data);

        if (data.length > 0) {
          setSelectedEmployee(data[0]);
        }
      } else {
        setError(result.message);
      }

      setLoadingEmployees(false);
    }

    loadEmployees();
  }, []);

  /* =========================================================
     LOAD ATTENDANCE
  ========================================================= */

  async function loadAttendance() {
    if (!selectedEmployee) {
      setError("Please select an employee.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    setLoadingAttendance(true);
    setError("");
    setMessage("");

    const result =
      await getEmployeeAttendanceByDateRange(
        selectedEmployee.id,
        {
          startDate,
          endDate,
        }
      );

    if (result.success && result.data) {
      const data =
        result.data as AttendanceResponse;

      setAttendance(data.attendance);

      setMessage(
        `Attendance loaded for ${data.employee.name}.`
      );
    } else {
      setAttendance([]);
      setError(result.message);
    }

    setLoadingAttendance(false);
  }

  useEffect(() => {
    if (selectedEmployee) {
      loadAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch
      .trim()
      .toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.employee_id,
        employee.email,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [employees, employeeSearch]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return attendance;

    return attendance.filter((record) =>
      [
        record.date,
        record.status,
        record.check_in,
        record.check_out,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [attendance, search]);

  /* =========================================================
     STATS
  ========================================================= */

  const presentCount = attendance.filter((record) =>
    record.status
      ?.toLowerCase()
      .includes("present")
  ).length;

  const absentCount = attendance.filter((record) =>
    record.status
      ?.toLowerCase()
      .includes("absent")
  ).length;

  const lateCount = attendance.filter((record) =>
    record.status
      ?.toLowerCase()
      .includes("late")
  ).length;

  const totalHours = attendance.reduce(
    (total, record) =>
      total + Number(record.working_hours || 0),
    0
  );

  const averageHours =
    attendance.length > 0
      ? totalHours / attendance.length
      : 0;

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

      <div className="mx-auto max-w-[1500px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
            Workforce intelligence
          </p>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Attendance
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor employee attendance, working hours,
                check-ins and check-outs across any date range.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Activity size={17} />
              </div>

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Attendance records
                </p>

                <p className="text-sm font-black text-slate-900">
                  {attendance.length} records
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =====================================================
            EMPLOYEE SELECTOR
        ====================================================== */}

        <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">

            <div className="flex-1">

              <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Employee
              </label>

              <div className="relative">

                <button
                  onClick={() =>
                    setShowEmployeeList(
                      !showEmployeeList
                    )
                  }
                  disabled={loadingEmployees}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-left transition hover:border-cyan-300 hover:bg-white disabled:opacity-50"
                >

                  <div className="flex items-center gap-3">

                    {selectedEmployee ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                          {initials(
                            selectedEmployee.name
                          )}
                        </div>

                        <div>

                          <p className="text-sm font-black text-slate-800">
                            {selectedEmployee.name}
                          </p>

                          <p className="font-mono text-[9px] font-bold text-cyan-600">
                            {selectedEmployee.employee_id}
                          </p>

                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Select employee
                      </span>
                    )}

                  </div>

                  <ChevronDown
                    size={17}
                    className="text-slate-400"
                  />

                </button>

                {showEmployeeList && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                    <div className="border-b border-slate-100 p-3">

                      <div className="relative">

                        <Search
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={employeeSearch}
                          onChange={(event) =>
                            setEmployeeSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search employees..."
                          className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-cyan-100"
                        />

                      </div>

                    </div>

                    <div className="max-h-72 overflow-y-auto">

                      {filteredEmployees.map(
                        (employee) => (

                          <button
                            key={employee.id}
                            onClick={() => {
                              setSelectedEmployee(
                                employee
                              );
                              setShowEmployeeList(
                                false
                              );
                              setEmployeeSearch("");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cyan-50"
                          >

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
                              {initials(
                                employee.name
                              )}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-xs font-black text-slate-800">
                                {employee.name}
                              </p>

                              <p className="mt-0.5 font-mono text-[9px] text-cyan-600">
                                {employee.employee_id}
                              </p>

                            </div>

                          </button>

                        )
                      )}

                      {filteredEmployees.length ===
                        0 && (
                        <p className="p-6 text-center text-xs text-slate-400">
                          No employees found.
                        </p>
                      )}

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* DATE RANGE */}

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[430px]">

              <div>

                <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  From
                </label>

                <div className="relative">

                  <CalendarDays
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 focus:bg-white"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  To
                </label>

                <div className="relative">

                  <CalendarDays
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 focus:bg-white"
                  />

                </div>

              </div>

            </div>

            <button
              onClick={loadAttendance}
              disabled={
                loadingAttendance ||
                !selectedEmployee
              }
              className="h-12 rounded-xl bg-slate-950 px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAttendance
                ? "Loading..."
                : "View attendance"}
            </button>

          </div>

        </section>

        {/* =====================================================
            FEEDBACK
        ====================================================== */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Present"
            value={presentCount}
            description="Attendance records"
            type="success"
          />

          <StatCard
            icon={<XCircle size={18} />}
            label="Absent"
            value={absentCount}
            description="Absence records"
            type="danger"
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Late"
            value={lateCount}
            description="Late attendance"
            type="warning"
          />

          <StatCard
            icon={<Activity size={18} />}
            label="Avg hours"
            value={averageHours.toFixed(1)}
            description="Hours per record"
            type="cyan"
          />

        </section>

        {/* =====================================================
            ATTENDANCE TABLE
        ====================================================== */}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)]">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Users size={17} />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-950">
                    Attendance history
                  </h2>

                  <p className="text-xs text-slate-400">
                    {selectedEmployee
                      ? `${selectedEmployee.name} · ${startDate} → ${endDate}`
                      : "Select an employee"}
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
                  placeholder="Search attendance..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />

              </div>

            </div>

          </div>

          {loadingAttendance ? (

            <div className="space-y-3 p-6">

              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}

            </div>

          ) : filteredAttendance.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Clock3 size={23} />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No attendance records
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                No attendance data exists for this employee
                during the selected period.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Check in
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Check out
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Working hours
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredAttendance.map(
                    (record) => (

                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                              <CalendarDays size={15} />
                            </div>

                            <span className="text-sm font-black text-slate-800">
                              {record.date}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={record.status}
                          />
                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                            {record.check_in || "—"}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                            {record.check_out || "—"}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-right">

                          <span className="text-sm font-black text-slate-900">
                            {record.working_hours != null
                              ? `${record.working_hours} h`
                              : "—"}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

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
  value: string | number;
  description: string;
  type:
    | "warning"
    | "success"
    | "danger"
    | "cyan";
}) {
  const styles = {
    warning: "bg-amber-50 text-amber-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-600",
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
  const normalized = status
    .toLowerCase()
    .replaceAll("_", " ");

  let style =
    "bg-slate-100 text-slate-600";

  if (normalized.includes("present")) {
    style =
      "bg-emerald-50 text-emerald-700";
  } else if (normalized.includes("absent")) {
    style =
      "bg-rose-50 text-rose-700";
  } else if (normalized.includes("late")) {
    style =
      "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black capitalize ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {normalized}
    </span>
  );
}