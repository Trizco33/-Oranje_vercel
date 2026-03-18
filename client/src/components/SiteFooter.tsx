import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: "linear-gradient(180deg, #001A12 0%, #00120C 100%)",
        borderTop: "1px solid rgba(230, 81, 0, 0.08)",
      }}
    >
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "3.5rem 1.5rem 2rem" }}>
        {/* Top Section - Brand + Nav */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div>
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="Oranje - Guia Cultural de Holambra"
                style={{ height: "32px", width: "auto", marginBottom: "1rem", opacity: 0.9 }}
                loading="lazy"
              />
            </picture>
            <p style={{
              fontSize: "0.8125rem",
              color: "rgba(232,230,227,0.5)",
              lineHeight: 1.7,
              maxWidth: "280px",
            }}>
              O guia definitivo de Holambra. Descubra os melhores lugares, eventos e experi\u00eancias da cidade das flores.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Links de navega\u00e7\u00e3o do rodap\u00e9">
            <h4 style={{
              fontWeight: 600,
              color: "rgba(232,230,227,0.4)",
              marginBottom: "1rem",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Navega\u00e7\u00e3o
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "In\u00edcio", to: "/" },
                { label: "O que fazer", to: "/o-que-fazer-em-holambra" },
                { label: "Roteiros", to: "/roteiros" },
                { label: "Blog", to: "/blog" },
                { label: "Parceiros", to: "/parceiros" },
              ].map((item: any) => (
                <li key={item?.to}>
                  <Link
                    to={item?.to}
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(232,230,227,0.55)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(232,230,227,0.55)")}
                  >
                    {item?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Links legais">
            <h4 style={{
              fontWeight: 600,
              color: "rgba(232,230,227,0.4)",
              marginBottom: "1rem",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Pol\u00edtica de Privacidade", to: "/privacidade" },
                { label: "Termos de Servi\u00e7o", to: "/termos" },
                { label: "Abrir App", to: "/app" },
              ].map((item: any) => (
                <li key={item?.to}>
                  <Link
                    to={item?.to}
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(232,230,227,0.55)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(232,230,227,0.55)")}
                  >
                    {item?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: "rgba(232,230,227,0.4)",
              marginBottom: "1rem",
              fontSize: "0.6875rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}>
              Contato
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <Mail size={14} style={{ color: "rgba(230,81,0,0.6)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href="mailto:contato@oranje.com.br"
                  style={{ fontSize: "0.8125rem", color: "rgba(232,230,227,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(232,230,227,0.55)")}
                >
                  contato@oranje.com.br
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <Phone size={14} style={{ color: "rgba(230,81,0,0.6)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href="tel:+551940000000"
                  style={{ fontSize: "0.8125rem", color: "rgba(232,230,227,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(232,230,227,0.55)")}
                >
                  (19) 4000-0000
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <MapPin size={14} style={{ color: "rgba(230,81,0,0.6)", marginTop: "2px", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: "0.8125rem", color: "rgba(232,230,227,0.55)" }}>Holambra, SP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(230, 81, 0, 0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "rgba(232,230,227,0.3)" }}>
            &copy; 2026 Oranje. Todos os direitos reservados.
          </p>
          <div style={{ display: "flex", gap: "1rem" }} aria-label="Redes sociais">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir Oranje no Instagram"
              style={{ color: "rgba(232,230,227,0.35)", transition: "color 0.2s" }}
              onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
              onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(232,230,227,0.35)")}
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
