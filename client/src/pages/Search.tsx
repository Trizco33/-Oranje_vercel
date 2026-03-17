import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchStr = location.search;
  const params = new URLSearchParams(searchStr);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"relevancia" | "avaliacao" | "recente">("relevancia");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const { user } = useAuth();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: places, isLoading } = trpc.places.list.useQuery({
    categoryId: selectedCategory,
    limit: 50,
    offset: 0,
  });

  const { data: userFavs } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  const addFav = trpc.favorites.add.useMutation();
  const removeFav = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteIds = new Set(userFavs?.map(f => f.placeId) ?? []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.location.href = getLoginUrl(); return; }
    if (favoriteIds.has(placeId)) {
      removeFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    } else {
      addFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function mapPriceRangeToFilter(priceRange: string | undefined): boolean {
    if (!priceRange) return true;
    return true;
  }

  const filteredPlaces = places?.filter((p: any) => {
    // Filtro de tags
    if (selectedTags.length > 0) {
      const placeTags: string[] = Array.isArray(p.tags) ? p.tags : [];
      if (!selectedTags.some(t => placeTags.includes(t))) return false;
    }
    
    // Filtro de preço
    if (selectedPriceRange && !mapPriceRangeToFilter(selectedPriceRange)) return false;
    
    // Filtro de localização (simplificado)
    if (selectedLocation) {
      return true;
    }
    
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === "avaliacao") {
      return (b.rating ?? 0) - (a.rating ?? 0);
    } else if (sortBy === "recente") {
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    }
    return 0;
  });

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Busca" showBack onBack={() => navigate("/")} />

      <div className="px-4 pt-4">
        {/* Search Input */}
        <div className="search-bar flex items-center gap-3 px-4 py-3 mb-3">
          <Search size={18} style={{ color: "#D88A3D" }} />
          <input
            type="text"
            placeholder="Restaurantes, cafés, eventos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} style={{ color: "#C8C5C0" }} />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: showFilters ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.1)" }}
          >
            <Filter size={15} style={{ color: "#D88A3D" }} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass-card p-4 mb-4">
            <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
              CATEGORIAS
            </p>
            <div className="scroll-x flex gap-2 pb-1 mb-4">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: !selectedCategory ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                  border: `1px solid ${!selectedCategory ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                  color: !selectedCategory ? "#D88A3D" : "#C8C5C0",
                }}
              >
                Todos
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedCategory === cat.id ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                    border: `1px solid ${selectedCategory === cat.id ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                    color: selectedCategory === cat.id ? "#D88A3D" : "#C8C5C0",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
              TAGS
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedTags.includes(tag) ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                    border: `1px solid ${selectedTags.includes(tag) ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                    color: selectedTags.includes(tag) ? "#D88A3D" : "#C8C5C0",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
              FAIXA DE PREÇO
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedPriceRange(undefined)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: !selectedPriceRange ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                  border: `1px solid ${!selectedPriceRange ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                  color: !selectedPriceRange ? "#D88A3D" : "#C8C5C0",
                }}
              >
                Qualquer preço
              </button>
              {PRICE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? undefined : range.value)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedPriceRange === range.value ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                    border: `1px solid ${selectedPriceRange === range.value ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                    color: selectedPriceRange === range.value ? "#D88A3D" : "#C8C5C0",
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
              LOCALIZAÇÃO
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedLocation(undefined)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: !selectedLocation ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                  border: `1px solid ${!selectedLocation ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                  color: !selectedLocation ? "#D88A3D" : "#C8C5C0",
                }}
              >
                Qualquer local
              </button>
              {LOCATIONS.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => setSelectedLocation(selectedLocation === loc.value ? undefined : loc.value)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedLocation === loc.value ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                    border: `1px solid ${selectedLocation === loc.value ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                    color: selectedLocation === loc.value ? "#D88A3D" : "#C8C5C0",
                  }}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#D88A3D" }}>
              ORDENAR POR
            </p>
            <div className="flex flex-wrap gap-2">
              {(["relevancia", "avaliacao", "recente"] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                  style={{
                    background: sortBy === sort ? "rgba(216,138,61,0.2)" : "rgba(216,138,61,0.08)",
                    border: `1px solid ${sortBy === sort ? "#D88A3D" : "rgba(216,138,61,0.2)"}`,
                    color: sortBy === sort ? "#D88A3D" : "#C8C5C0",
                  }}
                >
                  {sort === "relevancia" ? "Relevância" : sort === "avaliacao" ? "Melhor avaliação" : "Mais recente"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "#C8C5C0" }}>
            {isLoading ? "Buscando..." : `${filteredPlaces?.length ?? 0} resultados`}
          </p>
          {(selectedTags.length > 0 || selectedCategory || selectedPriceRange || selectedLocation || sortBy !== "relevancia") && (
            <button
              onClick={() => { 
                setSelectedTags([]); 
                setSelectedCategory(undefined);
                setSelectedPriceRange(undefined);
                setSelectedLocation(undefined);
                setSortBy("relevancia");
              }}
              className="text-xs flex items-center gap-1"
              style={{ color: "#D88A3D" }}
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer rounded-2xl" style={{ height: 200 }} />
            ))}
          </div>
        ) : filteredPlaces?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-medium mb-1" style={{ color: "#E8E6E3" }}>
              Nenhum resultado encontrado
            </p>
            <p className="text-xs" style={{ color: "#C8C5C0" }}>
              Tente outros termos ou remova os filtros
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPlaces?.map((place: any) => (
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
