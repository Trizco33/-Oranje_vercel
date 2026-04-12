import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { getPlaceImage } from "@/components/PlaceCard";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Navigation,
  ExternalLink, CheckCircle2, Compass, ArrowRight, Heart, AlertCircle,
} from "lucide-react";
import {
  trackReceptivoEvent,
  saveReceptivoProgress,
  loadReceptivoProgress,
  clearReceptivoProgress,
} from "@/lib/receptivoAnalytics";
import { TourDriverCTA } from "@/components/TourDriverCTA";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourStop {
  stopId: number;
  placeId: number;
  stopOrder: number;
  narrative: string | null;
  tip: string | null;
  bestMoment: string | null;
  placeName: string;
  placeShortDesc: string | null;
  placeLat: number | null;
  placeLng: number | null;
  placeAddress: string | null;
  placeCoverImage: string | null;
  placeImages: any;
  placeCategoryId: number | null;
}

// ─── Haversine distance (meters) ─────────────────────────────────────────────

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Configurable constants ───────────────────────────────────────────────────
// Adjust ARRIVAL_RADIUS_METERS to tune how close the user needs to be
// before "Você chegou!" fires. 80m works well for Holambra's street layout.
const ARRIVAL_RADIUS_METERS = 80;

// ─── Map Component ────────────────────────────────────────────────────────────
// Tile: CartoDB Positron (clean light map — orange markers pop dramatically)
// Markers: 3-state — past (dark/check), active (orange+pulse), upcoming (muted)
// Polylines: solid orange for walked path, dashed grey for path ahead
// Overlay: floating pill inside map shows active stop name + distance (if nav active)
// Geolocation: live user blue dot + haversine distance + arrival callback

const RECEPTIVO_PULSE_STYLE_ID = "receptivo-pulse-keyframes";

function injectPulseStyle() {
  if (document.getElementById(RECEPTIVO_PULSE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = RECEPTIVO_PULSE_STYLE_ID;
  style.textContent = `
    @keyframes receptivoPulse {
      0%   { box-shadow: 0 0 0 0 rgba(230,81,0,0.55), 0 3px 12px rgba(0,0,0,0.35); }
      60%  { box-shadow: 0 0 0 10px rgba(230,81,0,0), 0 3px 12px rgba(0,0,0,0.35); }
      100% { box-shadow: 0 0 0 0 rgba(230,81,0,0), 0 3px 12px rgba(0,0,0,0.35); }
    }
    .receptivo-marker-active {
      animation: receptivoPulse 1.8s ease-out infinite;
    }
  `;
  document.head.appendChild(style);
}

function createMarkerIcon(L: any, number: number, state: "past" | "active" | "upcoming", isFirst: boolean, isLast: boolean) {
  if (state === "active") {
    const size = 42;
    const labelHtml = isFirst
      ? `<div style="position:absolute;top:${size + 3}px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:800;color:#E65100;font-family:Montserrat,sans-serif;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 3px rgba(255,255,255,0.9);">INÍCIO</div>`
      : isLast
      ? `<div style="position:absolute;top:${size + 3}px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:800;color:#E65100;font-family:Montserrat,sans-serif;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 3px rgba(255,255,255,0.9);">FIM</div>`
      : "";
    const html = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="receptivo-marker-active" style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:#E65100;border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:800;font-size:15px;
          font-family:Montserrat,sans-serif;
          position:relative;z-index:2;
        ">${number}</div>
        ${labelHtml}
      </div>`;
    const anchor = size / 2;
    return L.divIcon({ html, iconSize: [size, size + (isFirst || isLast ? 18 : 0)], iconAnchor: [anchor, anchor], className: "" });
  }

  if (state === "past") {
    const size = 28;
    const labelHtml = isFirst
      ? `<div style="position:absolute;top:${size + 2}px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:800;color:#00251A;font-family:Montserrat,sans-serif;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 3px rgba(255,255,255,0.9);">INÍCIO</div>`
      : "";
    const html = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:#00251A;border:2px solid rgba(255,255,255,0.8);
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:11px;
          font-family:Montserrat,sans-serif;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
        ">✓</div>
        ${labelHtml}
      </div>`;
    const anchor = size / 2;
    return L.divIcon({ html, iconSize: [size, size + (isFirst ? 16 : 0)], iconAnchor: [anchor, anchor], className: "" });
  }

  // upcoming
  const size = 28;
  const labelHtml = isLast
    ? `<div style="position:absolute;top:${size + 2}px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:800;color:#7a9e96;font-family:Montserrat,sans-serif;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 3px rgba(255,255,255,0.9);">FIM</div>`
    : "";
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:rgba(255,255,255,0.85);border:2px solid rgba(0,77,58,0.35);
        display:flex;align-items:center;justify-content:center;
        color:#7a9e96;font-weight:700;font-size:11px;
        font-family:Montserrat,sans-serif;
        box-shadow:0 2px 6px rgba(0,0,0,0.12);
      ">${number}</div>
      ${labelHtml}
    </div>`;
  const anchor = size / 2;
  return L.divIcon({ html, iconSize: [size, size + (isLast ? 16 : 0)], iconAnchor: [anchor, anchor], className: "" });
}

function ReceptivoMap({
  stops,
  activeIndex,
  navActive,
  onStopSelect,
  onDistanceUpdate,
  onArrival,
  onGeoError,
}: {
  stops: TourStop[];
  activeIndex: number;
  navActive: boolean;
  onStopSelect: (i: number) => void;
  onDistanceUpdate: (meters: number | null) => void;
  onArrival: (stopIndex: number) => void;
  onGeoError: (code: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineWalkedRef = useRef<any>(null);
  const polylineAheadRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const arrivedRef = useRef<Set<number>>(new Set()); // prevent repeated arrival callbacks

  const validStops = stops.filter((s) => s.placeLat != null && s.placeLng != null);
  const total = validStops.length;

  const getState = useCallback((i: number): "past" | "active" | "upcoming" => {
    if (i < activeIndex) return "past";
    if (i === activeIndex) return "active";
    return "upcoming";
  }, [activeIndex]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || validStops.length === 0) return;
    injectPulseStyle();

    (async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(mapRef.current!, {
        center: [validStops[0].placeLat!, validStops[0].placeLng!],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron Retina — clean white/grey tiles, orange markers pop dramatically
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
        subdomains: "abcd",
      }).addTo(map);

      mapInstanceRef.current = map;

      const allCoords = validStops.map((s) => [s.placeLat!, s.placeLng!] as [number, number]);

      // Walked path: solid orange from start to active stop
      polylineWalkedRef.current = L.polyline(allCoords.slice(0, Math.max(activeIndex + 1, 1)), {
        color: "#E65100",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);

      // Ahead path: dashed muted from active stop to end
      polylineAheadRef.current = L.polyline(allCoords.slice(activeIndex), {
        color: "#7a9e96",
        weight: 2.5,
        opacity: 0.5,
        dashArray: "6 5",
      }).addTo(map);

      // Numbered stop markers
      validStops.forEach((stop, i) => {
        const icon = createMarkerIcon(L, i + 1, getState(i), i === 0, i === total - 1);
        const marker = L.marker([stop.placeLat!, stop.placeLng!], { icon }).addTo(map);
        marker.on("click", () => onStopSelect(i));
        markersRef.current.push(marker);
      });

      if (validStops.length > 1) {
        map.fitBounds(allCoords, { padding: [44, 44] });
      }
    })();

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      polylineWalkedRef.current = null;
      polylineAheadRef.current = null;
      userMarkerRef.current = null;
      watchIdRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers and polylines when activeIndex changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || markersRef.current.length === 0) return;

    const allCoords = validStops.map((s) => [s.placeLat!, s.placeLng!] as [number, number]);
    if (polylineWalkedRef.current) polylineWalkedRef.current.setLatLngs(allCoords.slice(0, Math.max(activeIndex + 1, 1)));
    if (polylineAheadRef.current) polylineAheadRef.current.setLatLngs(allCoords.slice(activeIndex));

    markersRef.current.forEach((marker, i) => {
      if (!validStops[i]) return;
      marker.setIcon(createMarkerIcon(L, i + 1, getState(i), i === 0, i === total - 1));
    });

    const active = validStops[activeIndex];
    if (active) map.setView([active.placeLat!, active.placeLng!], 16, { animate: true, duration: 0.5 });

    // Reset arrival state for new stop
    arrivedRef.current.delete(activeIndex);
  }, [activeIndex, getState, total]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start / stop geolocation watch when navActive changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    if (!navActive) {
      // Stop watching, remove user marker, reset distance
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userMarkerRef.current && map) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      onDistanceUpdate(null);
      return;
    }

    if (!navigator.geolocation) {
      onDistanceUpdate(null);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: userLat, longitude: userLng, accuracy } = pos.coords;

        // Create or update user marker (blue pulsing dot)
        if (L && map) {
          const latlng = L.latLng(userLat, userLng);
          const accuracyText = accuracy ? `${Math.round(accuracy)}m` : "";
          const userIcon = L.divIcon({
            html: `<div style="
              width:16px;height:16px;border-radius:50%;
              background:rgba(30,136,229,0.92);
              border:2.5px solid #fff;
              box-shadow:0 0 0 5px rgba(30,136,229,0.18), 0 2px 8px rgba(0,0,0,0.25);
              position:relative;
            " title="${accuracyText}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            className: "",
          });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(latlng);
            userMarkerRef.current.setIcon(userIcon);
          } else {
            userMarkerRef.current = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          }
        }

        // Calculate distance to active stop
        const activeStop = validStops[activeIndex];
        if (activeStop?.placeLat != null && activeStop?.placeLng != null) {
          const dist = haversineMeters(userLat, userLng, activeStop.placeLat!, activeStop.placeLng!);
          onDistanceUpdate(dist);

          // Fire arrival callback once per stop
          if (dist <= ARRIVAL_RADIUS_METERS && !arrivedRef.current.has(activeIndex)) {
            arrivedRef.current.add(activeIndex);
            onArrival(activeIndex);
          }
        }
      },
      (err) => {
        onDistanceUpdate(null);
        onGeoError(err.code); // 1=denied, 2=unavailable, 3=timeout
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [navActive, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeStop = validStops[activeIndex];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: 268, overflow: "hidden" }}
      />
      {/* Floating overlay: active stop name + progress/nav indicator */}
      {activeStop && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,37,26,0.85)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            padding: "8px 12px",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#E65100",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#fff", fontFamily: "Montserrat,sans-serif", flexShrink: 0,
            }}>
              {activeIndex + 1}
            </div>
            <span style={{
              color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat,sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {activeStop.placeName}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginLeft: 8 }}>
            {navActive && (
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "rgba(30,136,229,0.9)",
                boxShadow: "0 0 4px rgba(30,136,229,0.6)",
              }} />
            )}
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 600, fontFamily: "Montserrat,sans-serif" }}>
              {activeIndex + 1}/{total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Journey Strip ────────────────────────────────────────────────────────────
// Horizontal metro-style progress strip showing all stops as connected nodes.
// Gives the user the feeling of "I'm on a route" rather than "pins on a map".

function JourneyStrip({
  stops,
  activeIndex,
  onSelect,
}: {
  stops: TourStop[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      style={{
        background: "#00251A",
        padding: "14px 20px 16px",
      }}
    >
      {/* Label */}
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "Montserrat,sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Percurso
      </p>
      {/* Nodes + connectors */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {stops.map((stop, i) => {
          const isPast = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === stops.length - 1;

          const nodeColor = isPast ? "#00251A" : isActive ? "#E65100" : "transparent";
          const nodeBorder = isPast ? "rgba(255,255,255,0.45)" : isActive ? "#E65100" : "rgba(255,255,255,0.25)";
          const nodeInner = isPast ? "✓" : `${i + 1}`;
          const nodeTextColor = isPast ? "rgba(255,255,255,0.7)" : isActive ? "#fff" : "rgba(255,255,255,0.35)";

          return (
            <div key={stop.stopId} style={{ display: "flex", alignItems: "flex-start", flex: isLast ? "none" : 1 }}>
              {/* Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button
                  onClick={() => onSelect(i)}
                  style={{
                    width: isActive ? 28 : 22,
                    height: isActive ? 28 : 22,
                    borderRadius: "50%",
                    background: nodeColor,
                    border: `2px solid ${nodeBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: nodeTextColor,
                    fontSize: isActive ? 11 : 9,
                    fontWeight: 800,
                    fontFamily: "Montserrat,sans-serif",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                    boxShadow: isActive ? "0 0 0 3px rgba(230,81,0,0.25)" : "none",
                  }}
                >
                  {nodeInner}
                </button>
                {/* Stop name truncated */}
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#E65100" : isPast ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)",
                    fontFamily: "Montserrat,sans-serif",
                    textAlign: "center",
                    maxWidth: 52,
                    lineHeight: 1.25,
                    wordBreak: "break-word",
                  }}
                >
                  {stop.placeName.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginTop: isActive ? 13 : 10,
                    background: isPast
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.12)",
                    backgroundImage: isPast
                      ? "none"
                      : "repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 4px, transparent 4px, transparent 8px)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Navigation Bar ───────────────────────────────────────────────────────────
// The "coração" of the Receptivo experience.
// States:
//   idle   → "Ativar navegação guiada" call-to-action
//   locating → GPS signal being acquired
//   navigating (far) → distance indicator to active stop
//   navigating (arrived) → "Você chegou!" + advance button

type GeoStatus = "idle" | "locating" | "tracking" | "denied" | "unavailable";

function NavBar({
  navActive,
  geoStatus,
  distanceMeters,
  arrived,
  activeStop,
  isLastStop,
  onActivate,
  onAdvance,
}: {
  navActive: boolean;
  geoStatus: GeoStatus;
  distanceMeters: number | null;
  arrived: boolean;
  activeStop: TourStop | null;
  isLastStop: boolean;
  onActivate: () => void;
  onAdvance: () => void;
}) {
  const distLabel = distanceMeters != null
    ? distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)} km`
      : `${Math.round(distanceMeters)} m`
    : null;

  // ── Idle: invite user to activate guided navigation ──────────────────────
  if (!navActive) {
    return (
      <div style={{
        margin: "0 16px 4px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #00251A 0%, #004D3A 100%)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: "0 2px 12px rgba(0,37,26,0.18)",
      }}>
        <div>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "Montserrat,sans-serif", margin: "0 0 2px" }}>
            Navegação guiada
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Montserrat,sans-serif", margin: 0, lineHeight: 1.4 }}>
            Ative para acompanhar o percurso com sua localização
          </p>
        </div>
        <button
          onClick={onActivate}
          style={{
            background: "#E65100", border: "none", borderRadius: 10,
            padding: "10px 14px", color: "#fff", fontSize: 12, fontWeight: 700,
            fontFamily: "Montserrat,sans-serif", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <Compass size={14} />
          Ativar
        </button>
      </div>
    );
  }

  // ── GPS Permission denied — clean fallback, no broken state ─────────────
  if (geoStatus === "denied") {
    return (
      <div style={{
        margin: "0 16px 4px",
        borderRadius: 14,
        background: "rgba(0,37,26,0.08)",
        border: "1px solid rgba(0,37,26,0.12)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}>
        <AlertCircle size={18} color="#E65100" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ color: "#00251A", fontSize: 13, fontWeight: 700, fontFamily: "Montserrat,sans-serif", margin: "0 0 2px" }}>
            Permissão de localização negada
          </p>
          <p style={{ color: "rgba(0,37,26,0.55)", fontSize: 11, fontFamily: "Montserrat,sans-serif", margin: 0, lineHeight: 1.4 }}>
            Para usar a navegação guiada, habilite a localização nas configurações do seu navegador. O passeio continua normalmente mesmo sem GPS.
          </p>
        </div>
      </div>
    );
  }

  // ── GPS unavailable — friendly message ───────────────────────────────────
  if (geoStatus === "unavailable") {
    return (
      <div style={{
        margin: "0 16px 4px",
        borderRadius: 14,
        background: "rgba(0,37,26,0.08)",
        border: "1px solid rgba(0,37,26,0.12)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}>
        <AlertCircle size={18} color="rgba(0,37,26,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ color: "#00251A", fontSize: 13, fontWeight: 700, fontFamily: "Montserrat,sans-serif", margin: "0 0 2px" }}>
            Sinal GPS indisponível
          </p>
          <p style={{ color: "rgba(0,37,26,0.5)", fontSize: 11, fontFamily: "Montserrat,sans-serif", margin: 0, lineHeight: 1.4 }}>
            Seu dispositivo não conseguiu obter localização. Tente em área aberta. O passeio continua normalmente.
          </p>
        </div>
      </div>
    );
  }

  // ── Arrived: "Você chegou!" + advance or congratulations ─────────────────
  if (arrived) {
    return (
      <div style={{
        margin: "0 16px 4px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #E65100 0%, #BF360C 100%)",
        padding: "14px 16px",
        boxShadow: "0 2px 16px rgba(230,81,0,0.35)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <CheckCircle2 size={20} color="#fff" />
          <div>
            <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "Montserrat,sans-serif", margin: 0 }}>
              Você chegou!
            </p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Montserrat,sans-serif", margin: 0 }}>
              {activeStop?.placeName}
            </p>
          </div>
        </div>
        {!isLastStop ? (
          <button
            onClick={onAdvance}
            style={{
              width: "100%", background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 10,
              padding: "10px 0", color: "#fff", fontSize: 13, fontWeight: 700,
              fontFamily: "Montserrat,sans-serif", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            Próxima parada
            <ArrowRight size={15} />
          </button>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 12.5, fontFamily: "Montserrat,sans-serif", textAlign: "center", margin: 0, fontWeight: 600 }}>
            Parabéns — você completou o passeio! ✦
          </p>
        )}
      </div>
    );
  }

  // ── Navigating: live distance meter ──────────────────────────────────────
  return (
    <div style={{
      margin: "0 16px 4px",
      borderRadius: 14,
      background: "#00251A",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "rgba(30,136,229,0.9)",
          boxShadow: "0 0 0 3px rgba(30,136,229,0.22)",
          flexShrink: 0,
        }} />
        <div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, fontFamily: "Montserrat,sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1px" }}>
            Navegação ativa
          </p>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "Montserrat,sans-serif", margin: 0 }}>
            {activeStop?.placeName ?? "—"}
          </p>
        </div>
      </div>
      {geoStatus === "locating" || distLabel === null ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Montserrat,sans-serif", margin: 0, flexShrink: 0 }}>
          Localizando...
        </p>
      ) : (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "Montserrat,sans-serif", margin: "0 0 1px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            distância
          </p>
          <p style={{ color: "#E65100", fontSize: 20, fontWeight: 800, fontFamily: "Montserrat,sans-serif", margin: 0, lineHeight: 1 }}>
            {distLabel}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Stop Panel ───────────────────────────────────────────────────────────────

function StopPanel({
  stop,
  index,
  total,
  onNext,
  onPrev,
}: {
  stop: TourStop;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const image = imgError
    ? null
    : getPlaceImage({ coverImage: stop.placeCoverImage, images: stop.placeImages, name: stop.placeName });

  const mapsUrl = stop.placeLat && stop.placeLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${stop.placeLat},${stop.placeLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.placeName + " Holambra")}`;

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(0,37,26,0.04)",
          border: "1px solid rgba(0,37,26,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= index ? "#E65100" : "rgba(0,37,26,0.15)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#E65100",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {index + 1} de {total}
        </span>
      </div>

      {/* Stop card */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid rgba(0,37,26,0.1)",
          boxShadow: "0 4px 20px rgba(0,37,26,0.08)",
          marginBottom: 16,
        }}
      >
        {/* Image */}
        {image && !imgError && (
          <div style={{ position: "relative", height: 180 }}>
            <img
              src={image}
              alt={stop.placeName}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgError(true)}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,37,26,0.8) 0%, rgba(0,37,26,0.1) 50%, transparent 100%)",
              }}
            />
            <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#E65100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: "Montserrat, sans-serif",
                    flexShrink: 0,
                    border: "2px solid rgba(255,255,255,0.4)",
                  }}
                >
                  {index + 1}
                </div>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: "Montserrat, sans-serif",
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {stop.placeName}
                </h2>
              </div>
              {stop.bestMoment && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                    background: "rgba(230,81,0,0.75)",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  ✨ {stop.bestMoment}
                </span>
              )}
            </div>
          </div>
        )}

        {/* No image fallback header */}
        {(!image || imgError) && (
          <div
            style={{
              padding: "18px 16px 12px",
              background: "linear-gradient(135deg, #00251A, #004D40)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#E65100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "Montserrat, sans-serif",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </div>
            <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              {stop.placeName}
            </h2>
          </div>
        )}

        {/* Narrative */}
        {stop.narrative && (
          <div style={{ padding: "16px 16px 0" }}>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "#2D3748",
                margin: 0,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {stop.narrative}
            </p>
          </div>
        )}

        {/* Tip */}
        {stop.tip && (
          <div
            style={{
              margin: "12px 16px 0",
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(230,81,0,0.05)",
              borderLeft: "3px solid #E65100",
            }}
          >
            <p style={{ fontSize: 12.5, color: "#555", margin: 0, lineHeight: 1.6, fontFamily: "Montserrat, sans-serif" }}>
              💡 {stop.tip}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ padding: "14px 16px 10px" }}>
          {/* Primary: explore place detail within Oranje */}
          <Link
            to={`/app/lugar/${stop.placeId}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "11px 8px",
              borderRadius: 10,
              background: "#00251A",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "Montserrat, sans-serif",
              textDecoration: "none",
              width: "100%",
            }}
          >
            <ExternalLink size={13} />
            Ver lugar completo
          </Link>
          {/* Fallback: Google Maps as a small secondary text link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              marginTop: 8,
              color: "rgba(0,37,26,0.4)",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "Montserrat, sans-serif",
              textDecoration: "none",
            }}
          >
            <Navigation size={11} />
            Abrir navegação externa
          </a>
        </div>
      </div>

      {/* Navigation arrows */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "13px",
            borderRadius: 12,
            border: "1px solid rgba(0,37,26,0.15)",
            background: isFirst ? "rgba(0,37,26,0.03)" : "rgba(0,37,26,0.06)",
            color: isFirst ? "rgba(0,37,26,0.25)" : "#00251A",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Montserrat, sans-serif",
            cursor: isFirst ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background: isLast ? "#00251A" : "#E65100",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "Montserrat, sans-serif",
            cursor: "pointer",
          }}
        >
          {isLast ? (
            <>
              <CheckCircle2 size={16} />
              Finalizar passeio
            </>
          ) : (
            <>
              Próxima parada
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Stops List Overview ──────────────────────────────────────────────────────

function StopsList({
  stops,
  activeIndex,
  onSelect,
}: {
  stops: TourStop[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#00251A",
          fontFamily: "Montserrat, sans-serif",
          margin: "0 0 12px",
          letterSpacing: "0.02em",
        }}
      >
        Todas as paradas
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stops.map((stop, i) => {
          const isPast = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <button
              key={stop.stopId}
              onClick={() => onSelect(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                border: isActive
                  ? "1.5px solid #E65100"
                  : "1px solid rgba(0,37,26,0.1)",
                background: isActive
                  ? "rgba(230,81,0,0.04)"
                  : isPast
                  ? "rgba(0,37,26,0.02)"
                  : "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isPast ? "#00251A" : isActive ? "#E65100" : "rgba(0,37,26,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isPast || isActive ? "#fff" : "#00251A",
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "Montserrat, sans-serif",
                  flexShrink: 0,
                }}
              >
                {isPast ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "#E65100" : isPast ? "#666" : "#00251A",
                    margin: 0,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {stop.placeName}
                </p>
                {stop.bestMoment && (
                  <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0", fontFamily: "Montserrat, sans-serif" }}>
                    {stop.bestMoment}
                  </p>
                )}
              </div>
              {isActive && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#E65100",
                    background: "rgba(230,81,0,0.1)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  AQUI
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Closing Section ──────────────────────────────────────────────────────────

interface ExtensionPlace {
  placeId: number;
  placeName: string;
  placeShortDesc: string | null;
  placeAddress: string | null;
  placeCoverImage: string | null;
  placeImages: any;
  placeLat: any;
  placeLng: any;
}

function ClosingSection({ tourName, extensionPlaces = [] }: { tourName: string; extensionPlaces?: ExtensionPlace[] }) {
  const navigate = useNavigate();
  return (
    <div style={{ margin: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Encerramento principal ── */}
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "linear-gradient(135deg, #00251A 0%, #004D3A 100%)",
          padding: "28px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(230,81,0,0.2)",
            border: "1.5px solid rgba(230,81,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Heart size={24} color="#E65100" />
        </div>
        <h3
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            fontFamily: "Montserrat, sans-serif",
            margin: "0 0 8px",
          }}
        >
          Passeio concluído
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 13.5,
            lineHeight: 1.65,
            fontFamily: "Montserrat, sans-serif",
            margin: "0 0 24px",
          }}
        >
          Você viveu o {tourName}. Cada parada foi escolhida a dedo para criar uma experiência que Holambra merece.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => navigate("/app/explorar")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: "#E65100",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "Montserrat, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Compass size={16} />
            Explorar mais lugares
          </button>
          <button
            onClick={() => navigate("/app")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Montserrat, sans-serif",
              cursor: "pointer",
            }}
          >
            Início do app
          </button>
        </div>
      </div>

      {/* ── Se quiser ir além ── */}
      {extensionPlaces.length > 0 && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(0,37,26,0.10)",
            background: "#fff",
            padding: "18px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <div style={{ height: 2, width: 14, borderRadius: 2, background: "#E65100", flexShrink: 0 }} />
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#E65100",
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Se quiser ir além
            </p>
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: "rgba(0,37,26,0.55)",
              fontFamily: "Montserrat, sans-serif",
              margin: "0 0 14px",
              lineHeight: 1.55,
            }}
          >
            Lugares próximos que complementam bem a experiência — sem pressa, no seu ritmo.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {extensionPlaces.map((ep) => {
              const img = getPlaceImage({ coverImage: ep.placeCoverImage, images: ep.placeImages, name: ep.placeName });
              return (
                <Link
                  key={ep.placeId}
                  to={`/app/lugar/${ep.placeId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 12px",
                      borderRadius: 12,
                      background: "rgba(0,37,26,0.03)",
                      border: "1px solid rgba(0,37,26,0.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "linear-gradient(135deg, #00251A 0%, #004D3A 100%)",
                      }}
                    >
                      {img && (
                        <img
                          src={img}
                          alt={ep.placeName}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          fontFamily: "Montserrat, sans-serif",
                          color: "#00251A",
                          margin: "0 0 3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ep.placeName}
                      </p>
                      {ep.placeShortDesc && (
                        <p
                          style={{
                            fontSize: 11.5,
                            color: "rgba(0,37,26,0.5)",
                            fontFamily: "Montserrat, sans-serif",
                            margin: 0,
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {ep.placeShortDesc}
                        </p>
                      )}
                    </div>
                    <span style={{ flexShrink: 0, display: "flex" }}><ChevronRight size={14} color="#E65100" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReceptivoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const stopPanelRef = useRef<HTMLDivElement>(null);

  // ── Navigation mode state ──────────────────────────────────────────────────
  const [navActive, setNavActive] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [distanceToActive, setDistanceToActive] = useState<number | null>(null);
  const [arrivedAtActive, setArrivedAtActive] = useState(false);
  const hasTrackedStart = useRef(false);

  const { data: tour, isLoading, error } = trpc.receptivo.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const stops: TourStop[] = (tour as any)?.stops ?? [];
  const tourName: string = (tour as any)?.name ?? "";

  // ── Restore persisted progress ─────────────────────────────────────────────
  useEffect(() => {
    if (!slug || stops.length === 0 || hasTrackedStart.current) return;
    const saved = loadReceptivoProgress(slug);
    if (saved && saved.activeIndex > 0 && saved.activeIndex < stops.length) {
      setActiveIndex(saved.activeIndex);
    }
    // Track journey start (once)
    hasTrackedStart.current = true;
    trackReceptivoEvent("receptivo_start", {
      tourSlug: slug,
      totalStops: stops.length,
    });
  }, [slug, stops.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist progress on activeIndex change ─────────────────────────────────
  useEffect(() => {
    if (!slug || !tourName || stops.length === 0) return;
    if (finished) {
      clearReceptivoProgress();
      return;
    }
    saveReceptivoProgress({
      slug,
      tourName,
      activeIndex,
      totalStops: stops.length,
    });
  }, [slug, tourName, activeIndex, stops.length, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Abandon tracking (best-effort on unmount) ──────────────────────────────
  useEffect(() => {
    return () => {
      if (!finished && hasTrackedStart.current && slug && activeIndex > 0) {
        trackReceptivoEvent("receptivo_abandon", {
          tourSlug: slug,
          stopIndex: activeIndex,
          totalStops: stops.length,
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    if (activeIndex < stops.length - 1) {
      trackReceptivoEvent("receptivo_stop_advance", {
        tourSlug: slug ?? "",
        stopIndex: activeIndex,
        stopName: stops[activeIndex]?.placeName,
        totalStops: stops.length,
      });
      setActiveIndex((i) => i + 1);
      setArrivedAtActive(false);
      setDistanceToActive(null);
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setFinished(true);
      clearReceptivoProgress();
      trackReceptivoEvent("receptivo_complete", {
        tourSlug: slug ?? "",
        totalStops: stops.length,
      });
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeIndex, stops, slug]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      setArrivedAtActive(false);
      setDistanceToActive(null);
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeIndex]);

  const handleSelectStop = useCallback((i: number) => {
    setActiveIndex(i);
    setFinished(false);
    setArrivedAtActive(false);
    setDistanceToActive(null);
    stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── Navigation mode handlers ───────────────────────────────────────────────
  const handleActivateNav = useCallback(() => {
    setNavActive(true);
    setGeoStatus("locating");
    trackReceptivoEvent("receptivo_nav_activate", {
      tourSlug: slug ?? "",
      stopIndex: activeIndex,
      totalStops: stops.length,
    });
  }, [slug, activeIndex, stops.length]);

  const handleDistanceUpdate = useCallback((meters: number | null) => {
    setDistanceToActive(meters);
    if (meters !== null) setGeoStatus("tracking");
  }, []);

  const handleGeoError = useCallback((code: number) => {
    setGeoStatus(code === 1 ? "denied" : "unavailable");
    setDistanceToActive(null);
  }, []);

  const handleArrival = useCallback((stopIndex: number) => {
    setArrivedAtActive(true);
    trackReceptivoEvent("receptivo_stop_arrival", {
      tourSlug: slug ?? "",
      stopIndex,
      stopName: stops[stopIndex]?.placeName,
      totalStops: stops.length,
    });
    stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slug, stops]);

  const handleAdvanceFromNav = useCallback(() => {
    handleNext();
  }, [handleNext]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#00251A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E65100", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Montserrat, sans-serif", fontSize: 13 }}>Carregando passeio...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div style={{ minHeight: "100dvh", background: "#f8f8f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <MapPin size={40} color="#ccc" style={{ marginBottom: 16 }} />
        <p style={{ color: "#666", fontFamily: "Montserrat, sans-serif", fontSize: 14, textAlign: "center" }}>
          Passeio não encontrado.
        </p>
        <button onClick={() => navigate("/app")} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 12, border: "none", background: "#00251A", color: "#fff", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const t = tour as any;

  return (
    <div style={{ minHeight: "100dvh", background: "#f5f4f0", paddingBottom: 80 }}>
      <OranjeHeader />

      {/* ── Cover ── */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
          {t.coverImage ? (
            <img
              src={t.coverImage}
              alt={t.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #00251A 0%, #004D3A 50%, #00251A 100%)" }} />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,37,26,0.95) 0%, rgba(0,37,26,0.5) 50%, rgba(0,37,26,0.25) 100%)",
            }}
          />

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </button>

          {/* Cover content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 18px 20px" }}>
            {/* Receptivo badge */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#E65100",
                  background: "rgba(230,81,0,0.18)",
                  border: "1px solid rgba(230,81,0,0.35)",
                  padding: "3px 9px",
                  borderRadius: 6,
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Receptivo Oranje
              </span>
              {t.theme && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.8)",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "3px 9px",
                    borderRadius: 6,
                    fontFamily: "Montserrat, sans-serif",
                    letterSpacing: "0.04em",
                    textTransform: "capitalize",
                  }}
                >
                  {t.theme}
                </span>
              )}
            </div>
            <h1
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: 800,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 4px",
                lineHeight: 1.2,
              }}
            >
              {t.name}
            </h1>
            {t.tagline && (
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 13.5,
                  fontFamily: "Montserrat, sans-serif",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {t.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Meta bar */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "#00251A",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 8px",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Clock size={14} color="#E65100" style={{ marginBottom: 3 }} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
              {t.duration ?? "3–4h"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }}>duração</span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 8px",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <MapPin size={14} color="#E65100" style={{ marginBottom: 3 }} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
              {stops.length}
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }}>paradas</span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 8px",
            }}
          >
            <Compass size={14} color="#E65100" style={{ marginBottom: 3 }} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
              Curado
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }}>pelo Oranje</span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {t.description && (
        <div style={{ padding: "18px 16px 8px" }}>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "#2D3748",
              margin: 0,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {t.description}
          </p>
        </div>
      )}

      {/* ── Map ── */}
      {stops.some((s) => s.placeLat != null) && (
        <div style={{ marginTop: 12 }}>
          <ReceptivoMap
            stops={stops}
            activeIndex={activeIndex}
            navActive={navActive}
            onStopSelect={handleSelectStop}
            onDistanceUpdate={handleDistanceUpdate}
            onArrival={handleArrival}
            onGeoError={handleGeoError}
          />
          <JourneyStrip stops={stops} activeIndex={activeIndex} onSelect={handleSelectStop} />
        </div>
      )}

      {/* ── Navigation Bar ── */}
      {!finished && stops.length > 0 && (
        <div style={{ marginTop: 12, marginBottom: 4 }}>
          <NavBar
            navActive={navActive}
            geoStatus={geoStatus}
            distanceMeters={distanceToActive}
            arrived={arrivedAtActive}
            activeStop={stops[activeIndex] ?? null}
            isLastStop={activeIndex === stops.length - 1}
            onActivate={handleActivateNav}
            onAdvance={handleAdvanceFromNav}
          />
        </div>
      )}

      {/* ── Stop panel or closing ── */}
      <div ref={stopPanelRef} style={{ marginTop: 8 }}>
        {finished ? (
          <ClosingSection tourName={t.name} extensionPlaces={t.extensionPlaces ?? []} />
        ) : stops.length > 0 ? (
          <StopPanel
            stop={stops[activeIndex]}
            index={activeIndex}
            total={stops.length}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        ) : null}
      </div>

      {/* ── Divider ── */}
      {stops.length > 0 && (
        <div style={{ margin: "4px 16px 16px", borderTop: "1px solid rgba(0,37,26,0.08)" }} />
      )}

      {/* ── Stops list overview ── */}
      {stops.length > 0 && (
        <StopsList stops={stops} activeIndex={activeIndex} onSelect={handleSelectStop} />
      )}

      {/* ── Closing section always at bottom if finished ── */}
      {finished && stops.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              margin: "0 16px",
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(0,37,26,0.04)",
              border: "1px solid rgba(0,37,26,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={() => { setActiveIndex(0); setFinished(false); }}
          >
            <ArrowRight size={16} color="#E65100" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>
              Recomeçar o passeio
            </span>
          </div>
        </div>
      )}

      <TourDriverCTA
        tourId={(tour as any)?.id}
        tourName={(tour as any)?.name ?? ""}
        requiresTransport={(tour as any)?.requiresTransport}
        walkOnly={(tour as any)?.walkOnly}
        recommendedWithDriver={(tour as any)?.recommendedWithDriver}
        clientPrice={(tour as any)?.clientPrice}
        driverPayout={(tour as any)?.driverPayout}
        partnerFee={(tour as any)?.partnerFee}
      />

      <TabBar />
    </div>
  );
}
