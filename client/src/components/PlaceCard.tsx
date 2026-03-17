import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { DSBadge } from "@/components/ds";

interface PlaceCardProps {
  place: {
    id: number;
    name: string;
    shortDesc?: string | null;
    coverImage?: string | null;
    priceRange?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    tags?: string[] | null;
    isRecommended?: boolean;
    isPartner?: boolean;
    isFeatured?: boolean;
    address?: string | null;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  compact?: boolean;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop",
];

export function getPlaceholderImage(id: number) {
  return PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length];
}

export function PlaceCard({ place, isFavorite, onToggleFavorite, compact = false }: PlaceCardProps) {
  const image = place.coverImage || getPlaceholderImage(place.id);
  const tags: string[] = Array.isArray(place.tags) ? place.tags : [];

  return (
    <Link to={`/app/lugar/${place.id}`}>
      <div
        className="group overflow-hidden transition-all duration-300"
        style={{
          borderRadius: "var(--ds-radius-xl)",
          background: "var(--ds-color-bg-elevated)",
          border: "1px solid var(--ds-color-border-default)",
          boxShadow: "var(--ds-shadow-sm)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--ds-shadow-lg)";
          e.currentTarget.style.borderColor = "var(--ds-color-border-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--ds-shadow-sm)";
          e.currentTarget.style.borderColor = "var(--ds-color-border-default)";
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: compact ? 140 : 180 }}>
          <img
            src={image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,37,26,0.8) 0%, rgba(0,37,26,0.1) 40%, transparent 100%)",
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {place.isFeatured && <DSBadge variant="accent" size="sm">Destaque</DSBadge>}
            {place.isRecommended && !place.isFeatured && (
              <DSBadge variant="success" size="sm">★ ORANJE</DSBadge>
            )}
            {place.isPartner && !place.isFeatured && (
              <DSBadge variant="default" size="sm">Parceiro</DSBadge>
            )}
          </div>

          {/* Price range */}
          {place.priceRange && (
            <div className="absolute top-2 right-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(0,37,26,0.7)",
                  backdropFilter: "blur(8px)",
                  color: "var(--ds-color-text-secondary)",
                  border: "1px solid var(--ds-color-border-default)",
                }}
              >
                {place.priceRange}
              </span>
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(place.id); }}
              className="absolute bottom-2 right-2 flex items-center justify-center transition-all duration-200"
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--ds-radius-full)",
                background: isFavorite ? "var(--ds-color-accent)" : "rgba(0,37,26,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Heart
                size={14}
                fill={isFavorite ? "var(--ds-color-text-inverse)" : "none"}
                stroke={isFavorite ? "var(--ds-color-text-inverse)" : "var(--ds-color-text-primary)"}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: compact ? "10px 12px" : "12px 16px" }}>
          <h3
            className="font-bold leading-tight line-clamp-1"
            style={{
              fontSize: compact ? 13 : 15,
              color: "var(--ds-color-text-primary)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            {place.name}
          </h3>

          {!compact && place.shortDesc && (
            <p
              className="line-clamp-2"
              style={{
                fontSize: 12,
                color: "var(--ds-color-text-muted)",
                marginTop: 4,
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              {place.shortDesc}
            </p>
          )}

          <div className="flex items-center justify-between gap-2" style={{ marginTop: compact ? 6 : 4 }}>
            {/* Rating */}
            {place.rating && place.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star size={12} fill="var(--ds-color-accent)" stroke="none" />
                <span className="text-xs font-semibold" style={{ color: "var(--ds-color-accent)" }}>
                  {place.rating.toFixed(1)}
                </span>
                {place.reviewCount && (
                  <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
                    ({place.reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--ds-color-accent-subtle)",
                  color: "var(--ds-color-text-accent)",
                  border: "1px solid var(--ds-color-border-accent)",
                }}
              >
                {tags[0]}
              </span>
            )}
          </div>

          {place.address && !compact && (
            <div className="flex items-center gap-1" style={{ marginTop: 8 }}>
              <MapPin size={11} style={{ color: "var(--ds-color-accent)" }} />
              <span className="text-xs truncate" style={{ color: "var(--ds-color-text-muted)" }}>
                {place.address}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
