import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SiteLayout from "@/components/SiteLayout";
import { useNavigate } from "react-router-dom";
import { DSButton } from "@/components/ds/Button";
import { DSCard } from "@/components/ds/Card";
import { DSBadge } from "@/components/ds/Badge";

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
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-primary) 100%)",
          padding: "var(--ds-space-12) 0 var(--ds-space-16)",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <DSBadge variant="accent" size="md">Artigos</DSBadge>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "var(--ds-font-bold)",
              color: "var(--ds-color-text-primary)",
              marginTop: "var(--ds-space-4)",
              marginBottom: "var(--ds-space-3)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            Blog Oranje
          </h1>
          <p style={{ fontSize: "var(--ds-text-xl)", color: "var(--ds-color-text-muted)" }}>
            Dicas, histórias e guias sobre Holambra
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "var(--ds-space-16) 0", background: "var(--ds-color-bg-primary)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          {/* Categories Filter */}
          <div style={{ marginBottom: "var(--ds-space-12)" }}>
            <h3 style={{ fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-4)" }}>
              Categorias
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-2)" }}>
              <DSButton
                variant={selectedCategory === undefined ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
              >
                Todas
              </DSButton>
              {categories && categories.length > 0 && categories.map((cat) => (
                <DSButton
                  key={cat}
                  variant={selectedCategory === cat ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </DSButton>
              ))}
            </div>
          </div>

          {articlesError || categoriesError ? (
            <div style={{ textAlign: "center", padding: "var(--ds-space-12) 0" }}>
              <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)" }}>
                Nenhum artigo disponível no momento
              </p>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--ds-space-12) 0" }}>
              <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)" }}>
                Nenhum artigo encontrado
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "var(--ds-space-6)",
              }}
            >
              {articles.map((article) => {
                if (!article) return null;
                return (
                  <div key={article.id} onClick={() => navigate(`/blog/${article.slug}`)} style={{ cursor: "pointer" }}>
                    <DSCard
                      variant="elevated"
                      interactive
                      image={article.coverImageUrl || undefined}
                      imageAlt={article.title || "Artigo"}
                      overlay={!!article.coverImageUrl}
                      padding="none"
                      className="h-full"
                    >
                      <div style={{ padding: "var(--ds-space-4)", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ marginBottom: "var(--ds-space-3)" }}>
                          <DSBadge variant="accent" size="sm">
                            {article.category || "Geral"}
                          </DSBadge>
                        </div>
                        <h3
                          style={{
                            fontSize: "var(--ds-text-lg)",
                            fontWeight: "var(--ds-font-bold)",
                            color: "var(--ds-color-text-primary)",
                            marginBottom: "var(--ds-space-2)",
                            flex: 1,
                          }}
                        >
                          {article.title || "Sem título"}
                        </h3>
                        <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-4)" }}>
                          {article.excerpt || "Sem descrição"}
                        </p>
                        <DSButton variant="secondary" size="sm" fullWidth>
                          Ler Mais
                        </DSButton>
                      </div>
                    </DSCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
