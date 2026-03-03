import { cn } from "@/lib/utils";
import { formatDateSAST } from "@/lib/utils";
import type { RepairStatus } from "@/types";
import type { StatusHistoryEntry } from "@/lib/db/schema";
import { CheckCircle2, Circle } from "lucide-react";

const statusPipeline: { key: RepairStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "reviewed", label: "Reviewed" },
  { key: "in_repair", label: "In Repair" },
  { key: "quality_check", label: "Quality Check" },
  { key: "shipped", label: "Shipped" },
];

interface StatusTrackerProps {
  currentStatus: RepairStatus;
  statusHistory?: StatusHistoryEntry[];
}

export function StatusTracker({ currentStatus, statusHistory = [] }: StatusTrackerProps) {
  const currentIndex = statusPipeline.findIndex((s) => s.key === currentStatus);

  function getDateForStatus(status: RepairStatus): Date | null {
    const entry = statusHistory.find((h) => h.toStatus === status);
    return entry?.createdAt ?? null;
  }

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex sm:items-start sm:justify-between">
        {statusPipeline.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const date = getDateForStatus(step.key);

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted || isCurrent ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : isCurrent ? (
                    <Circle className="h-6 w-6 fill-primary text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>
                {index < statusPipeline.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-center text-xs font-medium",
                  isCompleted || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {step.label}
              </span>
              {date && (
                <span className="mt-0.5 text-center text-[10px] text-muted-foreground">
                  {formatDateSAST(date)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-3 sm:hidden">
        {statusPipeline.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const date = getDateForStatus(step.key);

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : isCurrent ? (
                  <Circle className="h-5 w-5 fill-primary text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                {index < statusPipeline.length - 1 && (
                  <div
                    className={cn(
                      "mt-1 h-6 w-0.5",
                      isCompleted ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
              <div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground/60",
                  )}
                >
                  {step.label}
                </span>
                {date && (
                  <p className="text-xs text-muted-foreground">
                    {formatDateSAST(date)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
