import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { type FilterState, type SortKey } from '../../hooks/useFilters';

interface FilterBarProps {
  filters: FilterState;
  subjects: string[];
  semesters: string[];
  fileTypes: string[];
  activeFilterCount: number;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
}

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A → Z', value: 'az' },
  { label: 'Z → A', value: 'za' },
  { label: 'Most Downloaded', value: 'downloads' },
];

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-glow-sm'
          : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.07] hover:text-slate-300'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full ${active ? 'bg-brand-500/30 text-brand-200' : 'bg-white/10'}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

export function FilterBar({
  filters,
  subjects,
  semesters,
  fileTypes,
  activeFilterCount,
  updateFilter,
  clearFilters,
}: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const fileTypeLabels: Record<string, string> = {
    pptx: 'PPTX', ppt: 'PPT', pdf: 'PDF', docx: 'DOCX', doc: 'DOC',
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Sort row */}
      <div className="flex gap-3 flex-wrap sm:flex-nowrap">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search files, subjects, uploaders… (Ctrl+K)"
            className="input-glass w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value as SortKey)}
            className="input-glass pl-9 pr-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-2 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter pills row */}
      <div className="flex items-center gap-2 scroll-x-hidden pb-1">
        {/* Mode toggles */}
        <FilterPill
          label="⚡ Exam Mode"
          active={filters.examMode}
          onClick={() => updateFilter('examMode', !filters.examMode)}
        />
        <FilterPill
          label="✓ Verified"
          active={filters.verifiedOnly}
          onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
        />

        <div className="h-4 w-px bg-white/10 flex-shrink-0" />

        {/* Subject pills */}
        {subjects.map((s) => (
          <FilterPill
            key={s}
            label={s}
            active={filters.subject === s}
            onClick={() => updateFilter('subject', filters.subject === s ? '' : s)}
          />
        ))}

        {subjects.length > 0 && semesters.length > 0 && (
          <div className="h-4 w-px bg-white/10 flex-shrink-0" />
        )}

        {/* Semester pills */}
        {semesters.map((sem) => (
          <FilterPill
            key={sem}
            label={sem}
            active={filters.semester === sem}
            onClick={() => updateFilter('semester', filters.semester === sem ? '' : sem)}
          />
        ))}

        {semesters.length > 0 && fileTypes.length > 0 && (
          <div className="h-4 w-px bg-white/10 flex-shrink-0" />
        )}

        {/* File type pills */}
        {fileTypes.map((ft) => (
          <FilterPill
            key={ft}
            label={fileTypeLabels[ft] ?? ft.toUpperCase()}
            active={filters.fileType === ft}
            onClick={() => updateFilter('fileType', filters.fileType === ft ? '' : ft)}
          />
        ))}

        {/* Clear all */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-400 border border-red-400/20 bg-red-400/05 hover:bg-red-400/10 transition-all ml-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeFilterCount})
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
