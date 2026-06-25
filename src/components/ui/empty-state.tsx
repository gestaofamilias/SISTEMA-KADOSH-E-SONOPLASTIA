import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="kadosh-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kadosh-burnt/10">
        <Icon className="h-6 w-6 text-kadosh-burnt" />
      </div>
      <p className="font-medium text-kadosh-beige-light">{title}</p>
      {description && <p className="max-w-sm text-sm text-kadosh-beige-mid/60">{description}</p>}
      {action}
    </div>
  );
}
