import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X, Menu, Compass, Calendar, Heart, MapPin, Search,
  Sparkles, Settings, Map, Navigation,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => { close(); }, [location.pathname, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => location.pathname.startsWith(href);

  const discoverItems = useMemo(() => [
    { label: "Explorar", href: "/app/explorar", icon: Compass, desc: "Categorias e lugares" },
    { label: "Mapa", href: "/app/mapa", icon: Navigation, desc: "Perto de você" },
    { label: "Buscar", href: "/app/busca", icon: Search, desc: "Encontre qualquer lugar" },
  ], []);

  const planItems = useMemo(() => [
    { label: "Roteiros", href: "/app/roteiros", icon: Map, desc: "Passeios planejados" },
    { label: "Eventos", href: "/app/eventos", icon: Calendar, desc: "Agenda de Holambra" },
    { label: "Favoritos", href: "/app/favoritos", icon: Heart, desc: "Seus lugares salvos" },
  ], []);

  const adminItems = useMemo(() => {
    if (user?.role !== "admin") return [];
    return [{ label: "Admin do App", href: "/app/adm", icon: Settings, desc: "Configurações" }];
  }, [user?.role]);

  function NavGroup({ title, items }: { title: string; items: { label: string; href: string; icon: any; desc?: string }[] }) {
    return (
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(230,81,0,0.5)",
            padding: "0 var(--ds-space-4)",
            marginBottom: "var(--ds-space-1)",
          }}
        >
          {title}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => {
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
                  padding: "10px var(--ds-space-4)",
                  borderRadius: "var(--ds-radius-lg)",
                  textDecoration: "none",
                  background: active ? "var(--ds-color-accent)" : "transparent",
                  transition: "background 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(230,81,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: active ? "rgba(255,255,255,0.2)" : "rgba(230,81,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon
                    size={16}
                    style={{ color: active ? "#fff" : "var(--ds-color-accent)" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "var(--ds-color-text-primary)",
                      fontFamily: "var(--ds-font-display)",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </p>
                  {item.desc && (
                    <p
                      style={{
                        fontSize: 11,
                        color: active ? "rgba(255,255,255,0.7)" : "var(--ds-color-text-muted)",
                        lineHeight: 1.2,
                        marginTop: 1,
                      }}
                    >
                      {item.desc}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 12,
          background: isOpen ? "rgba(230, 81, 0, 0.2)" : "rgba(230, 81, 0, 0.1)",
          border: "1px solid rgba(230, 81, 0, 0.15)",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
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
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
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
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            zIndex: 50,
            width: "min(300px, 84vw)",
            background: "var(--ds-color-bg-secondary)",
            borderLeft: "1px solid rgba(230, 81, 0, 0.1)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
            animation: "oranje-slide-in 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "var(--ds-color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={16} style={{ color: "#fff" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--ds-color-text-primary)", fontFamily: "var(--ds-font-display)", lineHeight: 1.1 }}>
                  Oranje
                </p>
                {user?.name && (
                  <p style={{ fontSize: 11, color: "var(--ds-color-text-muted)", lineHeight: 1.1 }}>
                    Olá, {user.name.split(" ")[0]}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={close}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(230, 81, 0, 0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Fechar menu"
            >
              <X size={16} style={{ color: "var(--ds-color-accent)" }} />
            </button>
          </div>

          {/* Nav Content */}
          <nav
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "var(--ds-space-3) var(--ds-space-2)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--ds-space-4)",
            }}
          >
            <NavGroup title="Descobrir" items={discoverItems} />
            <div style={{ height: 1, background: "rgba(230,81,0,0.07)", margin: "0 var(--ds-space-4)" }} />
            <NavGroup title="Planejar" items={planItems} />
            {adminItems.length > 0 && (
              <>
                <div style={{ height: 1, background: "rgba(230,81,0,0.07)", margin: "0 var(--ds-space-4)" }} />
                <NavGroup title="Administração" items={adminItems} />
              </>
            )}
          </nav>

          {/* Footer */}
          <div
            style={{
              flexShrink: 0,
              padding: "var(--ds-space-3) var(--ds-space-4)",
              borderTop: "1px solid rgba(230, 81, 0, 0.08)",
            }}
          >
            <div
              style={{
                padding: "var(--ds-space-3)",
                borderRadius: "var(--ds-radius-lg)",
                background: "rgba(230, 81, 0, 0.05)",
                border: "1px solid rgba(230, 81, 0, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <MapPin size={12} style={{ color: "var(--ds-color-accent)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-color-text-primary)" }}>
                  Holambra, SP
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--ds-color-text-muted)", lineHeight: 1.4 }}>
                Holambra em um só lugar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
