import type { UserRole } from "@/lib/database.types";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export interface NavItem {
  href: string;
  label: string;
  icon:
    | "LayoutDashboard"
    | "Users"
    | "CalendarDays"
    | "ClipboardList"
    | "Music2"
    | "AudioLines"
    | "History"
    | "Workflow"
    | "Settings";
  permission: string | null;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", permission: null },
  { href: "/equipe", label: "Equipe", icon: "Users", permission: "equipe" },
  { href: "/cultos", label: "Cultos da Semana", icon: "CalendarDays", permission: "cultos" },
  { href: "/escalas", label: "Escalas", icon: "ClipboardList", permission: "escalas" },
  { href: "/hinos-da-semana", label: "Hinos da Semana", icon: "Music2", permission: "hinos" },
  { href: "/sonoplastia", label: "Sonoplastia", icon: "AudioLines", permission: "sonoplastia" },
  { href: "/historico", label: "Histórico", icon: "History", permission: "historico" },
  { href: "/automacoes", label: "Automações", icon: "Workflow", permission: "automacoes" },
  { href: "/configuracoes", label: "Configurações", icon: "Settings", permission: "configuracoes" },
];

export function visibleNavItems(role: UserRole) {
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return NAV_ITEMS.filter((item) => item.permission === null || allowed.includes(item.permission));
}
