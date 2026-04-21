import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";

function renderContent(content: string): string {
  return content
    // headings — processados ANTES do replace de \n
    .replace(/^### (.*?)$/gm, '<h4 style="font-size:1.125rem;font-weight:700;margin-top:1.5rem;margin-bottom:0.5rem;color:#E8E6E3;">$1</h4>')
    .replace(/^## (.*?)$/gm, '<h3 style="font-size:1.375rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#E8E6E3;">$1</h3>')
    .replace(/^# (.*?)$/gm, '<h2 style="font-size:1.625rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#E8E6E3;">$1</h2>')
    // bold e italic
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:#E8E6E3;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style:italic;">$1</em>')
    // listas
    .replace(/^[-*] (.*?)$/gm, '<li style="margin-left:1.25rem;margin-bottom:0.375rem;list-style:disc;">$1</li>')
    // parágrafos — blocos separados por linha em branco
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[2-4]|li|ul|ol|strong|em)/.test(trimmed)) return trimmed;
      return `<p style="margin-bottom:1rem;line-height:1.7;color:#C8C5C0;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (!article) return;

    document.title = `${article.seoTitle || article.title} - ORANJE`;

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", article.seoDescription || article.excerpt || "");

    const setOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setOGTag("og:title", article.seoTitle || article.title);
    setOGTag("og:description", article.seoDescription || article.excerpt || "");
    if (article.coverImageUrl) setOGTag("og:image", article.coverImageUrl);
    setOGTag("og:type", "article");
    setOGTag("og:url", `${window.location.origin}/blog/${article.slug}`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/${article.slug}`);

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      image: article.coverImageUrl || "",
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: { "@type": "Organization", name: "ORANJE" },
    };

    let schema = document.querySelector('script[type="application/ld+json"]');
    if (!schema) {
      schema = document.createElement("script");
      schema.setAttribute("type", "application/ld+json");
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(schemaData);
  }, [article]);

  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <Loader2 size={32} style={{ color: "#D88A3D" }} className="animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="oranje-app min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-4xl mb-4">404</p>
        <p className="text-lg font-medium mb-2" style={{ color: "#E8E6E3" }}>
          Artigo não encontrado
        </p>
        <button
          onClick={() => navigate("/guia")}
          className="btn-gold px-6 py-2 rounded-xl text-sm mt-4"
        >
          Voltar ao Blog
        </button>
      </div>
    );
  }

  return (
    <div className="oranje-app min-h-screen">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => navigate("/guia")}
          className="flex items-center gap-2 text-sm"
          style={{ color: "#D88A3D" }}
        >
          <ArrowLeft size={18} />
          Voltar ao Blog
        </button>
      </div>

      {/* Hero image ou gradiente */}
      {article.coverImageUrl ? (
        <div className="px-4 mb-0">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full rounded-2xl object-cover"
            style={{ height: "220px" }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              const fallback = el.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            className="w-full rounded-2xl"
            style={{
              height: "220px",
              display: "none",
              background: "linear-gradient(135deg, #1a3a2a 0%, #2d1a0a 50%, #1a2a1a 100%)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={48} style={{ color: "rgba(216,138,61,0.4)" }} />
          </div>
        </div>
      ) : (
        <div className="px-4 mb-0">
          <div
            className="w-full rounded-2xl flex items-center justify-center"
            style={{
              height: "220px",
              background: "linear-gradient(135deg, #1a3a2a 0%, #2d1a0a 50%, #1a2a1a 100%)",
            }}
          >
            <BookOpen size={48} style={{ color: "rgba(216,138,61,0.4)" }} />
          </div>
        </div>
      )}

      {/* Header do artigo */}
      <div className="px-4 pt-6 pb-2 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4 text-sm">
          <span
            className="px-3 py-1 rounded-full"
            style={{ background: "rgba(216,138,61,0.1)", color: "#D88A3D" }}
          >
            {article.category}
          </span>
          <span style={{ color: "#9B9795" }}>
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4" style={{ color: "#E8E6E3", lineHeight: "1.25" }}>
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base mb-6" style={{ color: "#A8A5A0", lineHeight: "1.7" }}>
            {article.excerpt}
          </p>
        )}

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1.5rem",
          }}
        />
      </div>

      {/* Conteúdo */}
      <div
        className="px-4 pb-24 max-w-3xl mx-auto"
        style={{ color: "#C8C5C0", fontSize: "1rem", lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
      />
    </div>
  );
}
