"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const dateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date."),
});

async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
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
      user,
      profile: null,
      message: "Profile not found.",
    };
  }

  return {
    supabase,
    user,
    profile,
    message: "",
  };
}

/**
 * Employee: view complete attendance history.
 */
export async function getMyAttendance() {
  const { supabase, user, profile, message } = await getCurrentProfile();

  if (!user) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  if (!profile) {
    return {
      success: false,
      message: "Profile not found.",
      data: [],
    };
  }

  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can access their attendance history.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, employee_id, date, check_in, check_out, status, working_hours"
    )
    .eq("employee_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Unable to load attendance history.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Attendance history loaded.",
    data: data ?? [],
  };
}

/**
 * Employee: view attendance for a specific date range.
 */
export async function getMyAttendanceByDateRange(input: unknown) {
  const validation = dateRangeSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid date range.",
      data: [],
    };
  }

  const { startDate, endDate } = validation.data;

  if (startDate > endDate) {
    return {
      success: false,
      message: "Start date cannot be after end date.",
      data: [],
    };
  }

  const { supabase, user, profile, message } = await getCurrentProfile();

  if (!user) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  if (!profile) {
    return {
      success: false,
      message: "Profile not found.",
      data: [],
    };
  }

  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can access their attendance.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, employee_id, date, check_in, check_out, status, working_hours"
    )
    .eq("employee_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Unable to load attendance for the selected dates.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Attendance loaded for the selected date range.",
    data: data ?? [],
  };
}

/**
 * Admin: view an employee's attendance for a specific date range.
 */
export async function getEmployeeAttendanceByDateRange(
  employeeId: string,
  input: unknown
) {
  const employeeIdValidation = z
    .string()
    .uuid("Invalid employee ID.")
    .safeParse(employeeId);

  if (!employeeIdValidation.success) {
    return {
      success: false,
      message: "Invalid employee ID.",
      data: [],
    };
  }

  const validation = dateRangeSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid date range.",
      data: [],
    };
  }

  const { startDate, endDate } = validation.data;

  if (startDate > endDate) {
    return {
      success: false,
      message: "Start date cannot be after end date.",
      data: [],
    };
  }

  const { supabase, user, profile, message } = await getCurrentProfile();

  if (!user) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  if (!profile) {
    return {
      success: false,
      message: "Profile not found.",
      data: [],
    };
  }

  if (profile.role !== "admin") {
    return {
      success: false,
      message: "Admin access required.",
      data: [],
    };
  }

  const { data: employee, error: employeeError } = await supabase
    .from("profiles")
    .select("id, employee_id, name, email, department, designation")
    .eq("id", employeeId)
    .eq("role", "employee")
    .single();

  if (employeeError || !employee) {
    return {
      success: false,
      message: "Employee not found.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, employee_id, date, check_in, check_out, status, working_hours"
    )
    .eq("employee_id", employeeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Unable to load employee attendance.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Employee attendance loaded successfully.",
    data: {
      employee,
      startDate,
      endDate,
      attendance: data ?? [],
    },
  };
}
