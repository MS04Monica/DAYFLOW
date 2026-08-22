"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const leaveSchema = z
  .object({
    leaveType: z.enum(["Paid", "Sick", "Unpaid"]),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z
      .string()
      .trim()
      .min(5, "Reason must contain at least 5 characters.")
      .max(500, "Reason cannot exceed 500 characters."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
  });

export async function submitLeave(input: unknown) {
  const validation = leaveSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid leave data.",
    };
  }

  const { leaveType, startDate, endDate, reason } = validation.data;

  const supabase = await createClient();

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

  if (profile.role !== "employee") {
    return {
      success: false,
      message: "Only employees can submit leave requests.",
    };
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      employee_id: user.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: "PENDING",
    })
    .select(
      "id, employee_id, leave_type, start_date, end_date, reason, status, admin_comment, created_at"
    )
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to submit leave request.",
    };
  }

  return {
    success: true,
    message: "Leave request submitted successfully.",
    data,
  };
}