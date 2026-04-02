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

export type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

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
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "unsubscribed");
    }).catch(() => setState("unsubscribed"));
  }, []);

  const subscribe = useCallback(async () => {
    if (!vapidData?.publicKey) return;
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
      });
      const json = sub.toJSON();
      await subscribeMutation.mutateAsync({
        endpoint: sub.endpoint,
        p256dh: (json.keys as any)?.p256dh ?? "",
        auth: (json.keys as any)?.auth ?? "",
      });
      setState("subscribed");
    } catch {
      setState("unsubscribed");
    }
  }, [vapidData, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
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
