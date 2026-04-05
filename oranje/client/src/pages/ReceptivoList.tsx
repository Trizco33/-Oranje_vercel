import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { Clock, MapPin, ArrowRight, Compass, Footprints } from "lucide-react";

const CARD_ANIMATIONS = `
  @keyframes tour-fade-up {
    from { opacity: 0; transform: translateY(28px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes shimmer-slide {
    0%   { background-position: -400% center; }
    100% { background-position: 400% center; }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(230,81,0,0); }
    50%       { box-shadow: 0 0 22px 4px rgba(230,81,0,0.18); }
  }
`;

const THEME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  romântico:   { bg: "rgba(220,60,80,0.18)",  text: "#F48FB1", border: "rgba(220,60,80,0.35)" },
  gastronômico:{ bg: "rgba(230,130,0,0.18)",  text: "#FFB74D", border: "rgba(230,130,0,0.35)" },
  clássico:    { bg: "rgba(100,180,160,0.18)", text: "#80CBC4", border: "rgba(100,180,160,0.35)" },
  familiar:    { bg: "rgba(100,180,100,0.18)", text: "#A5D6A7", border: "rgba(100,180,100,0.35)" },
  histórico:   { bg: "rgba(180,140,60,0.18)",  text: "#FFD54F", border: "rgba(180,140,60,0.35)" },
  running:     { bg: "rgba(60,140,230,0.18)",  text: "#90CAF9", border: "rgba(60,140,230,0.35)" },
};

function getThemeStyle(theme: string | null) {
  if (!theme) return THEME_COLORS.clássico;
  const key = theme.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (
    THEME_COLORS[key] ??
    THEME_COLORS[Object.keys(THEME_COLORS).find(k => key.includes(k)) ?? ""] ??
    { bg: "rgba(230,81,0,0.18)", text: "#E65100", border: "rgba(230,81,0,0.35)" }
  );
}

function ThemeBadge({ theme }: { theme: string | null }) {
  if (!theme) return null;
  const s = getThemeStyle(theme);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: s.text,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 6,
      padding: "3px 9px",
      fontFamily: "Montserrat, sans-serif",
    }}>
      {theme}
    </span>
  );
}

function TourCardSkeleton() {
  return (
    <div style={{
      borderRadius: 20,
      background: "rgba(13,74,64,0.35)",
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        height: 170,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ height: 10, width: "45%", borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 10 }} />
        <div style={{ height: 14, width: "80%", borderRadius: 6, background: "rgba(255,255,255,0.1)", marginBottom: 8 }} />
        <div style={{ height: 10, width: "65%", borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}

interface Tour {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  theme: string | null;
  duration: string | null;
  coverImage: string | null;
  status: string;
}

function isRunning(tour: Tour) {
  const name = tour.name.toLowerCase();
  return name.includes("corrida") || name.includes("running");
}

function TourCard({ tour, featured = false, idx = 0 }: { tour: Tour; featured?: boolean; idx?: number }) {
  const navigate = useNavigate();
  const running = isRunning(tour);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60 + idx * 90);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div
      onClick={() => navigate(`/app/receptivo/${tour.slug}`)}
      style={{
        borderRadius: featured ? 22 : 18,
        overflow: "hidden",
        background: featured
          ? "linear-gradient(145deg, #0D2E22 0%, #102918 50%, #091F17 100%)"
          : "linear-gradient(145deg, #0B2920 0%, #091F17 100%)",
        border: featured
          ? "1px solid rgba(230,81,0,0.28)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: featured
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 2px 12px rgba(0,0,0,0.3)",
        cursor: "pointer",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)`,
        position: "relative",
      }}
      onPointerDown={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "scale(0.974)";
        el.style.boxShadow = "0 1px 6px rgba(0,0,0,0.4)";
      }}
      onPointerUp={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = featured
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 2px 12px rgba(0,0,0,0.3)";
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = featured
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 2px 12px rgba(0,0,0,0.3)";
      }}
    >
      {/* ── Cover image ── */}
      <div style={{
        height: featured ? 210 : 160,
        background: "linear-gradient(135deg, #00251A 0%, #003D2A 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {tour.coverImage && (
          <img
            src={tour.coverImage}
            alt={tour.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
              transition: "transform 0.5s ease",
            }}
          />
        )}

        {/* cinematic gradient */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: featured
            ? "linear-gradient(to top, rgba(9,31,23,0.92) 0%, rgba(9,31,23,0.45) 45%, rgba(0,0,0,0.15) 100%)"
            : "linear-gradient(to top, rgba(9,31,23,0.88) 0%, rgba(9,31,23,0.3) 55%, transparent 100%)",
        }} />

        {/* featured orange top glow */}
        {featured && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #E65100, transparent)",
          }} />
        )}

        {/* top badges row */}
        <div style={{
          position: "absolute",
          top: 12, left: 12, right: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          {featured && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#fff",
              background: "#E65100",
              borderRadius: 6,
              padding: "3px 10px",
              fontFamily: "Montserrat, sans-serif",
              boxShadow: "0 2px 8px rgba(230,81,0,0.5)",
            }}>
              ★ Destaque
            </span>
          )}
          {tour.theme && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.92)",
              background: "rgba(0,0,0,0.62)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 6,
              padding: "3px 9px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              {tour.theme}
            </span>
          )}
          {running && (
            <span style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 700,
              color: "#90CAF9",
              background: "rgba(60,140,230,0.22)",
              border: "1px solid rgba(60,140,230,0.35)",
              borderRadius: 6,
              padding: "3px 9px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              <Footprints size={9} />
              CORRIDA
            </span>
          )}
        </div>

        {/* bottom info row */}
        <div style={{
          position: "absolute",
          bottom: 12, left: 12, right: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          {tour.duration && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,0,0,0.62)",
              borderRadius: 20,
              padding: "4px 10px",
              border: "1px solid rgba(255,255,255,0.14)",
            }}>
              <Clock size={10} color="rgba(255,255,255,0.7)" />
              <span style={{
                fontSize: 11,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif",
              }}>
                {tour.duration}
              </span>
            </div>
          )}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(0,0,0,0.62)",
            borderRadius: 20,
            padding: "4px 10px",
            border: "1px solid rgba(255,255,255,0.14)",
          }}>
            <MapPin size={10} color="#E65100" />
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
              Holambra
            </span>
          </div>
        </div>
      </div>

      {/* ── Info section ── */}
      <div style={{
        padding: featured ? "16px 18px 18px" : "14px 16px 16px",
        background: featured
          ? "linear-gradient(145deg, #0D2E22 0%, #102918 50%, #091F17 100%)"
          : "linear-gradient(145deg, #0B2920 0%, #091F17 100%)",
      }}>
        <h3 style={{
          fontSize: featured ? 17 : 15,
          fontWeight: 800,
          fontFamily: "Montserrat, sans-serif",
          color: "#FFFFFF",
          margin: "0 0 6px",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          {tour.name}
        </h3>

        {tour.tagline && (
          <p style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Montserrat, sans-serif",
            margin: "0 0 14px",
            lineHeight: 1.5,
          }}>
            {tour.tagline}
          </p>
        )}

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
          }}>
            Roteiro verificado pela equipe Oranje
          </span>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: featured
              ? "linear-gradient(135deg, #E65100, #FF6D00)"
              : "rgba(230,81,0,0.15)",
            border: featured
              ? "none"
              : "1px solid rgba(230,81,0,0.35)",
            color: "#fff",
            fontSize: 11.5,
            fontWeight: 800,
            fontFamily: "Montserrat, sans-serif",
            padding: featured ? "9px 16px" : "7px 13px",
            borderRadius: 10,
            boxShadow: featured ? "0 4px 14px rgba(230,81,0,0.4)" : "none",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}>
            {featured ? "Fazer este passeio" : "Explorar passeio"}
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceptivoList() {
  const { data: tours, isLoading } = trpc.receptivo.list.useQuery();

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#00251A",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Montserrat, sans-serif",
      paddingBottom: 90,
    }}>
      <OranjeHeader />

      {/* ── Hero banner ── */}
      <div style={{
        background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #003028 100%)",
        padding: "28px 20px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: -60, right: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,81,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(230,81,0,0.15)",
          border: "1px solid rgba(230,81,0,0.3)",
          borderRadius: 6,
          padding: "3px 10px",
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            color: "#E65100",
            fontFamily: "Montserrat, sans-serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Receptivo Oranje
          </span>
        </div>
        <h1 style={{
          color: "#fff",
          fontSize: 23,
          fontWeight: 800,
          fontFamily: "Montserrat, sans-serif",
          margin: "0 0 8px",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          Passeios guiados<br />
          <span style={{ color: "#E65100" }}>em Holambra</span>
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          fontFamily: "Montserrat, sans-serif",
          margin: 0,
          lineHeight: 1.6,
          maxWidth: 320,
        }}>
          Percursos curados com narrativas, mapa e dicas — cada parada escolhida a dedo.
        </p>

        {tours && (
          <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "5px 12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <Compass size={12} color="#E65100" />
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                {tours.length} passeios
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "5px 12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <MapPin size={12} color="#E65100" />
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                Holambra, SP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tour list ── */}
      <div style={{ flex: 1, padding: "20px 16px 0" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => <TourCardSkeleton key={i} />)}
          </div>
        ) : !tours || tours.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
          }}>
            Nenhum passeio disponível no momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tours.map((tour, idx) => (
              <TourCard key={tour.id} tour={tour as Tour} featured={idx === 0} idx={idx} />
            ))}
          </div>
        )}
      </div>

      <TabBar />

      <style>{CARD_ANIMATIONS}</style>
    </div>
  );
}
