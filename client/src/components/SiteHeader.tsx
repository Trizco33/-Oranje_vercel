import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, MapPin, Calendar, BookOpen, Users, MessageCircle, Compass } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

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
  const isMobile = useIsMobile();
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
          zIndex: 100,
          background: "#00251A",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "border-color 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo — Fixed size via inline styles, NO Tailwind classes */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              position: "relative",
              zIndex: 110,
              flexShrink: 0,
            }}
            aria-label="Oranje - Página inicial"
          >
            <img
              src="/logo-white.png"
              alt="Oranje"
              style={{
                height: isMobile ? "32px" : "40px",
                width: "auto",
                objectFit: "contain",
                maxWidth: isMobile ? "120px" : "150px",
                display: "block",
              }}
            />
          </Link>

          {/* Desktop Navigation — Rendered only on desktop */}
          {!isMobile && (
            <nav
              aria-label="Navegação principal"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
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
                    transition: "color 0.2s ease, background 0.2s ease",
                    color: isActive(item.href) ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    background: isActive(item.href) ? "rgba(255,255,255,0.08)" : "transparent",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e: any) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop CTA — Only on desktop */}
          {!isMobile && (
            <Link
              to="/app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                height: "36px",
                padding: "0 18px",
                background: "#E65100",
                color: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 600,
                borderRadius: "10px",
                textDecoration: "none",
                transition: "background 0.2s ease",
                fontFamily: "'Montserrat', system-ui, sans-serif",
                flexShrink: 0,
              }}
              onMouseEnter={(e: any) => (e.currentTarget.style.background = "#FF6D00")}
              onMouseLeave={(e: any) => (e.currentTarget.style.background = "#E65100")}
            >
              Abrir o App
            </Link>
          )}

          {/* Mobile Menu Toggle — Only on mobile */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                position: "relative",
                zIndex: 110,
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                background: isMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: "#FFFFFF",
                transition: "background 0.2s ease",
              }}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu - Backdrop */}
      {isMobile && isMenuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            background: "rgba(0,0,0,0.4)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu - Slide Panel */}
      {isMobile && (
        <nav
          id="mobile-nav-panel"
          aria-label="Navegação mobile"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 105,
            width: "min(320px, 85vw)",
            background: "#00251A",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
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
              color: "rgba(255,255,255,0.35)",
            }}>
              Navegação
            </p>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, padding: "0.5rem 1rem" }}>
            {navItems.map((item) => {
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
                    marginBottom: "2px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.9375rem",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} style={{ color: active ? "#E65100" : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                height: "48px",
                background: "#E65100",
                color: "#FFFFFF",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: "12px",
                textDecoration: "none",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              Abrir o App
              <ArrowRight size={16} />
            </Link>
            <p style={{
              textAlign: "center",
              fontSize: "0.6875rem",
              color: "rgba(255,255,255,0.3)",
              marginTop: "0.75rem",
            }}>
              Guia cultural de Holambra
            </p>
          </div>
        </nav>
      )}
    </>
  );
}
