import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration> {
  // Register if not already present
  const existing = await navigator.serviceWorker.getRegistration("/app/");
  if (!existing) {
    await navigator.serviceWorker.register("/app/sw.js", { scope: "/app/" });
  }
  // Wait until active (required for pushManager.subscribe)
  return await navigator.serviceWorker.ready;
}

export type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";
export let lastPushError = "";

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const { data: vapidData } = trpc.push.vapidPublicKey.useQuery();
  const subscribeMutation = trpc.push.subscribe.useMutation();
  const unsubscribeMutation = trpc.push.unsubscribe.useMutation();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    getOrRegisterSW().then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "unsubscribed");
    }).catch(() => setState("unsubscribed"));
  }, []);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState("loading");
    try {
      // Register SW if needed
      const reg = await getOrRegisterSW();

      // Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      // Get VAPID key — wait up to 5s if not loaded yet
      let publicKey = vapidData?.publicKey;
      if (!publicKey) {
        const apiBase = (window as any).__VITE_API_URL__ || "";
        try {
          const resp = await fetch(`${apiBase}/api/trpc/push.vapidPublicKey`);
          const json = await resp.json();
          publicKey = json?.result?.data?.json?.publicKey;
        } catch { /* ignore */ }
      }
      if (!publicKey) {
        setState("unsubscribed");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Browser subscription created — mark as subscribed immediately
      setState("subscribed");

      // Save to server (best-effort)
      const json = sub.toJSON();
      subscribeMutation.mutate({
        endpoint: sub.endpoint,
        p256dh: (json.keys as any)?.p256dh ?? "",
        auth: (json.keys as any)?.auth ?? "",
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("[push] subscribe error:", msg);
      lastPushError = msg;
      if (Notification.permission === "denied") {
        setState("denied");
      } else {
        setState("unsubscribed");
      }
    }
  }, [vapidData, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    setState("loading");
    try {
      const reg = await getOrRegisterSW();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeMutation.mutateAsync({ endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setState("unsubscribed");
    } catch {
      setState("subscribed");
    }
  }, [unsubscribeMutation]);

  return { state, subscribe, unsubscribe };
}
