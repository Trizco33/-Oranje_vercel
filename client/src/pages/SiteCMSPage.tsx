import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { DSButton } from "@/components/ds/Button";

function renderContent(content: string) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content
          .split("\n")
          .map((line) => {
            if (line.startsWith("## ")) {
              return `<h2 style="font-size: var(--ds-text-2xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-8); margin-bottom: var(--ds-space-3); font-family: var(--ds-font-display);">${line.substring(3)}</h2>`;
            }
            if (line.startsWith("### ")) {
              return `<h3 style="font-size: var(--ds-text-xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-6); margin-bottom: var(--ds-space-2);">${line.substring(4)}</h3>`;
            }
            if (line.trim().startsWith("- ")) {
              return `<div style="display: flex; align-items: flex-start; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding-left: var(--ds-space-2);"><span style="color: var(--ds-color-accent); margin-top: 6px; flex-shrink: 0;">•</span><span style="color: var(--ds-color-text-secondary);">${line.trim().substring(2)}</span></div>`;
            }
            if (line.trim() === "") {
              return "";
            }
            return `<p style="margin-bottom: var(--ds-space-3); color: var(--ds-color-text-secondary); line-height: var(--ds-leading-relaxed);">${line.trim()}</p>`;
          })
          .join(""),
      }}
    />
  );
}

export default function SiteCMSPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const normalizedSlug = useMemo(() => slug?.trim() ?? "", [slug]);
  const { data: page, isLoading, error } = trpc.cms.getPageBySlug.useQuery(
    { slug: normalizedSlug },
    { enabled: !!normalizedSlug }
  );

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
            <p style={{ color: "var(--ds-color-text-muted)" }}>Carregando página...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !page) {
    return (
      <SiteLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          <div style={{ textAlign: "center", maxWidth: "32rem", padding: "0 var(--ds-space-4)" }}>
            <h1
              style={{
                fontSize: "var(--ds-text-2xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-3)",
              }}
            >
              Pagina nao encontrada
            </h1>
            <p style={{ color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-6)" }}>
              {error
                ? "Nao foi possivel carregar esta pagina agora."
                : "Esta pagina nao existe ou ainda nao foi publicada."}
            </p>
            <DSButton variant="primary" onClick={() => navigate("/")}>
              Voltar para a home
            </DSButton>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteContentPage
      title={page.title}
      subtitle={page.subtitle || undefined}
      content={renderContent(page.content)}
      cta={{ label: "Explorar no App", href: "/app" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: page.title, href: location.pathname },
      ]}
    />
  );
}
