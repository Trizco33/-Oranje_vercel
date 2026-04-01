export function PlaceCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: "var(--ds-radius-xl)",
        background: "var(--ds-color-bg-elevated)",
        border: "1px solid var(--ds-color-border-default)",
      }}
    >
      <div className="shimmer" style={{ height: compact ? 140 : 180 }} />
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="shimmer" style={{ height: 18, width: "72%", borderRadius: 8 }} />
        <div className="shimmer" style={{ height: 13, width: "100%", borderRadius: 6 }} />
        <div className="shimmer" style={{ height: 13, width: "55%", borderRadius: 6 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <div className="shimmer" style={{ height: 22, width: 64, borderRadius: 20 }} />
          <div className="shimmer" style={{ height: 32, width: 32, borderRadius: 9999 }} />
        </div>
      </div>
    </div>
  );
}
