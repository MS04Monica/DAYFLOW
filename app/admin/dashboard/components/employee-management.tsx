"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Mail,
  Phone,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getEmployeeDetails,
  getEmployees,
} from "@/app/actions/employees";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
};

type EmployeeDetails = {
  employee: Employee;
  attendance: Array<{
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    working_hours: number | null;
  }>;
  leaveRequests: Array<{
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    status: string;
    reason: string;
  }>;
  salary: {
    id: number;
    basic_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    effective_date: string;
  } | null;
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetails | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function loadEmployees() {
    setLoading(true);
    setMessage("");

    const result = await getEmployees();

    setLoading(false);
    setMessage(result.message);

    if (result.success) {
      setEmployees(result.data as Employee[]);
    }
  }

  async function viewEmployee(employeeId: string) {
    setLoading(true);
    setMessage("");

    const result = await getEmployeeDetails(employeeId);

    setLoading(false);
    setMessage(result.message);

    if (result.success && result.data) {
      setSelectedEmployee(result.data as EmployeeDetails);
    }
  }

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.email,
        employee.employee_id,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [employees, search]);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {/* =====================================================
          WORKFORCE HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Users size={19} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                Workforce
              </p>

              <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">
                Employees
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Search, inspect and monitor your organization's
            employee records.
          </p>
        </div>

        <button
          onClick={loadEmployees}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Activity size={16} />

          {loading ? "Loading..." : "Refresh workforce"}

        </button>

      </div>

      {/* =====================================================
          KPI STRIP
      ====================================================== */}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">

        <MiniStat
          icon={<Users size={16} />}
          label="Employees"
          value={employees.length}
        />

        <MiniStat
          icon={<BriefcaseBusiness size={16} />}
          label="Departments"
          value={
            new Set(
              employees
                .map((employee) => employee.department)
                .filter(Boolean)
            ).size
          }
        />

        <MiniStat
          icon={<CheckCircle2 size={16} />}
          label="Active workspace"
          value="Live"
        />

      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">

          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, employee ID, department..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
          />

        </div>

        {employees.length > 0 && (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-500">
            {filteredEmployees.length} of {employees.length}
          </div>
        )}

      </div>

      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {employees.length === 0 && !loading && (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Users size={26} />
          </div>

          <h3 className="mt-6 text-xl font-black text-slate-900">
            Workforce data is ready
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Load the current employee records from your Dayflow
            database to begin managing the workforce.
          </p>

          <button
            onClick={loadEmployees}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-600"
          >
            Load employees
            <ArrowUpRight size={16} />
          </button>

        </div>
      )}

      {/* =====================================================
          EMPLOYEE TABLE
      ====================================================== */}

      {employees.length > 0 && (

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/80">

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Role
                  </th>

                  <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredEmployees.map((employee) => (

                  <tr
                    key={employee.id}
                    className="group transition hover:bg-slate-50/70"
                  >

                    {/* EMPLOYEE */}

                    <td className="px-5 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-black text-white shadow-sm">
                          {initials(employee.name)}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-black text-slate-900">
                            {employee.name}
                          </p>

                          <p className="mt-1 font-mono text-[10px] font-bold text-cyan-600">
                            {employee.employee_id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-5 py-5">

                      <p className="text-sm font-bold text-slate-700">
                        {employee.department || "Unassigned"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {employee.designation || "Employee"}
                      </p>

                    </td>

                    {/* CONTACT */}

                    <td className="px-5 py-5">

                      <p className="max-w-[220px] truncate text-xs font-semibold text-slate-600">
                        {employee.email}
                      </p>

                      {employee.phone && (
                        <p className="mt-1 text-xs text-slate-400">
                          {employee.phone}
                        </p>
                      )}

                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-5">

                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black capitalize text-emerald-700">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        {employee.role}

                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-5 text-right">

                      <button
                        onClick={() =>
                          viewEmployee(employee.id)
                        }
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
                      >
                        View
                        <ChevronRight size={14} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* MOBILE */}

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredEmployees.map((employee) => (

              <button
                key={employee.id}
                onClick={() =>
                  viewEmployee(employee.id)
                }
                className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50"
              >

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                  {initials(employee.name)}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-black text-slate-900">
                    {employee.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {employee.department ||
                      "Unassigned"}
                  </p>

                  <p className="mt-1 font-mono text-[10px] font-bold text-cyan-600">
                    {employee.employee_id}
                  </p>

                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300"
                />

              </button>

            ))}

          </div>

          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-400">
              No employees match your search.
            </div>
          )}

        </div>

      )}

      {/* =====================================================
          EMPLOYEE DETAIL DRAWER
      ====================================================== */}

      {selectedEmployee && (

        <div className="fixed inset-0 z-50">

          {/* BACKDROP */}

          <button
            aria-label="Close employee details"
            onClick={() => setSelectedEmployee(null)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* DRAWER */}

          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-[#f8fafc] shadow-2xl">

            {/* DRAWER HEADER */}

            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-xl sm:px-8">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                    {initials(
                      selectedEmployee.employee.name
                    )}
                  </div>

                  <div>

                    <p className="text-sm font-black text-slate-900">
                      {selectedEmployee.employee.name}
                    </p>

                    <p className="mt-1 font-mono text-[10px] font-bold text-cyan-600">
                      {selectedEmployee.employee.employee_id}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedEmployee(null)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            <div className="space-y-5 p-6 sm:p-8">

              {/* PROFILE */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                <SectionTitle
                  icon={<UserRound size={17} />}
                  label="Profile"
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <DetailItem
                    icon={<Mail size={15} />}
                    label="Email"
                    value={
                      selectedEmployee.employee.email
                    }
                  />

                  <DetailItem
                    icon={<Phone size={15} />}
                    label="Phone"
                    value={
                      selectedEmployee.employee.phone ||
                      "Not provided"
                    }
                  />

                  <DetailItem
                    icon={<BriefcaseBusiness size={15} />}
                    label="Department"
                    value={
                      selectedEmployee.employee
                        .department ||
                      "Unassigned"
                    }
                  />

                  <DetailItem
                    icon={<UserRound size={15} />}
                    label="Designation"
                    value={
                      selectedEmployee.employee
                        .designation ||
                      "Not assigned"
                    }
                  />

                </div>

              </section>

              {/* PAYROLL */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                <SectionTitle
                  icon={<CreditCard size={17} />}
                  label="Payroll"
                />

                {selectedEmployee.salary ? (

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    <MoneyCard
                      label="Basic"
                      value={
                        selectedEmployee.salary
                          .basic_salary
                      }
                    />

                    <MoneyCard
                      label="Allowances"
                      value={
                        selectedEmployee.salary
                          .allowances
                      }
                    />

                    <MoneyCard
                      label="Deductions"
                      value={
                        selectedEmployee.salary
                          .deductions
                      }
                    />

                    <div className="rounded-2xl bg-slate-950 p-5 text-white">

                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Net salary
                      </p>

                      <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
                        {formatCurrency(
                          selectedEmployee.salary
                            .net_salary
                        )}
                      </p>

                    </div>

                  </div>

                ) : (

                  <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No salary information available.
                  </p>

                )}

              </section>

              {/* ATTENDANCE */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <SectionTitle
                    icon={<Clock3 size={17} />}
                    label="Attendance"
                  />

                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black text-cyan-700">
                    {selectedEmployee.attendance.length} records
                  </span>

                </div>

                {selectedEmployee.attendance.length > 0 ? (

                  <div className="mt-5 space-y-2">

                    {selectedEmployee.attendance
                      .slice(0, 8)
                      .map((record) => (

                        <div
                          key={record.id}
                          className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_auto_auto]"
                        >

                          <div>

                            <p className="text-xs font-black text-slate-800">
                              {record.date}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {record.check_in ||
                                "—"}{" "}
                              →{" "}
                              {record.check_out ||
                                "—"}
                            </p>

                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[9px] font-black ${
                              record.status
                                ?.toLowerCase()
                                .includes("present")
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {record.status}
                          </span>

                          <span className="hidden text-xs font-bold text-slate-600 sm:block">
                            {record.working_hours ??
                              "—"}{" "}
                            h
                          </span>

                        </div>

                      ))}

                  </div>

                ) : (

                  <EmptyBlock text="No attendance records available." />

                )}

              </section>

              {/* LEAVE */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <SectionTitle
                    icon={<CalendarDays size={17} />}
                    label="Leave requests"
                  />

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-600">
                    {selectedEmployee.leaveRequests.length}
                  </span>

                </div>

                {selectedEmployee.leaveRequests.length > 0 ? (

                  <div className="mt-5 space-y-3">

                    {selectedEmployee.leaveRequests.map(
                      (leave) => (

                        <div
                          key={leave.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <p className="text-sm font-black text-slate-900">
                              {leave.leave_type}
                            </p>

                            <StatusBadge
                              status={leave.status}
                            />

                          </div>

                          <p className="mt-2 text-xs font-semibold text-slate-400">
                            {leave.start_date} →{" "}
                            {leave.end_date}
                          </p>

                          <p className="mt-3 text-xs leading-5 text-slate-600">
                            {leave.reason}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <EmptyBlock text="No leave requests available." />

                )}

              </section>

            </div>

          </aside>

        </div>

      )}
    </>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-black text-slate-900">
          {value}
        </p>
      </div>

    </div>
  );
}

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <h3 className="text-sm font-black text-slate-900">
        {label}
      </h3>

    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[9px] font-black uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}

function MoneyCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-xl font-black tracking-[-0.035em] text-slate-900">
        {formatCurrency(value)}
      </p>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const className = normalized.includes("approved")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("rejected")
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[9px] font-black capitalize ${className}`}
    >
      {status}
    </span>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-xs font-medium text-slate-400">
      {text}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}