import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Set meta tags and SEO
  useEffect(() => {
    if (!article) return;

    document.title = `${article.seoTitle || article.title} - ORANJE`;

    // Update description meta
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", article.seoDescription || article.excerpt || "");

    // Update OG tags
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

    // Set canonical URL — aponta para /blog/ que é a URL no sitemap
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/${article.slug}`);

    // Set structured data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      image: article.coverImageUrl || "",
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        "@type": "Organization",
        name: "ORANJE",
      },
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
          Voltar ao Guia
        </button>
      </div>
    );
  }

  return (
    <div className="oranje-app min-h-screen">
      {/* Header */}
      <div className="oranje-header px-4 py-4">
        <button
          onClick={() => navigate("/guia")}
          className="flex items-center gap-2 text-sm mb-6"
          style={{ color: "#D88A3D" }}
        >
          <ArrowLeft size={18} />
          Voltar ao Guia
        </button>

        {article.coverImageUrl && (
          <div
            className="w-full h-64 rounded-2xl bg-cover bg-center mb-6"
            style={{ backgroundImage: `url(${article.coverImageUrl})` }}
          />
        )}

        <h1 className="text-4xl font-bold mb-2" style={{ color: "#E8E6E3" }}>
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-sm" style={{ color: "#C8C5C0" }}>
          <span className="px-3 py-1 rounded-full" style={{ background: "rgba(216,138,61,0.1)" }}>
            {article.category}
          </span>
          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 max-w-3xl mx-auto">
        {article.excerpt && (
          <p className="text-lg mb-6" style={{ color: "#C8C5C0" }}>
            {article.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert max-w-none"
          style={{ color: "#E8E6E3" }}
          dangerouslySetInnerHTML={{
            __html: article.content
              .replace(/\n/g, "<br />")
              .replace(/^# (.*?)$/gm, '<h2 style="font-size: 1.875rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; color: #E8E6E3;">$1</h2>')
              .replace(/^## (.*?)$/gm, '<h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.75rem; color: #E8E6E3;">$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
              .replace(/^\- (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>'),
          }}
        />
      </div>
    </div>
  );
}
