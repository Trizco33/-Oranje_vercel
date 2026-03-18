import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { DSButton } from "@/components/ds/Button";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Início", href: "/" },
    { label: "O que fazer", href: "/o-que-fazer-em-holambra" },
    { label: "Roteiros", href: "/roteiros" },
    { label: "Mapa", href: "/mapa" },
    { label: "Blog", href: "/blog" },
    { label: "Parceiros", href: "/parceiros" },
    { label: "Contato", href: "/contato" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(0, 37, 26, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(230, 81, 0, 0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
          aria-label="Oranje - Página inicial"
        >
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img src="/logo.png" alt="Oranje" style={{ height: "40px", width: "auto" }} />
          </picture>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navegação principal"
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          className="hidden md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--ds-radius-md)",
                fontSize: "var(--ds-text-sm)",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s ease",
                color: isActive(item.href)
                  ? "var(--ds-color-accent)"
                  : "var(--ds-color-text-muted)",
                background: isActive(item.href)
                  ? "rgba(230, 81, 0, 0.1)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = "var(--ds-color-accent)";
                  e.currentTarget.style.background = "rgba(230, 81, 0, 0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = "var(--ds-color-text-muted)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Link
            to="/app"
            style={{ textDecoration: "none" }}
          >
            <DSButton variant="primary" size="sm">
              Abrir o App
            </DSButton>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
          style={{
            padding: "0.5rem",
            borderRadius: "var(--ds-radius-md)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--ds-color-text-primary)",
            transition: "background 0.2s",
          }}
          aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden"
          style={{
            borderTop: "1px solid rgba(230, 81, 0, 0.1)",
            background: "rgba(0, 37, 26, 0.98)",
            backdropFilter: "blur(16px)",
            animation: "ds-fade-in 0.2s ease-out",
          }}
        >
          <nav aria-label="Navegação mobile" style={{ display: "flex", flexDirection: "column", padding: "1rem", gap: "0.25rem" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--ds-radius-md)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  color: isActive(item.href) ? "#FFFFFF" : "var(--ds-color-text-muted)",
                  background: isActive(item.href) ? "var(--ds-color-accent)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <Link
                to="/app"
                style={{ textDecoration: "none" }}
                onClick={() => setIsMenuOpen(false)}
              >
                <DSButton variant="primary" size="md" fullWidth>
                  Abrir o App
                </DSButton>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
