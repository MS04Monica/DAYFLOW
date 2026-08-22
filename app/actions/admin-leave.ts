"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const decisionSchema = z.object({
  leaveId: z.coerce.number().int().positive(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  adminComment: z
    .string()
    .trim()
    .max(500, "Admin comment cannot exceed 500 characters.")
    .optional()
    .default(""),
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
      user: null,
      authorized: false,
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
      supabase,
      user,
      authorized: false,
      message: "Admin profile not found.",
    };
  }

  if (profile.role !== "admin") {
    return {
      supabase,
      user,
      authorized: false,
      message: "Admin access required.",
    };
  }

  return {
    supabase,
    user,
    authorized: true,
    message: "",
  };
}

export async function getAllLeaveRequests() {
  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
      data: [],
    };
  }

  const { data, error } = await supabase
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
        created_at,
        profiles:employee_id (
          employee_id,
          name,
          email,
          department,
          designation
        )
      `
    )
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
    data: data ?? [],
  };
}

export async function updateLeaveDecision(input: unknown) {
  const validation = decisionSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid leave decision.",
    };
  }

  const { leaveId, decision, adminComment } = validation.data;

  const { supabase, authorized, message } = await requireAdmin();

  if (!authorized) {
    return {
      success: false,
      message,
    };
  }

  // Only a PENDING request can be approved or rejected.
  const { data: existingRequest, error: existingError } = await supabase
    .from("leave_requests")
    .select("id, status")
    .eq("id", leaveId)
    .single();

  if (existingError || !existingRequest) {
    return {
      success: false,
      message: "Leave request not found.",
    };
  }

  if (existingRequest.status !== "PENDING") {
    return {
      success: false,
      message: "Only pending leave requests can be updated.",
    };
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status: decision,
      admin_comment: adminComment || null,
    })
    .eq("id", leaveId)
    .eq("status", "PENDING")
    .select(
      "id, employee_id, leave_type, start_date, end_date, reason, status, admin_comment, created_at"
    )
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to update leave request.",
    };
  }

  return {
    success: true,
    message:
      decision === "APPROVED"
        ? "Leave request approved."
        : "Leave request rejected.",
    data,
  };
}