"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  CalendarDays,
  ClipboardList,
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Music2,
  Settings,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type { NavItem } from "@/lib/nav";
import { logout } from "@/app/login/actions";

const ICONS = {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Music2,
  AudioLines,
  History,
  Workflow,
  Settings,
};

export function AppShell({
  navItems,
  userName,
  userRole,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentLabel = navItems.find((item) => pathname?.startsWith(item.href))?.label ?? "";

  return (
    <div className="flex min-h-screen w-full">
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-kadosh-sidebar transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-kadosh-fire to-kadosh-fire-dark shadow-[0_4px_16px_rgba(197,89,24,0.35)]">
            <Flame className="h-5 w-5 text-kadosh-beige-light" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-kadosh-beige-light">
              Sistema Kadosh
            </p>
            <p className="text-[11px] leading-tight text-kadosh-beige-mid/60">
              Louvor, Banda e Sonoplastia
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-kadosh-beige-mid/70 hover:bg-kadosh-burnt/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gradient-to-r from-kadosh-fire/20 to-transparent text-kadosh-beige-light border border-kadosh-fire/30"
                    : "text-kadosh-beige-mid/75 hover:bg-kadosh-burnt/10 hover:text-kadosh-beige-light border border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-kadosh-burnt/15 px-3 py-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kadosh-burnt/20 text-sm font-semibold text-kadosh-beige-light">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-kadosh-beige-light">{userName}</p>
              <p className="truncate text-xs text-kadosh-beige-mid/60">{userRole}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="kadosh-btn-ghost w-full justify-start text-kadosh-beige-mid/70"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-kadosh-burnt/15 bg-kadosh-black/80 px-4 py-3.5 backdrop-blur-md">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-kadosh-beige-mid hover:bg-kadosh-burnt/10 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-kadosh-beige-light">{currentLabel}</h1>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
