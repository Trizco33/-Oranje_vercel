import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { useFavorites, usePlacesList } from "@/hooks/useMockData";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DSButton } from "@/components/ds";

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const { favoriteIds, removeFavorite } = useFavorites(!!user);
  const { data: allPlaces } = usePlacesList();

  const favoritePlaces = allPlaces?.filter((p: any) => favoriteIds.has(p.id)) ?? [];

  function handleRemoveFavorite(placeId: number) {
    removeFavorite(placeId);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader title="Favoritos" />
        <div className="p-5 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl" style={{ height: 200, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }} />
          ))}
        </div>
        <TabBar />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader title="Favoritos" />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div
            className="flex items-center justify-center mb-6"
            style={{
              width: 80,
              height: 80,
              borderRadius: "var(--ds-radius-full)",
              background: "var(--ds-color-accent-muted)",
            }}
          >
            <Heart size={36} style={{ color: "var(--ds-color-accent)" }} />
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--ds-font-display)",
              color: "var(--ds-color-text-primary)",
              marginBottom: 8,
            }}
          >
            Seus Favoritos
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-muted)" }}>
            Faça login para salvar seus lugares favoritos e acessá-los a qualquer momento.
          </p>
          <DSButton onClick={() => window.open(getLoginUrl(), '_blank')}>
            Entrar com ORANJE
          </DSButton>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Favoritos" showSearch />

      <div className="px-5 pt-5">
        {favoritePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="flex items-center justify-center mb-6"
              style={{
                width: 80,
                height: 80,
                borderRadius: "var(--ds-radius-full)",
                background: "var(--ds-color-accent-muted)",
              }}
            >
              <Heart size={36} style={{ color: "var(--ds-color-accent)" }} />
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--ds-font-display)",
                color: "var(--ds-color-text-primary)",
                marginBottom: 8,
              }}
            >
              Nenhum favorito ainda
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-muted)" }}>
              Explore Holambra e salve os lugares que você ama.
            </p>
            <DSButton onClick={() => navigate("/app/explorar")}>
              Explorar lugares
            </DSButton>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: "var(--ds-color-text-muted)" }}>
              {favoritePlaces.length} {favoritePlaces.length === 1 ? "lugar salvo" : "lugares salvos"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {favoritePlaces.map((place: any) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isFavorite={true}
                  onToggleFavorite={handleRemoveFavorite}
                  compact
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
