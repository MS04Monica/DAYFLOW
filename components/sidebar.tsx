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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Sparkles size={19} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            Dayflow
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            People OS
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.3 : 1.9}
                className={
                  active
                    ? "text-cyan-300"
                    : "text-slate-400 group-hover:text-slate-700"
                }
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}