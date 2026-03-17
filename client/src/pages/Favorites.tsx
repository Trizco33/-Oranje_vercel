import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const { data: userFavs } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  const { data: allPlaces } = trpc.places.list.useQuery({}, { enabled: !!userFavs });
  const removeFav = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteIds = new Set(userFavs?.map(f => f.placeId) ?? []);
  const favoritePlaces = allPlaces?.filter((p: any) => favoriteIds.has(p.id)) ?? [];

  function handleRemoveFavorite(placeId: number) {
    removeFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
  }

  if (loading) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader title="Favoritos" />
        <div className="p-4 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer rounded-2xl" style={{ height: 200 }} />
          ))}
        </div>
        <TabBar />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader title="Favoritos" />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(216,138,61,0.1)" }}>
            <Heart size={36} style={{ color: "#D88A3D" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
            Seus Favoritos
          </h2>
          <p className="text-sm mb-6" style={{ color: "#C8C5C0" }}>
            Faça login para salvar seus lugares favoritos e acessá-los a qualquer momento.
          </p>
          <button onClick={() => window.open(getLoginUrl(), '_blank')} className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">
            Entrar com ORANJE
          </button>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Favoritos" showSearch />

      <div className="px-4 pt-4">
        {favoritePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "rgba(216,138,61,0.1)" }}>
              <Heart size={36} style={{ color: "#D88A3D" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
              Nenhum favorito ainda
            </h2>
            <p className="text-sm mb-6" style={{ color: "#C8C5C0" }}>
              Explore Holambra e salve os lugares que você ama.
            </p>
            <button
              onClick={() => navigate("/app/explorar")}
              className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
            >
              Explorar lugares
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: "#C8C5C0" }}>
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

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
