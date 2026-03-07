"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateSAST } from "@/lib/utils";
import type { RepairStatus } from "@/types";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface RepairRow {
  id: string;
  currentStatus: RepairStatus;
  damageType: string;
  urgencyLevel: string;
  createdAt: Date;
  customer: { name: string } | null;
  technician: { name: string } | null;
}

interface RequestTableProps {
  repairs: RepairRow[];
  totalPages: number;
  currentPage: number;
}

const STATUS_VARIANTS: Record<RepairStatus, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "outline",
  reviewed: "secondary",
  quote_sent: "outline",
  quote_accepted: "secondary",
  in_repair: "default",
  quality_check: "secondary",
  shipped: "default",
};

const ALL_STATUSES: RepairStatus[] = [
  "submitted",
  "reviewed",
  "quote_sent",
  "quote_accepted",
  "in_repair",
  "quality_check",
  "shipped",
];

export function RequestTable({
  repairs,
  totalPages,
  currentPage,
}: RequestTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.set("page", "1");
    router.push(`/admin/requests?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/requests?${params.toString()}`);
  }

  const activeStatus = searchParams.get("status") ?? "all";

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Status:
        </span>
        <Select value={activeStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Damage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No repair requests found.
                </TableCell>
              </TableRow>
            ) : (
              repairs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">
                    {r.id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>{r.customer?.name ?? "—"}</TableCell>
                  <TableCell className="capitalize">
                    {r.damageType.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[r.currentStatus]}>
                      {r.currentStatus.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{r.urgencyLevel}</TableCell>
                  <TableCell>{formatDateSAST(new Date(r.createdAt))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/requests/${r.id}`}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
