import Link from "next/link";
import { getSession } from "@/lib/auth-utils";
import { getRepairsByCustomer } from "@/lib/db/queries/repairs";
import { RepairCard } from "@/components/repair/repair-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Wrench, PlusCircle } from "lucide-react";

const PAGE_SIZE = 10;

export default async function RepairsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = (await getSession())!;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const repairs = await getRepairsByCustomer(session.user.id, page, PAGE_SIZE);
  const hasMore = repairs.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">My Repairs</h1>
          <p className="text-text-secondary">Track all your jersey repair requests.</p>
        </div>
        <Link href="/repairs/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          New Request
        </Link>
      </div>

      {repairs.length > 0 ? (
        <div className="space-y-3">
          {repairs.map((repair) => (
            <RepairCard key={repair.id} repair={repair} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Wrench className="h-10 w-10" aria-hidden="true" />}
          title="No repairs found"
          description={
            page > 1
              ? "No more repairs on this page."
              : "You haven't submitted any repair requests yet."
          }
          action={
            page <= 1 ? (
              <Link href="/repairs/new" className="btn-primary">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Submit Your First Request
              </Link>
            ) : undefined
          }
        />
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/repairs?page=${page - 1}`} className="btn-secondary">Previous</Link>
          )}
          {hasMore && (
            <Link href={`/repairs?page=${page + 1}`} className="btn-secondary">Next</Link>
          )}
        </nav>
      )}
    </div>
  );
}
