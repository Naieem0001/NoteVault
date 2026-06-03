import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Upload, Shield, Command } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchResult {
  id: string;
  display_name: string;
  subject: string;
  file_type: string;
  type: 'file' | 'nav';
  path?: string;
}

const NAV_ITEMS: SearchResult[] = [
  { id: 'nav-home', display_name: 'Go to Gallery', subject: 'Navigation', file_type: 'app', type: 'nav', path: '/' },
  { id: 'nav-upload', display_name: 'Upload File', subject: 'Navigation', file_type: 'app', type: 'nav', path: '/upload' },
  { id: 'nav-admin', display_name: 'Admin Dashboard', subject: 'Navigation', file_type: 'app', type: 'nav', path: '/admin' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
    if (!query) {
      setResults(NAV_ITEMS);
      return;
    }
    const search = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('id, display_name, subject, file_type')
        .ilike('display_name', `%${query}%`)
        .limit(5);
        
      const navMatches = NAV_ITEMS.filter(n => n.display_name.toLowerCase().includes(query.toLowerCase()));
      
      const combined = [
        ...navMatches,
        ...(data ? data.map(d => ({ ...d, type: 'file' as const })) : [])
      ];
      setResults(combined);
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'nav' && item.path) {
      navigate(item.path);
    } else {
      // For files, we might want to navigate to a viewer or trigger download, 
      // but for now we just close as there's no dedicated file page
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
      scrollIntoView(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      scrollIntoView(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const scrollIntoView = (index: number) => {
    const safeIndex = (index + results.length) % results.length;
    const element = document.getElementById(`cmd-item-${safeIndex}`);
    if (element && listRef.current) {
      element.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-xl glass-strong shadow-2xl shadow-brand-500/10 overflow-hidden rounded-2xl border border-white/[0.15]"
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.1] bg-white/[0.02]">
            <Search className="w-5 h-5 text-brand-400" />
            <input
              autoFocus
              placeholder="Search files, navigate, or run commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-base"
            />
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-black/40 px-2 py-1 rounded-md border border-white/10">
              ESC
            </div>
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    id={`cmd-item-${i}`}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      selectedIndex === i
                        ? 'bg-brand-500/20 shadow-glow-sm border border-brand-500/30'
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedIndex === i ? 'bg-brand-500/30 text-brand-300' : 'bg-white/5 text-zinc-400'}`}>
                      {r.type === 'nav' && r.id === 'nav-home' && <Command className="w-4 h-4" />}
                      {r.type === 'nav' && r.id === 'nav-upload' && <Upload className="w-4 h-4" />}
                      {r.type === 'nav' && r.id === 'nav-admin' && <Shield className="w-4 h-4" />}
                      {r.type === 'file' && <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`text-sm font-semibold truncate ${selectedIndex === i ? 'text-white' : 'text-zinc-300'}`}>
                        {r.display_name}
                      </span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        {r.subject} {r.type === 'file' ? `• ${r.file_type}` : ''}
                      </span>
                    </div>
                    {selectedIndex === i && (
                      <span className="text-[10px] text-brand-300 uppercase tracking-wider font-bold pr-2">Enter</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                <Search className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-sm font-semibold text-zinc-400">No results found for "{query}"</p>
                <p className="text-xs text-zinc-500 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
