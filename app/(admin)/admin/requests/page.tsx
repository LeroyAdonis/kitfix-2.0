import { Suspense } from "react";

import { getAllRepairs, getRepairsByStatus } from "@/lib/db/queries/repairs";
import { RequestTable } from "@/components/admin/request-table";
import type { RepairStatus } from "@/types";

const VALID_STATUSES: RepairStatus[] = [
  "submitted",
  "reviewed",
  "in_repair",
  "quality_check",
  "shipped",
];

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status as RepairStatus | undefined;

  const isValidStatus =
    statusFilter && VALID_STATUSES.includes(statusFilter);

  const result = isValidStatus
    ? await getRepairsByStatus(statusFilter, page)
    : await getAllRepairs(page);

  // getRepairsByStatus returns an array, getAllRepairs returns paginated object
  const repairs = Array.isArray(result) ? result : result.items;
  const totalPages = Array.isArray(result) ? 1 : result.totalPages;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Repair Requests</h1>

      <Suspense fallback={<div>Loading…</div>}>
        <RequestTable
          repairs={repairs}
          totalPages={totalPages}
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}
