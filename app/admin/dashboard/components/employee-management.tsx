"use client";

import { useState } from "react";

import {
  getEmployeeDetails,
  getEmployees,
} from "@/app/actions/employees";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
};

type EmployeeDetails = {
  employee: Employee;
  attendance: Array<{
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    working_hours: number | null;
  }>;
  leaveRequests: Array<{
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    status: string;
    reason: string;
  }>;
  salary: {
    id: number;
    basic_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    effective_date: string;
  } | null;
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetails | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    setMessage("");

    const result = await getEmployees();

    setLoading(false);
    setMessage(result.message);

    if (result.success) {
      setEmployees(result.data as Employee[]);
    }
  }

  async function viewEmployee(employeeId: string) {
    setLoading(true);
    setMessage("");

    const result = await getEmployeeDetails(employeeId);

    setLoading(false);
    setMessage(result.message);

    if (result.success && result.data) {
      setSelectedEmployee(result.data as EmployeeDetails);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Employee Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View employee profiles, attendance, leave and payroll.
          </p>
        </div>

        <button
          onClick={loadEmployees}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Employees"}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-lg bg-slate-100 p-4 text-sm">
          {message}
        </div>
      )}

      {employees.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold">
                {employee.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {employee.employee_id}
              </p>

              <div className="mt-4 space-y-1 text-sm">
                <p>
                  <strong>Email:</strong> {employee.email}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {employee.department ?? "—"}
                </p>

                <p>
                  <strong>Designation:</strong>{" "}
                  {employee.designation ?? "—"}
                </p>
              </div>

              <button
                onClick={() => viewEmployee(employee.id)}
                disabled={loading}
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedEmployee && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedEmployee.employee.name}
              </h2>

              <p className="text-sm text-slate-500">
                {selectedEmployee.employee.employee_id}
              </p>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold">Profile</h3>

              <div className="mt-3 space-y-1 text-sm">
                <p>Email: {selectedEmployee.employee.email}</p>
                <p>
                  Department:{" "}
                  {selectedEmployee.employee.department ?? "—"}
                </p>
                <p>
                  Designation:{" "}
                  {selectedEmployee.employee.designation ?? "—"}
                </p>
                <p>
                  Phone: {selectedEmployee.employee.phone ?? "—"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold">Payroll</h3>

              {selectedEmployee.salary ? (
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    Basic Salary: ₹
                    {selectedEmployee.salary.basic_salary}
                  </p>

                  <p>
                    Allowances: ₹
                    {selectedEmployee.salary.allowances}
                  </p>

                  <p>
                    Deductions: ₹
                    {selectedEmployee.salary.deductions}
                  </p>

                  <p className="font-semibold">
                    Net Salary: ₹
                    {selectedEmployee.salary.net_salary}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No salary information available.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Recent Attendance</h3>

            {selectedEmployee.attendance.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
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
                    {selectedEmployee.attendance.map((record) => (
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
              <p className="mt-3 text-sm text-slate-500">
                No attendance records available.
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Leave Requests</h3>

            {selectedEmployee.leaveRequests.length > 0 ? (
              <div className="mt-3 space-y-3">
                {selectedEmployee.leaveRequests.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <strong>{leave.leave_type}</strong>
                      <span className="text-sm font-medium">
                        {leave.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {leave.start_date} → {leave.end_date}
                    </p>

                    <p className="mt-2 text-sm">
                      {leave.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No leave requests available.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}