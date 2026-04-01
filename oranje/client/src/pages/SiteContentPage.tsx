import { ReactNode } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSBadge } from "@/components/ds/Badge";

interface SiteContentPageProps {
  title: string;
  subtitle?: string;
  content: ReactNode;
  cta?: {
    label: string;
    href: string;
  };
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export default function SiteContentPage({
  title,
  subtitle,
  content,
  cta,
  breadcrumbs,
}: SiteContentPageProps) {
  return (
    <SiteLayout>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div
          style={{
            background: "var(--ds-color-bg-secondary)",
            borderBottom: "1px solid rgba(230, 81, 0, 0.1)",
          }}
        >
          <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "var(--ds-space-3) var(--ds-space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", fontSize: "var(--ds-text-sm)" }}>
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.href} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                  <Link
                    to={crumb.href}
                    style={{
                      color: idx === breadcrumbs.length - 1 ? "var(--ds-color-text-muted)" : "var(--ds-color-accent)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent-hover)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        idx === breadcrumbs.length - 1 ? "var(--ds-color-text-muted)" : "var(--ds-color-accent)")
                    }
                  >
                    {crumb.label}
                  </Link>
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight size={14} style={{ color: "var(--ds-color-text-muted)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-primary) 100%)",
          padding: "var(--ds-space-12) 0 var(--ds-space-16)",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "var(--ds-font-bold)",
              color: "var(--ds-color-text-primary)",
              marginBottom: "var(--ds-space-4)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: "var(--ds-text-xl)",
                color: "var(--ds-color-text-muted)",
                lineHeight: "var(--ds-leading-relaxed)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "var(--ds-space-16) 0", background: "var(--ds-color-bg-primary)" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div
            className="ds-content-prose"
            style={{
              color: "var(--ds-color-text-secondary)",
              lineHeight: "var(--ds-leading-relaxed)",
              fontSize: "var(--ds-text-base)",
            }}
          >
            {content}
          </div>

          {/* CTA */}
          {cta && (
            <div
              style={{
                marginTop: "var(--ds-space-12)",
                padding: "var(--ds-space-8)",
                background: "var(--ds-color-bg-secondary)",
                borderRadius: "var(--ds-radius-xl)",
                border: "1px solid rgba(230, 81, 0, 0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--ds-text-lg)",
                  color: "var(--ds-color-text-secondary)",
                  marginBottom: "var(--ds-space-4)",
                }}
              >
                Quer explorar mais? Baixe o app Oranje e tenha acesso a todas as experiências!
              </p>
              <Link to={cta.href} style={{ textDecoration: "none" }}>
                <DSButton variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                  {cta.label}
                </DSButton>
              </Link>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
