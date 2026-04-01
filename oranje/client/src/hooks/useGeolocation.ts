import { useState, useEffect } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  isFallback: boolean;
}

const HOLAMBRA_CENTER: GeoPosition = {
  lat: -22.6389,
  lng: -47.0600,
  isFallback: true,
};

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(HOLAMBRA_CENTER);
      setDenied(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      setPosition(HOLAMBRA_CENTER);
      setDenied(true);
      setLoading(false);
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isFallback: false,
        });
        setLoading(false);
      },
      () => {
        clearTimeout(timeout);
        setPosition(HOLAMBRA_CENTER);
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60000 }
    );

    return () => clearTimeout(timeout);
  }, []);

  return { position, loading, denied };
}
