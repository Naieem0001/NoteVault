import { motion } from 'framer-motion';
import {
  Download, Copy, Check, FileText, Presentation, File
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { type Submission, supabase } from '../../lib/supabase';
import { formatFileSize } from '../../lib/validators';
import { toast } from 'sonner';

interface FileCardProps {
  submission: Submission;
  isNew?: boolean;
  index?: number;
}

function FileTypeIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className="w-5 h-5" />;
  if (type === 'pptx' || type === 'ppt') return <Presentation className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

const FILE_TYPE_CONFIG: Record<string, { accent: string; iconBg: string; iconColor: string; glow: string }> = {
  pdf:  { accent: 'card-accent-pdf',  iconBg: 'rgba(6,182,212,0.15)',   iconColor: '#06b6d4', glow: 'var(--shadow-glow-teal)' },
  pptx: { accent: 'card-accent-pptx', iconBg: 'rgba(139,92,246,0.15)',  iconColor: '#a78bfa', glow: 'var(--shadow-glow-sm)' },
  ppt:  { accent: 'card-accent-ppt',  iconBg: 'rgba(139,92,246,0.15)',  iconColor: '#a78bfa', glow: 'var(--shadow-glow-sm)' },
  docx: { accent: 'card-accent-docx', iconBg: 'rgba(236,72,153,0.15)',  iconColor: '#ec4899', glow: 'var(--shadow-glow-pink)' },
  doc:  { accent: 'card-accent-doc',  iconBg: 'rgba(236,72,153,0.15)',  iconColor: '#ec4899', glow: 'var(--shadow-glow-pink)' },
};

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
  'linear-gradient(135deg,#ec4899,#be185d)',
  'linear-gradient(135deg,#f59e0b,#b45309)',
  'linear-gradient(135deg,#10b981,#047857)',
];

function getAvatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

export function FileCard({ submission, isNew = false, index = 0 }: FileCardProps) {
  const [copied, setCopied] = useState(false);

  const cfg = FILE_TYPE_CONFIG[submission.file_type] ?? {
    accent: 'card-accent-default', iconBg: 'rgba(255,255,255,0.08)', iconColor: 'var(--text-secondary)', glow: 'none',
  };

  const handleDownload = async () => {
    try {
      await supabase
        .from('submissions')
        .update({ download_count: submission.download_count + 1 })
        .eq('id', submission.id);
      const a = document.createElement('a');
      a.href = submission.public_url;
      a.download = submission.file_name;
      a.target = '_blank';
      a.click();
      toast.success('Download started');
    } catch {
      window.open(submission.public_url, '_blank');
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(submission.public_url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const relativeTime = formatDistanceToNow(new Date(submission.uploaded_at), { addSuffix: true });
  const initials = getInitials(submission.uploader_name || 'A');
  const avatarGradient = getAvatarGradient(submission.uploader_name || 'A');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93, y: 10 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28, delay: index * 0.045 }}
      whileHover={{ y: -4 }}
      className={`group relative glass flex flex-col overflow-hidden ${cfg.accent} cursor-pointer`}
      style={{ boxShadow: 'var(--shadow-card)', borderRadius: '16px' }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 8px 32px rgba(124,58,237,0.25)' }}
      />

      {/* New badge */}
      {isNew && (
        <span
          className="absolute top-3.5 right-3.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10"
          style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)', animation: 'pulseGlow 2s ease-in-out infinite' }}
        >
          NEW
        </span>
      )}

      <div className="p-4 md:p-5 flex flex-col gap-4 flex-1">
        {/* Header: icon + title */}
        <div className="flex items-start gap-3.5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 4 }}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: cfg.iconBg, color: cfg.iconColor, boxShadow: cfg.glow }}
          >
            <FileTypeIcon type={submission.file_type} />
          </motion.div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {submission.display_name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.iconBg, color: cfg.iconColor, border: `1px solid ${cfg.iconColor}30` }}
              >
                {submission.file_type.toUpperCase()}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
              >
                {submission.subject}
              </span>
              {submission.is_verified && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2.5">
          {/* Uploader row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm"
                style={{ background: avatarGradient }}
              >
                {initials}
              </div>
              <span className="text-xs font-medium truncate max-w-[110px]" style={{ color: 'var(--text-secondary)' }}>
                {submission.uploader_name}
              </span>
            </div>
            <span
              className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              {submission.semester}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{relativeTime}</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {formatFileSize(submission.file_size)}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#a78bfa' }}>
                <Download className="w-3 h-3" />
                {submission.download_count}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="flex-1 btn-brand flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
            aria-label={`Download ${submission.display_name}`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleCopyLink}
            className="px-3 py-2.5 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            title="Copy link"
            aria-label={`Copy link for ${submission.display_name}`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
