import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { useCategoriesList, usePlacesSearch, useFavorites } from "@/hooks/useMockData";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DSBadge } from "@/components/ds";

const POPULAR_TAGS = ["romântico", "família", "pet friendly", "vegetariano", "artesanal", "ao ar livre", "vista", "tradicional"];

const PRICE_RANGES = [
  { label: "Até R$ 50", value: "ate_50" },
  { label: "R$ 50 - R$ 100", value: "50_100" },
  { label: "R$ 100 - R$ 200", value: "100_200" },
  { label: "Acima de R$ 200", value: "acima_200" },
];

const LOCATIONS = [
  { label: "Centro", value: "centro" },
  { label: "Zona Rural", value: "zona_rural" },
  { label: "Próximo ao Centro", value: "proximo_centro" },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        background: active ? "var(--ds-color-accent-muted)" : "var(--ds-color-bg-surface)",
        border: `1px solid ${active ? "var(--ds-color-border-accent)" : "var(--ds-color-border-default)"}`,
        color: active ? "var(--ds-color-accent)" : "var(--ds-color-text-muted)",
      }}
    >
      {label}
    </button>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"relevancia" | "avaliacao" | "recente">("relevancia");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const { user } = useAuth();
  const { data: categories } = useCategoriesList();
  // Busca server-side: o backend filtra por nome/descrição/endereço/categoria
  // (e tags) usando LIKE no MySQL. Isso escala pra centenas/milhares de lugares
  // sem mandar tudo pro navegador. Usa o `debouncedQuery` pra não bater no
  // backend a cada tecla.
  const { data: places, isLoading, isFetching } = usePlacesSearch({
    query: debouncedQuery,
    categoryId: selectedCategory,
    tags: selectedTags,
    limit: 60,
    offset: 0,
  });

  const { favoriteIds, addFavorite, removeFavorite } = useFavorites(!!user);

  // Sync query state when URL search params change (e.g. navigating to Search with new ?q=)
  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get("q") ?? "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [location.search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.location.href = getLoginUrl(); return; }
    if (favoriteIds.has(placeId)) {
      removeFavorite(placeId);
    } else {
      addFavorite(placeId);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  // Filtragem (texto / categoria / tags) já vem feita pelo backend.
  // O servidor também ordena por relevância — só reordenamos no cliente quando
  // o usuário escolhe "Melhor avaliação" ou "Mais recente".
  const filteredPlaces = (() => {
    if (!places) return places;
    if (sortBy === "avaliacao") {
      return [...places].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if (sortBy === "recente") {
      return [...places].sort(
        (a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
    }
    return places;
  })();

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Busca" showBack onBack={() => navigate("/")} />

      <div className="px-5 pt-4">
        {/* Search Input */}
        <div
          className="flex items-center gap-3 mb-3"
          style={{
            padding: "10px 16px",
            borderRadius: "var(--ds-radius-xl)",
            background: "var(--ds-color-bg-surface)",
            border: "1px solid var(--ds-color-border-default)",
          }}
        >
          <Search size={18} style={{ color: "var(--ds-color-accent)" }} />
          <input
            type="text"
            placeholder="Restaurantes, cafés, eventos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--ds-color-text-primary)" }}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} style={{ color: "var(--ds-color-text-muted)" }} />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--ds-radius-lg)",
              background: showFilters ? "var(--ds-color-accent-muted)" : "var(--ds-color-bg-surface-hover)",
            }}
          >
            <Filter size={15} style={{ color: "var(--ds-color-accent)" }} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            className="mb-4"
            style={{
              padding: 16,
              borderRadius: "var(--ds-radius-xl)",
              background: "var(--ds-color-bg-surface)",
              border: "1px solid var(--ds-color-border-default)",
            }}
          >
            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: "var(--ds-color-accent)" }}>Categorias</p>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
              <FilterChip label="Todos" active={!selectedCategory} onClick={() => setSelectedCategory(undefined)} />
              {categories?.map((cat: any) => (
                <FilterChip key={cat.id} label={cat.name} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)} />
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: "var(--ds-color-accent)" }}>Tags</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POPULAR_TAGS.map(tag => (
                <FilterChip key={tag} label={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: "var(--ds-color-accent)" }}>Faixa de Preço</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <FilterChip label="Qualquer preço" active={!selectedPriceRange} onClick={() => setSelectedPriceRange(undefined)} />
              {PRICE_RANGES.map(range => (
                <FilterChip key={range.value} label={range.label} active={selectedPriceRange === range.value} onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? undefined : range.value)} />
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: "var(--ds-color-accent)" }}>Localização</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <FilterChip label="Qualquer local" active={!selectedLocation} onClick={() => setSelectedLocation(undefined)} />
              {LOCATIONS.map(loc => (
                <FilterChip key={loc.value} label={loc.label} active={selectedLocation === loc.value} onClick={() => setSelectedLocation(selectedLocation === loc.value ? undefined : loc.value)} />
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: "var(--ds-color-accent)" }}>Ordenar Por</p>
            <div className="flex flex-wrap gap-2">
              {(["relevancia", "avaliacao", "recente"] as const).map(sort => (
                <FilterChip
                  key={sort}
                  label={sort === "relevancia" ? "Relevância" : sort === "avaliacao" ? "Melhor avaliação" : "Mais recente"}
                  active={sortBy === sort}
                  onClick={() => setSortBy(sort)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
            {isLoading || isFetching ? "Buscando..." : `${filteredPlaces?.length ?? 0} resultados`}
          </p>
          {(selectedTags.length > 0 || selectedCategory || selectedPriceRange || selectedLocation || sortBy !== "relevancia" || debouncedQuery) && (
            <button
              onClick={() => { setSelectedTags([]); setSelectedCategory(undefined); setSelectedPriceRange(undefined); setSelectedLocation(undefined); setSortBy("relevancia"); setQuery(""); setDebouncedQuery(""); }}
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--ds-color-accent)" }}
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl" style={{ height: 200, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filteredPlaces?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Nenhum resultado encontrado</p>
            <p className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>Tente outros termos ou remova os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPlaces?.map((place: any) => (
              <PlaceCard key={place.id} place={place} isFavorite={favoriteIds.has(place.id)} onToggleFavorite={handleToggleFavorite} compact />
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
