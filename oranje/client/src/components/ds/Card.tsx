import { forwardRef, type HTMLAttributes, type ReactNode, useState } from "react";

type ImageAspect = "video" | "square" | "portrait" | "wide" | string;

interface DSCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "outline" | "accent";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  image?: string;
  imageAlt?: string;
  imageHeight?: number;
  imageAspect?: ImageAspect;
  overlay?: boolean;
  overlayContent?: ReactNode;
  children?: ReactNode;
}

const paddingMap = {
  none: 0,
  sm: "12px",
  md: "20px",
  lg: "28px",
  xl: "36px",
};

const aspectMap: Record<string, string> = {
  video: "56.25%",   // 16:9
  square: "100%",    // 1:1
  portrait: "133%",  // 3:4
  wide: "42.85%",    // 21:9
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
  ({ variant = "default", padding = "md", interactive = false, image, imageAlt, imageHeight = 200, imageAspect, overlay = false, overlayContent, children, style, className, ...props }, ref) => {
    const v = variantStyles[variant] ?? variantStyles.default;
    const aspectPadding = imageAspect ? (aspectMap[imageAspect] ?? imageAspect) : undefined;
    const [imgError, setImgError] = useState(false);

    return (
      <div
        ref={ref}
        className={className}
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
            e.currentTarget.style.boxShadow = (v.boxShadow as string) ?? "none";
            e.currentTarget.style.borderColor = (v.border as string)?.includes?.("accent") ? "var(--ds-color-border-accent)" : "var(--ds-color-border-default)";
          }
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {image && (
          <div style={{
            height: aspectPadding ? 0 : imageHeight,
            paddingBottom: aspectPadding,
            overflow: "hidden",
            position: "relative",
          }}>
            <img
              src={image}
              alt={imageAlt ?? ""}
              loading="lazy"
              style={{
                position: aspectPadding ? "absolute" : undefined,
                top: aspectPadding ? 0 : undefined,
                left: aspectPadding ? 0 : undefined,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform var(--ds-duration-slow) var(--ds-ease-smooth)",
              }}
              onMouseEnter={(e) => { if (interactive) e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
            {overlay && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,37,26,0.85) 0%, rgba(0,37,26,0.3) 50%, transparent 100%)",
              }} />
            )}
            {overlayContent && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: paddingMap[padding],
              }}>
                {overlayContent}
              </div>
            )}
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
