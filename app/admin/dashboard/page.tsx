import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmployeeManagement from "./components/employee-management";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
              Dayflow administration
            </p>

            <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Admin Control Center
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Welcome back, {profile.name}. Manage employees and
              monitor attendance, leave, and payroll information
              from one centralized workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <span className="text-sm font-black">
                {profile.name?.charAt(0)?.toUpperCase() ?? "A"}
              </span>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Administrator
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile.name}
              </p>
            </div>
          </div>

        </header>

        {/* QUICK OVERVIEW */}

        <section className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Workforce
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                  Employees
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Manage your organization
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white">
                PEOPLE
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Attendance
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                  Live
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Employee attendance records
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700">
                TRACK
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Payroll
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                  Centralized
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Salary information
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-xs font-black text-cyan-700">
                PAY
              </div>
            </div>
          </div>

        </section>

        {/* EMPLOYEE MANAGEMENT */}

        <section className="rounded-[32px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)]">

          <div className="border-b border-slate-100 p-6 sm:p-8">

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">
              Workforce management
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
              Employee Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Search employee information and inspect their
              profile, attendance, leave requests, and payroll.
            </p>

          </div>

          <div className="p-6 sm:p-8">
            <EmployeeManagement />
          </div>

        </section>

      </div>
    </main>
  );
}