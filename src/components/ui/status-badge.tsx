import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const color = STATUS_COLORS[status] ?? "border-kadosh-beige-mid/30 bg-kadosh-beige-mid/10 text-kadosh-beige-mid";
  return <span className={cn("kadosh-badge", color, className)}>{status}</span>;
}
