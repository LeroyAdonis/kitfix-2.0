import { eq, sql, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { user, repairRequests } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateSAST } from "@/lib/utils";

export default async function AdminTechniciansPage() {
  // Fetch technicians with their assigned (non-deleted) repair count
  const technicians = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      assignedCount: sql<number>`count(${repairRequests.id})`,
    })
    .from(user)
    .leftJoin(
      repairRequests,
      sql`${repairRequests.technicianId} = ${user.id} AND ${isNull(repairRequests.deletedAt)}`,
    )
    .where(eq(user.role, "technician"))
    .groupBy(user.id, user.name, user.email, user.createdAt)
    .orderBy(user.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Technicians</h1>
        <Badge variant="secondary">{technicians.length} total</Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Repairs</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {Number(t.assignedCount)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDateSAST(new Date(t.createdAt))}
                </TableCell>
              </TableRow>
            ))}
            {technicians.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No technicians found. Assign the technician role to a user
                  to see them here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
