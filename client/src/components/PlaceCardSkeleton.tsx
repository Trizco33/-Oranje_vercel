export function PlaceCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
      <div className="w-full animate-pulse" style={{ height: 192, background: "var(--ds-color-bg-secondary)" }} />
      <div className="p-4 space-y-3">
        <div className="animate-pulse rounded-lg" style={{ height: 20, width: "75%", background: "var(--ds-color-bg-secondary)" }} />
        <div className="animate-pulse rounded-lg" style={{ height: 16, background: "var(--ds-color-bg-secondary)" }} />
        <div className="animate-pulse rounded-lg" style={{ height: 16, width: "66%", background: "var(--ds-color-bg-secondary)" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="animate-pulse rounded-lg" style={{ height: 16, width: "25%", background: "var(--ds-color-bg-secondary)" }} />
          <div className="animate-pulse rounded-full" style={{ height: 32, width: 32, background: "var(--ds-color-bg-secondary)" }} />
        </div>
      </div>
    </div>
  );
}
