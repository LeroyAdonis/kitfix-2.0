import { CardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading admin dashboard">
      {/* Heading skeleton */}
      <div className="h-8 w-48 skeleton" />

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Recent requests table skeleton */}
      <div className="card-base">
        <div className="border-b border-border p-4">
          <div className="h-5 w-40 skeleton" />
        </div>
        <div className="p-4 space-y-1">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
