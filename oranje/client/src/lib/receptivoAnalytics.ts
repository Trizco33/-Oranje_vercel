// ─── Receptivo Analytics ──────────────────────────────────────────────────────
// Lightweight event tracker for Receptivo Oranje journeys.
//
// Dev mode: logs to console.
// Prod: sends to gtag (GA4) if configured, else buffers to localStorage.
// Buffer key: "oranje_analytics_buffer" (max 200 events, oldest discarded).
//
// EVENTS
// ──────
// receptivo_start          → user enters a guided tour
// receptivo_nav_activate   → user taps "Ativar navegação guiada"
// receptivo_stop_arrival   → arrival detected at a stop (GPS ≤ ARRIVAL_RADIUS_METERS)
// receptivo_stop_advance   → user manually advances to next stop
// receptivo_complete        → all stops visited, closing section shown
// receptivo_abandon        → user navigates away mid-tour (best-effort via beforeunload)

export type ReceptivoEventName =
  | "receptivo_start"
  | "receptivo_nav_activate"
  | "receptivo_stop_arrival"
  | "receptivo_stop_advance"
  | "receptivo_complete"
  | "receptivo_abandon";

export interface ReceptivoEventProps {
  tourSlug: string;
  stopIndex?: number;
  stopName?: string;
  totalStops?: number;
}

export function trackReceptivoEvent(
  event: ReceptivoEventName,
  props: ReceptivoEventProps
): void {
  const payload = { event, ...props, ts: Date.now() };

  if (import.meta.env.DEV) {
    console.info("[Receptivo Analytics]", payload);
    return;
  }

  const w = window as any;

  // GA4 via gtag
  if (typeof w.gtag === "function") {
    w.gtag("event", event, {
      tour_slug: props.tourSlug,
      stop_index: props.stopIndex,
      stop_name: props.stopName,
      total_stops: props.totalStops,
    });
    return;
  }

  // Fallback: localStorage buffer (survives page navigation)
  try {
    const key = "oranje_analytics_buffer";
    const existing: object[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...existing.slice(-199), payload]));
  } catch {
    // Storage unavailable — silently ignore
  }
}

// ─── Journey persistence ──────────────────────────────────────────────────────
// Single slot: saves the most recent in-progress tour.
// Key: "oranje_receptivo_progress"
// Used by Home.tsx to show "Continuar passeio" CTA.

const PERSIST_KEY = "oranje_receptivo_progress";
const PERSIST_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ReceptivoProgress {
  slug: string;
  tourName: string;
  activeIndex: number;
  totalStops: number;
  savedAt: number;
}

export function saveReceptivoProgress(data: Omit<ReceptivoProgress, "savedAt">): void {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    // ignore
  }
}

export function loadReceptivoProgress(slug: string): ReceptivoProgress | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed: ReceptivoProgress = JSON.parse(raw);
    if (parsed.slug !== slug) return null;
    if (Date.now() - parsed.savedAt > PERSIST_TTL_MS) {
      localStorage.removeItem(PERSIST_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearReceptivoProgress(): void {
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch {
    // ignore
  }
}

export function getAnyReceptivoProgress(): ReceptivoProgress | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed: ReceptivoProgress = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > PERSIST_TTL_MS) {
      localStorage.removeItem(PERSIST_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
