"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const attendanceActionSchema = z.object({
  action: z.enum(["check_in", "check_out"]),
});

type AttendanceResult = {
  success: boolean;
  message: string;
  data?: {
    check_in?: string | null;
    check_out?: string | null;
    working_hours?: number | null;
    status?: string | null;
  };
};

export async function handleAttendance(
  input: unknown
): Promise<AttendanceResult> {
  const validation = attendanceActionSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid attendance action.",
    };
  }

  const { action } = validation.data;

  const supabase = await createClient();

  // Identify the authenticated user on the server.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  // Get the employee profile belonging to the authenticated user.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: "Employee profile not found.",
    };
  }

  // Only employees can perform their own check-in/check-out.
  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can perform attendance actions.",
    };
  }

  // Use today's date for the attendance record.
  const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
}).format(new Date());

  const { data: todayAttendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("id, check_in, check_out, working_hours, status")
    .eq("employee_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (attendanceError) {
    return {
      success: false,
      message: "Unable to check today's attendance.",
    };
  }

  // CHECK IN
  if (action === "check_in") {
    if (todayAttendance?.check_in) {
      return {
        success: false,
        message: "You have already checked in today.",
      };
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        employee_id: user.id,
        date: today,
        check_in: now,
        status: "Present",
      })
      .select("check_in, check_out, working_hours, status")
      .single();

    if (error) {
      return {
        success: false,
        message: "Unable to check in. Please try again.",
      };
    }

    return {
      success: true,
      message: "Checked in successfully.",
      data,
    };
  }

  // CHECK OUT
  if (!todayAttendance) {
    return {
      success: false,
      message: "You must check in before checking out.",
    };
  }

  if (!todayAttendance.check_in) {
    return {
      success: false,
      message: "You must check in before checking out.",
    };
  }

  if (todayAttendance.check_out) {
    return {
      success: false,
      message: "You have already checked out today.",
    };
  }

  const checkOut = new Date();

  const checkIn = new Date(todayAttendance.check_in);

  const differenceMilliseconds =
    checkOut.getTime() - checkIn.getTime();

  if (differenceMilliseconds <= 0) {
    return {
      success: false,
      message: "Invalid attendance time.",
    };
  }

  const workingHours =
    Math.round(
      (differenceMilliseconds / (1000 * 60 * 60)) * 100
    ) / 100;

  const { data, error } = await supabase
    .from("attendance")
    .update({
      check_out: checkOut.toISOString(),
      working_hours: workingHours,
    })
    .eq("id", todayAttendance.id)
    .eq("employee_id", user.id)
    .select("check_in, check_out, working_hours, status")
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to check out. Please try again.",
    };
  }

  return {
    success: true,
    message: "Checked out successfully.",
    data,
  };
}