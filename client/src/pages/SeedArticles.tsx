import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { articlesData } from "@/utils/seed-articles";
import { toast } from "sonner";

export default function SeedArticles() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const createArticle = trpc.articles.create.useMutation();

  const handleSeed = async () => {
    setIsSeeding(true);
    setProgress(0);

    for (let i = 0; i < articlesData.length; i++) {
      const article = articlesData[i];
      try {
        await createArticle.mutateAsync({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          seoKeywords: article.seoKeywords,
          category: article.category,
          published: true,
        });
        setProgress(((i + 1) / articlesData.length) * 100);
      } catch (error) {
        console.error(`Erro ao criar artigo ${article.title}:`, error);
        toast.error(`Erro ao criar: ${article.title}`);
      }
    }

    setIsSeeding(false);
    toast.success(`${articlesData.length} artigos criados com sucesso!`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Seed Articles</h1>
      <p>Clique no botão abaixo para criar {articlesData.length} artigos de blog sobre Holambra.</p>

      <button
        onClick={handleSeed}
        disabled={isSeeding}
        style={{
          padding: "10px 20px",
          background: isSeeding ? "#ccc" : "#E65100",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: isSeeding ? "not-allowed" : "pointer",
        }}
      >
        {isSeeding ? `Criando... ${Math.round(progress)}%` : "Criar Artigos"}
      </button>

      {isSeeding && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              width: "100%",
              height: "20px",
              background: "#eee",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#E65100",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
