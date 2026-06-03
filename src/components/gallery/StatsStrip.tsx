import { motion } from 'framer-motion';
import { Files, BookOpen, Sparkles, Download } from 'lucide-react';
import { useMemo } from 'react';
import { type Submission } from '../../lib/supabase';

interface StatsStripProps {
  submissions: Submission[];
  filteredCount: number;
  isLive?: boolean;
}

export function StatsStrip({ submissions, filteredCount, isLive = false }: StatsStripProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newToday = submissions.filter((s) => new Date(s.uploaded_at) >= todayStart).length;
    const subjects = new Set(submissions.map((s) => s.subject)).size;
    const totalDownloads = submissions.reduce((acc, s) => acc + s.download_count, 0);
    return { newToday, subjects, totalDownloads };
  }, [submissions]);

  const items = [
    { icon: Files, label: 'Files', value: filteredCount, suffix: submissions.length !== filteredCount ? `/ ${submissions.length}` : '' },
    { icon: BookOpen, label: 'Subjects', value: stats.subjects },
    { icon: Sparkles, label: 'New Today', value: stats.newToday, accent: true },
    { icon: Download, label: 'Downloads', value: stats.totalDownloads },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-white/[0.08] mr-2">
          <span className="live-dot" />
          <span className="text-xs text-slate-400 font-medium">Live</span>
        </div>
      )}

      {items.map((item, i) => (
        <div key={item.label}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-2"
          >
            <item.icon className={`w-3.5 h-3.5 ${item.accent ? 'text-brand-400' : 'text-slate-500'}`} />
            <span className={`text-sm font-semibold ${item.accent && item.value > 0 ? 'text-brand-400' : 'text-slate-200'}`}>
              {item.value.toLocaleString()}{item.suffix ? ` ${item.suffix}` : ''}
            </span>
            <span className="text-xs text-slate-500">{item.label}</span>
          </motion.div>
          {i < items.length - 1 && <span className="mx-2 text-slate-700 text-sm">·</span>}
        </div>
      ))}
    </div>
  );
}
