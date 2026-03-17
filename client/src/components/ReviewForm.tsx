import { Star, Send } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
}

export function ReviewForm({ onSubmit, isLoading, isAuthenticated, onLoginClick }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  }

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-4 mb-4 text-center">
        <p className="text-sm mb-3" style={{ color: "#C8C5C0" }}>
          Faça login para deixar uma avaliação
        </p>
        <button
          onClick={onLoginClick}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "#D88A3D", color: "#0E1A26" }}
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 mb-4">
      <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
        DEIXE SUA AVALIAÇÃO
      </p>

      {/* Star Rating */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              style={{
                fill: star <= (hoverRating || rating) ? "#D88A3D" : "rgba(216,138,61,0.2)",
                color: star <= (hoverRating || rating) ? "#D88A3D" : "rgba(216,138,61,0.2)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Compartilhe sua experiência... (opcional)"
        className="w-full p-3 rounded-lg text-sm mb-3 resize-none"
        style={{
          background: "rgba(14,26,38,0.5)",
          border: "1px solid rgba(216,138,61,0.2)",
          color: "#E8E6E3",
        }}
        rows={3}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={rating === 0 || isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        style={{
          background: rating === 0 ? "rgba(216,138,61,0.2)" : "#D88A3D",
          color: rating === 0 ? "#C8C5C0" : "#0E1A26",
        }}
      >
        <Send size={14} />
        {isLoading ? "Enviando..." : "Enviar Avaliação"}
      </button>
    </form>
  );
}
