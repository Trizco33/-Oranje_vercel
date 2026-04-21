import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, BookOpen } from "lucide-react";

export default function Guide() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: articles = [], isLoading } = trpc.articles.listPublished.useQuery({
    category: selectedCategory || undefined,
  });
  const { data: categories = [] } = trpc.articles.categories.useQuery();

  return (
    <div className="oranje-app min-h-screen">
      {/* Header */}
      <div className="oranje-header px-4 py-6 text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#E8E6E3" }}>
          Blog
        </h1>
        <p style={{ color: "#C8C5C0" }}>
          Descubra histórias, dicas e informações sobre a cidade das flores
        </p>
      </div>

      {/* Categories Filter */}
      <div className="px-4 py-4 max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: !selectedCategory ? "#D88A3D" : "rgba(216,138,61,0.1)",
              color: !selectedCategory ? "#0F1B14" : "#D88A3D",
            }}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedCategory === category ? "#D88A3D" : "rgba(216,138,61,0.1)",
                color: selectedCategory === category ? "#0F1B14" : "#D88A3D",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="px-4 pb-24 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} style={{ color: "#D88A3D" }} className="animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#C8C5C0" }}>Nenhum artigo encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/guia/${article.slug}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Cover image */}
                {article.coverImageUrl ? (
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full object-cover"
                    style={{ height: "180px" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                      if (next) next.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Gradient fallback — shown when no image or image fails */}
                <div
                  style={{
                    height: "180px",
                    display: article.coverImageUrl ? "none" : "flex",
                    background: "linear-gradient(135deg, #1a3a2a 0%, #2a1a0a 50%, #1a2a1a 100%)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={40} style={{ color: "rgba(216,138,61,0.4)" }} />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-base line-clamp-2 group-hover:text-orange-400 transition-colors"
                      style={{ color: "#E8E6E3" }}
                    >
                      {article.title}
                    </h3>
                    <ArrowRight
                      size={18}
                      style={{ color: "#D88A3D" }}
                      className="flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: "#C8C5C0" }}>
                    {article.excerpt || article.content.substring(0, 100)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: "rgba(216,138,61,0.1)", color: "#D88A3D" }}
                    >
                      {article.category}
                    </span>
                    <span className="text-xs" style={{ color: "#9B9795" }}>
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
