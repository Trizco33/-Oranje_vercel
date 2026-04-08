import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { usePlacesList } from "@/hooks/useMockData";

const HOLAMBRA_CENTER: [number, number] = [-22.6333, -47.0500];
const DEFAULT_ZOOM = 14;

// Holambra bounding box — filter out bogus coords
const LAT_MIN = -22.70, LAT_MAX = -22.58;
const LNG_MIN = -47.12, LNG_MAX = -46.98;

function isValidCoord(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat == null || lng == null) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= LAT_MIN && lat <= LAT_MAX && lng >= LNG_MIN && lng <= LNG_MAX;
}

interface SiteMapViewProps {
  height?: string;
  className?: string;
}

export default function SiteMapView({ height = "400px", className = "" }: SiteMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // Fetch real places from DB (active, non-pending)
  const { data: places } = usePlacesList({ limit: 80, offset: 0 });

  // Initialize Leaflet
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
        await new Promise(resolve => {
          link.onload = resolve;
          setTimeout(resolve, 1000);
        });
      }

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: HOLAMBRA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      // OSM tiles — correct URL
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
      setLoading(false);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add real place markers when map is ready and places loaded
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady || !places || places.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const orangeIcon = L.divIcon({
      className: "site-map-marker",
      html: `<div style="
        width: 28px; height: 28px;
        background: #E65100;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      "><div style="
        transform: rotate(45deg);
        color: #FFFFFF; font-size: 12px; font-weight: bold;
      ">●</div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    (places as any[]).forEach((place) => {
      if (!isValidCoord(place.lat, place.lng)) return;

      const marker = L.marker([place.lat, place.lng], { icon: orangeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: Montserrat, sans-serif; padding: 4px 0;">
            <strong style="color: #00251A; font-size: 14px;">${place.name}</strong>
            ${place.categoryName ? `<br/><span style="color: #666; font-size: 12px;">${place.categoryName}</span>` : ""}
          </div>`
        );

      markersRef.current.push(marker);
    });
  }, [places, mapReady]);

  // Geolocation
  useEffect(() => {
    if (!mapReady) return;
    if (!("geolocation" in navigator)) { setGeoStatus("denied"); return; }

    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setGeoStatus("granted");

        const userIcon = L.divIcon({
          className: "site-map-user",
          html: `<div style="
            width: 16px; height: 16px;
            background: #4285F4;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 8px rgba(0,0,0,0.2);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(loc, { icon: userIcon })
          .addTo(map)
          .bindPopup('<div style="font-family: Montserrat, sans-serif;"><strong>Você está aqui</strong></div>');
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [mapReady]);

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userLocation, 15, { duration: 1 });
    }
  };

  const centerOnHolambra = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(HOLAMBRA_CENTER, DEFAULT_ZOOM, { duration: 1 });
    }
  };

  return (
    <div className={className} style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height, borderRadius: "14px", background: "#E8EDE8" }}
      />

      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#E8EDE8", borderRadius: "14px", zIndex: 10,
        }}>
          <div style={{ textAlign: "center" }}>
            <Loader2 size={32} style={{ color: "#E65100", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.5)" }}>Carregando mapa...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{
          position: "absolute", bottom: 16, right: 16, zIndex: 1000,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {userLocation && (
            <button
              onClick={centerOnUser}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#FFFFFF", border: "1px solid rgba(0,37,26,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#4285F4",
              }}
              title="Minha localização"
              aria-label="Centralizar na minha localização"
            >
              <Navigation size={18} />
            </button>
          )}
          <button
            onClick={centerOnHolambra}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#FFFFFF", border: "1px solid rgba(0,37,26,0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#E65100",
            }}
            title="Centro de Holambra"
            aria-label="Centralizar em Holambra"
          >
            <MapPin size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
