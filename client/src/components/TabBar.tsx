import { CalendarDays, Compass, Heart, Home, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { path: "/app", icon: Home, label: "Home" },
  { path: "/app/explorar", icon: Compass, label: "Explorar" },
  { path: "/app/eventos", icon: CalendarDays, label: "Eventos" },
  { path: "/app/favoritos", icon: Heart, label: "Favoritos" },
  { path: "/app/roteiros", icon: Map, label: "Roteiros" },
];

export function TabBar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      aria-label="Navegação principal do app"
      role="navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(0, 37, 26, 0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(245, 245, 220, 0.08)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div
        role="tablist"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 4px",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/app"
              ? pathname === "/app" || pathname === "/app/"
              : pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{ flex: 1, textDecoration: "none" }}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 0",
                  borderRadius: 12,
                  minHeight: 48,
                  justifyContent: "center",
                  background: isActive ? "rgba(230, 81, 0, 0.18)" : "transparent",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isActive ? "#E65100" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Icon
                    size={isActive ? 18 : 20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                    style={{
                      color: isActive ? "#FFFFFF" : "rgba(245, 245, 220, 0.55)",
                      transition: "color 0.3s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#E65100" : "rgba(245, 245, 220, 0.55)",
                    letterSpacing: "0.04em",
                    transition: "all 0.3s ease",
                  }}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
