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
      <div className="p-4 mb-4 text-center rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--ds-color-text-secondary)" }}>Faça login para deixar uma avaliação</p>
        <button
          onClick={onLoginClick}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "var(--ds-color-accent)", color: "#fff" }}
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
      <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "var(--ds-color-accent)" }}>DEIXE SUA AVALIAÇÃO</p>

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
                fill: star <= (hoverRating || rating) ? "var(--ds-color-accent)" : "rgba(230,81,0,0.2)",
                color: star <= (hoverRating || rating) ? "var(--ds-color-accent)" : "rgba(230,81,0,0.2)",
              }}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Compartilhe sua experiência... (opcional)"
        className="w-full p-3 rounded-xl text-sm mb-3 resize-none"
        style={{ background: "rgba(0,37,26,0.5)", border: "1px solid rgba(230,81,0,0.2)", color: "var(--ds-color-text-primary)" }}
        rows={3}
      />

      <button
        type="submit"
        disabled={rating === 0 || isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        style={{
          background: rating === 0 ? "rgba(230,81,0,0.2)" : "var(--ds-color-accent)",
          color: rating === 0 ? "var(--ds-color-text-secondary)" : "#fff",
        }}
      >
        <Send size={14} />
        {isLoading ? "Enviando..." : "Enviar Avaliação"}
      </button>
    </form>
  );
}
