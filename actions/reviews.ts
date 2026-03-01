"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { createReview, getReviewByRepair } from "@/lib/db/queries/reviews";
import { createReviewSchema } from "@/lib/validators/review";
import type { ActionResult } from "@/types";
import type { Review } from "@/lib/db/schema";

export async function submitReviewAction(
  formData: FormData,
): Promise<ActionResult<Review>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const raw = {
    repairRequestId: formData.get("repairRequestId") as string,
    rating: Number(formData.get("rating")),
    comment: (formData.get("comment") as string) || undefined,
  };

  const result = createReviewSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Validation failed.", fieldErrors };
  }

  const data = result.data;

  const repair = await getRepairById(data.repairRequestId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id) {
    return { success: false, error: "You can only review your own repairs." };
  }
  if (repair.currentStatus !== "shipped") {
    return { success: false, error: "You can only review completed (shipped) repairs." };
  }

  const existingReview = await getReviewByRepair(data.repairRequestId);
  if (existingReview) {
    return { success: false, error: "A review already exists for this repair." };
  }

  const review = await createReview({
    repairRequestId: data.repairRequestId,
    customerId: session.user.id,
    rating: data.rating,
    comment: data.comment ?? null,
  });

  revalidatePath(`/repairs/${data.repairRequestId}`);
  revalidatePath("/repairs");
  return { success: true, data: review };
}
