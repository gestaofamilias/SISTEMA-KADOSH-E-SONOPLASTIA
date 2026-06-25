import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { visibleNavItems } from "@/lib/nav";
import { AppShell } from "@/components/layout/app-shell";
import type { UserRole } from "@/lib/database.types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role: UserRole = profile?.role ?? "Operador";
  const userName = profile?.full_name?.trim() || user.email || "Usuário";

  return (
    <AppShell navItems={visibleNavItems(role)} userName={userName} userRole={role}>
      {children}
    </AppShell>
  );
}
