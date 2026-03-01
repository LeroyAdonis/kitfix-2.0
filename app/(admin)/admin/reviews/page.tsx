import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateSAST } from "@/lib/utils";

export default async function AdminReviewsPage() {
  const allReviews = await db.query.reviews.findMany({
    orderBy: [desc(reviews.createdAt)],
    with: { customer: true, repairRequest: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Repair ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tech Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allReviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < r.rating
                            ? "text-yellow-500"
                            : "text-muted-foreground/30"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {r.comment ?? "—"}
                </TableCell>
                <TableCell>{r.customer?.name ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {r.repairRequestId.slice(0, 8)}…
                </TableCell>
                <TableCell>
                  {formatDateSAST(new Date(r.createdAt))}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {r.technicianResponse ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            {allReviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No reviews yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
