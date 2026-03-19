import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, MapPin, Calendar, BookOpen, Users, MessageCircle, Compass } from "lucide-react";

const navItems = [
  { label: "Início", href: "/", icon: Compass },
  { label: "O que fazer", href: "/o-que-fazer-em-holambra", icon: MapPin },
  { label: "Roteiros", href: "/roteiros", icon: Calendar },
  { label: "Mapa", href: "/mapa", icon: MapPin },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Parceiros", href: "/parceiros", icon: Users },
  { label: "Contato", href: "/contato", icon: MessageCircle },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location?.pathname === href;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <header
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(0, 37, 26, 0.95)" : "#00251A",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.15)" : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: scrolled ? "60px" : "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              position: "relative",
              zIndex: 60,
            }}
            aria-label="Oranje - Página inicial"
          >
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Oranje" style={{ height: "36px", width: "auto" }} />
            </picture>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navegação principal"
            style={{ display: "flex", alignItems: "center", gap: "2px" }}
            className="hidden md:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: isActive(item.href) ? 600 : 500,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  color: isActive(item.href) ? "#E65100" : "rgba(255,255,255,0.8)",
                  background: isActive(item.href) ? "rgba(230, 81, 0, 0.12)" : "transparent",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e: any) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e: any) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              to="/app"
              className="site-cta site-cta-sm"
              style={{ textDecoration: "none" }}
            >
              Abrir o App
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            style={{
              position: "relative",
              zIndex: 60,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: isMenuOpen ? "rgba(230,81,0,0.15)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: isMenuOpen ? "#E65100" : "#FFFFFF",
              transition: "all 0.3s ease",
            }}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu - Backdrop */}
      <div
        onClick={closeMenu}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        aria-hidden="true"
      />

      {/* Mobile Menu - Slide Panel */}
      <nav
        id="mobile-nav-panel"
        aria-label="Navegação mobile"
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 55,
          width: "min(320px, 85vw)",
          background: "#00251A",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Panel Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          paddingTop: "5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.4)",
            marginBottom: "0.25rem",
          }}>
            Navegação
          </p>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, padding: "0.5rem 1rem" }}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  padding: "0.875rem 1rem",
                  marginBottom: "0.25rem",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: active ? 600 : 500,
                  fontSize: "0.9375rem",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                  background: active ? "rgba(230,81,0,0.15)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={18} style={{ color: active ? "#E65100" : "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ArrowRight size={14} style={{ color: "#E65100", opacity: 0.7 }} />}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <Link
            to="/app"
            onClick={closeMenu}
            className="site-cta site-cta-md"
            style={{
              width: "100%",
              textDecoration: "none",
            }}
          >
            Abrir o App
            <ArrowRight size={16} />
          </Link>
          <p style={{
            textAlign: "center",
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.35)",
            marginTop: "0.75rem",
          }}>
            Guia cultural de Holambra
          </p>
        </div>
      </nav>
    </>
  );
}
