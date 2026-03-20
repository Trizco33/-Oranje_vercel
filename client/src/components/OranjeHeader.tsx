import { Bell, Search, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

interface OranjeHeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  hideIcons?: boolean;
  hideThemeToggle?: boolean;
}

export function OranjeHeader({ title, showSearch = false, showBack = false, onBack, hideIcons = false, hideThemeToggle = false }: OranjeHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
    throwOnError: false,
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const iconBtnStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 9999,
    background: "rgba(13, 74, 64, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(0, 37, 26, 0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(245, 245, 220, 0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {showBack ? (
            <button
              onClick={onBack ?? (() => navigate(-1))}
              aria-label="Voltar para página anterior"
              style={{
                ...iconBtnStyle,
                background: "rgba(230, 81, 0, 0.18)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          ) : (
            <Link
              to="/"
              aria-label="Oranje - Página inicial"
              style={{ display: "flex", alignItems: "center" }}
            >
              <img
                src="/logo-white.png"
                alt="Oranje"
                style={{
                  height: "32px",
                  width: "auto",
                  maxWidth: "120px",
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                }}
              />
            </Link>
          )}
          {title && (
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#FFFFFF",
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }} aria-label="Ações do app">
          <MobileMenu />
          {!hideThemeToggle && <ThemeToggle />}
          {showSearch && (
            <Link to="/app/busca" aria-label="Buscar">
              <button
                aria-label="Abrir busca"
                style={iconBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.35)")}
              >
                <Search size={18} style={{ color: "#E65100" }} aria-hidden="true" />
              </button>
            </Link>
          )}

          {user && (
            <Link to="/app/notificacoes" aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}>
              <button
                aria-label={`Notificações${unreadCount > 0 ? ` - ${unreadCount} não lidas` : ''}`}
                style={{ ...iconBtnStyle, position: "relative" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.35)")}
              >
                <Bell size={18} style={{ color: "#E65100" }} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: 9999,
                      background: "#E65100",
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/app/admin" aria-label="Painel de administração">
              <button
                aria-label="Configurações de administrador"
                style={iconBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(13, 74, 64, 0.35)")}
              >
                <Settings size={18} style={{ color: "#E65100" }} aria-hidden="true" />
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
