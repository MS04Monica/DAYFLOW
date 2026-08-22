"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const employeeUpdateSchema = z.object({
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  profile_image: z.string().url().optional().or(z.literal("")),
});

const adminUpdateSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  joining_date: z.string().optional(),
  profile_image: z.string().url().optional().or(z.literal("")),
});

async function getAuthorizedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    profile,
  };
}

export async function getMyProfile() {
  const { supabase, user, profile } = await getAuthorizedUser();

  if (!user || !profile) {
    return {
      success: false,
      message: "You must be logged in.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Profile loaded successfully.",
    data: profile,
  };
}

export async function updateMyProfile(input: unknown) {
  const validation = employeeUpdateSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid profile information.",
    };
  }

  const { supabase, user, profile } = await getAuthorizedUser();

  if (!user || !profile) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(validation.data)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      message: "Unable to update profile.",
    };
  }

  return {
    success: true,
    message: "Profile updated successfully.",
    data,
  };
}

export async function getEmployeeProfile(employeeId: string) {
  const { supabase, user, profile } = await getAuthorizedUser();

  if (!user || !profile) {
    return {
      success: false,
      message: "You must be logged in.",
      data: null,
    };
  }

  if (profile.role !== "admin") {
    return {
      success: false,
      message: "Admin access required.",
      data: null,
    };
  }

  const idValidation = z.string().uuid().safeParse(employeeId);

  if (!idValidation.success) {
    return {
      success: false,
      message: "Invalid employee ID.",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", employeeId)
    .eq("role", "employee")
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Employee not found.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Employee profile loaded successfully.",
    data,
  };
}

export async function updateEmployeeProfile(input: unknown) {
  const validation = adminUpdateSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Invalid employee information.",
    };
  }

  const { employeeId, ...updates } = validation.data;

  const { supabase, user, profile } = await getAuthorizedUser();

  if (!user || !profile) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  if (profile.role !== "admin") {
    return {
      success: false,
      message: "Admin access required.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", employeeId)
    .eq("role", "employee")
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Unable to update employee profile.",
    };
  }

  return {
    success: true,
    message: "Employee profile updated successfully.",
    data,
  };
}
