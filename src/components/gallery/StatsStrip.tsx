import { motion, useSpring, useTransform } from 'framer-motion';
import { Files, BookOpen, Sparkles, Download } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { type Submission } from '../../lib/supabase';

interface StatsStripProps {
  submissions: Submission[];
  filteredCount: number;
  isLive?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
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
    { icon: Files, label: 'Files', value: filteredCount, suffix: submissions.length !== filteredCount ? ` / ${submissions.length}` : '' },
    { icon: BookOpen, label: 'Subjects', value: stats.subjects },
    { icon: Sparkles, label: 'New Today', value: stats.newToday, accent: true },
    { icon: Download, label: 'Downloads', value: stats.totalDownloads },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Live indicator */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 mr-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <span className="live-dot" />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sub-text)' }}>Live</span>
        </motion.div>
      )}

      {items.map((item, i) => (
        <div key={item.label} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <item.icon className="w-3.5 h-3.5" style={{ color: item.accent ? 'var(--brand)' : 'var(--text-muted)' }} />
            <span className="text-sm font-bold" style={{ color: item.accent && item.value > 0 ? 'var(--brand)' : 'var(--heading)' }}>
              <AnimatedNumber value={item.value} />
              {item.suffix && <span style={{ color: 'var(--text-muted)' }} className="font-medium">{item.suffix}</span>}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
