import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { getCategoryIcon, getCategorycover, normalizeSlug, isValidCategorySlug } from "@/constants/categories";
import { DSButton, DSBadge } from "@/components/ds";
import { useCategoryBySlug, usePlacesList, useFavorites } from "@/hooks/useMockData";

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug: propSlug }: CategoryDetailProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  const normalizedSlug = normalizeSlug(slug);
  const isValid = isValidCategorySlug(normalizedSlug);

  // IMPORTANT: All hooks must be called unconditionally (React rules of hooks).
  // We use `enabled` flag to skip fetching when slug is invalid.
  const { data: category } = useCategoryBySlug(isValid ? normalizedSlug : '');
  // Wait for category to load before fetching places to avoid showing all places briefly
  const { data: allPlaces, isLoading: placesLoading } = usePlacesList(
    category?.id ? { categoryId: category.id, limit: 50, offset: 0 } : { limit: 0, offset: 0 }
  );
  // When category hasn't loaded yet, show loading state instead of empty results
  const places = category?.id ? allPlaces : [];
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites(!!user);

  if (!isValid) {
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
      removeFavorite(placeId);
    } else {
      addFavorite(placeId);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
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
