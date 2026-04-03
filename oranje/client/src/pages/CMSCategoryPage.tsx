import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";

/* ─────────────────────────────────────────────
   CTA por slug (estrutural, não CMS)
───────────────────────────────────────────── */
const CTA_MAP: Record<string, { label: string; href: string }> = {
  "melhores-restaurantes-de-holambra": { label: "Ver restaurantes no App", href: "/app" },
  "melhores-cafes-de-holambra": { label: "Ver cafés no App", href: "/app" },
  "bares-e-drinks-em-holambra": { label: "Ver bares no App", href: "/app" },
  "onde-tirar-fotos-em-holambra": { label: "Explorar pontos turísticos", href: "/app" },
  "eventos-em-holambra": { label: "Ver eventos no App", href: "/app/eventos" },
};

function setMeta(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setNameMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function CMSCategoryPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "");

  const { data: page, isLoading } = trpc.cms.getPageBySlug.useQuery(
    { slug },
    { staleTime: 5 * 60 * 1000, retry: false }
  );

  useEffect(() => {
    if (!page) return;
    const SITE = "ORANJE — Guia Cultural de Holambra";
    const title = page.metaTitle || page.title;
    const description = page.metaDescription || "";
    const pageUrl = `https://oranjeapp.com.br${location.pathname}`;

    document.title = title;
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", pageUrl);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE);
    setNameMeta("description", description);
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", title);
    setNameMeta("twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    return () => {
      document.title = SITE;
    };
  }, [page, location.pathname]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid #E65100",
                borderTopColor: "transparent",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "var(--ds-color-text-muted)" }}>Carregando...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!page || !page.published) {
    return (
      <SiteLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "var(--ds-text-2xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-3)",
              }}
            >
              Página não disponível
            </h1>
            <p style={{ color: "var(--ds-color-text-muted)" }}>
              Este conteúdo está sendo preparado. Volte em breve.
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const content = (
    <>
      {page.coverImageUrl && (
        <div
          style={{
            marginBottom: "var(--ds-space-8)",
            borderRadius: "var(--ds-radius-xl)",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src={page.coverImageUrl}
            alt={page.title}
            style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <style>{`
        .cms-editorial-content p {
          margin-bottom: var(--ds-space-4);
          color: var(--ds-color-text-secondary);
          line-height: var(--ds-leading-relaxed);
          font-size: var(--ds-text-base);
        }
        .cms-editorial-content h2 {
          font-size: var(--ds-text-2xl);
          font-weight: var(--ds-font-bold);
          color: var(--ds-color-text-primary);
          margin-top: var(--ds-space-10);
          margin-bottom: var(--ds-space-3);
          font-family: var(--ds-font-display);
        }
        .cms-editorial-content h3 {
          font-size: var(--ds-text-xl);
          font-weight: 600;
          color: var(--ds-color-text-primary);
          margin-top: var(--ds-space-6);
          margin-bottom: var(--ds-space-2);
          font-family: var(--ds-font-display);
        }
        .cms-editorial-content a {
          color: var(--ds-color-accent);
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid rgba(230,81,0,0.3);
          transition: border-color 0.2s;
        }
        .cms-editorial-content a:hover {
          border-color: var(--ds-color-accent);
        }
        .cms-editorial-content strong {
          font-weight: 700;
          color: var(--ds-color-text-primary);
        }
        .cms-editorial-content ul, .cms-editorial-content ol {
          padding-left: var(--ds-space-5);
          margin-bottom: var(--ds-space-4);
          color: var(--ds-color-text-secondary);
        }
        .cms-editorial-content li {
          margin-bottom: var(--ds-space-2);
          line-height: var(--ds-leading-relaxed);
        }
        .cms-editorial-content .place-card {
          display: block;
          padding: var(--ds-space-4) var(--ds-space-5);
          border-radius: var(--ds-radius-lg);
          border: 1px solid rgba(230,81,0,0.15);
          background: var(--ds-color-bg-secondary);
          text-decoration: none;
          margin-bottom: var(--ds-space-3);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cms-editorial-content .place-card:hover {
          border-color: rgba(230,81,0,0.5);
          box-shadow: 0 2px 12px rgba(230,81,0,0.08);
        }
        .cms-editorial-content .place-card-name {
          font-weight: 700;
          color: var(--ds-color-text-primary);
          margin-bottom: var(--ds-space-1);
          font-family: var(--ds-font-display);
          font-size: var(--ds-text-base);
        }
        .cms-editorial-content .place-card-desc {
          color: var(--ds-color-text-muted);
          font-size: var(--ds-text-sm);
        }
      `}</style>

      <div
        className="cms-editorial-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </>
  );

  const cta = CTA_MAP[slug];

  return (
    <SiteContentPage
      title={page.title}
      subtitle={page.subtitle || undefined}
      content={content}
      cta={cta}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: page.title, href: location.pathname },
      ]}
    />
  );
}
