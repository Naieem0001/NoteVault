import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle } from 'lucide-react';
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
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/05 p-6 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <CheckCircle className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 text-sm truncate">{acceptedFile.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(acceptedFile.size)}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Wrap with a plain div from getRootProps, then animate an inner div */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/08 shadow-glow-sm scale-[1.02]'
            : 'border-white/15 hover:border-brand-500/50 hover:bg-white/[0.02]'
        }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                <Upload className="w-7 h-7 text-brand-400 animate-bounce" />
              </div>
              <p className="text-brand-300 font-semibold">Drop it here!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Upload className="w-8 h-8 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">
                  Drag &amp; drop your file here
                </p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['PDF', 'PPTX', 'PPT', 'DOCX', 'DOC'].map((t) => (
                  <span key={t} className="text-[0.7rem] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600">Maximum file size: 50 MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-2 px-1"
        >
          ⚠ {error}
        </motion.p>
      )}
    </div>
  );
}
