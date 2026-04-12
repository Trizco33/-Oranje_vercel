import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, MapPin, ExternalLink, Save, Navigation, ChevronUp, ChevronDown } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HOLAMBRA_CENTER: [number, number] = [-22.6333, -47.0520];

// ── Hook de largura de janela ─────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);
  return width;
}

// ── Ícone personalizado (pin laranja Oranje) ──────────────────────────────────
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

// ── Badges ────────────────────────────────────────────────────────────────────
const GEO_SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  auto:          { label: "Automático",  color: "#9E9E9E", bg: "rgba(150,150,150,0.15)" },
  manual:        { label: "Manual",      color: "#00897B", bg: "rgba(0,137,123,0.15)"   },
  osm_verified:  { label: "OSM Verif.", color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
  maps_verified: { label: "Maps Verif.",color: "#1976D2", bg: "rgba(25,118,210,0.15)"  },
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
      padding: "2px 8px", borderRadius: "4px",
      fontSize: "11px", fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

// ── Captura cliques no mapa ───────────────────────────────────────────────────
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

// ── Pan automático quando coords mudam via teclado ────────────────────────────
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
  const [panelOpen, setPanelOpen] = useState(false); // mobile: painel recolhido por padrão

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  const updatePin = trpc.places.updatePin.useMutation();
  const coordsValid = lat !== null && lng !== null && isFinite(lat) && isFinite(lng);
  const markerPos: [number, number] | null = coordsValid ? [lat!, lng!] : null;
  const mapCenter: [number, number] = markerPos ?? HOLAMBRA_CENTER;

  const googleMapsUrl = coordsValid
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(place.name + " Holambra SP")}`;

  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    setLat(newLat); setLng(newLng);
    setLatInput(newLat.toFixed(6)); setLngInput(newLng.toFixed(6));
  }, []);

  const handleLatInput = (val: string) => {
    setLatInput(val);
    const p = parseFloat(val);
    if (!isNaN(p) && p >= -90 && p <= 90) setLat(p);
  };
  const handleLngInput = (val: string) => {
    setLngInput(val);
    const p = parseFloat(val);
    if (!isNaN(p) && p >= -180 && p <= 180) setLng(p);
  };
  const handleMarkerDrag = useCallback((e: L.DragEndEvent) => {
    const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
    setLat(newLat); setLng(newLng);
    setLatInput(newLat.toFixed(6)); setLngInput(newLng.toFixed(6));
  }, []);

  const handleSave = async () => {
    if (!coordsValid) { toast.error("Coordenadas inválidas"); return; }
    try {
      await updatePin.mutateAsync({ id: place.id, lat: lat!, lng: lng! });
      toast.success("Pin salvo — coordenadas manuais protegidas");
      onSaved(); onClose();
    } catch {
      toast.error("Erro ao salvar pin");
    }
  };

  const sourceCfg = GEO_SOURCE_CONFIG[(place.geoSource as string) ?? "auto"] ?? GEO_SOURCE_CONFIG.auto;
  const statusCfg = GEO_STATUS_CONFIG[(place.geoStatus as string) ?? "unverified"] ?? GEO_STATUS_CONFIG.unverified;

  // ── Painel de controles (reutilizado em ambos os layouts) ─────────────────
  const controlPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: isMobile ? "16px" : "20px" }}>

      {/* Endereço */}
      {place.address && (
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>Endereço</div>
          <div style={{ fontSize: "13px", color: "#1A1A1A", lineHeight: 1.4 }}>{place.address}</div>
        </div>
      )}

      {/* Badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <Badge cfg={sourceCfg} />
        <Badge cfg={statusCfg} />
      </div>

      {/* Campos lat/lng */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { label: "Latitude", val: latInput, handler: handleLatInput, placeholder: "-22.6333" },
          { label: "Longitude", val: lngInput, handler: handleLngInput, placeholder: "-47.0520" },
        ].map(({ label, val, handler, placeholder }) => (
          <label key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "10px", color: "#9E9E9E", fontWeight: 600 }}>{label}</span>
            <input
              type="text"
              inputMode="decimal"
              value={val}
              onChange={e => handler(e.target.value)}
              placeholder={placeholder}
              style={{
                border: "1px solid",
                borderColor: editMode ? "#E65100" : "rgba(0,37,26,0.15)",
                borderRadius: "6px", padding: "8px 10px",
                fontSize: "13px", fontFamily: "monospace",
                color: "#1A1A1A",
                background: editMode ? "#fff" : "rgba(0,37,26,0.02)",
                outline: "none", width: "100%", boxSizing: "border-box",
              }}
            />
          </label>
        ))}
      </div>

      {/* Botão modo edição / aviso */}
      {!editMode ? (
        <button
          onClick={() => { setEditMode(true); if (isMobile) setPanelOpen(false); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "#00251A", color: "#fff", border: "none", borderRadius: "8px",
            padding: "12px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            fontFamily: "Montserrat, sans-serif", width: "100%",
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
          <strong>Modo edição ativo.</strong><br />
          {isMobile ? "Toque no mapa para reposicionar o pin." : "Clique no mapa ou arraste o pin para reposicionar."}
        </div>
      )}

      {/* Link Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1976D2", fontSize: "12px", textDecoration: "none" }}
      >
        <ExternalLink size={13} />
        Abrir no Google Maps
      </a>

      {place.geoNote && (
        <div style={{
          fontSize: "11px", color: "#718096",
          background: "rgba(0,37,26,0.04)", borderRadius: "6px",
          padding: "8px 10px", lineHeight: 1.5,
        }}>
          {place.geoNote.length > 160 ? place.geoNote.slice(0, 160) + "…" : place.geoNote}
        </div>
      )}
    </div>
  );

  // ── Rodapé com botões de ação ─────────────────────────────────────────────
  const footer = (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: isMobile ? "12px 16px" : "14px 20px",
      borderTop: "1px solid rgba(0,37,26,0.08)",
      background: "#fafafa",
      gap: "10px",
    }}>
      <div style={{ fontSize: "11px", color: "#9E9E9E", fontFamily: "monospace", flexShrink: 0 }}>
        {coordsValid ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : "—"}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "1px solid rgba(0,37,26,0.15)",
            borderRadius: "8px", padding: isMobile ? "10px 14px" : "9px 18px",
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
            padding: isMobile ? "10px 16px" : "9px 20px",
            fontSize: "13px", fontWeight: 600,
            cursor: coordsValid && editMode ? "pointer" : "not-allowed",
            color: coordsValid && editMode ? "#fff" : "#9E9E9E",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <Save size={14} />
          {updatePin.isPending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );

  // ── Mapa ──────────────────────────────────────────────────────────────────
  const mapView = (
    <div style={{ flex: 1, position: "relative", minHeight: isMobile ? "0" : undefined }}>
      {editMode && (
        <div style={{
          position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "#E65100", color: "#fff",
          padding: "5px 14px", borderRadius: "20px",
          fontSize: "12px", fontWeight: 600, boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          {isMobile ? "Toque no mapa para posicionar" : "Clique no mapa ou arraste o pin"}
        </div>
      )}
      <MapContainer
        center={mapCenter}
        zoom={17}
        style={{ width: "100%", height: "100%" }}
        zoomControl={!isMobile}
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
            draggable={editMode && !isMobile}
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
        )}
      </MapContainer>
    </div>
  );

  // ── LAYOUT MOBILE ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "#fff",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          background: "#00251A", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <MapPin size={16} style={{ color: "#E65100", flexShrink: 0 }} />
            <span style={{
              color: "#fff", fontWeight: 700, fontSize: "14px",
              fontFamily: "Montserrat, sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {place.name}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px", flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Mapa (flex: 1 — ocupa todo espaço disponível) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {mapView}
        </div>

        {/* Painel deslizante (bottom sheet simplificado) */}
        <div style={{
          flexShrink: 0,
          borderTop: "2px solid rgba(0,37,26,0.08)",
          background: "#fff",
          maxHeight: panelOpen ? "60vh" : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
          overflowY: panelOpen ? "auto" : "hidden",
        }}>
          {controlPanel}
        </div>

        {/* Aba de abrir/fechar painel */}
        <button
          onClick={() => setPanelOpen(v => !v)}
          style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            background: "rgba(0,37,26,0.06)", border: "none",
            borderTop: "1px solid rgba(0,37,26,0.08)",
            padding: "10px", cursor: "pointer",
            fontSize: "12px", color: "#00251A", fontWeight: 600,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          {panelOpen ? "Ocultar controles" : "Controles"}
        </button>

        {/* Footer com ações */}
        {footer}
      </div>
    );
  }

  // ── LAYOUT DESKTOP ────────────────────────────────────────────────────────
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

        {/* Corpo: sidebar + mapa */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{
            width: "320px", flexShrink: 0,
            borderRight: "1px solid rgba(0,37,26,0.08)",
            overflowY: "auto",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            {controlPanel}
            <div style={{
              margin: "0 20px 20px",
              background: "rgba(0,37,26,0.04)", borderRadius: "8px",
              padding: "10px", fontSize: "11px", color: "#718096", lineHeight: 1.6,
            }}>
              <strong style={{ color: "#1A1A1A" }}>Como usar:</strong>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px" }}>
                <li>Ative o modo de edição</li>
                <li>Clique no mapa ou arraste o pin</li>
                <li>Ou edite lat/lng diretamente</li>
                <li>Salve para proteger as coordenadas</li>
              </ul>
            </div>
          </div>
          {mapView}
        </div>

        {/* Footer */}
        <div style={{ borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}
