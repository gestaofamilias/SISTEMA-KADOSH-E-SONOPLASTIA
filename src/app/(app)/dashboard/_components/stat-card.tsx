import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="kadosh-card flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadosh-fire/15 text-kadosh-fire">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-kadosh-beige-light">{value}</p>
        <p className="truncate text-xs text-kadosh-beige-mid/65">{label}</p>
        {hint && <p className="truncate text-[11px] text-kadosh-beige-mid/45">{hint}</p>}
      </div>
    </div>
  );
}
