/**
 * useBusinessHours
 *
 * Parses the `openingHours` text field (stored as JSON in the DB) and returns
 * the current operational status of a place, calculated with the
 * America/Sao_Paulo timezone.
 *
 * JSON format for the `openingHours` field:
 * {
 *   "dom": null,                        // closed on Sunday
 *   "seg": [["08:00","12:00"],["13:00","18:00"]], // two intervals on Monday
 *   "ter": [["08:00","18:00"]],
 *   "qua": [["08:00","18:00"]],
 *   "qui": [["08:00","18:00"]],
 *   "sex": [["08:00","22:00"]],
 *   "sab": [["09:00","22:00"]]
 * }
 *
 * Keys: "dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab"
 * If a key is absent, it is treated the same as null (closed).
 * If the openingHours string cannot be parsed as JSON, the hook returns null
 * (no badge is shown — never shows misleading information).
 */

export type BusinessStatus =
  | { type: "open"; closesAt?: string }
  | { type: "closes_soon"; closesAt: string; minutesLeft: number }
  | { type: "opens_today"; opensAt: string }
  | { type: "closed_today" }
  | null;

type DayKey = "dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab";
type Interval = [string, string]; // ["HH:MM", "HH:MM"]
type DaySchedule = Interval[] | null;
type WeekSchedule = Partial<Record<DayKey, DaySchedule>>;

const DAY_KEYS: DayKey[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

function getNowInSaoPaulo(): { dayIndex: number; minutesOfDay: number } {
  const tz = "America/Sao_Paulo";
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(now);

  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
  const minuteStr = parts.find((p) => p.type === "minute")?.value ?? "0";

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const dayIndex = weekdayMap[weekdayStr] ?? 0;
  const minutesOfDay = parseInt(hourStr) * 60 + parseInt(minuteStr);
  return { dayIndex, minutesOfDay };
}

export function getBusinessStatus(openingHoursRaw: string | null | undefined): BusinessStatus {
  if (!openingHoursRaw) return null;

  let schedule: WeekSchedule;
  try {
    const parsed = JSON.parse(openingHoursRaw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    schedule = parsed as WeekSchedule;
  } catch {
    return null;
  }

  const { dayIndex, minutesOfDay } = getNowInSaoPaulo();
  const dayKey = DAY_KEYS[dayIndex];
  const daySchedule: DaySchedule = schedule[dayKey] ?? null;

  if (!daySchedule || daySchedule.length === 0) {
    return { type: "closed_today" };
  }

  let nextOpen: string | null = null;

  for (const [open, close] of daySchedule) {
    const openMin = parseTime(open);
    const closeMin = parseTime(close);

    if (minutesOfDay < openMin) {
      if (!nextOpen) nextOpen = open;
      continue;
    }

    if (minutesOfDay >= openMin && minutesOfDay < closeMin) {
      const minutesLeft = closeMin - minutesOfDay;
      if (minutesLeft <= 60) {
        return { type: "closes_soon", closesAt: close, minutesLeft };
      }
      return { type: "open", closesAt: close };
    }
  }

  if (nextOpen) {
    return { type: "opens_today", opensAt: nextOpen };
  }

  return { type: "closed_today" };
}

export function formatBusinessStatus(status: BusinessStatus): string | null {
  if (!status) return null;
  switch (status.type) {
    case "open":
      return status.closesAt ? `Aberto · fecha às ${formatTime(status.closesAt)}` : "Aberto agora";
    case "closes_soon":
      return status.minutesLeft <= 30
        ? `Fecha em ${status.minutesLeft} min`
        : `Fecha em ${Math.round(status.minutesLeft / 60)}h`;
    case "opens_today":
      return `Abre às ${formatTime(status.opensAt)}`;
    case "closed_today":
      return "Fechado hoje";
  }
}

export function useBusinessHours(openingHoursRaw: string | null | undefined) {
  const status = getBusinessStatus(openingHoursRaw);
  const label = formatBusinessStatus(status);
  return { status, label };
}
