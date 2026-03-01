import { Badge } from "@/components/ui/badge";
import type { DamageType } from "@/types";
import { cn } from "@/lib/utils";

const damageTypeConfig: Record<DamageType, { label: string; className: string }> = {
  tear: { label: "Tear", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  hole: { label: "Hole", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  stain: { label: "Stain", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  fading: { label: "Fading", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  logo_damage: { label: "Logo Damage", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  seam_split: { label: "Seam Split", className: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  other: { label: "Other", className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200" },
};

interface DamageTypeBadgeProps {
  type: DamageType;
  className?: string;
}

export function DamageTypeBadge({ type, className }: DamageTypeBadgeProps) {
  const config = damageTypeConfig[type];
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
