import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FileX, Inbox } from 'lucide-react';
import { useSubmissions } from '../hooks/useSubmissions';
import { useFilters } from '../hooks/useFilters';
import { FileCard } from '../components/gallery/FileCard';
import { FilterBar } from '../components/gallery/FilterBar';
import { StatsStrip } from '../components/gallery/StatsStrip';
import { SkeletonGrid } from '../components/gallery/SkeletonCard';

const LAST_VISIT_KEY = 'notevault_last_visit';

export function GalleryPage() {
  const { data: submissions = [], isLoading, isError } = useSubmissions();
  const { filters, updateFilter, clearFilters, filtered, subjects, semesters, fileTypes, activeFilterCount } = useFilters(submissions);

  // "New since last visit" tracking
  const [lastVisit] = useState<Date | null>(() => {
    const stored = localStorage.getItem(LAST_VISIT_KEY);
    return stored ? new Date(stored) : null;
  });

  useEffect(() => {
    // Update last visit on mount (after 3s so user sees the new indicators)
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
    <div className="page-wrapper">
      {/* Exam mode banner */}
      <AnimatePresence>
        {filters.examMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="exam-mode-active overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 text-center text-sm text-amber-400 font-medium">
              ⚡ Exam Mode — showing only verified files
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Academic <span className="gradient-text">Files</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse, filter and download study materials
            </p>
          </div>
          <StatsStrip
            submissions={submissions}
            filteredCount={filtered.length}
            isLive
          />
        </div>

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

        {/* Results count */}
        {!isLoading && (
          <div className="text-xs text-slate-500">
            Showing <span className="text-slate-300 font-medium">{filtered.length}</span> of{' '}
            <span className="text-slate-300 font-medium">{submissions.length}</span> files
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <SkeletonGrid count={9} />
        ) : isError ? (
          <div className="text-center py-20 text-slate-500">
            <FileX className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Failed to load files. Please refresh the page.</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Inbox className="w-14 h-14 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 font-medium text-lg">
              {submissions.length === 0 ? 'No files uploaded yet' : 'No results match your filters'}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {submissions.length === 0
                ? 'Be the first to upload!'
                : 'Try adjusting or clearing your filters'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 btn-glass px-5 py-2 rounded-xl text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
  );
}
