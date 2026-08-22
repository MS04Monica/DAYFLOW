"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      authorized: false,
      message: "You must be logged in.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      authorized: false,
      message: "Admin profile not found.",
    };
  }

  if (profile.role !== "admin") {
    return {
      supabase,
      authorized: false,
      message: "Admin access required.",
    };
  }

  return {
    supabase,
    authorized: true,
    message: "",
  };
}

export async function getEmployees() {
  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        employee_id,
        name,
        email,
        role,
        phone,
        address,
        department,
        designation,
        joining_date,
        profile_image
      `
    )
    .eq("role", "employee")
    .order("name", { ascending: true });

  if (error) {
    return {
      success: false,
      message: "Unable to load employees.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Employees loaded successfully.",
    data: data ?? [],
  };
}

const employeeIdSchema = z.string().uuid("Invalid employee ID.");

export async function getEmployeeDetails(employeeId: string) {
  const validation = employeeIdSchema.safeParse(employeeId);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid employee ID.",
      data: null,
    };
  }

  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
      data: null,
    };
  }

  const { data: employee, error: employeeError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        employee_id,
        name,
        email,
        role,
        phone,
        address,
        department,
        designation,
        joining_date,
        profile_image
      `
    )
    .eq("id", employeeId)
    .eq("role", "employee")
    .single();

  if (employeeError || !employee) {
    return {
      success: false,
      message: "Employee not found.",
      data: null,
    };
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select(
      `
        id,
        employee_id,
        date,
        check_in,
        check_out,
        status,
        working_hours
      `
    )
    .eq("employee_id", employeeId)
    .order("date", { ascending: false })
    .limit(30);

  const { data: leaveRequests, error: leaveError } = await supabase
    .from("leave_requests")
    .select(
      `
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        admin_comment,
        created_at
      `
    )
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: salary, error: salaryError } = await supabase
    .from("salary")
    .select(
      `
        id,
        employee_id,
        basic_salary,
        allowances,
        deductions,
        net_salary,
        effective_date
      `
    )
    .eq("employee_id", employeeId)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (attendanceError || leaveError || salaryError) {
    return {
      success: false,
      message: "Unable to load complete employee details.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Employee details loaded successfully.",
    data: {
      employee,
      attendance: attendance ?? [],
      leaveRequests: leaveRequests ?? [],
      salary: salary ?? null,
    },
  };
}