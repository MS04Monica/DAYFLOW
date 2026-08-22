"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Edit3,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  createSalary,
  getAllPayroll,
  updateSalary,
} from "@/app/actions/admin-payroll";

import { getEmployees } from "@/app/actions/employees";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
};

type PayrollRecord = {
  id: number;
  employee_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  effective_date: string;
  profiles:
    | EmployeeProfile[]
    | EmployeeProfile
    | null;
};

type EmployeeProfile = {
  employee_id: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
};

function getEmployeeProfile(
  profiles: PayrollRecord["profiles"]
): EmployeeProfile | null {
  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function AdminPayrollPage() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [payroll, setPayroll] = useState<
    PayrollRecord[]
  >([]);

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [editingRecord, setEditingRecord] =
    useState<PayrollRecord | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    effectiveDate: today,
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    setLoading(true);
    setError("");

    const [payrollResult, employeeResult] =
      await Promise.all([
        getAllPayroll(),
        getEmployees(),
      ]);

    if (payrollResult.success) {
      setPayroll(
        (payrollResult.data ?? []) as unknown as PayrollRecord[]
      );
    } else {
      setError(payrollResult.message);
    }

    if (employeeResult.success) {
      setEmployees(
        employeeResult.data as Employee[]
      );
    } else if (!payrollResult.success) {
      setError(employeeResult.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPayroll = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return payroll;
    }

    return payroll.filter((record) => {
      const employee =
        getEmployeeProfile(record.profiles);

      return [
        employee?.name,
        employee?.employee_id,
        employee?.email,
        employee?.department,
        employee?.designation,
        record.effective_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [payroll, search]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalPayroll = payroll.reduce(
    (sum, record) =>
      sum + Number(record.net_salary || 0),
    0
  );

  const totalBasic = payroll.reduce(
    (sum, record) =>
      sum + Number(record.basic_salary || 0),
    0
  );

  const totalAllowances = payroll.reduce(
    (sum, record) =>
      sum + Number(record.allowances || 0),
    0
  );

  const totalDeductions = payroll.reduce(
    (sum, record) =>
      sum + Number(record.deductions || 0),
    0
  );

  /* =========================================================
     MODAL
  ========================================================= */

  function openCreateModal() {
    setEditingRecord(null);

    setForm({
      employeeId: "",
      basicSalary: "",
      allowances: "",
      deductions: "",
      effectiveDate: today,
    });

    setMessage("");
    setError("");
    setShowModal(true);
  }

  function openEditModal(record: PayrollRecord) {
    setEditingRecord(record);

    setForm({
      employeeId: record.employee_id,
      basicSalary: String(
        record.basic_salary ?? ""
      ),
      allowances: String(
        record.allowances ?? ""
      ),
      deductions: String(
        record.deductions ?? ""
      ),
      effectiveDate:
        record.effective_date,
    });

    setMessage("");
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingRecord(null);
  }

  /* =========================================================
     SAVE SALARY
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      employeeId: form.employeeId,
      basicSalary: Number(form.basicSalary),
      allowances: Number(form.allowances),
      deductions: Number(form.deductions),
      effectiveDate: form.effectiveDate,
    };

    const result = editingRecord
      ? await updateSalary({
          ...payload,
          salaryId: editingRecord.id,
        })
      : await createSalary(payload);

    if (result.success) {
      setMessage(result.message);
      setShowModal(false);
      setEditingRecord(null);

      await loadData();
    } else {
      setError(result.message);
    }

    setSaving(false);
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

  const previewNet =
    Number(form.basicSalary || 0) +
    Number(form.allowances || 0) -
    Number(form.deductions || 0);

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">

      <div className="mx-auto max-w-[1500px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
            Financial operations
          </p>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Payroll
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Manage employee compensation, allowances,
                deductions and effective salary records.
              </p>

            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus size={17} />
              Add salary
            </button>

          </div>

        </header>

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
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<DollarSign size={18} />}
            label="Net payroll"
            value={formatCurrency(totalPayroll)}
            description={`${payroll.length} active salary records`}
            type="cyan"
          />

          <StatCard
            icon={<Banknote size={18} />}
            label="Basic salary"
            value={formatCurrency(totalBasic)}
            description="Total basic compensation"
            type="slate"
          />

          <StatCard
            icon={<Plus size={18} />}
            label="Allowances"
            value={formatCurrency(totalAllowances)}
            description="Total employee allowances"
            type="success"
          />

          <StatCard
            icon={<Users size={18} />}
            label="Deductions"
            value={formatCurrency(totalDeductions)}
            description="Total payroll deductions"
            type="danger"
          />

        </section>

        {/* =====================================================
            PAYROLL TABLE
        ====================================================== */}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)]">

          {/* TOOLBAR */}

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Banknote size={17} />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-950">
                    Salary records
                  </h2>

                  <p className="text-xs text-slate-400">
                    {filteredPayroll.length} record
                    {filteredPayroll.length === 1
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
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search employee..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />

              </div>

            </div>

          </div>

          {/* TABLE */}

          {loading ? (

            <div className="space-y-3 p-6">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100"
                  />
                )
              )}

            </div>

          ) : filteredPayroll.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Banknote size={23} />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No salary records
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Add a salary record to begin managing payroll.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Basic
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Allowances
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Deductions
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Net salary
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Effective
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredPayroll.map(
                    (record) => {

                      const employee =
                        getEmployeeProfile(
                          record.profiles
                        );

                      return (
                        <tr
                          key={record.id}
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
                                    record.employee_id}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  {employee?.designation ??
                                    employee?.department ??
                                    "Employee"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* BASIC */}

                          <td className="px-6 py-5 text-right">

                            <span className="text-sm font-bold text-slate-700">
                              {formatCurrency(
                                record.basic_salary
                              )}
                            </span>

                          </td>

                          {/* ALLOWANCES */}

                          <td className="px-6 py-5 text-right">

                            <span className="text-sm font-bold text-emerald-600">
                              +
                              {formatCurrency(
                                record.allowances
                              )}
                            </span>

                          </td>

                          {/* DEDUCTIONS */}

                          <td className="px-6 py-5 text-right">

                            <span className="text-sm font-bold text-rose-600">
                              -
                              {formatCurrency(
                                record.deductions
                              )}
                            </span>

                          </td>

                          {/* NET */}

                          <td className="px-6 py-5 text-right">

                            <span className="text-sm font-black text-slate-950">
                              {formatCurrency(
                                record.net_salary
                              )}
                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              <span className="text-xs font-bold text-slate-600">
                                {record.effective_date}
                              </span>

                            </div>

                          </td>

                          {/* EDIT */}

                          <td className="px-6 py-5 text-right">

                            <button
                              onClick={() =>
                                openEditModal(
                                  record
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                            >

                              <Edit3 size={14} />

                              Edit

                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50">

          {/* BACKDROP */}

          <button
            aria-label="Close modal"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          {/* MODAL */}

          <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">
                  Financial record
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {editingRecord
                    ? "Edit salary"
                    : "Add salary"}
                </h2>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* EMPLOYEE */}

              <div>

                <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Employee
                </label>

                <select
                  required
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      employeeId:
                        event.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                >

                  <option value="">
                    Select employee
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name} ·{" "}
                        {employee.employee_id}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SALARY GRID */}

              <div className="grid gap-4 sm:grid-cols-2">

                <MoneyInput
                  label="Basic salary"
                  value={form.basicSalary}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      basicSalary: value,
                    })
                  }
                />

                <MoneyInput
                  label="Allowances"
                  value={form.allowances}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      allowances: value,
                    })
                  }
                />

                <MoneyInput
                  label="Deductions"
                  value={form.deductions}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      deductions: value,
                    })
                  }
                />

                <div>

                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Effective date
                  </label>

                  <input
                    required
                    type="date"
                    value={form.effectiveDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        effectiveDate:
                          event.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />

                </div>

              </div>

              {/* PREVIEW */}

              <div className="rounded-2xl bg-slate-950 p-5 text-white">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                      Net salary
                    </p>

                    <p className="mt-2 text-3xl font-black tracking-[-0.04em]">
                      {formatCurrency(
                        Math.max(
                          previewNet,
                          0
                        )
                      )}
                    </p>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                    <DollarSign size={21} />
                  </div>

                </div>

                {previewNet < 0 && (
                  <p className="mt-3 text-xs font-bold text-rose-300">
                    Deductions exceed total earnings.
                  </p>
                )}

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    previewNet < 0
                  }
                  className="flex-1 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRecord
                      ? "Update salary"
                      : "Create salary"}
                </button>

              </div>

            </form>

          </div>

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
  value: string;
  description: string;
  type:
    | "cyan"
    | "slate"
    | "success"
    | "danger";
}) {
  const styles = {
    cyan: "bg-cyan-50 text-cyan-600",
    slate: "bg-slate-100 text-slate-700",
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

        <p className="text-xl font-black tracking-[-0.04em] text-slate-950">
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
   MONEY INPUT
============================================================ */

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
          ₹
        </span>

        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="0"
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
        />

      </div>

    </div>
  );
}