import { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";

interface DirectionsSheetProps {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  onClose: () => void;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function buildGoogleMapsUrl(lat?: number | null, lng?: number | null, address?: string | null): string {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return "https://www.google.com/maps";
}

function buildWazeUrl(lat?: number | null, lng?: number | null, address?: string | null): string {
  if (lat && lng) {
    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }
  if (address) {
    return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
  }
  return "https://waze.com";
}

function buildAppleMapsUrl(lat?: number | null, lng?: number | null, address?: string | null): string {
  if (lat && lng) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}`;
  }
  if (address) {
    return `maps://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
  }
  return "maps://maps.apple.com";
}

const GOOGLE_MAPS_LOGO = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M24 4C15.16 4 8 11.16 8 20C8 31.2 24 44 24 44C24 44 40 31.2 40 20C40 11.16 32.84 4 24 4Z" fill="#EA4335"/>
    <circle cx="24" cy="20" r="6" fill="white"/>
  </svg>
);

const WAZE_LOGO = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="19" ry="16" fill="#00D4FF"/>
    <ellipse cx="17" cy="12" rx="4" ry="4" fill="white"/>
    <ellipse cx="31" cy="12" rx="4" ry="4" fill="white"/>
    <ellipse cx="17" cy="12" rx="2" ry="2" fill="#1A1A1A"/>
    <ellipse cx="31" cy="12" rx="2" ry="2" fill="#1A1A1A"/>
    <path d="M18 22C18 22 20 25 24 25C28 25 30 22 30 22" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const APPLE_MAPS_LOGO = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#appleGrad)"/>
    <defs>
      <linearGradient id="appleGrad" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5AC8FA"/>
        <stop offset="1" stopColor="#2196F3"/>
      </linearGradient>
    </defs>
    <path d="M24 14L30 28H18L24 14Z" fill="white" opacity="0.9"/>
    <circle cx="24" cy="30" r="4" fill="white"/>
    <path d="M12 36H36" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export function DirectionsSheet({ name, address, lat, lng, onClose }: DirectionsSheetProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const showApple = isIOS();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 260);
  }

  async function copyAddress() {
    const text = address || `${lat}, ${lng}` || name;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function openLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    handleClose();
  }

  const googleUrl = buildGoogleMapsUrl(lat, lng, address);
  const wazeUrl = buildWazeUrl(lat, lng, address);
  const appleUrl = buildAppleMapsUrl(lat, lng, address);
  const displayAddress = address || (lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : name);

  const options = [
    {
      key: "google",
      label: "Google Maps",
      sublabel: "Abrir no Google Maps",
      icon: GOOGLE_MAPS_LOGO,
      action: () => openLink(googleUrl),
    },
    {
      key: "waze",
      label: "Waze",
      sublabel: "Abrir no Waze",
      icon: WAZE_LOGO,
      action: () => openLink(wazeUrl),
    },
    ...(showApple ? [{
      key: "apple",
      label: "Apple Maps",
      sublabel: "Abrir no Apple Maps",
      icon: APPLE_MAPS_LOGO,
      action: () => openLink(appleUrl),
    }] : []),
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        background: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        transition: "background 0.26s ease",
      }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#00251A",
          borderRadius: "20px 20px 0 0",
          padding: "0 0 max(env(safe-area-inset-bottom, 0px), 24px)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "90dvh",
          overflow: "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(250,250,247,0.2)" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 12,
          padding: "4px 20px 16px",
          borderBottom: "1px solid rgba(250,250,247,0.08)",
        }}>
          <div>
            <p style={{
              fontFamily: "'Montserrat', system-ui, sans-serif",
              fontWeight: 700, fontSize: "1rem",
              color: "#FAFAF7", margin: 0, lineHeight: 1.3,
            }}>
              Como chegar
            </p>
            <p style={{
              fontSize: "0.8rem", color: "rgba(250,250,247,0.5)",
              margin: "4px 0 0", lineHeight: 1.4, maxWidth: 260,
            }}>
              {displayAddress}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(250,250,247,0.08)", border: "none",
              borderRadius: 8, color: "rgba(250,250,247,0.7)",
              cursor: "pointer", padding: 6, display: "flex", flexShrink: 0,
              marginTop: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation options */}
        <div style={{ padding: "8px 0" }}>
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={opt.action}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                width: "100%", border: "none", cursor: "pointer",
                padding: "14px 20px",
                background: "transparent", textAlign: "left",
                borderBottom: "1px solid rgba(250,250,247,0.05)",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(250,250,247,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(250,250,247,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  fontWeight: 600, fontSize: "0.9rem",
                  color: "#FAFAF7", margin: 0,
                }}>
                  {opt.label}
                </p>
                <p style={{ fontSize: "0.75rem", color: "rgba(250,250,247,0.4)", margin: "2px 0 0" }}>
                  {opt.sublabel}
                </p>
              </div>
              <ExternalLink size={14} style={{ color: "rgba(250,250,247,0.25)", flexShrink: 0 }} />
            </button>
          ))}

          {/* Copy address */}
          <button
            onClick={copyAddress}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              width: "100%", border: "none", cursor: "pointer",
              padding: "14px 20px",
              background: "transparent", textAlign: "left",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(250,250,247,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: copied ? "rgba(34,197,94,0.15)" : "rgba(250,250,247,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}>
              {copied
                ? <Check size={18} style={{ color: "#22C55E" }} />
                : <Copy size={18} style={{ color: "rgba(250,250,247,0.6)" }} />
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                fontWeight: 600, fontSize: "0.9rem",
                color: copied ? "#22C55E" : "#FAFAF7", margin: 0,
                transition: "color 0.2s",
              }}>
                {copied ? "Endereço copiado!" : "Copiar endereço"}
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(250,250,247,0.4)", margin: "2px 0 0" }}>
                {displayAddress}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
