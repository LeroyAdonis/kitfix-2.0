import { getSession } from "@/lib/auth-utils";
import { getPaymentsByCustomer } from "@/lib/db/queries/payments";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatCurrency, formatDateSAST } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default async function PaymentsPage() {
  const session = (await getSession())!;
  const payments = await getPaymentsByCustomer(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-content">Payment History</h1>
        <p className="text-content-secondary">View all your payments.</p>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="card-base flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="font-medium text-content">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-xs text-content-tertiary">
                  {formatDateSAST(payment.createdAt)}
                </p>
                {payment.repairRequest && (
                  <Link
                    href={`/repairs/${payment.repairRequestId}`}
                    className="text-xs text-content-link hover:underline"
                  >
                    View repair →
                  </Link>
                )}
              </div>
              <span
                className={cn(
                  "badge capitalize",
                  payment.status === "completed"
                    ? "badge-success"
                    : payment.status === "failed"
                      ? "badge-error"
                      : "badge-outline"
                )}
              >
                {payment.status}
              </span>
            </div>
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
