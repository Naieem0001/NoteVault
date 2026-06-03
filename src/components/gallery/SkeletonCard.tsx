export function SkeletonCard() {
  return (
    <div className="rounded-2xl glass border border-white/[0.06] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl shimmer flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
        </div>
      </div>
      {/* Meta */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-2/3 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
      </div>
      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
        <div className="flex-1 h-9 rounded-xl shimmer" />
        <div className="w-9 h-9 rounded-xl shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
