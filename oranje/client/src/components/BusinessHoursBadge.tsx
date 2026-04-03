import { useBusinessHours } from "@/hooks/useBusinessHours";
import { Clock } from "lucide-react";

interface BusinessHoursBadgeProps {
  openingHours: string | null | undefined;
  size?: "sm" | "md";
}

export function BusinessHoursBadge({ openingHours, size = "sm" }: BusinessHoursBadgeProps) {
  const { status, label } = useBusinessHours(openingHours);

  if (!status || !label) return null;

  const isOpen = status.type === "open" || status.type === "closes_soon";
  const isClosesSoon = status.type === "closes_soon";
  const isClosed = status.type === "closed_today";

  const bgColor = isClosesSoon
    ? "rgba(245, 158, 11, 0.12)"
    : isOpen
    ? "rgba(16, 185, 129, 0.12)"
    : "rgba(239, 68, 68, 0.10)";

  const textColor = isClosesSoon
    ? "#B45309"
    : isOpen
    ? "#047857"
    : "#B91C1C";

  const dotColor = isClosesSoon ? "#F59E0B" : isOpen ? "#10B981" : "#EF4444";

  const fontSize = size === "sm" ? "0.6875rem" : "0.75rem";
  const padding = size === "sm" ? "2px 7px" : "3px 9px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: bgColor,
        color: textColor,
        fontSize,
        fontWeight: 600,
        borderRadius: 99,
        padding,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {isClosed ? (
        <Clock size={10} style={{ color: textColor, flexShrink: 0 }} />
      ) : (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
            ...(isOpen && !isClosesSoon
              ? {
                  animation: "biz-hours-pulse 2s ease-in-out infinite",
                }
              : {}),
          }}
        />
      )}
      <style>{`
        @keyframes biz-hours-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      {label}
    </span>
  );
}
