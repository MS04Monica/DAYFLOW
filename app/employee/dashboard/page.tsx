import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EmployeeOverview from "./components/employee-overview";

export default async function EmployeeDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employee") {
    redirect("/login");
  }

  return <EmployeeOverview />;
}