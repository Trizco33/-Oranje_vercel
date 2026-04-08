import { useEffect, useRef, useState, useCallback } from "react";
import { X, Navigation, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { useNearbyPlaces, formatDistance } from "@/hooks/useNearbyPlaces";
import type { PlaceWithDistance } from "@/hooks/useNearbyPlaces";
import type { GeoPosition } from "@/hooks/useGeolocation";
import { DirectionsSheet } from "@/components/DirectionsSheet";

const HOLAMBRA_CENTER: [number, number] = [-22.6389, -47.0600];

interface NearbyMapProps {
  onClose: () => void;
}

export default function NearbyMap({ onClose }: NearbyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const placeMarkersRef = useRef<Map<number, any>>(new Map());
  const polylineRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const leafletRef = useRef<any>(null);

  const [userPos, setUserPos] = useState<GeoPosition | null>(null);
  const [geoStatus, setGeoStatus] = useState<"loading" | "granted" | "denied">("loading");
  const [mapReady, setMapReady] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const [directionsPlace, setDirectionsPlace] = useState<PlaceWithDistance | null>(null);

  const geoPosition = userPos ?? { lat: HOLAMBRA_CENTER[0], lng: HOLAMBRA_CENTER[1], isFallback: true };
  const { nearby: nearbyPlaces, isLoading: placesLoading } = useNearbyPlaces(geoPosition, 12);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
        await new Promise(r => { link.onload = r; setTimeout(r, 1200); });
      }

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: HOLAMBRA_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Start watching user position
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("loading");

    const fallbackTimer = setTimeout(() => {
      setGeoStatus("denied");
    }, 8000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        clearTimeout(fallbackTimer);
        setGeoStatus("granted");
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isFallback: false,
        });
      },
      () => {
        clearTimeout(fallbackTimer);
        setGeoStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      clearTimeout(fallbackTimer);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update user marker when position changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady || !userPos) return;

    const latlng: [number, number] = [userPos.lat, userPos.lng];

    const pulsingIcon = L.divIcon({
      className: "",
      html: `<div style="
        position: relative;
        width: 20px; height: 20px;
      ">
        <div style="
          position: absolute; inset: 0;
          background: rgba(66,133,244,0.25);
          border-radius: 50%;
          animation: nearbyPulse 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 14px; height: 14px;
          background: #4285F4;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latlng);
    } else {
      userMarkerRef.current = L.marker(latlng, { icon: pulsingIcon, zIndexOffset: 1000 }).addTo(map);
      map.setView(latlng, 15);
    }
  }, [userPos, mapReady]);

  // Create place markers whenever nearby list changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady || nearbyPlaces.length === 0) return;

    const existingIds = new Set(placeMarkersRef.current.keys());
    const newIds = new Set(nearbyPlaces.map(p => p.id));

    // Remove stale markers
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        placeMarkersRef.current.get(id)?.remove();
        placeMarkersRef.current.delete(id);
      }
    });

    // Add new markers
    nearbyPlaces.forEach((place, idx) => {
      if (!place.lat || !place.lng) return;
      if (placeMarkersRef.current.has(place.id)) return;

      const isSelected = selectedPlace?.id === place.id;
      const icon = L.divIcon({
        className: "",
        html: makeMarkerHtml(idx + 1, isSelected),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .on("click", () => selectPlace(place));

      placeMarkersRef.current.set(place.id, marker);
    });
  }, [nearbyPlaces, mapReady]);

  // Update polyline and selected marker styling when selection changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Re-style all markers
    nearbyPlaces.forEach((place, idx) => {
      const marker = placeMarkersRef.current.get(place.id);
      if (!marker) return;
      const isSelected = selectedPlace?.id === place.id;
      marker.setIcon(L.divIcon({
        className: "",
        html: makeMarkerHtml(idx + 1, isSelected),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42],
      }));
    });

    // Draw polyline if a place is selected and user has location
    if (selectedPlace?.lat && selectedPlace?.lng && userPos) {
      polylineRef.current = L.polyline(
        [[userPos.lat, userPos.lng], [selectedPlace.lat, selectedPlace.lng]],
        { color: "#E65100", weight: 2.5, opacity: 0.7, dashArray: "8 6" }
      ).addTo(map);

      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, { duration: 0.8 });
    }
  }, [selectedPlace, userPos, mapReady, nearbyPlaces]);

  const selectPlace = useCallback((place: PlaceWithDistance) => {
    setSelectedPlace(prev => prev?.id === place.id ? null : place);
  }, []);

  const flyToUser = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPos) return;
    map.flyTo([userPos.lat, userPos.lng], 16, { duration: 0.8 });
    setSelectedPlace(null);
  }, [userPos]);

  return (
    <>
      <style>{`
        @keyframes nearbyPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .nearby-map-item:active { background: rgba(230,81,0,0.06); }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 3000,
        display: "flex", flexDirection: "column",
        background: "#f5f5f5",
      }}>
        {/* Header */}
        <div style={{
          background: "#00251A", color: "#FAFAF7",
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px",
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#FAFAF7", cursor: "pointer", padding: 4, display: "flex" }}
          >
            <X size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              Perto de Mim
            </h2>
            <p style={{ fontSize: "0.7rem", color: "rgba(250,250,247,0.55)", margin: 0, marginTop: 1 }}>
              {geoStatus === "loading" && "Obtendo localização..."}
              {geoStatus === "granted" && userPos && `📍 Localização ativa — ${nearbyPlaces.length} lugares próximos`}
              {geoStatus === "denied" && "Usando centro de Holambra"}
            </p>
          </div>
          {geoStatus === "loading" && <Loader2 size={18} className="animate-spin" style={{ color: "#E65100" }} />}
          {geoStatus === "granted" && (
            <button
              onClick={flyToUser}
              style={{
                background: "#E65100", border: "none", borderRadius: 8,
                color: "#fff", cursor: "pointer", padding: "6px 10px",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: "0.75rem", fontWeight: 600,
              }}
            >
              <Navigation size={13} />
              Eu
            </button>
          )}
          {geoStatus === "denied" && <AlertTriangle size={18} style={{ color: "#FF8F00" }} />}
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ flex: 1, position: "relative", minHeight: 0 }} />

        {/* Bottom sheet */}
        <div style={{
          background: "#fff", flexShrink: 0,
          maxHeight: "42vh", overflowY: "auto",
          borderTop: "1px solid rgba(0,37,26,0.08)",
        }}>
          {/* Handle */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(0,37,26,0.12)" }} />
          </div>

          {placesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <Loader2 size={22} className="animate-spin" style={{ color: "#E65100" }} />
            </div>
          ) : nearbyPlaces.length === 0 ? (
            <p style={{ textAlign: "center", padding: "16px 24px", color: "rgba(0,37,26,0.4)", fontSize: "0.875rem" }}>
              Nenhum lugar com localização cadastrada.
            </p>
          ) : (
            nearbyPlaces.map((place, idx) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <div key={place.id}>
                  <button
                    className="nearby-map-item"
                    onClick={() => selectPlace(place)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                      padding: "12px 16px",
                      background: isSelected ? "rgba(230,81,0,0.06)" : "transparent",
                      borderLeft: isSelected ? "3px solid #E65100" : "3px solid transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Rank badge */}
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: isSelected ? "#E65100" : "rgba(0,37,26,0.08)",
                      color: isSelected ? "#fff" : "rgba(0,37,26,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 700,
                      transition: "background 0.15s, color 0.15s",
                    }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "'Montserrat', system-ui, sans-serif",
                        fontWeight: 600, fontSize: "0.875rem",
                        color: "#00251A", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {place.name}
                      </p>
                      {place.categoryName && (
                        <p style={{ fontSize: "0.75rem", color: "rgba(0,37,26,0.4)", margin: 0, marginTop: 1 }}>
                          {place.categoryName}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <MapPin size={12} style={{ color: "#E65100" }} />
                      <span style={{
                        fontSize: "0.8125rem", fontWeight: 700,
                        color: isSelected ? "#E65100" : "#00251A",
                      }}>
                        {place.distanceFormatted}
                      </span>
                    </div>
                  </button>
                  {isSelected && (
                    <button
                      onClick={e => { e.stopPropagation(); setDirectionsPlace(place); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        width: "calc(100% - 32px)", margin: "0 16px 12px",
                        background: "#E65100", color: "#fff",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        padding: "10px 16px",
                        fontFamily: "'Montserrat', system-ui, sans-serif",
                        fontWeight: 700, fontSize: "0.8125rem",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Navigation size={13} />
                      Como chegar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {directionsPlace && (
        <DirectionsSheet
          name={directionsPlace.name}
          address={directionsPlace.address ?? null}
          lat={directionsPlace.lat ?? null}
          lng={directionsPlace.lng ?? null}
          onClose={() => setDirectionsPlace(null)}
        />
      )}
    </>
  );
}

function makeMarkerHtml(num: number, selected: boolean) {
  const bg = selected ? "#E65100" : "#00251A";
  const shadow = selected
    ? "0 3px 10px rgba(230,81,0,0.5)"
    : "0 2px 6px rgba(0,0,0,0.3)";
  return `<div style="
    display: flex; flex-direction: column; align-items: center;
  ">
    <div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${bg};
      border: 2.5px solid #fff;
      box-shadow: ${shadow};
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    ">
      <span style="
        transform: rotate(45deg);
        color: #fff; font-size: 11px; font-weight: 700;
        font-family: Montserrat, system-ui, sans-serif;
        line-height: 1;
      ">${num}</span>
    </div>
  </div>`;
}
