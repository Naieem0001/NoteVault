import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FileX, Inbox, Library } from 'lucide-react';
import { useSubmissions } from '../hooks/useSubmissions';
import { useFilters } from '../hooks/useFilters';
import { FileCard } from '../components/gallery/FileCard';
import { FilterBar } from '../components/gallery/FilterBar';
import { StatsStrip } from '../components/gallery/StatsStrip';
import { SkeletonGrid } from '../components/gallery/SkeletonCard';

const LAST_VISIT_KEY = 'notevault_last_visit';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export function GalleryPage() {
  const { data: submissions = [], isLoading, isError } = useSubmissions();
  const {
    filters, updateFilter, clearFilters,
    filtered, subjects, semesters, fileTypes, activeFilterCount,
  } = useFilters(submissions);

  const [lastVisit] = useState<Date | null>(() => {
    const stored = localStorage.getItem(LAST_VISIT_KEY);
    return stored ? new Date(stored) : null;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const isNew = (uploadedAt: string) => {
    if (!lastVisit) return false;
    return new Date(uploadedAt) > lastVisit;
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden px-6 pt-6 pb-6 md:pt-10 md:pb-8"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* subtle gradient behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-3"
            >
              <Library className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Academic Vault
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              className="text-3xl md:text-5xl font-display font-bold leading-tight mb-2 gradient-text-brand"
            >
              All Files
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Browse and download premium study materials.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsStrip
              submissions={submissions}
              filteredCount={filtered.length}
              isLive={false}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-5 md:py-7 flex flex-col gap-6">

        {/* Filters */}
        <FilterBar
          filters={filters}
          subjects={subjects}
          semesters={semesters}
          fileTypes={fileTypes}
          activeFilterCount={activeFilterCount}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
        />

        {/* Exam mode banner */}
        <AnimatePresence>
          {filters.examMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#fbbf24',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                Exam Mode Active — Showing verified materials only
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Showing <span style={{ color: 'var(--text-secondary)' }} className="font-bold">{filtered.length}</span> of{' '}
            <span style={{ color: 'var(--text-secondary)' }} className="font-bold">{submissions.length}</span> files
          </motion.p>
        )}

        {/* Grid / States */}
        <div className="pb-12">
          {isLoading ? (
            <SkeletonGrid count={9} />
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 rounded-2xl flex flex-col items-center gap-4"
              style={{ background: 'var(--glass-bg)', border: '1px solid rgba(248,113,113,0.15)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                <FileX className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Failed to load files</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Check your connection and try refreshing.</p>
              </div>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 rounded-2xl flex flex-col items-center gap-5"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <Inbox className="w-8 h-8" style={{ color: '#a78bfa' }} />
              </motion.div>
              <div>
                <p className="font-bold text-lg mb-1.5 gradient-text-brand">
                  {submissions.length === 0 ? 'Vault is empty' : 'No results found'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {submissions.length === 0
                    ? 'Be the first to contribute study materials!'
                    : 'Try adjusting your filters to find what you need.'}
                </p>
                {activeFilterCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={clearFilters}
                    className="mt-4 text-sm font-bold px-4 py-2 rounded-xl btn-brand"
                  >
                    Clear Filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((submission, i) => (
                  <FileCard
                    key={submission.id}
                    submission={submission}
                    isNew={isNew(submission.uploaded_at)}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
