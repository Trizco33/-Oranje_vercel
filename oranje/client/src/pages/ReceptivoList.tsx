import { useNavigate } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { Clock, MapPin, ArrowRight, Compass } from "lucide-react";

// ─── Theme badge color by theme ──────────────────────────────────────────────

function ThemeBadge({ theme }: { theme: string | null }) {
  if (!theme) return null;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#E65100",
        background: "rgba(230,81,0,0.10)",
        border: "1px solid rgba(230,81,0,0.22)",
        borderRadius: 5,
        padding: "2px 7px",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      {theme}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TourCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: 16,
        background: "#fff",
        border: "1px solid rgba(0,37,26,0.07)",
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,37,26,0.04)",
      }}
    >
      <div
        style={{
          height: 160,
          background: "linear-gradient(90deg, rgba(0,37,26,0.07) 0%, rgba(0,37,26,0.04) 50%, rgba(0,37,26,0.07) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ height: 12, width: "60%", borderRadius: 6, background: "rgba(0,37,26,0.07)", marginBottom: 8 }} />
        <div style={{ height: 9, width: "85%", borderRadius: 6, background: "rgba(0,37,26,0.05)", marginBottom: 4 }} />
        <div style={{ height: 9, width: "70%", borderRadius: 6, background: "rgba(0,37,26,0.05)" }} />
      </div>
    </div>
  );
}

// ─── Tour Card ────────────────────────────────────────────────────────────────

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

function TourCard({ tour, featured = false }: { tour: Tour; featured?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/app/receptivo/${tour.slug}`)}
      style={{
        borderRadius: featured ? 20 : 16,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid rgba(0,37,26,0.07)",
        boxShadow: featured ? "0 4px 20px rgba(0,37,26,0.10)" : "0 1px 6px rgba(0,37,26,0.04)",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.985)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,37,26,0.06)";
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = featured
          ? "0 4px 20px rgba(0,37,26,0.10)"
          : "0 1px 6px rgba(0,37,26,0.04)";
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = featured
          ? "0 4px 20px rgba(0,37,26,0.10)"
          : "0 1px 6px rgba(0,37,26,0.04)";
      }}
    >
      {/* Cover image */}
      <div
        style={{
          height: featured ? 200 : 150,
          background: "linear-gradient(135deg, #00251A 0%, #004D3A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,37,26,0.75) 0%, rgba(0,37,26,0.15) 60%, transparent 100%)",
          }}
        />
        {featured && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#E65100",
                borderRadius: 5,
                padding: "3px 9px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Destaque
            </span>
          </div>
        )}
        {/* Duration bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {tour.duration && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 600,
                fontFamily: "Montserrat, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={11} color="rgba(255,255,255,0.7)" />
              {tour.duration}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <ThemeBadge theme={tour.theme} />
        </div>
        <h3
          style={{
            fontSize: featured ? 16 : 14,
            fontWeight: 800,
            fontFamily: "Montserrat, sans-serif",
            color: "#00251A",
            margin: "0 0 5px",
            lineHeight: 1.2,
          }}
        >
          {tour.name}
        </h3>
        {tour.tagline && (
          <p
            style={{
              fontSize: 12,
              color: "rgba(0,37,26,0.55)",
              fontFamily: "Montserrat, sans-serif",
              margin: "0 0 12px",
              lineHeight: 1.5,
            }}
          >
            {tour.tagline}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#E65100",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: "Montserrat, sans-serif",
              padding: "7px 12px",
              borderRadius: 8,
            }}
          >
            Iniciar
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReceptivoList() {
  const { data: tours, isLoading } = trpc.receptivo.list.useQuery();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F7F5F2",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Montserrat, sans-serif",
        paddingBottom: 90,
      }}
    >
      <OranjeHeader />

      {/* ── Hero banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #00251A 0%, #004D3A 100%)",
          padding: "24px 20px 28px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(230,81,0,0.18)",
            border: "1px solid rgba(230,81,0,0.35)",
            borderRadius: 6,
            padding: "3px 9px",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "#E65100",
              fontFamily: "Montserrat, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Receptivo Oranje
          </span>
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "Montserrat, sans-serif",
            margin: "0 0 6px",
            lineHeight: 1.2,
          }}
        >
          Passeios guiados em Holambra
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            fontFamily: "Montserrat, sans-serif",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          Percursos curados com narrativas, mapa e dicas — cada parada escolhida a dedo.
        </p>

        {/* Stats */}
        {tours && (
          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Compass size={13} color="#E65100" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                {tours.length} passeios
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={13} color="#E65100" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
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
            {[1, 2, 3, 4].map((i) => (
              <TourCardSkeleton key={i} />
            ))}
          </div>
        ) : !tours || tours.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "rgba(0,37,26,0.4)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
            }}
          >
            Nenhum passeio disponível no momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tours.map((tour, idx) => (
              <TourCard key={tour.id} tour={tour as Tour} featured={idx === 0} />
            ))}
          </div>
        )}
      </div>

      <TabBar />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
