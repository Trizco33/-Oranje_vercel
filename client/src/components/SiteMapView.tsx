import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// Holambra center coordinates
const HOLAMBRA_CENTER: [number, number] = [-22.6333, -47.0500];
const DEFAULT_ZOOM = 14;

// Sample places in Holambra
const HOLAMBRA_PLACES = [
  { name: "Expoflora", lat: -22.6340, lng: -47.0560, category: "Ponto Turístico" },
  { name: "Moinho Povos Unidos", lat: -22.6320, lng: -47.0480, category: "Ponto Turístico" },
  { name: "Praça Vitória Régia", lat: -22.6338, lng: -47.0502, category: "Praça" },
  { name: "Deck do Lago", lat: -22.6355, lng: -47.0510, category: "Restaurante" },
  { name: "Café Moinho", lat: -22.6315, lng: -47.0490, category: "Café" },
  { name: "Cervejaria Holambra", lat: -22.6365, lng: -47.0530, category: "Bar" },
];

interface SiteMapViewProps {
  height?: string;
  className?: string;
}

export default function SiteMapView({ height = "400px", className = "" }: SiteMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // Load Leaflet dynamically
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      // Dynamically import leaflet
      const L = (await import("leaflet")).default;

      // Import leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
        // Wait for CSS to load
        await new Promise(resolve => {
          link.onload = resolve;
          setTimeout(resolve, 1000); // fallback
        });
      }

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths for Leaflet
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map
      const map = L.map(mapRef.current, {
        center: HOLAMBRA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      // Use OpenStreetMap tiles (free, no API key)
      L.tileLayer("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7pHyau6SJsIskcFQWV3OGtHEvVFQq4uVHsU0mlfQAIFWrdS6NzDp_X9IORZpWoxKg4OHxdMmfn_JP1eltHWx0l4CZKh83tVRcagXqk4GihfeOvbxKIwEYIikp8ap5JJ3A7kJJnnpCFhO6/s1600/Maperitive_screenshot.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add place markers
      const orangeIcon = L.divIcon({
        className: "site-map-marker",
        html: `<div style="
          width: 32px; height: 32px; 
          background: #E65100; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><div style="
          transform: rotate(45deg); 
          color: #FFFFFF; 
          font-size: 14px; 
          font-weight: bold;
        ">●</div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      HOLAMBRA_PLACES.forEach((place) => {
        L.marker([place.lat, place.lng], { icon: orangeIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: Montserrat, sans-serif; padding: 4px 0;">
              <strong style="color: #00251A; font-size: 14px;">${place.name}</strong><br/>
              <span style="color: #666; font-size: 12px;">${place.category}</span>
            </div>`
          );
      });

      setLoading(false);

      // Try geolocation
      if ("geolocation" in navigator) {
        setGeoStatus("requesting");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(loc);
            setGeoStatus("granted");

            // Add user location marker
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
          () => {
            if (cancelled) return;
            setGeoStatus("denied");
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
      } else {
        setGeoStatus("denied");
      }
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
      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height,
          borderRadius: "14px",
          background: "#F5F5DC",
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F5DC",
            borderRadius: "14px",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Loader2
              size={32}
              style={{ color: "#E65100", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}
            />
            <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.5)" }}>Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* Map controls */}
      {!loading && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {userLocation && (
            <button
              onClick={centerOnUser}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#FFFFFF",
                border: "1px solid rgba(0,37,26,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#4285F4",
              }}
              title="Minha localização"
              aria-label="Centralizar no minha localização"
            >
              <Navigation size={18} />
            </button>
          )}
          <button
            onClick={centerOnHolambra}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid rgba(0,37,26,0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#E65100",
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
