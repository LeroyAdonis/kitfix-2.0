import { requireAuth } from "@/lib/auth-utils";
import { getPaymentsByCustomer } from "@/lib/db/queries/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateSAST } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default async function PaymentsPage() {
  const session = await requireAuth();
  const payments = await getPaymentsByCustomer(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">View all your payments.</p>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateSAST(payment.createdAt)}
                  </p>
                  {payment.repairRequest && (
                    <Link
                      href={`/repairs/${payment.repairRequestId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View repair →
                    </Link>
                  )}
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard className="h-10 w-10" />}
          title="No payments yet"
          description="Payments will appear here once you have approved repair quotes."
        />
      )}
    </div>
  );
}
