import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getPaymentsByRepair } from "@/lib/db/queries/payments";
import { StatusUpdater } from "@/components/admin/status-updater";
import { TechnicianAssignment } from "@/components/admin/technician-assignment";
import { RepairDetailView } from "./repair-detail-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import type { RepairStatus } from "@/types";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [repair, paymentsList, technicians] = await Promise.all([
    getRepairById(id),
    getPaymentsByRepair(id),
    db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(eq(user.role, "technician")),
  ]);

  if (!repair) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Request Detail</h1>
        <Badge variant="secondary" className="text-sm">
          {repair.currentStatus.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info — 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Jersey & damage */}
          <Card>
            <CardHeader>
              <CardTitle>Jersey Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Info label="Description" value={repair.jerseyDescription} />
              <Info label="Brand" value={repair.jerseyBrand ?? "—"} />
              <Info label="Size" value={repair.jerseySize} />
              <Info
                label="Damage Type"
                value={repair.damageType.replace(/_/g, " ")}
              />
              <Info label="Urgency" value={repair.urgencyLevel} />
              <Info
                label="Submitted"
                value={formatDateSAST(new Date(repair.createdAt))}
              />
              <div className="sm:col-span-2">
                <Info
                  label="Damage Description"
                  value={repair.damageDescription}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          {repair.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {repair.photos.map((p) => (
                    <div key={p.id} className="space-y-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnailUrl ?? p.url}
                        alt={p.originalFilename}
                        className="aspect-square rounded-md border object-cover"
                      />
                      <span className="block text-xs capitalize text-muted-foreground">
                        {p.photoType}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost & payment */}
          <Card>
            <CardHeader>
              <CardTitle>Costs &amp; Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Estimated Cost"
                value={
                  repair.estimatedCost != null
                    ? formatCurrency(repair.estimatedCost)
                    : "Not set"
                }
              />
              <Info
                label="Final Cost"
                value={
                  repair.finalCost != null
                    ? formatCurrency(repair.finalCost)
                    : "Not set"
                }
              />
              {paymentsList.map((p) => (
                <div key={p.id} className="sm:col-span-2">
                  <Info
                    label={`Payment (${p.status})`}
                    value={`${formatCurrency(p.amount)} — ${formatDateSAST(new Date(p.createdAt))}`}
                  />
                </div>
              ))}
              {paymentsList.length === 0 && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  No payments recorded.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status history */}
          {repair.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {repair.statusHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          {entry.fromStatus
                            ? `${entry.fromStatus.replace(/_/g, " ")} → `
                            : ""}
                          {entry.toStatus.replace(/_/g, " ")}
                        </span>
                        {entry.notes && (
                          <p className="mt-1 text-muted-foreground">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateSAST(new Date(entry.createdAt))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review */}
          {repair.review && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < repair.review!.rating
                          ? "text-yellow-500"
                          : "text-muted-foreground/30"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                {repair.review.comment && (
                  <p className="text-sm">{repair.review.comment}</p>
                )}
                {repair.review.technicianResponse && (
                  <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                    <span className="font-medium">Technician response: </span>
                    {repair.review.technicianResponse}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar actions — 1 col */}
        <div className="space-y-6">
          {/* Status updater */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusUpdater
                repairId={repair.id}
                currentStatus={repair.currentStatus as RepairStatus}
              />
            </CardContent>
          </Card>

          {/* Technician assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign Technician</CardTitle>
            </CardHeader>
            <CardContent>
              <TechnicianAssignment
                repairId={repair.id}
                currentTechnicianId={repair.technicianId}
                technicians={technicians}
              />
              {repair.technician && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Currently assigned: {repair.technician.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estimate + tracking + notes */}
          <RepairDetailView
            repairId={repair.id}
            estimatedCost={repair.estimatedCost}
            trackingNumber={repair.trackingNumber}
            adminNotes={repair.adminNotes}
          />

          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{repair.customer?.name ?? "—"}</p>
              <p className="text-muted-foreground">
                {repair.customer?.email ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
