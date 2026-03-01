"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTechnicianAction } from "@/actions/admin";

interface TechnicianAssignmentProps {
  repairId: string;
  currentTechnicianId?: string | null;
  technicians: { id: string; name: string }[];
}

export function TechnicianAssignment({
  repairId,
  currentTechnicianId,
  technicians,
}: TechnicianAssignmentProps) {
  const [selectedId, setSelectedId] = useState(currentTechnicianId ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAssign() {
    if (!selectedId) return;
    setError(null);

    startTransition(async () => {
      const result = await assignTechnicianAction(repairId, selectedId);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  if (technicians.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No technicians available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Technician:</span>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select technician" />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleAssign}
        disabled={!selectedId || selectedId === currentTechnicianId || isPending}
        size="sm"
      >
        {isPending ? "Assigning…" : "Assign Technician"}
      </Button>
    </div>
  );
}
