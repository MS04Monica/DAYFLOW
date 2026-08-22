"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  WalletCards,
  UserRound,
  Users,
  ClipboardList,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const employeeNavigation = [
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

const adminNavigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Employees",
    href: "/admin/dashboard#employees",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Leave Requests",
    href: "/admin/leave-requests",
    icon: ClipboardList,
  },
  {
    label: "Payroll",
    href: "/admin/payroll",
    icon: WalletCards,
  },
];

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  const navigation = isAdmin
    ? adminNavigation
    : employeeNavigation;

  const homeHref = isAdmin
    ? "/admin/dashboard"
    : "/employee/dashboard";

  const workspaceLabel = isAdmin
    ? "Admin workspace"
    : "Employee workspace";

  const workspaceDescription = isAdmin
    ? "Manage your workforce and operations."
    : "Everything you need for your workday.";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:z-40 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[82px] items-center justify-between border-b border-slate-100 px-6">
          <Link
            href={homeHref}
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <Sparkles
                size={18}
                strokeWidth={2.2}
              />
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

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {isAdmin ? "Administration" : "Workspace"}
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              /*
               * Remove the hash from the URL when determining
               * the current route.
               */
              const itemPath = item.href.split("#")[0];

              /*
               * Dashboard and Employees both live on the
               * admin dashboard, so only Dashboard is marked
               * active automatically.
               */
              const active =
                pathname === itemPath &&
                !item.href.includes("#");

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

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom workspace information */}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {workspaceLabel}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {workspaceDescription}
            </p>
          </div>

          {/* Sign out */}
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            <span>Sign out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}