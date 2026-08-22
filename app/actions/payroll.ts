"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyPayroll() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be logged in.",
      data: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: "Profile not found.",
      data: null,
    };
  }

  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can access this payroll view.",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("salary")
    .select(
      "id, employee_id, basic_salary, allowances, deductions, net_salary, effective_date"
    )
    .eq("employee_id", user.id)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message: "Unable to load salary information.",
      data: null,
    };
  }

  if (!data) {
    return {
      success: true,
      message: "No salary information available.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Salary information loaded successfully.",
    data,
  };
}