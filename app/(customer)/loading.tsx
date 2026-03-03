import { CardSkeleton, PageSkeleton } from "@/components/shared/loading-skeleton";

export default function CustomerLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard">
      {/* Welcome heading skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Recent repairs skeleton */}
      <PageSkeleton />

      <span className="sr-only">Loading…</span>
    </div>
  );
}
