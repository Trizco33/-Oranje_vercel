import { lazy, Suspense } from "react";
import { TabBar } from "@/components/TabBar";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NearbyMap = lazy(() => import("@/components/NearbyMap"));

function MapLoading() {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "var(--ds-color-bg-secondary)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(230,81,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={24} style={{ color: "var(--ds-color-accent)" }} />
      </div>
      <p style={{ fontSize: 13, color: "var(--ds-color-text-muted)" }}>Carregando mapa...</p>
    </div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--ds-color-bg-primary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* O NearbyMap usa posição fixed internamente — onClose navega para trás */}
      <Suspense fallback={<MapLoading />}>
        <NearbyMap onClose={() => navigate(-1)} />
      </Suspense>

      <TabBar />
    </div>
  );
}
