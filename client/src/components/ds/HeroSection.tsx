import type { ReactNode, CSSProperties } from "react";

interface DSHeroSectionProps {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
  background?: string;
  backgroundImage?: string;
  overlay?: boolean;
  children?: ReactNode;
  stats?: Array<{ value: string; label: string }>;
  cta?: ReactNode;
  ctaSecondary?: ReactNode;
  bottomContent?: ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

const sizeMap = {
  sm: { py: "var(--ds-space-12)", titleSize: "var(--ds-text-3xl)" },
  md: { py: "var(--ds-space-16)", titleSize: "var(--ds-text-4xl)" },
  lg: { py: "var(--ds-space-20)", titleSize: "var(--ds-text-5xl)" },
  xl: { py: "var(--ds-space-24)", titleSize: "var(--ds-text-6xl)" },
};

export function DSHeroSection({
  eyebrow,
  title,
  subtitle,
  size = "lg",
  align = "center",
  background,
  backgroundImage,
  overlay = true,
  children,
  stats,
  cta,
  ctaSecondary,
  bottomContent,
  id,
  className,
  style: customStyle,
}: DSHeroSectionProps) {
  const s = sizeMap[size];

  return (
    <section
      id={id}
      className={className}
      style={{
        position: "relative",
        padding: `${s.py} 0`,
        background: backgroundImage
          ? undefined
          : background ?? "linear-gradient(165deg, var(--oranje-green-dark) 0%, var(--oranje-green-deep) 50%, #0B3129 100%)",
        overflow: "hidden",
        ...customStyle,
      }}
    >
      {backgroundImage && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {overlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,37,26,0.75) 0%, rgba(0,37,26,0.9) 100%)",
              }}
            />
          )}
        </>
      )}

      {/* Decorative orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "80%",
          background: "radial-gradient(ellipse, rgba(230,81,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "40%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(13,74,64,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 var(--ds-space-6)",
          textAlign: align,
        }}
      >
        {eyebrow && (
          typeof eyebrow === "string" ? (
            <span
              style={{
                display: "inline-block",
                fontSize: "var(--ds-text-xs)",
                fontWeight: "var(--ds-font-semibold)" as any,
                letterSpacing: "var(--ds-tracking-wider)",
                textTransform: "uppercase" as const,
                color: "var(--ds-color-accent)",
                marginBottom: "var(--ds-space-4)",
                padding: "4px 14px",
                borderRadius: "var(--ds-radius-full)",
                background: "var(--ds-color-accent-subtle)",
                border: "1px solid var(--ds-color-border-accent)",
              }}
            >
              {eyebrow}
            </span>
          ) : (
            <div style={{ marginBottom: "var(--ds-space-4)" }}>{eyebrow}</div>
          )
        )}

        <h1
          style={{
            fontSize: s.titleSize,
            fontWeight: "var(--ds-font-bold)" as any,
            fontFamily: "var(--ds-font-display)",
            color: "var(--ds-color-text-primary)",
            lineHeight: "var(--ds-leading-tight)",
            letterSpacing: "var(--ds-tracking-tight)",
            marginBottom: subtitle ? "var(--ds-space-5)" : "var(--ds-space-8)",
            maxWidth: align === "center" ? "48rem" : "40rem",
            marginLeft: align === "center" ? "auto" : undefined,
            marginRight: align === "center" ? "auto" : undefined,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "var(--ds-text-lg)",
              fontWeight: "var(--ds-font-regular)" as any,
              color: "var(--ds-color-text-secondary)",
              lineHeight: "var(--ds-leading-relaxed)",
              maxWidth: "42rem",
              marginLeft: align === "center" ? "auto" : undefined,
              marginRight: align === "center" ? "auto" : undefined,
              marginBottom: "var(--ds-space-8)",
              opacity: 0.85,
            }}
          >
            {subtitle}
          </p>
        )}

        {(cta || ctaSecondary) && (
          <div style={{
            display: "flex",
            gap: "var(--ds-space-4)",
            justifyContent: align === "center" ? "center" : "flex-start",
            flexWrap: "wrap",
            marginBottom: stats || bottomContent ? "var(--ds-space-12)" : 0,
          }}>
            {cta}
            {ctaSecondary}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: align === "center" ? "center" : "flex-start",
              gap: "var(--ds-space-8)",
              flexWrap: "wrap",
              marginTop: "var(--ds-space-8)",
            }}
          >
            {stats.map((stat: any, i: number) => (
              <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                <p
                  style={{
                    fontSize: "var(--ds-text-3xl)",
                    fontWeight: "var(--ds-font-bold)" as any,
                    fontFamily: "var(--ds-font-display)",
                    color: "var(--ds-color-accent)",
                    lineHeight: 1,
                  }}
                >
                  {stat?.value ?? ""}
                </p>
                <p
                  style={{
                    fontSize: "var(--ds-text-xs)",
                    color: "var(--ds-color-text-muted)",
                    marginTop: "var(--ds-space-1)",
                    letterSpacing: "var(--ds-tracking-wide)",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {stat?.label ?? ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {bottomContent && (
          <div style={{ marginTop: "var(--ds-space-8)" }}>
            {bottomContent}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
