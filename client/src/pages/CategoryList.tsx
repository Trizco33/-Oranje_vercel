import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon, getCategorycover, normalizeSlug } from "@/constants/categories";
import coverPontosTuristicos from "../assets/covers/pontos-turisticos.jpg";

const CARD_COVER_OVERRIDE: Record<string, string> = {
  "pontos-turisticos": coverPontosTuristicos,
};

export default function CategoryList() {
  console.log('[CategoryList] rendered');
  const { data: categories } = trpc.categories.list.useQuery();
  console.log('[CategoryList] rendered, categories:', categories);

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Explorar" showSearch />

      <div className="px-4 pt-4 pb-2">
        <p className="text-sm" style={{ color: "#C8C5C0" }}>
          Descubra o melhor de Holambra por categoria
        </p>
      </div>

      <div className="px-4 mt-2 flex flex-col gap-3">
        {categories?.map(cat => {
          const normalizedSlug = normalizeSlug(cat.slug) || cat.slug;
          return (
          <Link key={cat.id} to={`/app/explorar/${normalizedSlug}`}>
            <div className="relative overflow-hidden rounded-2xl cursor-pointer group"
              style={{ height: 120, border: "1px solid rgba(216,138,61,0.1)" }}>
              <img
                src={CARD_COVER_OVERRIDE[cat.slug] || cat.coverImage || getCategorycover(cat.slug)}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getCategorycover('restaurantes');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center px-5 gap-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#C8C5C0" }}>
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronRight size={20} style={{ color: "#D88A3D" }} />
              </div>
            </div>
          </Link>
        );
        })}
      </div>

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
