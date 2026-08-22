"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyAttendance() {
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
      message: "Only employees can access their attendance history.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, date, check_in, check_out, status, working_hours"
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
    data,
  };
}