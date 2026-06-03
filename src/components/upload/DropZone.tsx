import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, FileText } from 'lucide-react';
import { formatFileSize, validateFile } from '../../lib/validators';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  acceptedFile: File | null;
  onRemove: () => void;
}

export function DropZone({ onFileAccepted, acceptedFile, onRemove }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      setError(null);
      if (!files[0]) return;
      const validation = validateFile(files[0]);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }
      onFileAccepted(files[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  if (acceptedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative rounded-2xl glass-strong border-2 border-emerald-500/40 p-6 flex items-center gap-4 shadow-[0_0_20px_rgba(52,211,153,0.15)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-glow-sm relative z-10">
          <FileText className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <p className="font-bold text-white text-base truncate">{acceptedFile.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-300">Ready • {formatFileSize(acceptedFile.size)}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(248,113,113,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-red-400 border border-transparent hover:border-red-400/30 transition-all relative z-10"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragActive
            ? 'bg-brand-500/10 shadow-[0_0_30px_rgba(124,58,237,0.25)]'
            : 'bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        {/* Animated Dashed Border using SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" xmlns="http://www.w3.org/2000/svg">
          <rect 
            width="100%" height="100%" rx="16" ry="16" 
            fill="none" 
            stroke={isDragActive ? '#a78bfa' : 'rgba(255,255,255,0.15)'} 
            strokeWidth="3" 
            strokeDasharray="10 10" 
            className={`transition-colors duration-300 ${isDragActive ? 'animate-[dash_1s_linear_infinite]' : ''}`}
          />
        </svg>

        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
        `}</style>

        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 relative z-10"
            >
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow-brand"
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-brand-300 font-bold text-lg tracking-wide">Drop it like it's hot!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 relative z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shadow-inner group-hover:bg-brand-500/10 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-400" />
              </div>
              <div>
                <p className="font-bold text-white text-base">
                  Drag &amp; drop your file here
                </p>
                <p className="text-sm text-slate-400 mt-1">or click to browse</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {['PDF', 'PPTX', 'DOCX'].map((t) => (
                  <span key={t} className="text-[0.7rem] px-3 py-1 rounded-full bg-black/20 border border-white/[0.05] text-slate-400 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-red-400 mt-3 px-2 flex items-center gap-1.5"
        >
          <X className="w-4 h-4 bg-red-400/20 rounded-full" /> {error}
        </motion.p>
      )}
    </div>
  );
}
