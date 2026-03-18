import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu, Compass, Calendar, Heart, Map, Search, Sparkles } from "lucide-react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Explorar", href: "/app/explorar", icon: Compass },
    { label: "Buscar", href: "/app/buscar", icon: Search },
    { label: "Eventos", href: "/app/eventos", icon: Calendar },
    { label: "Favoritos", href: "/app/favoritos", icon: Heart },
    { label: "Roteiros", href: "/app/roteiros", icon: Map },
  ];

  const close = useCallback(() => setIsOpen(false), []);

  // Close on route change
  useEffect(() => { close(); }, [location.pathname, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
        style={{
          background: isOpen ? "rgba(230, 81, 0, 0.2)" : "rgba(230, 81, 0, 0.1)",
          border: "1px solid rgba(230, 81, 0, 0.15)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(230, 81, 0, 0.25)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = isOpen ? "rgba(230, 81, 0, 0.2)" : "rgba(230, 81, 0, 0.1)")}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X width={20} height={20} style={{ color: "var(--ds-color-accent)" }} />
        ) : (
          <Menu width={20} height={20} style={{ color: "var(--ds-color-accent)" }} />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={close}
          style={{
            background: "rgba(0, 25, 18, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "ds-fade-in 200ms ease-out forwards",
          }}
        />
      )}

      {/* Slide-out Panel */}
      {isOpen && (
        <div
          className="fixed top-0 right-0 h-screen z-50 md:hidden"
          style={{
            width: "min(280px, 80vw)",
            background: "var(--ds-color-bg-secondary)",
            borderLeft: "1px solid rgba(230, 81, 0, 0.1)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
            animation: "oranje-slide-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <style>{`
            @keyframes oranje-slide-in {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              padding: "var(--ds-space-4)",
              borderBottom: "1px solid rgba(230, 81, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              <Sparkles size={18} style={{ color: "var(--ds-color-accent)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "var(--ds-text-lg)",
                  color: "var(--ds-color-accent)",
                  fontFamily: "var(--ds-font-display)",
                }}
              >
                Oranje
              </span>
            </div>
            <button
              onClick={close}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--ds-radius-lg)",
                background: "rgba(230, 81, 0, 0.1)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(230, 81, 0, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(230, 81, 0, 0.1)")}
              aria-label="Fechar menu"
            >
              <X width={20} height={20} style={{ color: "var(--ds-color-accent)" }} />
            </button>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: "var(--ds-space-4)", display: "flex", flexDirection: "column", gap: "var(--ds-space-1)" }}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={close}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--ds-space-3)",
                    padding: "var(--ds-space-3) var(--ds-space-4)",
                    borderRadius: "var(--ds-radius-lg)",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 500,
                    fontSize: "var(--ds-text-base)",
                    color: active ? "#FFFFFF" : "var(--ds-color-text-secondary)",
                    background: active ? "var(--ds-color-accent)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(230, 81, 0, 0.1)";
                      e.currentTarget.style.color = "var(--ds-color-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--ds-color-text-secondary)";
                    }
                  }}
                >
                  <item.icon size={20} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "var(--ds-space-4)",
              borderTop: "1px solid rgba(230, 81, 0, 0.1)",
            }}
          >
            <div
              style={{
                padding: "var(--ds-space-4)",
                borderRadius: "var(--ds-radius-lg)",
                background: "rgba(230, 81, 0, 0.06)",
                border: "1px solid rgba(230, 81, 0, 0.1)",
              }}
            >
              <p style={{ fontSize: "var(--ds-text-xs)", color: "var(--ds-color-text-muted)", lineHeight: "1.5" }}>
                <strong style={{ color: "var(--ds-color-accent)" }}>Oranje</strong> — Guia Cultural de Holambra
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
