import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmployeeManagement from "./components/employee-management";

export default async function AdminDashboard() {
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

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return (
  <main className="min-h-screen p-8">
    <h1 className="text-3xl font-bold">
      Welcome, {profile.name}
    </h1>

    <p className="mt-2 text-slate-500">
      Admin Dashboard
    </p>

    <EmployeeManagement />
  </main>
);
}