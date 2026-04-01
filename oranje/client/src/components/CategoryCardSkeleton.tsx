export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="animate-pulse rounded-full" style={{ width: 64, height: 64, background: "var(--ds-color-bg-secondary)" }} />
      <div className="animate-pulse rounded-lg" style={{ height: 16, width: 80, background: "var(--ds-color-bg-secondary)" }} />
    </div>
  );
}
