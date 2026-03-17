import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer style={{ background: "var(--ds-color-bg-secondary, #004D40)" }}>
      {/* Main Footer */}
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "var(--ds-space-16) var(--ds-space-4)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--ds-space-8)",
            marginBottom: "var(--ds-space-8)",
          }}
        >
          {/* Brand */}
          <div>
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Oranje" style={{ height: "36px", width: "auto", marginBottom: "var(--ds-space-4)" }} />
            </picture>
            <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", lineHeight: "var(--ds-leading-relaxed)" }}>
              Seu guia definitivo de Holambra. Descubra os melhores lugares, eventos e experiências.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-4)",
                fontSize: "var(--ds-text-sm)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Navegação
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
              {[
                { label: "Início", to: "/" },
                { label: "Roteiros", to: "/roteiros" },
                { label: "Blog", to: "/blog" },
                { label: "Parceiros", to: "/parceiros" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      fontSize: "var(--ds-text-sm)",
                      color: "var(--ds-color-text-muted)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-color-text-muted)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              style={{
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-4)",
                fontSize: "var(--ds-text-sm)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
              {[
                { label: "Política de Privacidade", to: "/privacidade" },
                { label: "Termos de Serviço", to: "/termos" },
                { label: "Abrir App", to: "/app" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      fontSize: "var(--ds-text-sm)",
                      color: "var(--ds-color-text-muted)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-color-text-muted)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-4)",
                fontSize: "var(--ds-text-sm)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Contato
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <Mail size={16} style={{ color: "var(--ds-color-accent)" }} />
                <a
                  href="mailto:contato@oranje.com.br"
                  style={{
                    fontSize: "var(--ds-text-sm)",
                    color: "var(--ds-color-text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-color-text-muted)")}
                >
                  contato@oranje.com.br
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <Phone size={16} style={{ color: "var(--ds-color-accent)" }} />
                <a
                  href="tel:+551940000000"
                  style={{
                    fontSize: "var(--ds-text-sm)",
                    color: "var(--ds-color-text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-color-text-muted)")}
                >
                  (19) 4000-0000
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--ds-space-2)" }}>
                <MapPin size={16} style={{ color: "var(--ds-color-accent)", marginTop: "2px" }} />
                <span style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>Holambra, SP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div
          style={{
            borderTop: "1px solid rgba(230, 81, 0, 0.1)",
            paddingTop: "var(--ds-space-8)",
            marginBottom: "var(--ds-space-8)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--ds-space-6)" }}>
            {[
              { icon: <Facebook size={20} />, href: "https://facebook.com", label: "Facebook" },
              { icon: <Instagram size={20} />, href: "https://instagram.com", label: "Instagram" },
              { icon: <Twitter size={20} />, href: "https://twitter.com", label: "Twitter" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                style={{
                  color: "var(--ds-color-text-muted)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-color-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-color-text-muted)")}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: "1px solid rgba(230, 81, 0, 0.1)",
            paddingTop: "var(--ds-space-8)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
            &copy; 2026 Oranje. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
