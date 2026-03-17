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
    <header className="oranje-header" style={{
      background: "rgba(15, 27, 20, 0.72)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(242, 140, 40, 0.12)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)"
    }}>
      <div className="flex items-center justify-between px-4 py-3 relative">
        {/* Left */}
        <div className="flex items-center gap-3 relative" style={{ zIndex: 10000 }}>
          {showBack ? (
            <button
              onClick={onBack ?? (() => navigate(-1))}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ 
                background: "rgba(242,140,40,0.15)",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.15)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F28C28" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          ) : (
            /* Brand Wordmark - Animado */
            <Link 
              to="/" 
              className="brand-wordmark"
              style={{
                animation: "brandWordmarkFadeIn 550ms ease-out forwards",
                display: "flex",
                alignItems: "center",
                transition: "transform 200ms ease-out"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img 
                src="/brand/oranje-wordmark.png" 
                alt="Oranje" 
                style={{ 
                  height: "clamp(40px, 10vw, 48px)",
                  width: "auto",
                  opacity: 1,
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
                  flexShrink: 0,
                  animation: "brandWordmarkFadeIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                }} 
              />
            </Link>
          )}
          {title && (
            <h1 className="text-base font-semibold" style={{ color: "#EAEAEA", fontFamily: "'Montserrat', sans-serif" }}>
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 relative z-10">
          <MobileMenu />
          {!hideThemeToggle && <ThemeToggle />}
          {showSearch && (
            <Link to="/app/busca">
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all" 
                style={{ background: "rgba(242,140,40,0.08)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.08)"}
              >
                <Search size={18} style={{ color: "#F28C28" }} />
              </button>
            </Link>
          )}

          {user && (
            <Link to="/app/notificacoes">
              <button className="w-10 h-10 rounded-full flex items-center justify-center relative transition-all" 
                style={{ background: "rgba(242,140,40,0.08)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.08)"}
              >
                <Bell size={18} style={{ color: "#F28C28" }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "#F28C28", color: "#0F1B14" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/app/admin">
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all" 
                style={{ background: "rgba(242,140,40,0.08)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.08)"}
              >
                <Settings size={18} style={{ color: "#F28C28" }} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes brandWordmarkFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .brand-wordmark {
            animation: none !important;
            opacity: 1;
            transform: scale(1) translateY(0) !important;
          }
        }
      `}</style>
    </header>
  );
}
