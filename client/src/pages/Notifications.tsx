import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, CalendarDays, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(undefined, { enabled: !!user });
  const markRead = trpc.notifications.markRead.useMutation();
  const utils = trpc.useUtils();

  function handleMarkRead(id: number) {
    markRead.mutate({ id }, { onSuccess: () => utils.notifications.list.invalidate() });
  }

  if (!user) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader title="Notificações" showBack onBack={() => navigate("/")} />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <Bell size={40} style={{ color: "#D88A3D" }} className="mb-4" />
          <p className="text-sm" style={{ color: "#C8C5C0" }}>Faça login para ver suas notificações.</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Notificações" showBack onBack={() => navigate("/")} />

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer rounded-2xl" style={{ height: 80 }} />
            ))}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} style={{ color: "rgba(216,138,61,0.3)" }} className="mx-auto mb-4" />
            <p className="text-sm" style={{ color: "#C8C5C0" }}>Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications?.map(notif => (
              <div
                key={notif.id}
                className="glass-card p-4 flex items-start gap-3"
                style={{ opacity: notif.isRead ? 0.6 : 1 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notif.isRead ? "rgba(216,138,61,0.08)" : "rgba(216,138,61,0.15)" }}>
                  <CalendarDays size={18} style={{ color: "#D88A3D" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#E8E6E3" }}>{notif.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#C8C5C0" }}>{notif.content}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(216,138,61,0.6)" }}>
                    {new Date(notif.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(216,138,61,0.15)" }}
                  >
                    <Check size={13} style={{ color: "#D88A3D" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
