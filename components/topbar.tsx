"use client";

import { Menu, Bell } from "lucide-react";

type TopbarProps = {
  name?: string;
  role?: string;
};

export default function Topbar({
  name = "Employee",
  role = "Employee",
}: TopbarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-sm font-medium text-slate-400">
              Workspace
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Employee Portal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="text-xs text-slate-400">{role}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white ring-4 ring-slate-100">
              {initials || "E"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}