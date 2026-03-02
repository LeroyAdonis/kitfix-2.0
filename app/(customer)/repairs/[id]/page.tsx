import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getPaymentsByRepair } from "@/lib/db/queries/payments";
import { StatusTracker } from "@/components/repair/status-tracker";
import { DamageTypeBadge } from "@/components/repair/damage-type-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import { Star, Package, MessageSquare } from "lucide-react";

export default async function RepairDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await requireAuth();
  const repair = await getRepairById(id);

  if (!repair) notFound();
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    notFound();
  }

  const paymentsForRepair = await getPaymentsByRepair(id);
  const shippingAddress = repair.shippingAddress as {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  } | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Repair Details</h1>
        <p className="text-sm text-muted-foreground">
          Request ID: {repair.id.slice(0, 8)}… · Submitted{" "}
          {formatDateSAST(repair.createdAt)}
        </p>
      </div>

      {/* Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTracker
            currentStatus={repair.currentStatus}
            statusHistory={repair.statusHistory}
          />
        </CardContent>
      </Card>

      {/* Jersey & Damage Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jersey Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{repair.jerseyDescription}</p>
            {repair.jerseyBrand && (
              <p className="text-muted-foreground">
                Brand: {repair.jerseyBrand}
              </p>
            )}
            <p className="text-muted-foreground">Size: {repair.jerseySize}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Damage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <DamageTypeBadge type={repair.damageType} />
              <Badge variant="outline" className="capitalize">
                {repair.urgencyLevel}
              </Badge>
            </div>
            <p>{repair.damageDescription}</p>
          </CardContent>
        </Card>
      </div>

      {/* Photos */}
      {repair.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {repair.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={photo.thumbnailUrl ?? photo.url}
                    alt={photo.originalFilename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-1 left-1 text-[10px] capitalize"
                  >
                    {photo.photoType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Costs & Shipping */}
      <div className="grid gap-6 md:grid-cols-2">
        {(repair.estimatedCost !== null || repair.finalCost !== null || repair.trackingNumber) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {repair.estimatedCost !== null && (
                <p>
                  Estimated: {formatCurrency(repair.estimatedCost)}
                </p>
              )}
              {repair.finalCost !== null && (
                <p className="font-medium">
                  Final: {formatCurrency(repair.finalCost)}
                </p>
              )}
              {repair.trackingNumber && (
                <p className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  Tracking: {repair.trackingNumber}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{shippingAddress.street}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.province}{" "}
                {shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{shippingAddress.country}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payments */}
      {paymentsForRepair.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentsForRepair.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateSAST(payment.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      payment.status === "completed"
                        ? "default"
                        : payment.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Section */}
      {repair.review ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= repair.review!.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            {repair.review.comment && (
              <p className="text-sm">{repair.review.comment}</p>
            )}
          </CardContent>
        </Card>
      ) : repair.currentStatus === "shipped" ? (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">How was your repair experience?</p>
            </div>
            <Button asChild>
              <Link href={`/repairs/${repair.id}/review`}>Leave a Review</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
