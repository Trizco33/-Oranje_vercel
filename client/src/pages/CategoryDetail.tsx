import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { getCategoryIcon, getCategorycover, normalizeSlug, isValidCategorySlug } from "@/constants/categories";

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug: propSlug }: CategoryDetailProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('[CategoryDetail] rendered', { slug, href: window.location.href });

  // Normalizar slug e validar
  const normalizedSlug = normalizeSlug(slug);
  const isValid = isValidCategorySlug(normalizedSlug);

  // Se slug é inválido, mostrar página "Categoria não encontrada" sem 404 do navegador
  if (!isValid) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader
          title="Categoria não encontrada"
          showBack
          onBack={() => navigate("/app/explorar")}
        />
        <div className="px-4 mt-8 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>
            Categoria não encontrada
          </h2>
          <p className="text-sm mb-6" style={{ color: "#C8C5C0" }}>
            A categoria "{slug}" não existe.
          </p>
          <button
            onClick={() => navigate("/app/explorar")}
            className="px-6 py-2 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: "#D88A3D", color: "#0F1B14" }}
          >
            Voltar para Explorar
          </button>
        </div>
        <div className="mb-tab" />
        <TabBar />
      </div>
    );
  }

  // Queries com slug normalizado
  const { data: category, error: categoryError } = trpc.categories.bySlug.useQuery({ slug: normalizedSlug });
  const { data: places, error: placesError, isLoading: placesLoading } = trpc.places.list.useQuery(
    category?.id ? { categoryId: category.id, limit: 50, offset: 0 } : { limit: 50, offset: 0 },
    { enabled: !!category?.id }
  );
  const { data: userFavs } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  const addFav = trpc.favorites.add.useMutation();
  const removeFav = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteIds = new Set(userFavs?.map(f => f.placeId) ?? []);

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (favoriteIds.has(placeId)) {
      removeFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    } else {
      addFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    }
  }

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader
        title={category?.name ?? "Categoria"}
        showBack
        onBack={() => navigate("/app/explorar")}
      />

      {/* Cover */}
      <div className="relative" style={{ height: 160 }}>
        <img
          src={category?.coverImage || getCategorycover(normalizedSlug)}
          alt={category?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0E1A26]" />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-xl font-bold" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>
            {category?.name}
          </h1>
          <p className="text-xs" style={{ color: "#C8C5C0" }}>
            {places?.length ?? 0} lugares
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {placesError ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#D88A3D" }}>Erro ao carregar lugares. Tente novamente.</p>
          </div>
        ) : !places || placesLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer rounded-2xl" style={{ height: 200 }} />
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#C8C5C0" }}>Nenhum lugar nesta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {places.map((place: any) => (
              <PlaceCard
                key={place.id}
                place={place}
                isFavorite={favoriteIds.has(place.id)}
                onToggleFavorite={handleToggleFavorite}
                compact
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
