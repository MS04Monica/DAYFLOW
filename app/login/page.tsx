"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      /*
       * Next.js redirect() throws internally after
       * successful authentication. Do not treat that
       * redirect as a login failure.
       */
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#07111f]">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[100px]" />

      </div>

      {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}

      <section className="relative hidden flex-1 overflow-hidden lg:flex">

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

          {/* Brand */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-xl">
              <Sparkles
                size={20}
                strokeWidth={2.4}
              />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.04em] text-white">
                Dayflow
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                People OS
              </p>
            </div>

          </div>

          {/* Hero */}

          <div className="max-w-xl">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />

              Human Resource Management

            </div>

            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.06em] text-white xl:text-7xl">

              Everything your
              <br />

              <span className="text-cyan-300">
                people need.
              </span>

            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-slate-400 xl:text-base">
              A modern workspace for attendance,
              leave management, payroll and employee
              operations — all in one place.
            </p>

            {/* Feature cards */}

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">

              <Feature
                label="Attendance"
                icon={<ShieldCheck size={17} />}
              />

              <Feature
                label="Leave"
                icon={<Sparkles size={17} />}
              />

              <Feature
                label="Payroll"
                icon={<LockKeyhole size={17} />}
              />

            </div>

          </div>

          {/* Footer */}

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Secure workforce management
          </p>

        </div>

      </section>

      {/* =====================================================
          LOGIN PANEL
      ====================================================== */}

      <section className="relative z-10 flex w-full items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:max-w-[560px] xl:max-w-[620px]">

        <div className="w-full max-w-md">

          {/* Mobile logo */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.04em] text-slate-950">
                Dayflow
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                People OS
              </p>
            </div>

          </div>

          {/* Heading */}

          <div className="mb-8">

            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-600">
              Welcome back
            </p>

            <h2 className="text-4xl font-black tracking-[-0.055em] text-slate-950">
              Sign in to Dayflow
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Access your workspace using your
              registered account.
            </p>

          </div>

          {/* Login card */}

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.10)] sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.17em] text-slate-500"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.17em] text-slate-500"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* Security */}

            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-slate-400">

              <ShieldCheck size={14} />

              Secure authentication powered by Dayflow

            </div>

          </div>

          <p className="mt-7 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Employee & Admin access
          </p>

        </div>

      </section>

    </main>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function Feature({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}