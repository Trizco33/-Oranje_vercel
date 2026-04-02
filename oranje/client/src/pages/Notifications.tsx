import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { useNotificationsList } from "@/hooks/useMockData";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, BellOff, CalendarDays, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications, isLoading, markRead } = useNotificationsList(!!user);
  const { state: pushState, subscribe, unsubscribe } = usePushNotifications();

  function handleMarkRead(id: number) {
    markRead(id);
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader title="Notificações" showBack onBack={() => navigate("/")} />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <Bell size={40} style={{ color: "var(--ds-color-accent)" }} className="mb-4" />
          <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Faça login para ver suas notificações.</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Notificações" showBack onBack={() => navigate("/")} />

      <div className="px-4 pt-4">

        {/* Push notification opt-in card */}
        {pushState !== "unsupported" && (
          <div
            className="rounded-2xl p-4 mb-4 flex items-center gap-3"
            style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: pushState === "subscribed" ? "rgba(34,197,94,0.15)" : "rgba(230,81,0,0.12)" }}
            >
              {pushState === "subscribed"
                ? <Bell size={18} style={{ color: "#22c55e" }} />
                : <BellOff size={18} style={{ color: "var(--ds-color-accent)" }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>
                {pushState === "subscribed" ? "Notificações push ativas" : "Ativar notificações push"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ds-color-text-secondary)" }}>
                {pushState === "subscribed"
                  ? "Você receberá alertas de novos eventos e roteiros."
                  : pushState === "denied"
                    ? "Permissão negada — reative nas configurações do navegador."
                    : "Receba alertas de eventos, roteiros e novidades."}
              </p>
            </div>
            {pushState !== "denied" && (
              <button
                onClick={pushState === "subscribed" ? unsubscribe : subscribe}
                disabled={pushState === "loading"}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0"
                style={{
                  background: pushState === "subscribed" ? "rgba(255,255,255,0.06)" : "var(--ds-color-accent)",
                  color: pushState === "subscribed" ? "var(--ds-color-text-secondary)" : "#fff",
                  border: pushState === "subscribed" ? "1px solid rgba(255,255,255,0.12)" : "none",
                  opacity: pushState === "loading" ? 0.6 : 1,
                }}
              >
                {pushState === "loading" ? "..." : pushState === "subscribed" ? "Desativar" : "Ativar"}
              </button>
            )}
          </div>
        )}

        {/* In-app notification list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 80, background: "var(--ds-color-bg-secondary)" }} />
            ))}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} style={{ color: "rgba(230,81,0,0.3)" }} className="mx-auto mb-4" />
            <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications?.map((notif: any) => (
              <div
                key={notif.id}
                className="p-4 flex items-start gap-3 rounded-2xl"
                style={{ opacity: notif.isRead ? 0.6 : 1, background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notif.isRead ? "rgba(230,81,0,0.08)" : "rgba(230,81,0,0.15)" }}>
                  <CalendarDays size={18} style={{ color: "var(--ds-color-accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{notif.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--ds-color-text-secondary)" }}>{notif.content}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(230,81,0,0.6)" }}>
                    {new Date(notif.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(230,81,0,0.15)" }}
                  >
                    <Check size={13} style={{ color: "var(--ds-color-accent)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
