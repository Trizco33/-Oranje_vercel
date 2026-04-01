import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon, getCategorycover, normalizeSlug } from "@/constants/categories";
import { DSBadge } from "@/components/ds";
import coverPontosTuristicos from "../assets/covers/pontos-turisticos.jpg";
import { useCategoriesList } from "@/hooks/useMockData";

const CARD_COVER_OVERRIDE: Record<string, string> = {
  "pontos-turisticos": coverPontosTuristicos,
};

export default function CategoryList() {
  const { data: categories } = useCategoriesList();

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Explorar" showSearch />

      <div className="px-5 pt-5 pb-2">
        <p className="text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
          Descubra o melhor de Holambra por categoria
        </p>
      </div>

      <div className="px-5 mt-3 flex flex-col gap-3">
        {categories?.map(cat => {
          const normalizedSlug = normalizeSlug(cat.slug) || cat.slug;
          return (
            <Link key={cat.id} to={`/app/explorar/${normalizedSlug}`}>
              <div
                className="card-press relative overflow-hidden cursor-pointer"
                style={{
                  height: 120,
                  borderRadius: "var(--ds-radius-xl)",
                  border: "1px solid var(--ds-color-border-default)",
                  boxShadow: "var(--ds-shadow-sm)",
                }}
              >
                <img
                  src={CARD_COVER_OVERRIDE[cat.slug] || cat.coverImage || getCategorycover(cat.slug)}
                  alt={cat.name}
                  className="card-img-zoom w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getCategorycover('restaurantes');
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(0,37,26,0.85) 0%, rgba(0,37,26,0.4) 60%, transparent 100%)" }}
                />
                <div className="absolute inset-0 flex items-center px-5 gap-4">
                  <div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--ds-color-text-primary)",
                        fontFamily: "var(--ds-font-display)",
                      }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--ds-color-text-secondary)" }}>
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--ds-radius-full)",
                      background: "var(--ds-color-accent-muted)",
                    }}
                  >
                    <ChevronRight size={18} style={{ color: "var(--ds-color-accent)" }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
