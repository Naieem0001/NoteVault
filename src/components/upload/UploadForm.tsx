import { useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { Upload, Loader2, X } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { DropZone } from './DropZone';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const EASE_OUT: Easing = 'easeOut';

const FIELD_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: EASE_OUT },
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
    if (!file) { toast.error('Please select a file first.'); return; }
    if (!form.displayName || !form.subject || !form.uploaderName || !form.semester) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const success = await upload(file, { ...form, tags });

    if (success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#06b6d4', '#a78bfa', '#ec4899', '#ffffff'],
      });
      toast.success('File uploaded successfully! 🎉 It will appear in the gallery shortly.');
      // Reset form
      setFile(null);
      setTags([]);
      setTagInput('');
      setForm({ displayName: '', subject: '', uploaderName: '', semester: '', description: '' });
      setTimeout(reset, 1500);
    } else {
      toast.error(state.error ?? 'Upload failed. Please try again.');
    }
  };

  const isLoading = ['validating', 'uploading', 'inserting'].includes(state.status);

  const fields = [
    { key: 'displayName', label: 'File Title *', placeholder: 'e.g. Data Structures Unit 2 Notes', required: true },
    { key: 'subject', label: 'Subject *', placeholder: 'e.g. Data Structures and Algorithms', required: true },
    { key: 'uploaderName', label: 'Your Name *', placeholder: 'e.g. Rahul Sharma', required: true },
    { key: 'semester', label: 'Semester *', placeholder: 'e.g. 3rd Semester, 5th Sem', required: true },
  ] as const;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Drop zone */}
      <motion.div custom={0} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          File *
        </label>
        <DropZone
          onFileAccepted={setFile}
          acceptedFile={file}
          onRemove={() => setFile(null)}
        />
      </motion.div>

      {/* Text fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f, i) => (
          <motion.div key={f.key} custom={i + 1} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {f.label}
            </label>
            <input
              type="text"
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              required={f.required}
              className="input-glass w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <motion.div custom={5} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Description <span className="text-slate-600 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the content, topics covered, etc."
          rows={3}
          className="input-glass w-full px-4 py-2.5 rounded-xl text-sm resize-none"
        />
      </motion.div>

      {/* Tags */}
      <motion.div custom={6} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Tags <span className="text-slate-600 normal-case font-normal">(optional, press Enter or comma to add)</span>
        </label>
        <div className="input-glass rounded-xl px-4 py-2.5 flex flex-wrap gap-2 min-h-[46px] items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs bg-brand-500/15 text-brand-300 border border-brand-500/25 rounded-full px-2.5 py-0.5"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={tags.length === 0 ? 'unit-2, important, pyqs…' : ''}
            className="flex-1 bg-transparent outline-none text-sm text-slate-300 placeholder:text-slate-600 min-w-[100px]"
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
            <div className="glass rounded-xl p-4 border border-brand-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300 font-medium">
                  {state.status === 'validating' && 'Validating file…'}
                  {state.status === 'uploading' && 'Uploading to cloud…'}
                  {state.status === 'inserting' && 'Saving metadata…'}
                </span>
                <span className="text-sm text-brand-400 font-semibold">{state.progress}%</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-aurora-teal rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        custom={7}
        variants={FIELD_VARIANTS}
        initial="hidden"
        animate="visible"
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
        type="submit"
        disabled={isLoading}
        className="btn-brand w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload File
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
