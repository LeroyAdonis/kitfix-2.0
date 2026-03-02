import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getPaymentsByRepair } from "@/lib/db/queries/payments";
import { formatCurrency } from "@/lib/utils";
import { PaymentCheckoutButton } from "./checkout-button";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const session = await requireAuth();

  const repair = await getRepairById(id);
  if (!repair) {
    redirect("/repairs");
  }

  // Only the repair owner or admin can access the payment page
  if (session.user.role !== "admin" && repair.customerId !== session.user.id) {
    redirect("/repairs");
  }

  // Check existing payments
  const payments = await getPaymentsByRepair(id);
  const completedPayment = payments.find((p) => p.status === "completed");
  const pendingPayment = payments.find((p) => p.status === "pending");

  // Already paid — show confirmation
  if (completedPayment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-green-800">
            Payment Complete
          </h1>
          <p className="mb-4 text-green-700">
            Your payment of{" "}
            <span className="font-medium">
              {formatCurrency(completedPayment.amount)}
            </span>{" "}
            has been confirmed. Your repair is now in progress.
          </p>
          <a
            href={`/repairs/${id}`}
            className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            View Repair Status
          </a>
        </div>
      </div>
    );
  }

  // Repair not reviewed yet — can't pay
  if (repair.currentStatus !== "reviewed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold text-amber-800">
            Payment Not Available
          </h1>
          <p className="mb-4 text-amber-700">
            {repair.currentStatus === "submitted"
              ? "Your repair request is still being reviewed. You'll be able to pay once an admin has reviewed and estimated the cost."
              : "This repair is already in progress."}
          </p>
          <a
            href={`/repairs/${id}`}
            className="inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Back to Repair
          </a>
        </div>
      </div>
    );
  }

  // No estimated cost set
  if (!repair.estimatedCost || repair.estimatedCost <= 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold text-gray-800">
            Awaiting Estimate
          </h1>
          <p className="text-gray-600">
            The admin is still preparing your cost estimate. You&apos;ll be notified
            when it&apos;s ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Complete Payment
      </h1>

      {/* Repair summary */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Repair Summary
        </h2>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Jersey</dt>
            <dd className="font-medium text-gray-900">
              {repair.jerseyDescription}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Damage Type</dt>
            <dd className="font-medium capitalize text-gray-900">
              {repair.damageType.replace("_", " ")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Urgency</dt>
            <dd className="font-medium capitalize text-gray-900">
              {repair.urgencyLevel}
            </dd>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between">
              <dt className="text-base font-semibold text-gray-900">
                Estimated Cost
              </dt>
              <dd className="text-base font-bold text-gray-900">
                {formatCurrency(repair.estimatedCost)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Admin notes if present */}
      {repair.adminNotes && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">Admin Notes</p>
          <p className="mt-1 text-sm text-blue-700">{repair.adminNotes}</p>
        </div>
      )}

      {/* Pay button */}
      <PaymentCheckoutButton
        repairRequestId={id}
        amount={repair.estimatedCost}
        hasPendingPayment={!!pendingPayment}
      />

      <p className="mt-4 text-center text-xs text-gray-500">
        You will be redirected to Polar.sh to complete your payment securely.
      </p>
    </div>
  );
}
