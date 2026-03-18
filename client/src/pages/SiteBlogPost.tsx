import { useParams, useNavigate, Link } from "react-router-dom";
import { useArticleBySlug } from "@/hooks/useMockData";
import SiteLayout from "@/components/SiteLayout";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSBadge } from "@/components/ds/Badge";
import { DSCard } from "@/components/ds/Card";

export default function SiteBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading } = useArticleBySlug(slug || "");

  if (isLoading) {
    return (
      <SiteLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(230, 81, 0, 0.2)",
                borderTopColor: "var(--ds-color-accent)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto var(--ds-space-4)",
              }}
            />
            <p style={{ color: "var(--ds-color-text-muted)" }}>Carregando artigo...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!article) {
    return (
      <SiteLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-4)" }}>
              Artigo não encontrado
            </h1>
            <DSButton variant="primary" onClick={() => navigate("/blog")}>
              Voltar ao Blog
            </DSButton>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-primary) 100%)",
          padding: "var(--ds-space-8) 0 var(--ds-space-12)",
        }}
      >
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <DSButton
            variant="ghost"
            size="sm"
            iconLeft={<ArrowLeft size={18} />}
            onClick={() => navigate("/blog")}
            style={{ marginBottom: "var(--ds-space-4)" }}
          >
            Voltar
          </DSButton>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              fontWeight: "var(--ds-font-bold)",
              color: "var(--ds-color-text-primary)",
              marginBottom: "var(--ds-space-4)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            {article.title}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)", alignItems: "center" }}>
            {article.category && (
              <DSBadge variant="accent" size="sm">{article.category}</DSBadge>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", color: "var(--ds-color-text-muted)" }}>
              <Calendar size={16} />
              <span style={{ fontSize: "var(--ds-text-sm)" }}>
                {article.publishedAt &&
                  new Date(article.publishedAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {article.coverImageUrl && (
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "var(--ds-space-4) var(--ds-space-4) 0" }}>
          <img
            src={article.coverImageUrl}
            alt={article.title}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "24rem",
              objectFit: "cover",
              borderRadius: "var(--ds-radius-xl)",
            }}
          />
        </div>
      )}

      {/* Content */}
      <section style={{ padding: "var(--ds-space-12) 0", background: "var(--ds-color-bg-primary)" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <article>
            <div
              style={{
                color: "var(--ds-color-text-secondary)",
                lineHeight: "var(--ds-leading-relaxed)",
                fontSize: "var(--ds-text-base)",
              }}
              dangerouslySetInnerHTML={{
                __html: article.content
                  .split("\n")
                  .map((line: string) => {
                    if (line.startsWith("# ")) {
                      return `<h1 style="font-size: var(--ds-text-4xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-10); margin-bottom: var(--ds-space-4); font-family: var(--ds-font-display);">${line.substring(2)}</h1>`;
                    }
                    if (line.startsWith("## ")) {
                      return `<h2 style="font-size: var(--ds-text-2xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-8); margin-bottom: var(--ds-space-3); font-family: var(--ds-font-display);">${line.substring(3)}</h2>`;
                    }
                    if (line.startsWith("### ")) {
                      return `<h3 style="font-size: var(--ds-text-xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-6); margin-bottom: var(--ds-space-2);">${line.substring(4)}</h3>`;
                    }
                    if (line.startsWith("- ")) {
                      return `<div style="display: flex; align-items: flex-start; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding-left: var(--ds-space-2);"><span style="color: var(--ds-color-accent); margin-top: 6px;">•</span><span>${line.substring(2)}</span></div>`;
                    }
                    if (line.trim() === "") {
                      return "<br />";
                    }
                    return `<p style="margin-bottom: var(--ds-space-3);">${line}</p>`;
                  })
                  .join(""),
              }}
            />
          </article>

          {/* Share */}
          <div
            style={{
              marginTop: "var(--ds-space-12)",
              paddingTop: "var(--ds-space-8)",
              borderTop: "1px solid rgba(230, 81, 0, 0.1)",
            }}
          >
            <h3
              style={{
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-4)",
                display: "flex",
                alignItems: "center",
                gap: "var(--ds-space-2)",
              }}
            >
              <Share2 size={18} style={{ color: "var(--ds-color-accent)" }} />
              Compartilhe este artigo
            </h3>
            <div style={{ display: "flex", gap: "var(--ds-space-3)", flexWrap: "wrap" }}>
              {[
                { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}` },
                { label: "Twitter", url: `https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}&text=${article.title}` },
                { label: "WhatsApp", url: `https://wa.me/?text=${article.title} ${typeof window !== 'undefined' ? window.location.href : ''}` },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <DSButton variant="secondary" size="sm">{s.label}</DSButton>
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <DSCard variant="elevated" padding="lg" className="mt-12">
            <h3 style={{ fontSize: "var(--ds-text-xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-3)" }}>
              Quer explorar mais Holambra?
            </h3>
            <p style={{ color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-6)", lineHeight: "var(--ds-leading-relaxed)" }}>
              Baixe o app Oranje e tenha acesso a todos os lugares, eventos e roteiros da cidade.
            </p>
            <Link to="/app" style={{ textDecoration: "none" }}>
              <DSButton variant="primary" size="lg">Abrir App</DSButton>
            </Link>
          </DSCard>
        </div>
      </section>

      {/* Spinner animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </SiteLayout>
  );
}
