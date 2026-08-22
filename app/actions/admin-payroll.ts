"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const salarySchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID."),
  basicSalary: z.coerce
    .number()
    .finite()
    .nonnegative("Basic salary cannot be negative."),
  allowances: z.coerce
    .number()
    .finite()
    .nonnegative("Allowances cannot be negative."),
  deductions: z.coerce
    .number()
    .finite()
    .nonnegative("Deductions cannot be negative."),
  effectiveDate: z
    .string()
    .min(1, "Effective date is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid effective date."),
});

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

export async function getAllPayroll() {
  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("salary")
    .select(
      `
        id,
        employee_id,
        basic_salary,
        allowances,
        deductions,
        net_salary,
        effective_date,
        profiles:employee_id (
          employee_id,
          name,
          email,
          department,
          designation
        )
      `
    )
    .order("effective_date", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Unable to load payroll information.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Payroll information loaded successfully.",
    data: data ?? [],
  };
}

export async function createSalary(input: unknown) {
  const validation = salarySchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid salary information.",
    };
  }

  const {
    employeeId,
    basicSalary,
    allowances,
    deductions,
    effectiveDate,
  } = validation.data;

  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
    };
  }

  // Never trust a salary amount sent from the UI.
  const netSalary = basicSalary + allowances - deductions;

  if (netSalary < 0) {
    return {
      success: false,
      message: "Deductions cannot exceed total earnings.",
    };
  }

  // Verify that the employee exists.
  const { data: employee, error: employeeError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", employeeId)
    .eq("role", "employee")
    .single();

  if (employeeError || !employee) {
    return {
      success: false,
      message: "Employee not found.",
    };
  }

  const { data, error } = await supabase
    .from("salary")
    .insert({
      employee_id: employeeId,
      basic_salary: basicSalary,
      allowances,
      deductions,
      net_salary: netSalary,
      effective_date: effectiveDate,
    })
    .select(
      "id, employee_id, basic_salary, allowances, deductions, net_salary, effective_date"
    )
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to create salary record.",
    };
  }

  return {
    success: true,
    message: "Salary record created successfully.",
    data,
  };
}

export async function updateSalary(input: unknown) {
  const validation = salarySchema.extend({
    salaryId: z.coerce.number().int().positive(),
  }).safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid salary information.",
    };
  }

  const {
    salaryId,
    employeeId,
    basicSalary,
    allowances,
    deductions,
    effectiveDate,
  } = validation.data;

  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
    };
  }

  const netSalary = basicSalary + allowances - deductions;

  if (netSalary < 0) {
    return {
      success: false,
      message: "Deductions cannot exceed total earnings.",
    };
  }

  const { data, error } = await supabase
    .from("salary")
    .update({
      employee_id: employeeId,
      basic_salary: basicSalary,
      allowances,
      deductions,
      net_salary: netSalary,
      effective_date: effectiveDate,
    })
    .eq("id", salaryId)
    .select(
      "id, employee_id, basic_salary, allowances, deductions, net_salary, effective_date"
    )
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to update salary record.",
    };
  }

  return {
    success: true,
    message: "Salary record updated successfully.",
    data,
  };
}