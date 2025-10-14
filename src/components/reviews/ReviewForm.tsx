import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  appointmentId: string;
  dentistId?: string;
  existingReview?: {
    rating: number;
    review_text: string;
  };
  onReviewSubmitted?: () => void;
}

export const ReviewForm = ({ 
  appointmentId, 
  dentistId,
  existingReview,
  onReviewSubmitted 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const reviewData = {
        appointment_id: appointmentId,
        patient_id: user.id,
        dentist_id: dentistId || null,
        rating,
        review_text: reviewText || null,
      };

      const { error } = existingReview
        ? await supabase
            .from('reviews')
            .update(reviewData)
            .eq('appointment_id', appointmentId)
            .eq('patient_id', user.id)
        : await supabase
            .from('reviews')
            .insert(reviewData);

      if (error) throw error;

      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? "Update Your Review" : "Leave a Review"}
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Review (Optional)
          </p>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length}/500 characters
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            existingReview ? "Update Review" : "Submit Review"
          )}
        </Button>
      </div>
    </Card>
  );
};
