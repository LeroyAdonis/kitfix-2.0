import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DamageTypeBadge } from "./damage-type-badge";
import { formatDateSAST } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Clock, Zap, AlertTriangle } from "lucide-react";
import type { RepairRequest, RepairPhoto } from "@/lib/db/schema";
import type { RepairStatus, UrgencyLevel } from "@/types";

const statusConfig: Record<RepairStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  submitted: { label: "Submitted", variant: "secondary" },
  reviewed: { label: "Reviewed", variant: "outline" },
  in_repair: { label: "In Repair", variant: "default" },
  quality_check: { label: "Quality Check", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
};

const urgencyIcons: Record<UrgencyLevel, React.ReactNode> = {
  standard: <Clock className="h-3.5 w-3.5" />,
  rush: <Zap className="h-3.5 w-3.5 text-yellow-500" />,
  emergency: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
};

interface RepairCardProps {
  repair: RepairRequest & { photos: RepairPhoto[] };
}

export function RepairCard({ repair }: RepairCardProps) {
  const status = statusConfig[repair.currentStatus];
  const firstPhoto = repair.photos[0];

  return (
    <Link href={`/repairs/${repair.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-4">
          {firstPhoto && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={firstPhoto.thumbnailUrl ?? firstPhoto.url}
                alt="Jersey photo"
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {repair.jerseyDescription}
              </p>
              <Badge variant={status.variant} className="shrink-0">
                {status.label}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DamageTypeBadge type={repair.damageType} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {urgencyIcons[repair.urgencyLevel]}
                {repair.urgencyLevel}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateSAST(repair.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
