import { useState } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { DSBadge } from "@/components/ds";
import { getPlaceImagesByName, getCategoryFallbackImage } from "@/constants/placeImages";
import { BusinessHoursBadge } from "@/components/BusinessHoursBadge";

interface PlaceCardProps {
  place: {
    id: number;
    name: string;
    shortDesc?: string | null;
    coverImage?: string | null;
    images?: string[] | null;
    priceRange?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    tags?: string[] | null;
    isRecommended?: boolean;
    isPartner?: boolean;
    isFeatured?: boolean;
    address?: string | null;
    categoryName?: string | null;
    openingHours?: string | null;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  compact?: boolean;
}

/**
 * Resolves the best image for a place, with fallback chain:
 * 1. place.coverImage (from DB)
 * 2. First image from place.images array (from DB)
 * 3. Match from PLACE_IMAGES constant (by name)
 * 4. Category fallback image
 */
export function getPlaceImage(place: {
  name: string;
  coverImage?: string | null;
  images?: string[] | null;
  categoryName?: string | null;
}): string {
  if (place.coverImage) return place.coverImage;
  if (place.images && place.images.length > 0) return place.images[0];

  const nameImages = getPlaceImagesByName(place.name);
  if (nameImages.length > 0) return nameImages[0];

  return getCategoryFallbackImage(place.categoryName);
}

/**
 * Get all available images for a place (for gallery)
 */
export function getAllPlaceImages(place: {
  name: string;
  coverImage?: string | null;
  images?: string[] | null;
  categoryName?: string | null;
}): string[] {
  const images: string[] = [];

  // DB images first
  if (place.coverImage) images.push(place.coverImage);
  if (place.images) {
    for (const img of place.images) {
      if (!images.includes(img)) images.push(img);
    }
  }

  // Name-matched images
  const nameImages = getPlaceImagesByName(place.name);
  for (const img of nameImages) {
    if (!images.includes(img)) images.push(img);
  }

  // If still empty, use category fallback
  if (images.length === 0) {
    images.push(getCategoryFallbackImage(place.categoryName));
  }

  return images;
}

export function PlaceCard({ place, isFavorite, onToggleFavorite, compact = false }: PlaceCardProps) {
  const image = getPlaceImage(place);
  const tags: string[] = Array.isArray(place.tags) ? place.tags : [];
  const [imgError, setImgError] = useState(false);

  const fallbackSrc = getCategoryFallbackImage(place.categoryName);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link to={`/app/lugar/${place.id}`} style={{ display: "block", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <div
        className="card-press overflow-hidden"
        style={{
          borderRadius: "var(--ds-radius-xl)",
          background: "var(--ds-color-bg-elevated)",
          border: "1px solid var(--ds-color-border-default)",
          boxShadow: "var(--ds-shadow-sm)",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: compact ? 140 : 180, background: "var(--ds-color-bg-secondary)" }}>
          <img
            src={imgError ? fallbackSrc : image}
            alt={place.name}
            className={`card-img-zoom img-blur-up w-full h-full object-cover${imgLoaded ? " loaded" : ""}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (!imgError) { setImgError(true); setImgLoaded(true); }
            }}
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
                marginBottom: 6,
                lineHeight: 1.5,
              }}
            >
              {place.shortDesc}
            </p>
          )}

          {!compact && (
            <div style={{ marginBottom: 6 }}>
              <BusinessHoursBadge openingHours={place.openingHours} size="sm" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2" style={{ marginTop: compact ? 6 : 0 }}>
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
