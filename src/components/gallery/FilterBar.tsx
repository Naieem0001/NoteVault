import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ArrowUpDown } from 'lucide-react';
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
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
  { label: 'Downloads', value: 'downloads' },
];

function FilterPill({
  label, active, onClick, count,
}: {
  label: string; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200"
      style={{
        background: active ? '#7c3aed' : '#111111',
        color: active ? '#ffffff' : '#9ca3af',
        border: `1px solid ${active ? '#7c3aed' : '#222222'}`
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: active ? 'rgba(255,255,255,0.2)' : '#222222' }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterBar({
  filters, subjects, semesters, fileTypes, activeFilterCount, updateFilter, clearFilters,
}: FilterBarProps) {
  if (activeFilterCount === 0 && !filters.search) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Search active indicator */}
      {filters.search && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111111] rounded-xl border border-[#222222]">
          <span className="text-[13px] font-semibold text-[#a78bfa]">
            Searching for "{filters.search}"
          </span>
          <button onClick={() => updateFilter('search', '')} className="text-[#a78bfa] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500 mr-1" />
        
        {/* Sort Select */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value as SortKey)}
            className="pl-8 pr-6 py-1.5 rounded-full text-[13px] font-semibold bg-[#111111] border border-[#222222] appearance-none text-gray-300 focus:outline-none focus:border-[#7c3aed]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Pills */}
        {subjects.map((s) => (
          <FilterPill
            key={s} label={s}
            active={filters.subject === s}
            onClick={() => updateFilter('subject', filters.subject === s ? '' : s)}
          />
        ))}
        {semesters.map((sem) => (
          <FilterPill
            key={sem} label={sem}
            active={filters.semester === sem}
            onClick={() => updateFilter('semester', filters.semester === sem ? '' : sem)}
          />
        ))}
        {fileTypes.map((ft) => (
          <FilterPill
            key={ft} label={ft.toUpperCase()}
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
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 hover:bg-red-900/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
