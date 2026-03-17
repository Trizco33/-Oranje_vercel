import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

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
      <div className="card-premium group overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: compact ? 140 : 180 }}>
          <img
            src={image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {place.isFeatured && <span className="badge-featured">Destaque</span>}
            {place.isRecommended && !place.isFeatured && (
              <span className="badge-recommended">★ ORANJE</span>
            )}
            {place.isPartner && !place.isFeatured && (
              <span className="badge-partner">Parceiro</span>
            )}
          </div>

          {/* Price range */}
          {place.priceRange && (
            <div className="absolute top-2 right-2">
              <span className="price-range bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs">
                {place.priceRange}
              </span>
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(place.id); }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isFavorite ? "rgba(216,138,61,0.9)" : "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Heart
                size={14}
                fill={isFavorite ? "#0E1A26" : "none"}
                stroke={isFavorite ? "#0E1A26" : "#E8E6E3"}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="font-bold text-base leading-tight mb-1 line-clamp-1"
            style={{ color: "#E8E6E3" }}
          >
            {place.name}
          </h3>

          {!compact && place.shortDesc && (
            <p className="text-xs line-clamp-2 mb-3" style={{ color: "#B8B8B8" }}>
              {place.shortDesc}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            {/* Rating */}
            {place.rating && place.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star size={12} fill="#F28C28" stroke="none" />
                <span className="text-xs font-semibold" style={{ color: "#F28C28" }}>
                  {place.rating.toFixed(1)}
                </span>
                {place.reviewCount && (
                  <span className="text-xs" style={{ color: "#B8B8B8" }}>
                    ({place.reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <span className="tag-chip text-xs">{tags[0]}</span>
            )}
          </div>

          {place.address && !compact && (
            <div className="flex items-center gap-1 mt-3">
              <MapPin size={11} style={{ color: "#F28C28" }} />
              <span className="text-xs truncate" style={{ color: "#B8B8B8" }}>
                {place.address}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
