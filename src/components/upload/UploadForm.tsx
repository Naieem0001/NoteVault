import { useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { Upload, Loader2, X, Check } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { DropZone } from './DropZone';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const EASE_OUT: Easing = 'easeOut';

const FIELD_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: EASE_OUT },
  }),
};

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    displayName: '',
    subject: '',
    uploaderName: '',
    semester: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const { state, upload, reset } = useUpload();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 6) {
        setTags((prev) => [...prev, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!file) nextErrors.file = 'Please select a file first.';
    if (!form.displayName) nextErrors.displayName = 'Please provide a title.';
    if (!form.subject) nextErrors.subject = 'Please provide a subject.';
    if (!form.uploaderName) nextErrors.uploaderName = 'Please provide your name.';
    if (!form.semester) nextErrors.semester = 'Please provide the semester.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    const success = await upload(file!, { ...form, tags });

    if (success) {
      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#06b6d4', '#ec4899', '#ffffff'],
        disableForReducedMotion: true,
      });
      toast.success('File uploaded successfully!');
      setTimeout(() => {
        setIsSuccess(false);
        setFile(null);
        setTags([]);
        setTagInput('');
        setForm({ displayName: '', subject: '', uploaderName: '', semester: '', description: '' });
        reset();
      }, 2500);
    } else {
      toast.error(state.error ?? 'Upload failed');
    }
  };

  const isLoading = ['validating', 'uploading', 'inserting'].includes(state.status);

  const fields = [
    { key: 'displayName', label: 'File Title', placeholder: 'Data Structures Notes', required: true },
    { key: 'subject', label: 'Subject', placeholder: 'Data Structures and Algorithms', required: true },
    { key: 'uploaderName', label: 'Your Name', placeholder: 'Rahul Sharma', required: true },
    { key: 'semester', label: 'Semester', placeholder: '3rd Semester', required: true },
  ] as const;

  const labelStyle = {
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
  };

  return (
    <motion.form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Drop zone */}
      <motion.div custom={0} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block mb-2.5" style={labelStyle}>
          File <span style={{ color: '#f87171' }}>*</span>
        </label>
        <DropZone onFileAccepted={setFile} acceptedFile={file} onRemove={() => setFile(null)} />
        {errors.file && (
          <p className="text-xs mt-2 font-semibold" style={{ color: '#f87171' }}>{errors.file}</p>
        )}
      </motion.div>

      {/* Text fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f, i) => (
          <motion.div key={f.key} custom={i + 1} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label htmlFor={f.key} className="block mb-2" style={labelStyle}>
              {f.label} <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id={f.key}
              type="text"
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              required={f.required}
              className="input-glass w-full px-4 py-3 text-base"
            />
            {errors[f.key] && (
              <p className="text-[10px] mt-1.5 font-semibold" style={{ color: '#f87171' }}>{errors[f.key]}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <motion.div custom={5} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block mb-2" style={labelStyle}>
          <span>Description</span>
          <span className="ml-2" style={{ color: 'var(--text-muted)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>— Optional</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the content..."
          rows={3}
          className="input-glass w-full px-4 py-3 text-base resize-none"
        />
      </motion.div>

      {/* Tags */}
      <motion.div custom={6} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block mb-2" style={labelStyle}>
          <span>Tags</span>
          <span className="ml-2" style={{ color: 'var(--text-muted)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>— Optional</span>
        </label>
        <div
          className="w-full rounded-[10px] px-4 py-2 flex flex-wrap gap-2 min-h-[48px] items-center transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-default)' }}
        >
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(124,58,237,0.18)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 opacity-70 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={tags.length === 0 ? 'Type tag and press Enter…' : ''}
            className="flex-1 bg-transparent outline-none text-base min-w-[150px]"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </motion.div>

      {/* Progress bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                  {state.status === 'validating' && 'Validating…'}
                  {state.status === 'uploading' && 'Uploading…'}
                  {state.status === 'inserting' && 'Finalizing…'}
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{state.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        custom={7}
        variants={FIELD_VARIANTS}
        initial="hidden"
        animate="visible"
        whileHover={!isLoading && !isSuccess ? { scale: 1.02 } : {}}
        whileTap={!isLoading && !isSuccess ? { scale: 0.97 } : {}}
        type="submit"
        disabled={isLoading || isSuccess}
        className={`w-full mt-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
          isSuccess ? '' : 'btn-brand'
        }`}
        style={
          isSuccess
            ? { background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }
            : {}
        }
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 12 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" /> Uploaded!
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing…
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload File
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.form>
  );
}
