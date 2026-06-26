import { desc, eq } from "drizzle-orm";

import { db } from "../index";
import {
  orders,
  orderItems,
  payments,
  type NewOrder,
  type NewOrderItem,
} from "../schema";

export async function createOrder(data: NewOrder) {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
}

export async function createOrderItems(items: NewOrderItem[]) {
  return db.insert(orderItems).values(items).returning();
}

export async function getOrderById(id: string) {
  const result = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          product: { columns: { name: true } },
          variant: { columns: { size: true } },
        },
      },
      payments: {
        orderBy: [desc(payments.createdAt)],
        limit: 1,
      },
    },
  });
  return result ?? null;
}

export async function getOrdersByUserId(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          product: { columns: { name: true } },
          variant: { columns: { size: true } },
        },
      },
      payments: {
        orderBy: [desc(payments.createdAt)],
        limit: 1,
      },
    },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
) {
  const [updated] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, orderId))
    .returning();
  return updated;
}
