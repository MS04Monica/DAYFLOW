"use client";

import { Bell, Menu, Search } from "lucide-react";

type TopbarProps = {
  name?: string;
  role?: string;
  onMenuClick?: () => void;
};

export default function Topbar({
  name = "Employee",
  role = "Employee",
  onMenuClick,
}: TopbarProps) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "E";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20.5 items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={19} />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Search size={15} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-400">
              Search workspace
            </span>
            <kbd className="ml-5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              /
            </kbd>
          </div>

          <div className="md:hidden">
            <p className="text-xs font-medium text-slate-400">
              Employee Portal
            </p>
            <p className="text-sm font-bold text-slate-950">
              Dayflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-500 ring-2 ring-white" />
          </button>

          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-bold text-slate-900">
                {name}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {role}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white ring-4 ring-slate-100">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}