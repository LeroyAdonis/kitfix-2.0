import { desc, eq } from "drizzle-orm";

import { db } from "../index";
import { payments, type NewPayment } from "../schema";

/** Find a payment by its Polar checkout ID. */
export async function getPaymentByCheckoutId(polarCheckoutId: string) {
  const result = await db.query.payments.findFirst({
    where: eq(payments.polarCheckoutId, polarCheckoutId),
    with: { repairRequest: true, customer: true },
  });
  return result ?? null;
}

/** List all payments for a given repair request. */
export async function getPaymentsByRepair(repairRequestId: string) {
  return db.query.payments.findMany({
    where: eq(payments.repairRequestId, repairRequestId),
    orderBy: [desc(payments.createdAt)],
  });
}

/** List all payments by a customer (paginated). */
export async function getPaymentsByCustomer(
  customerId: string,
  page = 1,
  pageSize = 20,
) {
  return db.query.payments.findMany({
    where: eq(payments.customerId, customerId),
    orderBy: [desc(payments.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { repairRequest: true },
  });
}

/** Create a new payment record. */
export async function createPayment(data: NewPayment) {
  const [payment] = await db.insert(payments).values(data).returning();
  return payment;
}

/** Update the status of a payment (e.g. completed, failed, refunded). */
export async function updatePaymentStatus(
  paymentId: string,
  status: (typeof payments.$inferSelect)["status"],
  extra?: {
    polarOrderId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    metadata?: Record<string, unknown>;
  },
) {
  const [updated] = await db
    .update(payments)
    .set({
      status,
      ...(extra?.polarOrderId && { polarOrderId: extra.polarOrderId }),
      ...(extra?.paidAt && { paidAt: extra.paidAt }),
      ...(extra?.refundedAt && { refundedAt: extra.refundedAt }),
      ...(extra?.metadata && { metadata: extra.metadata }),
    })
    .where(eq(payments.id, paymentId))
    .returning();
  return updated;
}
