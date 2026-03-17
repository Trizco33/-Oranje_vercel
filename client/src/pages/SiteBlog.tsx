import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SiteLayout from "@/components/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SiteBlog() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const { data: articles = [], isError: articlesError } = trpc.articles.listPublished.useQuery(
    {
      category: selectedCategory,
      limit: 20,
    },
    {
      retry: false,
    }
  );
  
  const { data: categories = [], isError: categoriesError } = trpc.articles.categories.useQuery(undefined, {
    retry: false,
  });

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#004D40] to-[#00251A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 font-montserrat">Blog Oranje</h1>
          <p className="text-xl text-gray-200">Dicas, histórias e guias sobre Holambra</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-lg font-bold text-[#004D40] mb-4">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory(undefined)}
                variant={selectedCategory === undefined ? "default" : "outline"}
                className={selectedCategory === undefined ? "bg-[#E65100] hover:bg-[#D84500]" : ""}
              >
                Todas
              </Button>
              {categories && categories.length > 0 && categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={selectedCategory === cat ? "bg-[#E65100] hover:bg-[#D84500]" : ""}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {articlesError || categoriesError ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum artigo disponível no momento</p>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum artigo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                if (!article) return null;
                return (
                  <Card 
                    key={article.id} 
                    className="overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
                    onClick={() => navigate(`/blog/${article.slug}`)}
                  >
                    {article.coverImageUrl && (
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url('${article.coverImageUrl}')` }}
                      ></div>
                    )}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-[#E65100] text-white px-2 py-1 rounded">
                          {article.category || "Geral"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#004D40] mb-2 flex-1">
                        {article.title || "Sem título"}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {article.excerpt || "Sem descrição"}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-[#E65100] text-[#E65100] hover:bg-[#E65100] hover:text-white"
                      >
                        Ler Mais
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
