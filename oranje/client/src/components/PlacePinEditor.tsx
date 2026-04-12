/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, MapPin, ExternalLink, Save, Navigation } from "lucide-react";

const HOLAMBRA_CENTER = { lat: -22.6333, lng: -47.0520 };
const MAPS_PROXY_URL = `${import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev"}/v1/maps/proxy`;
const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }
    const existing = document.querySelector('script[data-gmaps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.setAttribute('data-gmaps', '1');
    s.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(s);
  });
}

const GEO_SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  auto:         { label: "Automático",   color: "#9E9E9E", bg: "rgba(150,150,150,0.15)" },
  manual:       { label: "Manual",       color: "#00897B", bg: "rgba(0,137,123,0.15)"   },
  osm_verified: { label: "OSM Verif.",   color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
  maps_verified:{ label: "Maps Verif.", color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
};

const GEO_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ok:            { label: "OK",         color: "#5BD98A", bg: "rgba(91,217,138,0.15)"  },
  suspect:       { label: "Suspeito",   color: "#FF9800", bg: "rgba(255,152,0,0.15)"   },
  out_of_bounds: { label: "Fora área",  color: "#F44336", bg: "rgba(244,67,54,0.15)"   },
  unverified:    { label: "Não verif.", color: "#9E9E9E", bg: "rgba(150,150,150,0.15)" },
  needs_review:  { label: "Revisar",    color: "#2196F3", bg: "rgba(33,150,243,0.15)"  },
};

function Badge({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      backgroundColor: cfg.bg,
      color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

interface PlacePinEditorProps {
  place: {
    id: number;
    name: string;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    geoStatus?: string | null;
    geoSource?: string | null;
    geoNote?: string | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

export function PlacePinEditor({ place, onClose, onSaved }: PlacePinEditorProps) {
  const [lat, setLat] = useState<number | null>(place.lat ?? null);
  const [lng, setLng] = useState<number | null>(place.lng ?? null);
  const [latInput, setLatInput] = useState(place.lat?.toFixed(6) ?? "");
  const [lngInput, setLngInput] = useState(place.lng?.toFixed(6) ?? "");
  const [mapReady, setMapReady] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null);

  const updatePin = trpc.places.updatePin.useMutation();

  const coordsValid = lat !== null && lng !== null && isFinite(lat) && isFinite(lng);
  const googleMapsUrl = coordsValid
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(place.name + " Holambra SP")}`;

  const moveMarker = useCallback((newLat: number, newLng: number) => {
    if (!markerRef.current) return;
    markerRef.current.position = { lat: newLat, lng: newLng };
  }, []);

  const panMap = useCallback((newLat: number, newLng: number) => {
    mapRef.current?.panTo({ lat: newLat, lng: newLng });
  }, []);

  const onMarkerPositionChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setLatInput(newLat.toFixed(6));
    setLngInput(newLng.toFixed(6));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleMaps();
        if (cancelled || !mapContainer.current) return;

        const center = (lat !== null && lng !== null)
          ? { lat, lng }
          : HOLAMBRA_CENTER;

        const map = new window.google.maps.Map(mapContainer.current, {
          zoom: 17,
          center,
          mapId: "DEMO_MAP_ID",
          mapTypeControl: true,
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: true,
          clickableIcons: false,
        });
        mapRef.current = map;

        const pinEl = document.createElement("div");
        pinEl.innerHTML = `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#E65100;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
          transform:rotate(-45deg);cursor:${editMode?'grab':'default'};
          transition:transform 0.15s;
        "></div>`;

        const marker = new (window.google.maps.marker.AdvancedMarkerElement as any)({
          map,
          position: center,
          title: place.name,
          content: pinEl,
          gmpDraggable: false,
        });
        markerRef.current = marker;

        if (lat === null) {
          marker.position = null;
          markerRef.current = marker;
        }

        setMapReady(true);
      } catch (err) {
        console.error("[PlacePinEditor]", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapReady || !markerRef.current) return;
    const marker = markerRef.current;
    marker.gmpDraggable = editMode;

    const pinEl = marker.content as HTMLElement | null;
    if (pinEl) {
      const inner = pinEl.querySelector("div");
      if (inner) inner.style.cursor = editMode ? "grab" : "default";
    }

    let mapClickListener: google.maps.MapsEventListener | null = null;
    let dragEndListener: any = null;

    if (editMode) {
      mapClickListener = mapRef.current!.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        moveMarker(newLat, newLng);
        onMarkerPositionChange(newLat, newLng);
      });

      dragEndListener = marker.addListener("dragend", () => {
        const pos = marker.position;
        if (!pos) return;
        const newLat = typeof pos.lat === "function" ? pos.lat() : pos.lat;
        const newLng = typeof pos.lng === "function" ? pos.lng() : pos.lng;
        onMarkerPositionChange(newLat, newLng);
      });
    }

    return () => {
      mapClickListener && window.google.maps.event.removeListener(mapClickListener);
      dragEndListener && window.google.maps.event.removeListener(dragEndListener);
    };
  }, [editMode, mapReady, moveMarker, onMarkerPositionChange]);

  const handleLatInput = (val: string) => {
    setLatInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
      setLat(parsed);
      if (lng !== null) {
        moveMarker(parsed, lng);
        panMap(parsed, lng);
      }
    }
  };

  const handleLngInput = (val: string) => {
    setLngInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      setLng(parsed);
      if (lat !== null) {
        moveMarker(lat, parsed);
        panMap(lat, parsed);
      }
    }
  };

  const handleSave = async () => {
    if (!coordsValid) {
      toast.error("Coordenadas inválidas");
      return;
    }
    try {
      await updatePin.mutateAsync({ id: place.id, lat: lat!, lng: lng! });
      toast.success("Pin salvo — coordenadas manuais protegidas contra sobrescrita automática");
      onSaved();
      onClose();
    } catch {
      toast.error("Erro ao salvar pin");
    }
  };

  const sourceCfg = GEO_SOURCE_CONFIG[(place.geoSource as string) ?? "auto"] ?? GEO_SOURCE_CONFIG.auto;
  const statusCfg = GEO_STATUS_CONFIG[(place.geoStatus as string) ?? "unverified"] ?? GEO_STATUS_CONFIG.unverified;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        width: "min(1100px, 100%)",
        height: "min(760px, 90vh)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,37,26,0.08)",
          background: "#00251A",
          borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MapPin size={18} style={{ color: "#E65100" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", fontFamily: "Montserrat, sans-serif" }}>
              Ajustar Pin — {place.name}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Left Panel */}
          <div style={{
            width: "320px", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: "0",
            borderRight: "1px solid rgba(0,37,26,0.08)",
            overflowY: "auto",
          }}>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Endereço */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Endereço
                </div>
                <div style={{ fontSize: "13px", color: "#1A1A1A", lineHeight: 1.5 }}>
                  {place.address || <span style={{ color: "#9E9E9E" }}>Não informado</span>}
                </div>
              </div>

              {/* Status badges */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Origem / Status Geo
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <Badge cfg={sourceCfg} />
                  <Badge cfg={statusCfg} />
                </div>
                {place.geoNote && (
                  <div style={{
                    marginTop: "8px", fontSize: "11px", color: "#718096",
                    background: "rgba(0,37,26,0.04)", borderRadius: "6px",
                    padding: "8px 10px", lineHeight: 1.5,
                  }}>
                    {place.geoNote.length > 180 ? place.geoNote.slice(0, 180) + "…" : place.geoNote}
                  </div>
                )}
              </div>

              {/* Coordenadas atuais */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Coordenadas
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#9E9E9E" }}>Latitude</span>
                    <input
                      type="text"
                      value={latInput}
                      onChange={e => handleLatInput(e.target.value)}
                      disabled={!editMode}
                      placeholder="-22.6333"
                      style={{
                        border: "1px solid",
                        borderColor: editMode ? "#E65100" : "rgba(0,37,26,0.12)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        color: "#1A1A1A",
                        background: editMode ? "#fff" : "rgba(0,37,26,0.02)",
                        transition: "border-color 0.2s",
                        outline: "none",
                      }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#9E9E9E" }}>Longitude</span>
                    <input
                      type="text"
                      value={lngInput}
                      onChange={e => handleLngInput(e.target.value)}
                      disabled={!editMode}
                      placeholder="-47.0520"
                      style={{
                        border: "1px solid",
                        borderColor: editMode ? "#E65100" : "rgba(0,37,26,0.12)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        color: "#1A1A1A",
                        background: editMode ? "#fff" : "rgba(0,37,26,0.02)",
                        transition: "border-color 0.2s",
                        outline: "none",
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Botão de modo de edição */}
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    background: "#00251A", color: "#fff",
                    border: "none", borderRadius: "8px",
                    padding: "11px 16px", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <Navigation size={15} />
                  Ajustar Pin Manualmente
                </button>
              ) : (
                <div style={{
                  background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.25)",
                  borderRadius: "8px", padding: "10px 12px",
                  fontSize: "12px", color: "#E65100", lineHeight: 1.5,
                }}>
                  <strong>Modo de edição ativo.</strong><br />
                  Arraste o pin ou clique no mapa para reposicionar.
                  Os campos lat/lng também são editáveis.
                </div>
              )}

              {/* Link abrir no Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  color: "#1976D2", fontSize: "12px", textDecoration: "none",
                }}
              >
                <ExternalLink size={13} />
                Abrir ponto no Google Maps
              </a>

            </div>

            {/* Instruções de uso */}
            <div style={{
              margin: "0 20px 20px",
              background: "rgba(0,37,26,0.04)", borderRadius: "8px",
              padding: "12px", fontSize: "11px", color: "#718096", lineHeight: 1.6,
            }}>
              <strong style={{ color: "#1A1A1A" }}>Como funciona:</strong>
              <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px" }}>
                <li>Clique em "Ajustar Pin" para ativar o modo de edição</li>
                <li>Clique no mapa ou arraste o pin para reposicionar</li>
                <li>Edite lat/lng diretamente nos campos</li>
                <li>Salve — o pin fica protegido contra atualizações automáticas</li>
              </ul>
            </div>
          </div>

          {/* Mapa */}
          <div style={{ flex: 1, position: "relative" }}>
            {!mapReady && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f5f5f5", zIndex: 10,
              }}>
                <div style={{ textAlign: "center", color: "#9E9E9E", fontSize: "14px" }}>
                  <div style={{
                    width: "32px", height: "32px", border: "3px solid #E65100",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
                  }} />
                  Carregando mapa…
                </div>
              </div>
            )}
            {editMode && (
              <div style={{
                position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
                zIndex: 10, background: "#E65100", color: "#fff",
                padding: "6px 14px", borderRadius: "20px",
                fontSize: "12px", fontWeight: 600, boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                pointerEvents: "none",
              }}>
                Modo edição — clique no mapa ou arraste o pin
              </div>
            )}
            <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          borderTop: "1px solid rgba(0,37,26,0.08)",
          background: "#fafafa",
          borderRadius: "0 0 16px 16px",
        }}>
          <div style={{ fontSize: "12px", color: "#9E9E9E" }}>
            {coordsValid
              ? <span style={{ fontFamily: "monospace" }}>{lat!.toFixed(6)}, {lng!.toFixed(6)}</span>
              : "Pin não posicionado"}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "1px solid rgba(0,37,26,0.15)",
                borderRadius: "8px", padding: "9px 18px",
                fontSize: "13px", cursor: "pointer", color: "#718096",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!coordsValid || !editMode || updatePin.isPending}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: coordsValid && editMode ? "#E65100" : "rgba(0,37,26,0.1)",
                border: "none", borderRadius: "8px",
                padding: "9px 20px", fontSize: "13px",
                fontWeight: 600, cursor: coordsValid && editMode ? "pointer" : "not-allowed",
                color: coordsValid && editMode ? "#fff" : "#9E9E9E",
                fontFamily: "Montserrat, sans-serif",
                transition: "background 0.2s",
              }}
            >
              <Save size={14} />
              {updatePin.isPending ? "Salvando…" : "Salvar Ajuste Manual"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
