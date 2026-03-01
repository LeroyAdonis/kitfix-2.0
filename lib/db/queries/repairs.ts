import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "../index";
import {
  repairRequests,
  statusHistory,
  type NewRepairRequest,
} from "../schema";

/** Fetch a single repair request by ID (excludes soft-deleted). */
export async function getRepairById(id: string) {
  const result = await db.query.repairRequests.findFirst({
    where: and(eq(repairRequests.id, id), isNull(repairRequests.deletedAt)),
    with: {
      customer: true,
      technician: true,
      photos: true,
      statusHistory: { orderBy: [desc(statusHistory.createdAt)] },
      review: true,
    },
  });
  return result ?? null;
}

/** List repairs for a given customer (paginated, excludes soft-deleted). */
export async function getRepairsByCustomer(
  customerId: string,
  page = 1,
  pageSize = 20,
) {
  return db.query.repairRequests.findMany({
    where: and(
      eq(repairRequests.customerId, customerId),
      isNull(repairRequests.deletedAt),
    ),
    orderBy: [desc(repairRequests.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { photos: true },
  });
}

/** List repairs assigned to a technician (paginated, excludes soft-deleted). */
export async function getRepairsByTechnician(
  technicianId: string,
  page = 1,
  pageSize = 20,
) {
  return db.query.repairRequests.findMany({
    where: and(
      eq(repairRequests.technicianId, technicianId),
      isNull(repairRequests.deletedAt),
    ),
    orderBy: [desc(repairRequests.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { customer: true, photos: true },
  });
}

/** List repairs filtered by status (paginated, excludes soft-deleted). */
export async function getRepairsByStatus(
  status: (typeof repairRequests.$inferSelect)["currentStatus"],
  page = 1,
  pageSize = 20,
) {
  return db.query.repairRequests.findMany({
    where: and(
      eq(repairRequests.currentStatus, status),
      isNull(repairRequests.deletedAt),
    ),
    orderBy: [desc(repairRequests.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { customer: true, technician: true },
  });
}

/** List all repairs with pagination (admin view, excludes soft-deleted). */
export async function getAllRepairs(page = 1, pageSize = 20) {
  const [items, countResult] = await Promise.all([
    db.query.repairRequests.findMany({
      where: isNull(repairRequests.deletedAt),
      orderBy: [desc(repairRequests.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: { customer: true, technician: true },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(repairRequests)
      .where(isNull(repairRequests.deletedAt)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/** Create a new repair request. */
export async function createRepair(data: NewRepairRequest) {
  const [repair] = await db.insert(repairRequests).values(data).returning();
  return repair;
}

/**
 * Update the status of a repair request and record the change in history.
 * Returns the updated repair request.
 */
export async function updateRepairStatus(
  repairId: string,
  toStatus: (typeof repairRequests.$inferSelect)["currentStatus"],
  changedBy: string,
  notes?: string,
) {
  // Fetch current status for history
  const current = await db.query.repairRequests.findFirst({
    where: eq(repairRequests.id, repairId),
    columns: { currentStatus: true },
  });

  if (!current) {
    throw new Error(`Repair request ${repairId} not found`);
  }

  const [updated] = await db
    .update(repairRequests)
    .set({ currentStatus: toStatus })
    .where(eq(repairRequests.id, repairId))
    .returning();

  await db.insert(statusHistory).values({
    repairRequestId: repairId,
    fromStatus: current.currentStatus,
    toStatus,
    changedBy,
    notes: notes ?? null,
  });

  return updated;
}
