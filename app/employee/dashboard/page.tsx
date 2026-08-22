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

  return (
  <main className="min-h-screen p-8">
    <h1 className="text-3xl font-bold">
      Welcome, {profile.name}
    </h1>

    <p className="mt-2 text-slate-500">
      Employee Dashboard
    </p>

    <EmployeeOverview />
  </main>
);
}