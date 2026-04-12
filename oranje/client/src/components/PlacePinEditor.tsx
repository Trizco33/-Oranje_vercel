import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, MapPin, ExternalLink, Save, Navigation, ChevronUp, ChevronDown } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HOLAMBRA_CENTER: [number, number] = [-22.6333, -47.0520];

/* ─── Leaflet exige que o container tenha altura CSS explícita.
       Em layouts flex, "height: 100%" não sobe pela chain.
       A solução correta: position: absolute + inset: 0 no MapContainer,
       dentro de um pai com position: relative e flex: 1.          ─── */

// ── Hook: detecta largura + orientação ───────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", () => setTimeout(update, 100));
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return width;
}

// ── Pin laranja Oranje ────────────────────────────────────────────────────────
const orangeIcon = L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#E65100;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    transform:rotate(-45deg)"></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// ── Captura cliques no mapa ───────────────────────────────────────────────────
function ClickHandler({ editMode, onMapClick }: {
  editMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) { if (editMode) onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ── Pan automático quando o usuário digita lat/lng ────────────────────────────
function MapPanner({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const prev = useRef<[number | null, number | null]>([null, null]);
  useEffect(() => {
    if (lat == null || lng == null) return;
    if (lat === prev.current[0] && lng === prev.current[1]) return;
    prev.current = [lat, lng];
    map.panTo([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

// ── Badges ────────────────────────────────────────────────────────────────────
const GEO_SOURCE: Record<string, { label: string; color: string; bg: string }> = {
  auto:          { label: "Automático",  color: "#9E9E9E", bg: "rgba(150,150,150,.15)" },
  manual:        { label: "Manual",      color: "#00897B", bg: "rgba(0,137,123,.15)"   },
  osm_verified:  { label: "OSM Verif.", color: "#1976D2", bg: "rgba(25,118,210,.15)"  },
  maps_verified: { label: "Maps Verif.",color: "#1976D2", bg: "rgba(25,118,210,.15)"  },
};
const GEO_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ok:            { label: "OK",         color: "#5BD98A", bg: "rgba(91,217,138,.15)"  },
  suspect:       { label: "Suspeito",   color: "#FF9800", bg: "rgba(255,152,0,.15)"   },
  out_of_bounds: { label: "Fora área",  color: "#F44336", bg: "rgba(244,67,54,.15)"   },
  unverified:    { label: "Não verif.", color: "#9E9E9E", bg: "rgba(150,150,150,.15)" },
  needs_review:  { label: "Revisar",    color: "#2196F3", bg: "rgba(33,150,243,.15)"  },
};
function Badge({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "4px",
      fontSize: "11px", fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PlacePinEditorProps {
  place: {
    id: number; name: string;
    address?: string | null; lat?: number | null; lng?: number | null;
    geoStatus?: string | null; geoSource?: string | null; geoNote?: string | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
export function PlacePinEditor({ place, onClose, onSaved }: PlacePinEditorProps) {
  const [lat, setLat]     = useState<number | null>(place.lat ?? null);
  const [lng, setLng]     = useState<number | null>(place.lng ?? null);
  const [latTxt, setLatTxt] = useState(place.lat?.toFixed(6) ?? "");
  const [lngTxt, setLngTxt] = useState(place.lng?.toFixed(6) ?? "");
  const [editMode, setEditMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  const updatePin = trpc.places.updatePin.useMutation();
  const coordsOk  = lat != null && lng != null && isFinite(lat) && isFinite(lng);
  const markerPos = coordsOk ? [lat!, lng!] as [number, number] : null;
  const center    = markerPos ?? HOLAMBRA_CENTER;

  const googleUrl = coordsOk
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(place.name + " Holambra SP")}`;

  const onMapClick = useCallback((la: number, ln: number) => {
    setLat(la); setLng(ln);
    setLatTxt(la.toFixed(6)); setLngTxt(ln.toFixed(6));
  }, []);

  const onDragEnd = useCallback((e: L.DragEndEvent) => {
    const { lat: la, lng: ln } = (e.target as L.Marker).getLatLng();
    setLat(la); setLng(ln);
    setLatTxt(la.toFixed(6)); setLngTxt(ln.toFixed(6));
  }, []);

  const handleLat = (v: string) => {
    setLatTxt(v);
    const p = parseFloat(v);
    if (!isNaN(p) && p >= -90  && p <= 90)  setLat(p);
  };
  const handleLng = (v: string) => {
    setLngTxt(v);
    const p = parseFloat(v);
    if (!isNaN(p) && p >= -180 && p <= 180) setLng(p);
  };

  const handleSave = async () => {
    if (!coordsOk) { toast.error("Coordenadas inválidas"); return; }
    try {
      await updatePin.mutateAsync({ id: place.id, lat: lat!, lng: lng! });
      toast.success("Pin salvo — protegido contra sobrescrita automática");
      onSaved(); onClose();
    } catch { toast.error("Erro ao salvar pin"); }
  };

  const srcCfg = GEO_SOURCE[(place.geoSource ?? "auto")]  ?? GEO_SOURCE.auto;
  const stCfg  = GEO_STATUS[(place.geoStatus ?? "unverified")] ?? GEO_STATUS.unverified;

  // ── painel de controles ──────────────────────────────────────────────────
  const controls = (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
      {place.address && (
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "3px" }}>Endereço</div>
          <div style={{ fontSize: "13px", color: "#1A1A1A", lineHeight: 1.4 }}>{place.address}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <Badge cfg={srcCfg} /><Badge cfg={stCfg} />
      </div>

      {/* Campos lat/lng lado a lado */}
      <div style={{ display: "flex", gap: "8px" }}>
        {([
          { lbl: "Latitude",  val: latTxt, fn: handleLat, ph: "-22.6333" },
          { lbl: "Longitude", val: lngTxt, fn: handleLng, ph: "-47.0520" },
        ] as const).map(({ lbl, val, fn, ph }) => (
          <label key={lbl} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "10px", color: "#9E9E9E", fontWeight: 600 }}>{lbl}</span>
            <input
              type="text" inputMode="decimal"
              value={val} placeholder={ph}
              onChange={e => fn(e.target.value)}
              style={{
                border: `1px solid ${editMode ? "#E65100" : "rgba(0,37,26,.15)"}`,
                borderRadius: "6px", padding: "8px 10px",
                fontSize: "13px", fontFamily: "monospace",
                color: "#1A1A1A", width: "100%", boxSizing: "border-box",
                background: editMode ? "#fff" : "rgba(0,37,26,.02)",
                outline: "none",
              }}
            />
          </label>
        ))}
      </div>

      {!editMode ? (
        <button
          onClick={() => { setEditMode(true); if (isMobile) setPanelOpen(false); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "#00251A", color: "#fff", border: "none", borderRadius: "8px",
            padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            fontFamily: "Montserrat, sans-serif", width: "100%",
          }}
        >
          <Navigation size={15} />Ajustar Pin Manualmente
        </button>
      ) : (
        <div style={{
          background: "rgba(230,81,0,.08)", border: "1px solid rgba(230,81,0,.25)",
          borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#E65100", lineHeight: 1.5,
        }}>
          <strong>Modo edição ativo.</strong><br />
          {isMobile ? "Toque no mapa para reposicionar o pin." : "Clique no mapa ou arraste o pin."}
        </div>
      )}

      <a href={googleUrl} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1976D2", fontSize: "12px", textDecoration: "none" }}>
        <ExternalLink size={13} />Abrir no Google Maps
      </a>

      {place.geoNote && (
        <div style={{
          fontSize: "11px", color: "#718096", lineHeight: 1.5,
          background: "rgba(0,37,26,.04)", borderRadius: "6px", padding: "8px 10px",
        }}>
          {place.geoNote.length > 160 ? place.geoNote.slice(0, 160) + "…" : place.geoNote}
        </div>
      )}
    </div>
  );

  // ── rodapé ────────────────────────────────────────────────────────────────
  const footer = (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: isMobile ? "12px 16px" : "13px 20px",
      borderTop: "1px solid rgba(0,37,26,.08)", background: "#fafafa",
      gap: "10px", flexShrink: 0,
    }}>
      <span style={{ fontSize: "11px", color: "#9E9E9E", fontFamily: "monospace" }}>
        {coordsOk ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : "—"}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid rgba(0,37,26,.15)",
          borderRadius: "8px", padding: isMobile ? "10px 14px" : "9px 18px",
          fontSize: "13px", cursor: "pointer", color: "#718096",
        }}>Cancelar</button>
        <button onClick={handleSave} disabled={!coordsOk || !editMode || updatePin.isPending} style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: coordsOk && editMode ? "#E65100" : "rgba(0,37,26,.1)",
          border: "none", borderRadius: "8px", padding: isMobile ? "10px 16px" : "9px 20px",
          fontSize: "13px", fontWeight: 600,
          cursor: coordsOk && editMode ? "pointer" : "not-allowed",
          color: coordsOk && editMode ? "#fff" : "#9E9E9E",
          fontFamily: "Montserrat, sans-serif",
        }}>
          <Save size={14} />{updatePin.isPending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );

  // ── bloco do mapa (CRÍTICO: position absolute para garantir altura) ────────
  //
  //  O Leaflet exige que o .leaflet-container tenha uma altura em pixels.
  //  "height: 100%" não funciona dentro de flex sem altura explícita no pai.
  //  Solução: envolver em um div position:relative + flex:1 e colocar
  //  o MapContainer como position:absolute + inset:0 dentro dele.
  //
  const mapBlock = (mapH?: number) => (
    <div style={{
      position: "relative",
      flex: mapH ? undefined : 1,
      height: mapH,
      minHeight: 0,            // permite shrink em colunas flex
      overflow: "hidden",
    }}>
      {/* Banner modo edição */}
      {editMode && (
        <div style={{
          position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "#E65100", color: "#fff",
          padding: "5px 14px", borderRadius: "20px",
          fontSize: "12px", fontWeight: 600,
          boxShadow: "0 2px 12px rgba(0,0,0,.25)",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          {isMobile ? "Toque no mapa para posicionar" : "Clique no mapa ou arraste o pin"}
        </div>
      )}

      {/* MapContainer: position absolute preenche pai com altura definida */}
      <MapContainer
        center={center}
        zoom={17}
        zoomControl={!isMobile}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler editMode={editMode} onMapClick={onMapClick} />
        <MapPanner lat={lat} lng={lng} />
        {markerPos && (
          <Marker
            position={markerPos}
            icon={orangeIcon}
            draggable={editMode && !isMobile}
            eventHandlers={{ dragend: onDragEnd }}
          />
        )}
      </MapContainer>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LAYOUT MOBILE  — tela cheia, mapa com altura calculada em pixels
  // ════════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    // Alturas fixas conhecidas:
    const HEADER_H = 50;
    const TOGGLE_H = 42;
    const FOOTER_H = 58;
    const PANEL_H  = panelOpen ? Math.min(window.innerHeight * 0.45, 320) : 0;
    const mapH = Math.max(120, window.innerHeight - HEADER_H - TOGGLE_H - FOOTER_H - PANEL_H);

    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "#fff",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          height: HEADER_H, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          background: "#00251A", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <MapPin size={16} style={{ color: "#E65100", flexShrink: 0 }} />
            <span style={{
              color: "#fff", fontWeight: 700, fontSize: "14px",
              fontFamily: "Montserrat, sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{place.name}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.7)", padding: "4px", flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Mapa — altura calculada explicitamente em pixels */}
        {mapBlock(mapH)}

        {/* Painel recolhível */}
        <div style={{
          height: PANEL_H, overflow: "hidden",
          transition: "height .3s ease",
          borderTop: PANEL_H > 0 ? "1px solid rgba(0,37,26,.08)" : "none",
          overflowY: panelOpen ? "auto" : "hidden",
          background: "#fff", flexShrink: 0,
        }}>
          {controls}
        </div>

        {/* Botão toggle painel */}
        <button
          onClick={() => setPanelOpen(v => !v)}
          style={{
            height: TOGGLE_H, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            background: "rgba(0,37,26,.05)", border: "none",
            borderTop: "1px solid rgba(0,37,26,.08)",
            cursor: "pointer", fontSize: "12px", color: "#00251A", fontWeight: 600,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          {panelOpen ? "Ocultar controles" : "Controles"}
        </button>

        {footer}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LAYOUT DESKTOP — modal centralizado, sidebar + mapa
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px",
        width: "min(1100px, 100%)", height: "min(760px, 90vh)",
        display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.3)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(0,37,26,.08)",
          background: "#00251A", borderRadius: "16px 16px 0 0", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MapPin size={18} style={{ color: "#E65100" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", fontFamily: "Montserrat, sans-serif" }}>
              Ajustar Pin — {place.name}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.7)", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo: sidebar + mapa */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
          <div style={{
            width: "320px", flexShrink: 0,
            borderRight: "1px solid rgba(0,37,26,.08)",
            overflowY: "auto", display: "flex", flexDirection: "column",
          }}>
            {controls}
            <div style={{
              margin: "0 16px 16px",
              background: "rgba(0,37,26,.04)", borderRadius: "8px",
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

          {/* Mapa desktop: flex:1, sem altura fixa — position absolute cuida do resto */}
          {mapBlock()}
        </div>

        {/* Footer */}
        <div style={{ borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}
