import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

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
          Guia de Holambra
        </h1>
        <p style={{ color: "#C8C5C0" }}>
          Descubra histórias, dicas e informações sobre a cidade das flores
        </p>
      </div>

      {/* Categories Filter */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-4">
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
      <div className="px-4 pb-12 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} style={{ color: "#D88A3D" }} className="animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#C8C5C0" }}>Nenhum artigo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
              key={article.id}
              onClick={() => navigate(`/guia/${article.slug}`)}
              className="group cursor-pointer"
            >
                  <div
                    className="rounded-2xl overflow-hidden mb-4 aspect-video bg-cover bg-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundImage: article.coverImageUrl
                        ? `url(${article.coverImageUrl})`
                        : "linear-gradient(135deg, #D88A3D 0%, #8B5A2B 100%)",
                    }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-orange-400 transition-colors" style={{ color: "#E8E6E3" }}>
                        {article.title}
                      </h3>
                      <ArrowRight size={20} style={{ color: "#D88A3D" }} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "#C8C5C0" }}>
                      {article.excerpt || article.content.substring(0, 100)}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(216,138,61,0.1)", color: "#D88A3D" }}>
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
