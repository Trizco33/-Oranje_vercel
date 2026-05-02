import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { getCategoryIcon, getCategorycover, normalizeSlug } from "@/constants/categories";
import { DSButton, DSBadge } from "@/components/ds";
import { trpc } from "@/lib/trpc";

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug: propSlug }: CategoryDetailProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  // Normaliza o slug (remove acentos, espaços → hífen), mas aceita qualquer
  // slug vindo do banco — não bloqueia com lista estática.
  const normalizedSlug = normalizeSlug(slug) ?? slug;

  // Busca a categoria diretamente na API — sem pré-validação estática.
  // Se não existir no banco, `category` ficará null após o carregamento.
  const categoryQuery = trpc.categories.bySlug.useQuery(
    { slug: normalizedSlug },
    { enabled: !!normalizedSlug, staleTime: 60_000, retry: 1 }
  );
  const category = categoryQuery.data ?? null;

  // Wait for category to load before fetching places to avoid showing all places briefly
  const placesQuery = trpc.places.list.useQuery(
    { categoryId: category?.id, limit: 50, offset: 0 },
    { enabled: !!category?.id, staleTime: 30_000, retry: 1, throwOnError: false }
  );
  const allPlaces = placesQuery.data ?? [];
  const placesLoading = placesQuery.isLoading;

  // When category hasn't loaded yet, show loading state instead of empty results
  const places = category?.id ? allPlaces : [];

  const favoritesQuery = trpc.favorites.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 30_000,
    retry: 1,
  });
  const favoriteIds = new Set(
    (favoritesQuery.data ?? []).map((f: { placeId: number }) => f.placeId)
  );
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });

  // Mostra "não encontrada" somente APÓS o carregamento concluir sem dados.
  // Enquanto carrega, renderiza normalmente (com skeletons via placesLoading).
  if (!categoryQuery.isLoading && !categoryQuery.isFetching && !category) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader
          title="Categoria não encontrada"
          showBack
          onBack={() => navigate("/app/explorar")}
        />
        <div className="px-5 mt-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--ds-color-text-primary)",
              fontFamily: "var(--ds-font-display)",
              marginBottom: 8,
            }}
          >
            Categoria não encontrada
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-muted)" }}>
            A categoria "{slug}" não existe.
          </p>
          <DSButton onClick={() => navigate("/app/explorar")}>
            Voltar para Explorar
          </DSButton>
        </div>
        <div style={{ height: 100 }} />
        <TabBar />
      </div>
    );
  }

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (favoriteIds.has(placeId)) {
      removeFavoriteMutation.mutate({ placeId });
    } else {
      addFavoriteMutation.mutate({ placeId });
    }
  }

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader
        title={category?.name ?? "Categoria"}
        showBack
        onBack={() => navigate("/app/explorar")}
      />

      {/* Cover */}
      <div className="relative" style={{ height: 180 }}>
        <img
          src={category?.coverImage || getCategorycover(normalizedSlug)}
          alt={category?.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 20%, var(--ds-color-bg-primary) 100%)" }}
        />
        <div className="absolute bottom-4 left-5">
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ds-color-text-primary)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            {category?.name}
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--ds-color-text-muted)" }}>
            {places?.length ?? 0} lugares
          </p>
        </div>
      </div>

      <div className="px-5 mt-4">
        {!category?.id || placesLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl"
                style={{ height: 200, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }}
              />
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--ds-color-text-muted)" }}>Nenhum lugar nesta categoria ainda.</p>
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

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
