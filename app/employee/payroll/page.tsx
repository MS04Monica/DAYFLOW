"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileText,
  TrendingUp,
} from "lucide-react";

import { getMyPayroll } from "@/app/actions/payroll";

type Payroll = {
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
};

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayroll() {
      setLoading(true);

      const result = await getMyPayroll();

      if (result.success && result.data) {
        setPayroll(result.data as Payroll);
        setError("");
      } else {
        setError(result.message);
      }

      setLoading(false);
    }

    loadPayroll();
  }, []);

  const basic = Number(payroll?.basic_salary ?? 0);
  const allowances = Number(payroll?.allowances ?? 0);
  const deductions = Number(payroll?.deductions ?? 0);
  const netSalary = Number(payroll?.net_salary ?? 0);

  const grossSalary = basic + allowances;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
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
              Payroll
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              View your salary breakdown, earnings,
              deductions, and current net pay.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Payroll period
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Current salary
              </p>
            </div>

          </div>

        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
              !
            </span>

            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="space-y-6">

            <div className="h-64 animate-pulse rounded-[32px] bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-[24px] bg-slate-200"
                />
              ))}

            </div>

          </div>

        ) : (

          <>
            {/* =================================================
                NET SALARY HERO
            ================================================== */}

            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-[#06101f] shadow-[0_25px_70px_rgba(15,23,42,0.16)]">

              <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_400px] lg:items-center">

                <div>

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-black tracking-[0.15em] text-cyan-300">

                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

                    CURRENT PAYROLL

                  </div>

                  <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-5xl">
                    Your earnings,
                    <br />
                    clearly presented.
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                    Your current payroll information is securely
                    retrieved from the Dayflow HR system.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3">

                      <CheckCircle2
                        size={17}
                        className="text-emerald-400"
                      />

                      <span className="text-xs font-bold text-slate-300">
                        Payroll synced
                      </span>

                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3">

                      <CreditCard
                        size={17}
                        className="text-cyan-400"
                      />

                      <span className="text-xs font-bold text-slate-300">
                        Employee payroll
                      </span>

                    </div>

                  </div>

                </div>

                {/* NET SALARY */}

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl">

                  <div className="flex items-center justify-between">

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Net salary
                    </p>

                    <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                      <Banknote size={19} />
                    </div>

                  </div>

                  <p className="mt-7 text-4xl font-black tracking-[-0.045em] text-white">
                    {formatCurrency(netSalary)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Amount after deductions
                  </p>

                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                      style={{
                        width:
                          grossSalary > 0
                            ? `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  (netSalary /
                                    grossSalary) *
                                    100
                                )
                              )}%`
                            : "0%",
                      }}
                    />

                  </div>

                  <div className="mt-3 flex justify-between">

                    <span className="text-[10px] font-semibold text-slate-500">
                      Gross
                    </span>

                    <span className="text-[10px] font-bold text-slate-300">
                      {formatCurrency(grossSalary)}
                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SALARY STAT CARDS
            ================================================== */}

            <section className="mb-6 grid gap-4 md:grid-cols-3">

              <PayrollCard
                label="Basic salary"
                value={formatCurrency(basic)}
                description="Core monthly salary"
                icon={<CircleDollarSign size={19} />}
              />

              <PayrollCard
                label="Allowances"
                value={formatCurrency(allowances)}
                description="Additional earnings"
                icon={<TrendingUp size={19} />}
              />

              <PayrollCard
                label="Deductions"
                value={formatCurrency(deductions)}
                description="Taxes and deductions"
                icon={<FileText size={19} />}
              />

            </section>

            {/* =================================================
                BREAKDOWN
            ================================================== */}

            <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">

              {/* SALARY BREAKDOWN */}

              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">

                <div className="mb-8">

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
                    Salary details
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                    Earnings breakdown
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    A transparent view of how your net salary is calculated.
                  </p>

                </div>

                <div className="space-y-5">

                  <SalaryRow
                    label="Basic salary"
                    value={formatCurrency(basic)}
                    positive
                  />

                  <SalaryRow
                    label="Allowances"
                    value={formatCurrency(allowances)}
                    positive
                  />

                  <div className="my-2 border-t border-dashed border-slate-200" />

                  <SalaryRow
                    label="Gross salary"
                    value={formatCurrency(grossSalary)}
                    strong
                  />

                  <SalaryRow
                    label="Deductions"
                    value={`- ${formatCurrency(
                      deductions
                    )}`}
                    negative
                  />

                  <div className="border-t border-slate-200 pt-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Net salary
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Final payable amount
                        </p>

                      </div>

                      <p className="text-2xl font-black tracking-[-0.04em] text-cyan-600">
                        {formatCurrency(netSalary)}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* PAYROLL STATUS */}

              <div className="relative overflow-hidden rounded-[30px] bg-cyan-50 p-7 sm:p-8">

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

                <div className="relative">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
                    <CheckCircle2 size={21} />
                  </div>

                  <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                    Payroll status
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                    Everything looks good.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your payroll information has been successfully
                    retrieved from the Dayflow backend.
                  </p>

                  <div className="mt-8 space-y-3">

                    <StatusRow
                      label="Salary record"
                      value="Available"
                    />

                    <StatusRow
                      label="Gross salary"
                      value={formatCurrency(
                        grossSalary
                      )}
                    />

                    <StatusRow
                      label="Net salary"
                      value={formatCurrency(
                        netSalary
                      )}
                    />

                  </div>

                </div>

              </div>

            </section>
          </>
        )}

      </div>
    </main>
  );
}

/* ============================================================
   PAYROLL CARD
============================================================ */

function PayrollCard({
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

      <p className="text-2xl font-black tracking-[-0.04em] text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   SALARY ROW
============================================================ */

function SalaryRow({
  label,
  value,
  positive,
  negative,
  strong,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span
          className={`h-2 w-2 rounded-full ${
            positive
              ? "bg-emerald-400"
              : negative
              ? "bg-rose-400"
              : "bg-slate-300"
          }`}
        />

        <span
          className={`text-sm ${
            strong
              ? "font-black text-slate-900"
              : "font-medium text-slate-500"
          }`}
        >
          {label}
        </span>

      </div>

      <span
        className={`text-sm ${
          negative
            ? "font-bold text-rose-500"
            : strong
            ? "font-black text-slate-950"
            : "font-bold text-slate-700"
        }`}
      >
        {value}
      </span>

    </div>
  );
}

/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">

      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

      <span className="text-xs font-black text-slate-800">
        {value}
      </span>

    </div>
  );
}