"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyLeaveRequests() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be logged in.",
      data: [],
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
      data: [],
    };
  }

  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can access this leave history.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      "id, leave_type, start_date, end_date, reason, status, admin_comment, created_at"
    )
    .eq("employee_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Unable to load leave requests.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Leave requests loaded successfully.",
    data,
  };
}