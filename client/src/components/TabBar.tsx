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
    <nav className="tab-bar">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/app"
              ? pathname === "/app" || pathname === "/app/"
              : pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link key={tab.path} to={tab.path} className="flex-1">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]"
                style={{
                  background: isActive ? "rgba(216,138,61,0.12)" : "transparent",
                }}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#D88A3D" : "#6B7A8D" }}
                />
                <span
                  className="text-[10px] font-medium tracking-wide"
                  style={{ color: isActive ? "#D88A3D" : "#6B7A8D" }}
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
