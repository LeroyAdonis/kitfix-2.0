"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitReviewAction } from "@/actions/reviews";
import { Loader2, Star } from "lucide-react";

interface ReviewFormProps {
  repairRequestId: string;
}

export function ReviewForm({ repairRequestId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("repairRequestId", repairRequestId);
      formData.set("rating", String(rating));
      if (comment.trim()) {
        formData.set("comment", comment.trim());
      }

      const result = await submitReviewAction(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/repairs/${repairRequestId}`), 1500);
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <Alert>
        <AlertDescription>
          Thank you for your review! Redirecting...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
              disabled={isPending}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">{comment.length}/1000</p>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || rating === 0}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </div>
  );
}
