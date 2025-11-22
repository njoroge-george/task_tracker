"use client";

import { useState, useEffect } from "react";
import StarRating from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface RatingData {
  id: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

interface RatingsSummary {
  ratings: RatingData[];
  average: number;
  count: number;
}

interface EntityRatingsProps {
  entityType: string; // "task", "project", "user"
  entityId: string;
  currentUserId?: string;
}

export default function EntityRatings({
  entityType,
  entityId,
  currentUserId,
}: EntityRatingsProps) {
  const [ratingsData, setRatingsData] = useState<RatingsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [entityType, entityId]);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/ratings?entityType=${entityType}&entityId=${entityId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRatingsData(data);
        
        // Check if current user has already rated
        if (currentUserId) {
          const existingRating = data.ratings.find(
            (r: RatingData) => r.user.id === currentUserId
          );
          if (existingRating) {
            setUserRating(existingRating.rating);
            setUserComment(existingRating.comment || "");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          rating: userRating,
          comment: userComment || null,
        }),
      });

      if (response.ok) {
        setShowRatingForm(false);
        fetchRatings(); // Refresh ratings
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    try {
      const response = await fetch(
        `/api/ratings?entityType=${entityType}&entityId=${entityId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setUserRating(0);
        setUserComment("");
        setShowRatingForm(false);
        fetchRatings();
      }
    } catch (error) {
      console.error("Failed to delete rating:", error);
    }
  };

  if (isLoading) {
    return <div className="text-secondary text-sm">Loading ratings...</div>;
  }

  const userHasRated = currentUserId && ratingsData?.ratings.some(
    (r) => r.user.id === currentUserId
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StarRating value={ratingsData?.average || 0} readonly size="md" />
          <span className="text-primary font-semibold">
            {ratingsData?.average?.toFixed(1) || "0.0"}
          </span>
        </div>
        <span className="text-secondary text-sm">
          ({ratingsData?.count || 0} {ratingsData?.count === 1 ? "rating" : "ratings"})
        </span>
      </div>

      {/* Rate Button */}
      {currentUserId && (
        <div className="pt-2">
          {!showRatingForm && !userHasRated && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRatingForm(true)}
            >
              Rate this {entityType}
            </Button>
          )}

          {!showRatingForm && userHasRated && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRatingForm(true)}
              >
                Edit your rating
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteRating}
                className="text-red-600 hover:text-red-700"
              >
                Remove rating
              </Button>
            </div>
          )}

          {showRatingForm && (
            <div className="border border-default rounded-lg p-4 bg-secondary space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Your Rating
                </label>
                <StarRating
                  value={userRating}
                  onChange={setUserRating}
                  size="lg"
                  showText
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border border-default rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitRating}
                  disabled={!userRating || isSubmitting}
                  className="bg-accent hover:bg-accent-hover"
                >
                  {isSubmitting ? "Submitting..." : userHasRated ? "Update Rating" : "Submit Rating"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowRatingForm(false);
                    // Reset to existing rating if user had one
                    if (userHasRated) {
                      const existing = ratingsData?.ratings.find(
                        (r) => r.user.id === currentUserId
                      );
                      if (existing) {
                        setUserRating(existing.rating);
                        setUserComment(existing.comment || "");
                      }
                    } else {
                      setUserRating(0);
                      setUserComment("");
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ratings List */}
      {ratingsData && ratingsData.ratings.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-default">
          <h4 className="font-semibold text-primary">All Ratings</h4>
          {ratingsData.ratings.map((rating) => (
            <div
              key={rating.id}
              className="flex gap-3 p-3 bg-secondary rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                {rating.user.image ? (
                  <img
                    src={rating.user.image}
                    alt={rating.user.name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary">
                    {rating.user.name}
                  </span>
                  <StarRating value={rating.rating} readonly size="sm" />
                </div>
                {rating.comment && (
                  <p className="text-secondary text-sm">{rating.comment}</p>
                )}
                <span className="text-xs text-secondary">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
