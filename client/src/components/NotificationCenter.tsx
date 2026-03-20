import { useEffect, useState, useCallback, useMemo } from "react";
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

const EMPTY_ARRAY: readonly any[] = [];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications - with error resilience
  const { data: rawNotifications, refetch } = trpc.notifications.list.useQuery(undefined, {
    staleTime: 10000,
    retry: 1,
    retryDelay: 5000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });

  // Stabilize the reference: use a stable empty array when data is undefined/null
  const fetchedNotifications = useMemo(
    () => (rawNotifications && Array.isArray(rawNotifications) ? rawNotifications : EMPTY_ARRAY),
    [rawNotifications]
  );

  // Always call the hook (Rules of Hooks) — don't wrap in try-catch
  const markReadMutation = trpc.notifications.markRead.useMutation();

  useEffect(() => {
    if (fetchedNotifications.length === 0) {
      // Only reset if we have existing notifications to clear
      setNotifications((prev) => (prev.length > 0 ? [] : prev));
      setUnreadCount((prev) => (prev > 0 ? 0 : prev));
      return;
    }

    const mapped = fetchedNotifications.map((n: any) => ({
      id: n?.id ?? 0,
      title: n?.title || "Notificação",
      content: n?.content || "",
      type: "info" as const,
      createdAt: new Date(n?.createdAt ?? Date.now()),
      read: n?.read ?? false,
    }));
    setNotifications(mapped);
    setUnreadCount(mapped.filter((n) => !n.read).length);
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
      await markReadMutation.mutateAsync({ id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      refetch?.()?.catch?.(() => {});
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  }, [markReadMutation, refetch]);

  const handleClear = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50 }}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          padding: 12,
          borderRadius: 9999,
          background: "rgba(216,138,61,0.2)",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <Bell size={24} style={{ color: "#D88A3D" }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FF6464",
              color: "#fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 0,
            width: 320,
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxHeight: 384,
            overflowY: "auto",
            background: "rgba(15,27,20,0.95)",
            border: "1px solid rgba(216,138,61,0.2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              padding: 16,
              borderBottom: "1px solid rgba(216,138,61,0.2)",
              background: "rgba(15,27,20,0.95)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontWeight: 700, color: "#E8E6E3", margin: 0 }}>
                Notificações
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: 4,
                  borderRadius: 8,
                  background: "rgba(216,138,61,0.1)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} style={{ color: "#D88A3D" }} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <p style={{ color: "#C8C5C0" }}>Nenhuma notificação</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: 16,
                    borderBottom: "1px solid rgba(216,138,61,0.1)",
                    background: notification.read ? "transparent" : "rgba(216,138,61,0.1)",
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flexShrink: 0, paddingTop: 4 }}>
                      {getIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: 14, color: "#E8E6E3", margin: 0 }}>
                        {notification.title}
                      </p>
                      <p style={{ fontSize: 12, marginTop: 4, color: "#C8C5C0", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {notification.content}
                      </p>
                      <p style={{ fontSize: 12, marginTop: 8, color: "#9B9795" }}>
                        {new Date(notification.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            background: "rgba(91,217,138,0.2)",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Marcar como lido"
                        >
                          <CheckCircle size={16} style={{ color: "#5BD98A" }} />
                        </button>
                      )}
                      <button
                        onClick={() => handleClear(notification.id)}
                        style={{
                          padding: 4,
                          borderRadius: 4,
                          background: "rgba(255,100,100,0.2)",
                          border: "none",
                          cursor: "pointer",
                        }}
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
          {notifications.length > 0 && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                padding: 12,
                borderTop: "1px solid rgba(216,138,61,0.2)",
                background: "rgba(15,27,20,0.95)",
              }}
            >
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: "rgba(216,138,61,0.15)",
                  color: "#D88A3D",
                  border: "1px solid rgba(216,138,61,0.3)",
                  cursor: "pointer",
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
