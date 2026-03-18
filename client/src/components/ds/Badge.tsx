import type { ReactNode, CSSProperties } from "react";

interface DSBadgeProps {
  variant?: "default" | "accent" | "success" | "warning" | "error" | "outline" | "premium";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--ds-color-bg-glass)",
    color: "var(--ds-color-text-secondary)",
    border: "1px solid var(--ds-color-border-default)",
  },
  accent: {
    background: "var(--ds-color-accent-muted)",
    color: "var(--ds-color-accent)",
    border: "1px solid var(--ds-color-border-accent)",
  },
  success: {
    background: "rgba(52, 211, 153, 0.15)",
    color: "var(--ds-color-success)",
    border: "1px solid rgba(52, 211, 153, 0.3)",
  },
  warning: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "var(--ds-color-warning)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  error: {
    background: "rgba(248, 113, 113, 0.15)",
    color: "var(--ds-color-error)",
    border: "1px solid rgba(248, 113, 113, 0.3)",
  },
  outline: {
    background: "transparent",
    color: "var(--ds-color-text-secondary)",
    border: "1px solid var(--ds-color-border-default)",
  },
  premium: {
    background: "linear-gradient(135deg, rgba(230, 81, 0, 0.2), rgba(191, 54, 12, 0.2))",
    color: "var(--ds-color-accent)",
    border: "1px solid var(--ds-color-border-accent)",
  },
};

const sizeMap = {
  sm: { fontSize: "var(--ds-text-xs)", padding: "2px 8px", height: 22, gap: 4 },
  md: { fontSize: "var(--ds-text-xs)", padding: "4px 12px", height: 26, gap: 5 },
  lg: { fontSize: "var(--ds-text-sm)", padding: "5px 14px", height: 30, gap: 6 },
};

export function DSBadge({ variant = "default", size = "sm", icon, dot, className, style: customStyle, children }: DSBadgeProps) {
  const v = variantStyles[variant] ?? variantStyles.default;
  const s = sizeMap[size];

  return (
    <span
      className={className}
      style={{
        ...v,
        fontSize: s.fontSize,
        padding: s.padding,
        height: s.height,
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        borderRadius: "var(--ds-radius-full)",
        fontFamily: "var(--ds-font-sans)",
        fontWeight: "var(--ds-font-semibold)" as any,
        letterSpacing: "var(--ds-tracking-wide)",
        whiteSpace: "nowrap",
        lineHeight: 1,
        ...customStyle,
      }}
    >
      {dot && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "currentColor",
          flexShrink: 0,
        }} />
      )}
      {icon && <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>}
      {children}
    </span>
  );
}
