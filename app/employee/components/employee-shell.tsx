"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

type EmployeeShellProps = {
  children: ReactNode;
  name?: string;
};

export default function EmployeeShell({
  children,
  name = "Employee",
}: EmployeeShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-67.5">
        <Topbar
          name={name}
          role="Employee"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="mx-auto max-w-[1700px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}