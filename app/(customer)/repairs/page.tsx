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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-green-400/40" />
            <p className="text-[10px] font-semibold tracking-[0.3em] text-green-400 uppercase">Requests</p>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary">My Repairs</h1>
          <p className="mt-1 text-sm text-text-secondary">Track all your jersey repair requests.</p>
        </div>
        <Link
          href="/repairs/new"
          className="inline-flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-xs font-semibold text-green-400 tracking-[0.1em] uppercase transition-all duration-300 hover:bg-green-400/20"
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
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
              <Link
                href="/repairs/new"
                className="inline-flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-xs font-semibold text-green-400 tracking-[0.1em] uppercase transition-all duration-300 hover:bg-green-400/20"
              >
                <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Submit Your First Request
              </Link>
            ) : undefined
          }
        />
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination" className="flex justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/repairs?page=${page - 1}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-4 py-2 text-xs font-semibold text-text-secondary tracking-[0.1em] uppercase transition-all duration-300 hover:border-green-400/20 hover:text-green-400"
            >
              Previous
            </Link>
          )}
          {hasMore && (
            <Link
              href={`/repairs?page=${page + 1}`}
              className="inline-flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-semibold text-green-400 tracking-[0.1em] uppercase transition-all duration-300 hover:bg-green-400/20"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
