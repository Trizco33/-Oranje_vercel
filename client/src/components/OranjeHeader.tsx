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
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(0, 37, 26, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid var(--ds-color-border-default)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack ?? (() => navigate(-1))}
              aria-label="Voltar para página anterior"
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--ds-radius-full)",
                background: "var(--ds-color-accent-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-color-accent-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ds-color-accent-muted)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          ) : (
            <Link
              to="/"
              aria-label="Oranje - Página inicial"
              className="flex items-center transition-transform duration-200 hover:scale-[1.02]"
            >
              <img
                src="/brand/oranje-wordmark.png"
                alt="Oranje"
                style={{
                  height: "clamp(36px, 9vw, 44px)",
                  width: "auto",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                }}
              />
            </Link>
          )}
          {title && (
            <h1
              className="text-base font-semibold"
              style={{
                color: "var(--ds-color-text-primary)",
                fontFamily: "var(--ds-font-display)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <nav className="flex items-center gap-1.5" aria-label="Ações do app">
          <MobileMenu />
          {!hideThemeToggle && <ThemeToggle />}
          {showSearch && (
            <Link to="/app/busca" aria-label="Buscar">
              <button
                className="flex items-center justify-center transition-all duration-200"
                aria-label="Abrir busca"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--ds-radius-full)",
                  background: "var(--ds-color-bg-surface)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface)")}
              >
                <Search size={18} style={{ color: "var(--ds-color-accent)" }} aria-hidden="true" />
              </button>
            </Link>
          )}

          {user && (
            <Link to="/app/notificacoes" aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}>
              <button
                className="flex items-center justify-center relative transition-all duration-200"
                aria-label={`Notificações${unreadCount > 0 ? ` - ${unreadCount} não lidas` : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--ds-radius-full)",
                  background: "var(--ds-color-bg-surface)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface)")}
              >
                <Bell size={18} style={{ color: "var(--ds-color-accent)" }} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute flex items-center justify-center font-bold"
                    aria-hidden="true"
                    style={{
                      top: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: "var(--ds-radius-full)",
                      background: "var(--ds-color-accent)",
                      color: "var(--ds-color-text-inverse)",
                      fontSize: 9,
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
                className="flex items-center justify-center transition-all duration-200"
                aria-label="Configurações de administrador"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--ds-radius-full)",
                  background: "var(--ds-color-bg-surface)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ds-color-bg-surface)")}
              >
                <Settings size={18} style={{ color: "var(--ds-color-accent)" }} aria-hidden="true" />
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
