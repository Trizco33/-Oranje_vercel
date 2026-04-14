import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, MapPin, Calendar, BookOpen, Users, MessageCircle, Compass, Utensils, Coffee, Beer, Camera, PartyPopper, Map, Navigation, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";

const DESCUBRA_ITEMS = [
  { label: "O que fazer em Holambra", href: "/o-que-fazer-em-holambra", icon: Compass },
  { label: "Roteiro de 1 dia",        href: "/roteiro-1-dia-em-holambra", icon: Map },
  { label: "Holambra bate e volta",   href: "/holambra-bate-e-volta",    icon: Navigation },
  { label: "Restaurantes",            href: "/melhores-restaurantes-de-holambra", icon: Utensils },
  { label: "Cafés",                   href: "/melhores-cafes-de-holambra", icon: Coffee },
  { label: "Bares & Drinks",          href: "/bares-e-drinks-em-holambra", icon: Beer },
  { label: "Onde Tirar Fotos",         href: "/onde-tirar-fotos-em-holambra", icon: Camera },
  { label: "Eventos",                 href: "/eventos-em-holambra",        icon: PartyPopper },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Compass, MapPin, Calendar, BookOpen, Users, MessageCircle,
};

const DEFAULT_NAV_ITEMS = [
  { label: "Início",           href: "/",              icon: "Compass",       visible: true, order: 0 },
  { label: "Receptivo Oranje", href: "/app/receptivo", icon: "MapPin",        visible: true, order: 1 },
  { label: "Mapa",             href: "/mapa",          icon: "MapPin",        visible: true, order: 2 },
  { label: "Blog",             href: "/blog",          icon: "BookOpen",      visible: true, order: 3 },
  { label: "Contato",          href: "/contato",       icon: "MessageCircle", visible: true, order: 4 },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [guiaOpen, setGuiaOpen] = useState(false);
  const guiaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const { data: cmsNavItems } = trpc.content.getNavItems.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
  const navItems = ((cmsNavItems ?? DEFAULT_NAV_ITEMS) as typeof DEFAULT_NAV_ITEMS)
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const isActive = (href: string) => location?.pathname === href;
  const isDescubraActive = DESCUBRA_ITEMS.some((i) => location?.pathname === i.href);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => { setIsMenuOpen(false); setGuiaOpen(false); }, [location?.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (guiaRef.current && !guiaRef.current.contains(e.target as Node)) {
        setGuiaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "0.8125rem",
    fontWeight: active ? 600 : 500,
    textDecoration: "none",
    transition: "color 0.2s ease, background 0.2s ease",
    color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
    background: active ? "rgba(255,255,255,0.08)" : "transparent",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap" as const,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  });

  return (
    <>
      <header
        role="banner"
        className={`header-transition${scrolled ? " header-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#00251A",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
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
          {/* Logo */}
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

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav
              aria-label="Navegação principal"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    style={navLinkStyle(active)}
                    onMouseEnter={(e: any) => {
                      if (!active) {
                        e.currentTarget.style.color = "#FFFFFF";
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      }
                    }}
                    onMouseLeave={(e: any) => {
                      if (!active) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Descubra dropdown */}
              <div ref={guiaRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setGuiaOpen((v) => !v)}
                  style={{
                    ...navLinkStyle(isDescubraActive),
                    background: guiaOpen || isDescubraActive ? "rgba(255,255,255,0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                  }}
                >
                  Descubra
                  <ChevronDown
                    size={13}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: guiaOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {guiaOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#00251A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      padding: "8px",
                      minWidth: "240px",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                      zIndex: 200,
                    }}
                  >
                    {DESCUBRA_ITEMS.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "9px",
                            textDecoration: "none",
                            color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                            background: active ? "rgba(255,255,255,0.08)" : "transparent",
                            fontSize: "0.8125rem",
                            fontWeight: active ? 600 : 400,
                            transition: "all 0.15s ease",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e: any) => {
                            if (!active) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                              e.currentTarget.style.color = "#FFFFFF";
                            }
                          }}
                          onMouseLeave={(e: any) => {
                            if (!active) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                            }
                          }}
                        >
                          <Icon size={14} style={{ color: active ? "#E65100" : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Desktop CTA */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
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
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "#FF6D00")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "#E65100")}
              >
                Abrir o App
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
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
          aria-hidden={!isMenuOpen}
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
            display: isMenuOpen ? "flex" : "none",
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
          <div style={{ padding: "0.5rem 1rem" }}>
            {navItems.map((item) => {
              const Icon = (typeof item.icon === "string" ? ICON_MAP[item.icon] : item.icon) ?? Compass;
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

          {/* Descubra Holambra */}
          <div style={{ padding: "0 1rem 0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "0.5rem" }}>
            <p style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.35)",
              padding: "1rem 1rem 0.5rem",
            }}>
              Descubra Holambra
            </p>
            {DESCUBRA_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 1rem",
                    marginBottom: "1px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.875rem",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={15} style={{ color: active ? "#E65100" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
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
              Holambra em um só lugar
            </p>
          </div>
        </nav>
      )}
    </>
  );
}
