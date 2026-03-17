import { Star, ThumbsUp } from "lucide-react";

export interface ReviewData {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
  isVerified?: boolean;
}

interface ReviewCardProps {
  review: ReviewData;
  onHelpful?: (reviewId: number) => void;
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  return (
    <div className="glass-card p-4 mb-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: "#E8E6E3" }}>
              {review.author}
            </p>
            {review.isVerified && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(216,138,61,0.2)", color: "#D88A3D" }}>
                ✓ Verificado
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#C8C5C0" }}>
            {review.date}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            style={{
              fill: i < review.rating ? "#D88A3D" : "rgba(216,138,61,0.2)",
              color: i < review.rating ? "#D88A3D" : "rgba(216,138,61,0.2)",
            }}
          />
        ))}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm mb-3" style={{ color: "#C8C5C0" }}>
          {review.comment}
        </p>
      )}

      {/* Helpful */}
      {onHelpful && (
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-1 text-xs transition-all"
          style={{ color: "#D88A3D" }}
        >
          <ThumbsUp size={12} />
          Útil {review.helpful ? `(${review.helpful})` : ""}
        </button>
      )}
    </div>
  );
}
