import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getRepairsByCustomer } from "@/lib/db/queries/repairs";
import { RepairCard } from "@/components/repair/repair-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Wrench, PlusCircle } from "lucide-react";

const PAGE_SIZE = 10;

export default async function RepairsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await requireAuth();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const repairs = await getRepairsByCustomer(session.user.id, page, PAGE_SIZE);
  const hasMore = repairs.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Repairs</h1>
          <p className="text-muted-foreground">Track all your jersey repair requests.</p>
        </div>
        <Button asChild>
          <Link href="/repairs/new">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            New Request
          </Link>
        </Button>
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
              <Button asChild>
                <Link href="/repairs/new">
                  <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Submit Your First Request
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link href={`/repairs?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          {hasMore && (
            <Button asChild variant="outline">
              <Link href={`/repairs?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
