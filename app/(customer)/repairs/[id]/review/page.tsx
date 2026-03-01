import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getReviewByRepair } from "@/lib/db/queries/reviews";
import { ReviewForm } from "@/components/forms/review-form";

export default async function ReviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await requireAuth();
  const repair = await getRepairById(id);

  if (!repair) notFound();
  if (repair.customerId !== session.user.id) notFound();
  if (repair.currentStatus !== "shipped") {
    redirect(`/repairs/${id}`);
  }

  const existingReview = await getReviewByRepair(id);
  if (existingReview) {
    redirect(`/repairs/${id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave a Review</h1>
        <p className="text-muted-foreground">
          Tell us about your repair experience for &quot;{repair.jerseyDescription}&quot;.
        </p>
      </div>
      <ReviewForm repairRequestId={id} />
    </div>
  );
}
