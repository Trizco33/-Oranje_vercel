import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface DSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent-outline" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const sizeMap = {
  sm: { height: 34, fontSize: "var(--ds-text-xs)", padding: "0 14px", gap: 6, radius: "var(--ds-radius-md)" },
  md: { height: 42, fontSize: "var(--ds-text-sm)", padding: "0 20px", gap: 8, radius: "var(--ds-radius-lg)" },
  lg: { height: 50, fontSize: "var(--ds-text-base)", padding: "0 28px", gap: 10, radius: "var(--ds-radius-xl)" },
  xl: { height: 58, fontSize: "var(--ds-text-lg)", padding: "0 36px", gap: 12, radius: "var(--ds-radius-xl)" },
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, var(--oranje-orange) 0%, #BF360C 100%)",
    color: "#FFFFFF",
    border: "none",
    boxShadow: "var(--ds-shadow-accent)",
  },
  secondary: {
    background: "var(--ds-color-bg-glass)",
    color: "var(--ds-color-text-primary)",
    border: "1px solid var(--ds-color-border-default)",
    backdropFilter: "blur(12px)",
  },
  ghost: {
    background: "transparent",
    color: "var(--ds-color-text-secondary)",
    border: "1px solid transparent",
  },
  "accent-outline": {
    background: "var(--ds-color-accent-subtle)",
    color: "var(--ds-color-accent)",
    border: "1px solid var(--ds-color-border-accent)",
  },
  danger: {
    background: "rgba(248, 113, 113, 0.12)",
    color: "var(--ds-color-error)",
    border: "1px solid rgba(248, 113, 113, 0.25)",
  },
};

export const DSButton = forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, loading, iconLeft, iconRight, children, disabled, style, ...props }, ref) => {
    const s = sizeMap[size];
    const v = variantStyles[variant] ?? variantStyles.primary;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...v,
          height: s.height,
          fontSize: s.fontSize,
          padding: s.padding,
          borderRadius: s.radius,
          fontFamily: "var(--ds-font-sans)",
          fontWeight: "var(--ds-font-semibold)" as any,
          letterSpacing: "var(--ds-tracking-wide)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: s.gap,
          width: fullWidth ? "100%" : undefined,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "all var(--ds-duration-normal) var(--ds-ease-smooth)",
          whiteSpace: "nowrap",
          userSelect: "none",
          textDecoration: "none",
          lineHeight: 1,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.transform = "translateY(-1px)";
            if (variant === "primary") {
              e.currentTarget.style.boxShadow = "var(--ds-shadow-accent-lg)";
            } else {
              e.currentTarget.style.boxShadow = "var(--ds-shadow-md)";
            }
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = v.boxShadow as string ?? "none";
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {loading ? (
          <span
            style={{
              width: 16,
              height: 16,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <>
            {iconLeft}
            {children}
            {iconRight}
          </>
        )}
      </button>
    );
  }
);

DSButton.displayName = "DSButton";
