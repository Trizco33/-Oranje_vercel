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
      className="tab-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(0, 37, 26, 0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid var(--ds-color-border-default)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-around px-1" style={{ paddingTop: 8, paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/app"
              ? pathname === "/app" || pathname === "/app/"
              : pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link key={tab.path} to={tab.path} className="flex-1">
              <button
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-300 w-full"
                style={{
                  minHeight: 48,
                  background: isActive
                    ? "var(--ds-color-accent-muted)"
                    : "transparent",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <div
                  className="flex items-center justify-center transition-all duration-300"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isActive ? "var(--ds-color-accent)" : "transparent",
                  }}
                >
                  <Icon
                    size={isActive ? 18 : 20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{
                      color: isActive
                        ? "var(--ds-color-text-inverse)"
                        : "var(--ds-color-text-muted)",
                      transition: "color 0.3s ease",
                    }}
                  />
                </div>
                <span
                  className="font-medium tracking-wide transition-all duration-300"
                  style={{
                    fontSize: 10,
                    color: isActive
                      ? "var(--ds-color-accent)"
                      : "var(--ds-color-text-muted)",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
