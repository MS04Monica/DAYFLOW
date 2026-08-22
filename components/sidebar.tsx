"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  WalletCards,
  UserRound,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Attendance",
    href: "/employee/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Leave",
    href: "/employee/leave",
    icon: CalendarDays,
  },
  {
    label: "Payroll",
    href: "/employee/payroll",
    icon: WalletCards,
  },
  {
    label: "Profile",
    href: "/employee/profile",
    icon: UserRound,
  },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-67.5 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:z-40 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20.5 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/employee/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <Sparkles size={18} strokeWidth={2.2} />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-[-0.03em] text-slate-950">
                Dayflow
              </div>

              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                People OS
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 h-5 w-0.5 rounded-full bg-cyan-300" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={active ? 2.3 : 1.9}
                    className={
                      active
                        ? "text-cyan-300"
                        : "text-slate-400 transition-colors group-hover:text-slate-700"
                    }
                  />

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Employee workspace
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Everything you need for your workday.
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </Link>
        </div>
      </aside>
    </>
  );
}