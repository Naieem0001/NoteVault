import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { FileX, Inbox, ArrowRight, Mic, Upload, PlayCircle, Settings, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubmissions } from '../hooks/useSubmissions';
import { useFilters } from '../hooks/useFilters';
import { FileCard } from '../components/gallery/FileCard';
import { FilterBar } from '../components/gallery/FilterBar';
import { SkeletonGrid } from '../components/gallery/SkeletonCard';

const LAST_VISIT_KEY = 'notevault_last_visit';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export function GalleryPage() {
  const { data: submissions = [], isLoading, isError } = useSubmissions();
  const {
    filters, updateFilter, clearFilters,
    filtered, subjects, semesters, fileTypes, activeFilterCount,
  } = useFilters(submissions);

  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const groupedFiles = filtered.reduce((acc, file) => {
    const date = new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(file);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full flex flex-col"
    >
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Top Search Bar */}
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            ref={searchRef}
            type="text" 
            placeholder="Search for notes..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-[#1a1a1a] md:bg-[#111111] border border-[#333333] md:border-[#222222] rounded-full py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all shadow-sm"
          />
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
            Hi there, how may I help you?
          </h1>
        </div>

        {/* Action Cards Grid (Responsive 3-col on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[240px]">
          {/* Left tall card (takes 2 cols on desktop) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative rounded-3xl p-8 flex flex-col cursor-pointer overflow-hidden md:col-span-2 border border-white/10"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
            onClick={scrollToList}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/20 flex items-center justify-center mb-6 relative z-10">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white text-2xl md:text-3xl leading-tight mb-2 relative z-10">Browse<br/>Notes</h3>
            
            <button className="mt-auto bg-white hover:bg-gray-100 text-[#7c3aed] text-sm font-bold py-3 px-6 rounded-full w-max transition-colors relative z-10 shadow-lg">
              Browse now
            </button>
          </motion.div>

          {/* Right stacked cards (takes 1 col on desktop) */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-3xl p-6 flex items-center justify-between cursor-pointer border border-white/10"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}
              onClick={() => navigate('/upload')}
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full border border-white/20 bg-white/20 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-base">Upload note</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-3xl p-6 flex items-center justify-between cursor-pointer border border-white/10"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' }}
              onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full border border-white/20 bg-white/20 flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-base">Verified</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80" />
            </motion.div>
          </div>
        </div>

        {/* Filter Pills */}
        <FilterBar
          filters={filters}
          subjects={subjects}
          semesters={semesters}
          fileTypes={fileTypes}
          activeFilterCount={activeFilterCount}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
        />

        {/* Recent Notes List */}
        <div className="flex flex-col gap-6 pb-12" ref={listRef}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Recent Notes
            </h2>
            {filtered.length > 0 && (
              <button className="text-[#a78bfa] text-sm font-bold hover:text-white transition-colors" onClick={clearFilters}>
                See all
              </button>
            )}
          </div>

          {isLoading ? (
            <SkeletonGrid count={3} />
          ) : isError ? (
            <div className="text-center py-10">
              <FileX className="w-8 h-8 mx-auto text-red-500 mb-3" />
              <p className="font-bold text-white">Failed to load files</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#111111] rounded-3xl border border-dashed border-[#333333]">
              <Inbox className="w-10 h-10 mx-auto text-gray-600 mb-4" />
              <p className="font-bold text-white mb-1">No notes found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="show" className="flex flex-col gap-8">
              <AnimatePresence mode="popLayout">
                {Object.entries(groupedFiles).map(([date, files]) => (
                  <div key={date} className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">
                      {date}
                    </h4>
                    {/* Desktop grid for horizontal cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {files.map((submission, index) => (
                        <FileCard 
                          key={submission.id}
                          submission={submission}
                          isNew={isNew(submission.uploaded_at)}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
