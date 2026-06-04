import { motion } from 'framer-motion';
import { Download, Copy, Check, File as FileIcon, Folder } from 'lucide-react';
import { useState } from 'react';
import { type Submission, supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface FileCardProps {
  submission: Submission;
  isNew?: boolean;
  index?: number;
}

const FILE_TYPE_CONFIG: Record<string, { color: string }> = {
  pdf:  { color: '#06b6d4' },
  pptx: { color: '#8b5cf6' },
  ppt:  { color: '#8b5cf6' },
  docx: { color: '#ec4899' },
  doc:  { color: '#ec4899' },
};

export function FileCard({ submission, isNew = false, index = 0 }: FileCardProps) {
  const [copied, setCopied] = useState(false);
  const cfg = FILE_TYPE_CONFIG[submission.file_type] ?? { color: 'var(--brand)' };

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-[#111111]/80 backdrop-blur-md border border-[#222222] rounded-2xl p-5 w-full flex flex-col sm:flex-row sm:items-center gap-4 relative transition-all duration-300 hover:bg-[#151515] hover:border-[#333333] overflow-hidden group shadow-lg"
    >
      {/* Subtle left glowing border based on file type */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: cfg.color, boxShadow: `0 0 10px ${cfg.color}` }}
      />

      {/* Left side: Icon and Title */}
      <div className="flex flex-1 items-center gap-4 pl-2 min-w-0">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
        >
          <FileIcon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-white group-hover:text-gray-50 transition-colors truncate mb-1.5">
            {submission.display_name}
          </h3>
          
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#1a1a1a] text-gray-300 border border-[#222222] flex items-center gap-1">
              <Folder className="w-3 h-3" />
              {submission.subject}
            </span>
            
            {isNew && (
              <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-1.5 py-0.5 rounded border border-[#10b981]/20">
                New
              </span>
            )}
            {submission.is_verified && (
              <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded border border-[#10b981]/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 pl-2 sm:pl-0 sm:ml-auto">
        <button 
          onClick={handleCopyLink}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#222222] hover:bg-[#222222] hover:border-[#333333] transition-all text-gray-400 hover:text-white"
          title="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <button 
          onClick={handleDownload}
          className="h-10 px-6 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95 bg-[#7c3aed] hover:bg-[#6d28d9] shadow-[0_0_12px_rgba(124,58,237,0.2)] hover:shadow-[0_0_16px_rgba(124,58,237,0.4)] flex items-center gap-2 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </motion.div>
  );
}
