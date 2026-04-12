import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, MapPin, ExternalLink, Save, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HOLAMBRA_CENTER: [number, number] = [-22.6333, -47.0520];

// ── Ícone personalizado (pin laranja Oranje) ─────────────────────────────────
const orangeIcon = L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#E65100;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    transform:rotate(-45deg);
  "></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// ── Badge ────────────────────────────────────────────────────────────────────
const GEO_SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  auto:         { label: "Automático",   color: "#9E9E9E", bg: "rgba(150,150,150,0.15)" },
  manual:       { label: "Manual",       color: "#00897B", bg: "rgba(0,137,123,0.15)"   },
  osm_verified: { label: "OSM Verif.",   color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
  maps_verified:{ label: "Maps Verif.", color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
};
const GEO_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ok:            { label: "OK",          color: "#5BD98A", bg: "rgba(91,217,138,0.15)"  },
  suspect:       { label: "Suspeito",    color: "#FF9800", bg: "rgba(255,152,0,0.15)"   },
  out_of_bounds: { label: "Fora área",   color: "#F44336", bg: "rgba(244,67,54,0.15)"   },
  unverified:    { label: "Não verif.",  color: "#9E9E9E", bg: "rgba(150,150,150,0.15)" },
  needs_review:  { label: "Revisar",     color: "#2196F3", bg: "rgba(33,150,243,0.15)"  },
};
function Badge({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "4px",
      fontSize: "11px", fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

// ── Sub-componente: captura cliques no mapa ───────────────────────────────────
function ClickHandler({ editMode, onMapClick }: {
  editMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!editMode) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Sub-componente: pan automático quando coords mudam via teclado ────────────
function MapPanner({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const prev = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  useEffect(() => {
    if (lat === null || lng === null) return;
    if (lat === prev.current.lat && lng === prev.current.lng) return;
    prev.current = { lat, lng };
    map.panTo([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
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

// ── Componente principal ──────────────────────────────────────────────────────
export function PlacePinEditor({ place, onClose, onSaved }: PlacePinEditorProps) {
  const [lat, setLat] = useState<number | null>(place.lat ?? null);
  const [lng, setLng] = useState<number | null>(place.lng ?? null);
  const [latInput, setLatInput] = useState(place.lat?.toFixed(6) ?? "");
  const [lngInput, setLngInput] = useState(place.lng?.toFixed(6) ?? "");
  const [editMode, setEditMode] = useState(false);

  const updatePin = trpc.places.updatePin.useMutation();

  const coordsValid = lat !== null && lng !== null && isFinite(lat) && isFinite(lng);
  const markerPos: [number, number] | null = coordsValid ? [lat!, lng!] : null;

  const googleMapsUrl = coordsValid
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(place.name + " Holambra SP")}`;

  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setLatInput(newLat.toFixed(6));
    setLngInput(newLng.toFixed(6));
  }, []);

  const handleLatInput = (val: string) => {
    setLatInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) setLat(parsed);
  };

  const handleLngInput = (val: string) => {
    setLngInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) setLng(parsed);
  };

  const handleMarkerDrag = useCallback((e: L.DragEndEvent) => {
    const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
    setLat(newLat);
    setLng(newLng);
    setLatInput(newLat.toFixed(6));
    setLngInput(newLng.toFixed(6));
  }, []);

  const handleSave = async () => {
    if (!coordsValid) { toast.error("Coordenadas inválidas"); return; }
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

  const mapCenter: [number, number] = markerPos ?? HOLAMBRA_CENTER;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px",
        width: "min(1100px, 100%)", height: "min(760px, 90vh)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(0,37,26,0.08)",
          background: "#00251A", borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MapPin size={18} style={{ color: "#E65100" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", fontFamily: "Montserrat, sans-serif" }}>
              Ajustar Pin — {place.name}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Painel lateral */}
          <div style={{
            width: "320px", flexShrink: 0,
            display: "flex", flexDirection: "column",
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

              {/* Coordenadas */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Coordenadas
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Latitude", val: latInput, handler: handleLatInput, placeholder: "-22.6333" },
                    { label: "Longitude", val: lngInput, handler: handleLngInput, placeholder: "-47.0520" },
                  ].map(({ label, val, handler, placeholder }) => (
                    <label key={label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#9E9E9E" }}>{label}</span>
                      <input
                        type="text"
                        value={val}
                        onChange={e => handler(e.target.value)}
                        placeholder={placeholder}
                        style={{
                          border: "1px solid",
                          borderColor: editMode ? "#E65100" : "rgba(0,37,26,0.12)",
                          borderRadius: "6px", padding: "8px 10px",
                          fontSize: "13px", fontFamily: "monospace",
                          color: "#1A1A1A",
                          background: editMode ? "#fff" : "rgba(0,37,26,0.02)",
                          outline: "none", transition: "border-color 0.2s",
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Botão modo edição */}
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
                  Clique no mapa ou arraste o pin para reposicionar.
                  Os campos lat/lng também são editáveis.
                </div>
              )}

              {/* Abrir no Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1976D2", fontSize: "12px", textDecoration: "none" }}
              >
                <ExternalLink size={13} />
                Abrir ponto no Google Maps
              </a>
            </div>

            {/* Instruções */}
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

          {/* Mapa (Leaflet + OpenStreetMap) */}
          <div style={{ flex: 1, position: "relative" }}>
            {editMode && (
              <div style={{
                position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
                zIndex: 1000, background: "#E65100", color: "#fff",
                padding: "6px 14px", borderRadius: "20px",
                fontSize: "12px", fontWeight: 600, boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                pointerEvents: "none", whiteSpace: "nowrap",
              }}>
                Modo edição — clique no mapa ou arraste o pin
              </div>
            )}
            <MapContainer
              center={mapCenter}
              zoom={17}
              style={{ width: "100%", height: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler editMode={editMode} onMapClick={handleMapClick} />
              <MapPanner lat={lat} lng={lng} />
              {markerPos && (
                <Marker
                  position={markerPos}
                  icon={orangeIcon}
                  draggable={editMode}
                  eventHandlers={{ dragend: handleMarkerDrag }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderTop: "1px solid rgba(0,37,26,0.08)",
          background: "#fafafa", borderRadius: "0 0 16px 16px",
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
                fontFamily: "Montserrat, sans-serif", transition: "background 0.2s",
              }}
            >
              <Save size={14} />
              {updatePin.isPending ? "Salvando…" : "Salvar Ajuste Manual"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
