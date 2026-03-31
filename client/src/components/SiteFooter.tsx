import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function SiteFooter() {
  const linkStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    transition: "color 0.2s ease",
    lineHeight: 1.8,
  };

  return (
    <footer
      role="contentinfo"
      style={{
        background: "#00251A",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 20%, rgba(230,81,0,0.12) 0%, transparent 34%), radial-gradient(circle at 78% 30%, rgba(245,245,220,0.08) 0%, transparent 28%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px 32px" }}>
        {/* Top Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <img
              src="/logo-white.png"
              alt="Oranje - Guia Cultural de Holambra"
              style={{ height: "34px", width: "auto", maxWidth: "136px", marginBottom: "18px", opacity: 0.95, objectFit: "contain" }}
              loading="lazy"
            />
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 12px",
                marginBottom: "16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(245,245,220,0.66)",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Curadoria editorial
            </p>
            <p style={{
              fontSize: "0.92rem",
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.8,
              maxWidth: "320px",
            }}>
              Turismo, gastronomia e experiências com direção visual e curadoria local para quem quer viver Holambra com profundidade.
            </p>
            <Link
              to="/seja-um-parceiro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "20px",
                textDecoration: "none",
                color: "#F5F5DC",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              Seja parceiro <ArrowRight size={14} style={{ color: "#E65100" }} />
            </Link>
          </div>

          {/* Navigation */}
          <nav aria-label="Links de navegação do rodapé" style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              marginBottom: "16px",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Navegação
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Início", to: "/" },
                { label: "O que fazer", to: "/o-que-fazer-em-holambra" },
                { label: "Roteiros", to: "/roteiros" },
                { label: "Blog", to: "/blog" },
                { label: "Parceiros", to: "/parceiros" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={linkStyle}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Links legais" style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              marginBottom: "16px",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Política de Privacidade", to: "/privacidade" },
                { label: "Termos de Serviço", to: "/termos" },
                { label: "Abrir App", to: "/app" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={linkStyle}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              marginBottom: "16px",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Contato
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href="mailto:contato@oranje.com.br"
                  style={linkStyle}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  contato@oranje.com.br
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href="tel:+551938021000"
                  style={linkStyle}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  (19) 3802-1000
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <MapPin size={14} style={{ color: "rgba(255,255,255,0.3)", marginTop: "2px", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>Holambra, SP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
            &copy; 2026 Oranje. Todos os direitos reservados.
          </p>
          <div style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1 }} aria-label="Redes sociais">
            <a
              href="https://www.instagram.com/oranjeholambra"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir Oranje no Instagram"
              style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.2s ease" }}
              onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
              onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
