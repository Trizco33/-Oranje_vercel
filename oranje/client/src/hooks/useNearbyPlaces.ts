import { useMemo } from "react";
import { usePlacesList } from "@/hooks/useMockData";
import type { GeoPosition } from "@/hooks/useGeolocation";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000 / 50) * 50;
    return `${m === 0 ? "<50" : m} m`;
  }
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export interface PlaceWithDistance {
  id: number;
  name: string;
  address?: string | null;
  shortDesc?: string | null;
  categoryName?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  isFeatured?: boolean | null;
  isRecommended?: boolean | null;
  isPartner?: boolean | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm: number;
  distanceFormatted: string;
  [key: string]: unknown;
}

// Holambra region bounding box — reject bogus or out-of-region coordinates
const LAT_MIN = -22.70, LAT_MAX = -22.58;
const LNG_MIN = -47.12, LNG_MAX = -46.98;

function hasValidCoords(p: { lat?: number | null; lng?: number | null }): boolean {
  const { lat, lng } = p;
  if (lat == null || lng == null) return false;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= LAT_MIN && lat <= LAT_MAX && lng >= LNG_MIN && lng <= LNG_MAX;
}

export function useNearbyPlaces(position: GeoPosition | null, limit = 6) {
  const { data: places, isLoading } = usePlacesList({ limit: 100, offset: 0 });

  const nearby = useMemo<PlaceWithDistance[]>(() => {
    if (!places || !position) return [];

    const withCoords = (places as PlaceWithDistance[]).filter(hasValidCoords);

    return withCoords
      .map((place) => {
        const km = haversineKm(position.lat, position.lng, place.lat as number, place.lng as number);
        return {
          ...place,
          distanceKm: km,
          distanceFormatted: formatDistance(km),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }, [places, position, limit]);

  return { nearby, isLoading };
}
