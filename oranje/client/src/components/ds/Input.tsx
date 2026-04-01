import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface DSInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  variant?: "default" | "filled";
}

export const DSInput = forwardRef<HTMLInputElement, DSInputProps>(
  ({ label, error, hint, iconLeft, iconRight, variant = "default", className, style, ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && (
          <label
            style={{
              fontSize: "var(--ds-text-xs)",
              fontWeight: "var(--ds-font-semibold)" as any,
              letterSpacing: "var(--ds-tracking-wider)",
              textTransform: "uppercase" as const,
              color: error ? "var(--ds-color-error)" : "var(--ds-color-text-muted)",
              fontFamily: "var(--ds-font-sans)",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {iconLeft && (
            <div style={{ position: "absolute", left: 14, color: "var(--ds-color-text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            style={{
              width: "100%",
              height: 46,
              padding: `0 ${iconRight ? 42 : 16}px 0 ${iconLeft ? 42 : 16}px`,
              fontSize: "var(--ds-text-sm)",
              fontFamily: "var(--ds-font-sans)",
              fontWeight: "var(--ds-font-regular)" as any,
              color: "var(--ds-color-text-primary)",
              background: variant === "filled" ? "var(--ds-color-bg-surface)" : "transparent",
              border: `1px solid ${error ? "var(--ds-color-error)" : "var(--ds-color-border-default)"}`,
              borderRadius: "var(--ds-radius-lg)",
              outline: "none",
              transition: "all var(--ds-duration-fast) var(--ds-ease-smooth)",
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? "var(--ds-color-error)" : "var(--ds-color-border-focus)";
              e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? "rgba(248,113,113,0.15)" : "rgba(230,81,0,0.12)"}`;
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "var(--ds-color-error)" : "var(--ds-color-border-default)";
              e.currentTarget.style.boxShadow = "none";
              props.onBlur?.(e);
            }}
            {...props}
          />
          {iconRight && (
            <div style={{ position: "absolute", right: 14, color: "var(--ds-color-text-muted)", display: "flex", alignItems: "center" }}>
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <span style={{ fontSize: "var(--ds-text-xs)", color: "var(--ds-color-error)" }}>{error}</span>
        )}
        {hint && !error && (
          <span style={{ fontSize: "var(--ds-text-xs)", color: "var(--ds-color-text-muted)" }}>{hint}</span>
        )}
      </div>
    );
  }
);

DSInput.displayName = "DSInput";
