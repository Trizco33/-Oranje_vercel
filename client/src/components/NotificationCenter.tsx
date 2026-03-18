import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: "success" | "error" | "info";
  createdAt: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications - with error resilience
  const { data: fetchedNotifications = [], refetch } = trpc.notifications.list.useQuery(undefined, {
    staleTime: 10000,
    retry: 1,
    retryDelay: 5000,
    refetchOnWindowFocus: false,
    // This ensures the component doesn't throw on error
    throwOnError: false,
  });

  let markReadMutation: any = null;
  try {
    markReadMutation = trpc.notifications.markRead.useMutation();
  } catch {
    // Silently ignore if mutation is unavailable
  }

  useEffect(() => {
    try {
      if (fetchedNotifications && Array.isArray(fetchedNotifications)) {
        const mapped = fetchedNotifications.map((n: any) => ({
          id: n?.id ?? 0,
          title: n?.title || "Notificação",
          content: n?.content || "",
          type: "info" as const,
          createdAt: new Date(n?.createdAt ?? Date.now()),
          read: n?.read ?? false,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped?.filter((n: any) => !n?.read)?.length ?? 0);
      }
    } catch {
      // Silently handle mapping errors
    }
  }, [fetchedNotifications]);

  // Poll for new notifications every 30 seconds (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch?.()?.catch?.(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      if (markReadMutation) {
        await markReadMutation.mutateAsync({ id });
      }
      setNotifications((prev) =>
        (prev ?? []).map((n: any) => (n?.id === id ? { ...(n ?? {}), read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, (c ?? 0) - 1));
      refetch?.()?.catch?.(() => {});
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  }, [markReadMutation, refetch]);

  const handleClear = useCallback((id: number | string) => {
    setNotifications((prev) => (prev ?? []).filter((n: any) => n?.id !== id));
  }, []);

  const getIcon = useCallback((type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} style={{ color: "#5BD98A" }} />;
      case "error":
        return <AlertCircle size={20} style={{ color: "#FF6464" }} />;
      default:
        return <Info size={20} style={{ color: "#D88A3D" }} />;
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full transition-all"
        style={{ background: "rgba(216,138,61,0.2)" }}
      >
        <Bell size={24} style={{ color: "#D88A3D" }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: "#FF6464", color: "#fff" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 rounded-2xl shadow-2xl max-h-96 overflow-y-auto"
          style={{ background: "rgba(15,27,20,0.95)", border: "1px solid rgba(216,138,61,0.2)" }}
        >
          {/* Header */}
          <div className="sticky top-0 p-4 border-b" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: "#E8E6E3" }}>
                Notificações
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg transition-all"
                style={{ background: "rgba(216,138,61,0.1)" }}
              >
                <X size={18} style={{ color: "#D88A3D" }} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {(notifications?.length ?? 0) === 0 ? (
            <div className="p-8 text-center">
              <p style={{ color: "#C8C5C0" }}>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
              {(notifications ?? []).map((notification: any) => (
                <div
                  key={notification?.id}
                  className="p-4 transition-all"
                  style={{
                    background: notification?.read ? "transparent" : "rgba(216,138,61,0.1)",
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-1">
                      {getIcon(notification?.type ?? "info")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: "#E8E6E3" }}>
                        {notification?.title ?? ""}
                      </p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: "#C8C5C0" }}>
                        {notification?.content ?? ""}
                      </p>
                      <p className="text-xs mt-2" style={{ color: "#9B9795" }}>
                        {(() => { try { return new Date(notification?.createdAt ?? Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } })()}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!notification?.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification?.id)}
                          className="p-1 rounded transition-all"
                          style={{ background: "rgba(91,217,138,0.2)" }}
                          title="Marcar como lido"
                        >
                          <CheckCircle size={16} style={{ color: "#5BD98A" }} />
                        </button>
                      )}
                      <button
                        onClick={() => handleClear(notification?.id)}
                        className="p-1 rounded transition-all"
                        style={{ background: "rgba(255,100,100,0.2)" }}
                        title="Remover"
                      >
                        <X size={16} style={{ color: "#FF6464" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {(notifications?.length ?? 0) > 0 && (
            <div className="sticky bottom-0 p-3 border-t" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "rgba(216,138,61,0.15)",
                  color: "#D88A3D",
                  border: "1px solid rgba(216,138,61,0.3)",
                }}
              >
                Limpar Tudo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
