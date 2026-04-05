import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { getPlaceImage } from "@/components/PlaceCard";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Navigation,
  ExternalLink, CheckCircle2, Compass, ArrowRight, Heart,
} from "lucide-react";

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

// ─── Map Component ────────────────────────────────────────────────────────────

function ReceptivoMap({
  stops,
  activeIndex,
  onStopSelect,
}: {
  stops: TourStop[];
  activeIndex: number;
  onStopSelect: (i: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const validStops = stops.filter((s) => s.placeLat != null && s.placeLng != null);

  const createNumberedIcon = useCallback((L: any, number: number, isActive: boolean) => {
    const color = isActive ? "#E65100" : "#00251A";
    const border = isActive ? "#fff" : "rgba(255,255,255,0.7)";
    const size = isActive ? 38 : 30;
    const fontSize = isActive ? 14 : 11;
    const shadow = isActive
      ? "0 0 0 3px rgba(230,81,0,0.25), 0 3px 10px rgba(0,0,0,0.35)"
      : "0 2px 6px rgba(0,0,0,0.25)";
    const html = `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid ${border};
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:800;font-size:${fontSize}px;
      font-family:Montserrat,sans-serif;
      box-shadow:${shadow};
      transition:all 0.3s ease;
    ">${number}</div>`;
    return L.divIcon({ html, iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "" });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || validStops.length === 0) return;

    (async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const center = validStops[0];
      const map = L.map(mapRef.current!, {
        center: [center.placeLat!, center.placeLng!],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Draw polyline
      const coords = validStops.map((s) => [s.placeLat!, s.placeLng!] as [number, number]);
      polylineRef.current = L.polyline(coords, {
        color: "#E65100",
        weight: 3,
        opacity: 0.65,
        dashArray: "8 6",
      }).addTo(map);

      // Add numbered markers
      validStops.forEach((stop, i) => {
        const isActive = i === 0;
        const icon = createNumberedIcon(L, i + 1, isActive);
        const marker = L.marker([stop.placeLat!, stop.placeLng!], { icon }).addTo(map);
        marker.on("click", () => onStopSelect(i));
        markersRef.current.push(marker);
      });

      // Fit bounds
      if (validStops.length > 1) {
        map.fitBounds(coords, { padding: [40, 40] });
      }
    })();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      polylineRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when activeIndex changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || markersRef.current.length === 0) return;

    markersRef.current.forEach((marker, i) => {
      const isActive = i === activeIndex;
      const stop = validStops[i];
      if (!stop) return;
      marker.setIcon(createNumberedIcon(L, i + 1, isActive));
    });

    const activeStop = validStops[activeIndex];
    if (activeStop) {
      map.setView([activeStop.placeLat!, activeStop.placeLng!], 16, { animate: true, duration: 0.6 });
    }
  }, [activeIndex, createNumberedIcon]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 260,
        borderRadius: "0 0 20px 20px",
        overflow: "hidden",
        zIndex: 1,
      }}
    />
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
        <div style={{ display: "flex", gap: 8, padding: "14px 16px" }}>
          <Link
            to={`/app/lugar/${stop.placeId}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 8px",
              borderRadius: 10,
              background: "#00251A",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "Montserrat, sans-serif",
              textDecoration: "none",
            }}
          >
            <ExternalLink size={13} />
            Ver lugar completo
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 8px",
              borderRadius: 10,
              background: "rgba(0,37,26,0.06)",
              border: "1px solid rgba(0,37,26,0.12)",
              color: "#00251A",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "Montserrat, sans-serif",
              textDecoration: "none",
            }}
          >
            <Navigation size={13} />
            Abrir rota
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

function ClosingSection({ tourName }: { tourName: string }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        margin: "0 16px 16px",
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
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReceptivoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const stopPanelRef = useRef<HTMLDivElement>(null);

  const { data: tour, isLoading, error } = trpc.receptivo.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const stops: TourStop[] = (tour as any)?.stops ?? [];

  const handleNext = useCallback(() => {
    if (activeIndex < stops.length - 1) {
      setActiveIndex((i) => i + 1);
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setFinished(true);
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeIndex, stops.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeIndex]);

  const handleSelectStop = useCallback((i: number) => {
    setActiveIndex(i);
    setFinished(false);
    stopPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
            onStopSelect={handleSelectStop}
          />
        </div>
      )}

      {/* ── Stop panel or closing ── */}
      <div ref={stopPanelRef} style={{ marginTop: 16 }}>
        {finished ? (
          <ClosingSection tourName={t.name} />
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

      <TabBar />
    </div>
  );
}
