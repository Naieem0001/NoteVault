import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
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
  layoutIdPrefix
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  layoutIdPrefix: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap overflow-hidden"
      style={{ color: active ? '#fff' : 'var(--text-muted)' }}
    >
      {active && (
        <motion.div
          layoutId={`active-pill-${layoutIdPrefix}`}
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: active ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)', color: active ? '#fff' : 'var(--text-secondary)' }}>
          {count}
        </span>
      )}
    </button>
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
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
    <div className="flex flex-col gap-4 w-full">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search files... (Press /)"
            aria-label="Filter files"
            className="input-glass w-full pr-11 py-3 text-base shadow-sm"
            style={{ paddingLeft: '48px', background: 'var(--bg-2)' }}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort and Toggle */}
        <div className="flex gap-2 flex-shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 pointer-events-none" />
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value as SortKey)}
              aria-label="Sort files"
              className="input-glass pr-8 py-3 text-sm appearance-none cursor-pointer w-full font-medium"
              style={{ paddingLeft: '44px', background: 'var(--bg-2)' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#09090b] text-zinc-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="md:hidden input-glass px-4 py-3 flex items-center justify-center text-sm font-medium transition-colors"
            style={{ background: mobileFiltersOpen ? 'var(--brand)' : 'var(--bg-2)', color: mobileFiltersOpen ? '#fff' : 'var(--text-primary)' }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && !mobileFiltersOpen && (
              <span className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter pills row */}
      <div className={`${mobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-3 pb-2`}>
        {/* Mode toggles */}
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <FilterPill
            label="⚡ Exam Mode"
            active={filters.examMode}
            onClick={() => updateFilter('examMode', !filters.examMode)}
            layoutIdPrefix="mode1"
          />
          <FilterPill
            label="✓ Verified"
            active={filters.verifiedOnly}
            onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            layoutIdPrefix="mode2"
          />
        </div>

        {subjects.length > 0 && (
          <div className="flex gap-1 p-1 rounded-full scroll-x-hidden max-w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <FilterPill
              label="All Subjects"
              active={!filters.subject}
              onClick={() => updateFilter('subject', '')}
              layoutIdPrefix="subject"
            />
            {subjects.map((s) => (
              <FilterPill
                key={s}
                label={s}
                active={filters.subject === s}
                onClick={() => updateFilter('subject', s)}
                layoutIdPrefix="subject"
              />
            ))}
          </div>
        )}

        {semesters.length > 0 && (
          <div className="flex gap-1 p-1 rounded-full scroll-x-hidden max-w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <FilterPill
              label="All Semesters"
              active={!filters.semester}
              onClick={() => updateFilter('semester', '')}
              layoutIdPrefix="sem"
            />
            {semesters.map((sem) => (
              <FilterPill
                key={sem}
                label={sem}
                active={filters.semester === sem}
                onClick={() => updateFilter('semester', sem)}
                layoutIdPrefix="sem"
              />
            ))}
          </div>
        )}

        {fileTypes.length > 0 && (
          <div className="flex gap-1 p-1 rounded-full scroll-x-hidden max-w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <FilterPill
              label="All Types"
              active={!filters.fileType}
              onClick={() => updateFilter('fileType', '')}
              layoutIdPrefix="type"
            />
            {fileTypes.map((ft) => (
              <FilterPill
                key={ft}
                label={fileTypeLabels[ft] ?? ft.toUpperCase()}
                active={filters.fileType === ft}
                onClick={() => updateFilter('fileType', ft)}
                layoutIdPrefix="type"
              />
            ))}
          </div>
        )}

        {/* Clear all */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
