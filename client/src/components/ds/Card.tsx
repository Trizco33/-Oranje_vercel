import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

interface DSCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "outline" | "accent";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  image?: string;
  imageAlt?: string;
  imageHeight?: number;
  children?: ReactNode;
}

const paddingMap = {
  none: 0,
  sm: "12px",
  md: "20px",
  lg: "28px",
  xl: "36px",
};

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--ds-color-bg-surface)",
    border: "1px solid var(--ds-color-border-default)",
    boxShadow: "var(--ds-shadow-xs)",
  },
  elevated: {
    background: "var(--ds-color-bg-elevated)",
    border: "1px solid var(--ds-color-border-default)",
    boxShadow: "var(--ds-shadow-md)",
  },
  glass: {
    background: "var(--ds-color-bg-glass)",
    border: "1px solid var(--ds-color-border-subtle)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  outline: {
    background: "transparent",
    border: "1px solid var(--ds-color-border-default)",
  },
  accent: {
    background: "var(--ds-color-accent-subtle)",
    border: "1px solid var(--ds-color-border-accent)",
  },
};

export const DSCard = forwardRef<HTMLDivElement, DSCardProps>(
  ({ variant = "default", padding = "md", interactive = false, image, imageAlt, imageHeight = 200, children, style, ...props }, ref) => {
    const v = variantStyles[variant] ?? variantStyles.default;

    return (
      <div
        ref={ref}
        style={{
          ...v,
          borderRadius: "var(--ds-radius-xl)",
          overflow: "hidden",
          transition: "all var(--ds-duration-normal) var(--ds-ease-smooth)",
          cursor: interactive ? "pointer" : undefined,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--ds-shadow-lg)";
            e.currentTarget.style.borderColor = "var(--ds-color-border-accent)";
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = v.boxShadow as string ?? "none";
            e.currentTarget.style.borderColor = (v.border as string)?.includes("accent") ? "var(--ds-color-border-accent)" : "var(--ds-color-border-default)";
          }
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {image && (
          <div style={{ height: imageHeight, overflow: "hidden", position: "relative" }}>
            <img
              src={image}
              alt={imageAlt ?? ""}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform var(--ds-duration-slow) var(--ds-ease-smooth)",
              }}
              onMouseEnter={(e) => { if (interactive) e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
          </div>
        )}
        {children && (
          <div style={{ padding: paddingMap[padding] }}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

DSCard.displayName = "DSCard";
