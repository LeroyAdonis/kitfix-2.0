import { desc, eq } from "drizzle-orm";

import { db } from "../index";
import { reviews, type NewReview } from "../schema";

/** Get the review for a specific repair request (one-to-one). */
export async function getReviewByRepair(repairRequestId: string) {
  const result = await db.query.reviews.findFirst({
    where: eq(reviews.repairRequestId, repairRequestId),
    with: { customer: true },
  });
  return result ?? null;
}

/** List all reviews written by a customer (paginated). */
export async function getReviewsByCustomer(
  customerId: string,
  page = 1,
  pageSize = 20,
) {
  return db.query.reviews.findMany({
    where: eq(reviews.customerId, customerId),
    orderBy: [desc(reviews.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { repairRequest: true },
  });
}

/** Create a review for a repair request. */
export async function createReview(
  data: Omit<NewReview, "technicianResponse">,
) {
  const [review] = await db.insert(reviews).values(data).returning();
  return review;
}

/** Add or update a technician's response to a review. */
export async function addTechnicianResponse(
  reviewId: string,
  response: string,
) {
  const [updated] = await db
    .update(reviews)
    .set({ technicianResponse: response })
    .where(eq(reviews.id, reviewId))
    .returning();
  return updated;
}
