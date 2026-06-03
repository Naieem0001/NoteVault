import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { type Submission } from '../lib/supabase';

export type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'downloads';

export interface FilterState {
  search: string;
  subject: string;
  semester: string;
  fileType: string;
  sort: SortKey;
  examMode: boolean;
  verifiedOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  subject: '',
  semester: '',
  fileType: '',
  sort: 'newest',
  examMode: false,
  verifiedOnly: false,
};

export function useFilters(submissions: Submission[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // Derived unique values for filter dropdowns
  const subjects = useMemo(
    () => [...new Set(submissions.map((s) => s.subject))].sort(),
    [submissions]
  );
  const semesters = useMemo(
    () => [...new Set(submissions.map((s) => s.semester))].sort(),
    [submissions]
  );
  const fileTypes = useMemo(
    () => [...new Set(submissions.map((s) => s.file_type))].sort(),
    [submissions]
  );

  const fuse = useMemo(
    () =>
      new Fuse(submissions, {
        keys: ['display_name', 'file_name', 'uploader_name', 'subject', 'semester', 'description'],
        threshold: 0.35,
        includeScore: true,
      }),
    [submissions]
  );

  const filtered = useMemo(() => {
    let result = submissions;

    // Fuzzy search
    if (filters.search.trim()) {
      result = fuse.search(filters.search).map((r) => r.item);
    }

    // Filter passes
    if (filters.subject) result = result.filter((s) => s.subject === filters.subject);
    if (filters.semester) result = result.filter((s) => s.semester === filters.semester);
    if (filters.fileType) result = result.filter((s) => s.file_type === filters.fileType);
    if (filters.examMode || filters.verifiedOnly) result = result.filter((s) => s.is_verified);

    // Sort
    const sorted = [...result];
    switch (filters.sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
        break;
      case 'az':
        sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
        break;
      case 'za':
        sorted.sort((a, b) => b.display_name.localeCompare(a.display_name));
        break;
      case 'downloads':
        sorted.sort((a, b) => b.download_count - a.download_count);
        break;
    }

    return sorted;
  }, [submissions, filters, fuse]);

  const activeFilterCount = useMemo(
    () =>
      [filters.subject, filters.semester, filters.fileType, filters.examMode, filters.verifiedOnly]
        .filter(Boolean).length,
    [filters]
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    filtered,
    subjects,
    semesters,
    fileTypes,
    activeFilterCount,
  };
}
