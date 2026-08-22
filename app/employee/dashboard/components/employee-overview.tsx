"use client";

import { useEffect, useState } from "react";

import { getMyProfile } from "@/app/actions/profile";
import { getMyAttendance } from "@/app/actions/attendance-history";
import { getMyPayroll } from "@/app/actions/payroll";

type Profile = {
  name: string;
  email: string;
  employee_id: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
};

type Attendance = {
  id: number;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
};

type Salary = {
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
};

export default function EmployeeOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const [profileResult, attendanceResult, payrollResult] =
        await Promise.all([
          getMyProfile(),
          getMyAttendance(),
          getMyPayroll(),
        ]);

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data as Profile);
      }

      if (attendanceResult.success) {
        setAttendance(attendanceResult.data as Attendance[]);
      }

      if (payrollResult.success && payrollResult.data) {
        setSalary(payrollResult.data as Salary);
      }

      const errors = [
        !profileResult.success ? profileResult.message : "",
        !attendanceResult.success ? attendanceResult.message : "",
        !payrollResult.success ? payrollResult.message : "",
      ].filter(Boolean);

      if (errors.length > 0) {
        setMessage(errors.join(" "));
      }

      setLoading(false);
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-slate-500">
          Loading your Dayflow data...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-6">
      {message && (
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          {message}
        </div>
      )}

      {/* Profile */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          My Profile
        </h2>

        {profile ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium">{profile.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Employee ID
              </p>
              <p className="font-medium">
                {profile.employee_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Department
              </p>
              <p className="font-medium">
                {profile.department ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Designation
              </p>
              <p className="font-medium">
                {profile.designation ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium">
                {profile.phone ?? "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Profile information unavailable.
          </p>
        )}
      </div>

      {/* Attendance */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Attendance
            </h2>

            <p className="text-sm text-slate-500">
              Your recent attendance records
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {attendance.length} records
          </span>
        </div>

        {attendance.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Hours</th>
                </tr>
              </thead>

              <tbody>
                {attendance.slice(0, 10).map((record) => (
                  <tr
                    key={record.id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3">{record.date}</td>
                    <td className="p-3">{record.status}</td>
                    <td className="p-3">
                      {record.check_in ?? "—"}
                    </td>
                    <td className="p-3">
                      {record.check_out ?? "—"}
                    </td>
                    <td className="p-3">
                      {record.working_hours ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No attendance records available.
          </p>
        )}
      </div>

      {/* Payroll */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          My Payroll
        </h2>

        {salary ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Basic Salary
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{salary.basic_salary}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Allowances
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{salary.allowances}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Deductions
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{salary.deductions}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-sm text-slate-500">
                Net Salary
              </p>
              <p className="mt-1 text-lg font-bold">
                ₹{salary.net_salary}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No salary information available.
          </p>
        )}
      </div>
    </section>
  );
}