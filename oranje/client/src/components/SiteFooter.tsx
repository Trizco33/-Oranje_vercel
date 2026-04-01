import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SiteFooter() {
  const { data: contact } = trpc.content.getContact.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const email     = contact?.email     || "contato@oranje.com.br";
  const phone     = contact?.phone     || "(19) 3802-1000";
  const address   = contact?.address   || "Holambra, SP";
  const instagram = contact?.instagram || "https://instagram.com/oranjeholambra";

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
      }}
    >
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
          <div>
            <img
              src="/logo-white.png"
              alt="Oranje - Guia Cultural de Holambra"
              style={{ height: "32px", width: "auto", maxWidth: "130px", marginBottom: "16px", opacity: 0.9, objectFit: "contain" }}
              loading="lazy"
            />
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              maxWidth: "280px",
            }}>
              O guia definitivo de Holambra. Descubra os melhores lugares, eventos e experiências da cidade das flores.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Links de navegação do rodapé">
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
          <nav aria-label="Links legais">
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
          <div>
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
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href={`mailto:${email}`}
                  style={linkStyle}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  {email}
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} aria-hidden="true" />
                <a
                  href={`tel:${phone.replace(/\D/g, "")}`}
                  style={linkStyle}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#E65100")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  {phone}
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <MapPin size={14} style={{ color: "rgba(255,255,255,0.3)", marginTop: "2px", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>{address}</span>
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
          <div style={{ display: "flex", gap: "16px" }} aria-label="Redes sociais">
            <a
              href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir Oranje no Instagram"
              style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.2s ease" }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#E65100")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
