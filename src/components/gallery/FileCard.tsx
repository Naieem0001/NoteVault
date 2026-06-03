import { motion } from 'framer-motion';
import {
  Download, Copy, Check, FileText, Presentation,
  File, Calendar, User, GraduationCap, BookOpen, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { type Submission, supabase } from '../../lib/supabase';
import { formatFileSize, getFileTypeColor, getSubjectColor } from '../../lib/validators';
import { toast } from 'sonner';

interface FileCardProps {
  submission: Submission;
  isNew?: boolean;
  index?: number;
}

function FileTypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = `w-5 h-5 ${className ?? ''}`;
  if (type === 'pdf') return <FileText className={cls} />;
  if (type === 'pptx' || type === 'ppt') return <Presentation className={cls} />;
  return <File className={cls} />;
}

export function FileCard({ submission, isNew = false, index = 0 }: FileCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const ftColor = getFileTypeColor(submission.file_type);
  const subjectColor = getSubjectColor(submission.subject);

  const handleDownload = async () => {
    try {
      // Increment download count
      await supabase
        .from('submissions')
        .update({ download_count: submission.download_count + 1 })
        .eq('id', submission.id);

      // Trigger download
      const a = document.createElement('a');
      a.href = submission.public_url;
      a.download = submission.file_name;
      a.target = '_blank';
      a.click();
      toast.success('Download started!');
    } catch {
      // Still attempt download even if count update fails
      window.open(submission.public_url, '_blank');
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(submission.public_url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const relativeTime = formatDistanceToNow(new Date(submission.uploaded_at), { addSuffix: true });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl glass border border-white/[0.08] p-5 flex flex-col gap-4 cursor-default transition-shadow duration-300 hover:shadow-card-hover hover:border-brand-500/30"
    >
      {/* NEW badge */}
      {isNew && (
        <span className="new-badge absolute -top-2 -right-2 badge bg-brand-500/90 text-white text-[0.65rem] px-2.5 py-0.5 z-10">
          ✦ NEW
        </span>
      )}

      {/* Verified badge */}
      {submission.is_verified && (
        <span className="absolute top-3 left-3 badge text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 text-[0.65rem]">
          ✓ Verified
        </span>
      )}

      {/* Header row */}
      <div className={`flex items-start gap-3 ${submission.is_verified ? 'mt-5' : ''}`}>
        {/* File type icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${ftColor}`}>
          <FileTypeIcon type={submission.file_type} />
        </div>

        {/* Title + subject */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors">
            {submission.display_name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`badge border text-[0.68rem] ${subjectColor}`}>
              <BookOpen className="w-3 h-3" />
              {submission.subject}
            </span>
            <span className={`badge border text-[0.68rem] ${ftColor}`}>
              {submission.file_type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-col gap-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            {submission.uploader_name}
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            {submission.semester}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {relativeTime}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">{formatFileSize(submission.file_size)}</span>
            <span className="flex items-center gap-1 text-aurora-teal/80">
              <Download className="w-3 h-3" />
              {submission.download_count}
            </span>
          </div>
        </div>
      </div>

      {/* Description (expandable) */}
      {submission.description && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide' : 'Show'} description
          </button>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-slate-400 mt-2 leading-relaxed bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06]"
            >
              {submission.description}
            </motion.p>
          )}
        </div>
      )}

      {/* Tags */}
      {submission.tags && submission.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {submission.tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.68rem] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/15"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1 border-t border-white/[0.06]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="flex-1 btn-brand flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCopyLink}
          className="btn-glass flex items-center justify-center p-2 rounded-xl"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
