import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden"
      style={{
        background: 'var(--card-white)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--border)',
      }}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl shimmer flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-3.5 w-3/4 rounded-lg shimmer" />
            <div className="h-3 w-1/2 rounded-lg shimmer" />
            <div className="flex gap-1.5 mt-1">
              <div className="h-4 w-12 rounded-full shimmer" />
              <div className="h-4 w-20 rounded-full shimmer" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
            </div>
            <div className="h-4 w-12 rounded-full shimmer" />
          </div>
          <div className="h-px shimmer" style={{ opacity: 0.5 }} />
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded shimmer" />
            <div className="h-3 w-16 rounded shimmer" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-10 rounded-full shimmer" />
          <div className="w-10 h-10 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </motion.div>
  );
}
