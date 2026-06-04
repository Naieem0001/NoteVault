import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, CheckCircle, Tag, FileText } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { DropZone } from './DropZone';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { formatFileSize } from '../../lib/validators';

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
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success('File published successfully!');
      setTimeout(() => {
        setFile(null);
        setTags([]);
        setForm({ displayName: '', subject: '', uploaderName: '', semester: '', description: '' });
        reset();
      }, 2500);
    } else {
      toast.error(state.error ?? 'Upload failed');
    }
  };

  const isLoading = ['validating', 'uploading', 'inserting'].includes(state.status);
  const isSuccess = state.status === 'success';

  return (
    <form id="upload-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column - Media */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Product Media Card */}
        <div className="bg-[#111111] rounded-2xl border border-[#222222] shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222222]">
            <h2 className="text-base font-bold text-white">File Media</h2>
          </div>
          <div className="p-6">
            <DropZone onFileAccepted={setFile} />
            {errors.file && <p className="text-xs mt-2 font-bold text-red-500">{errors.file}</p>}
          </div>
        </div>

        {/* Uploaded Files Card */}
        <div className="bg-[#111111] rounded-2xl border border-[#222222] shadow-xl overflow-hidden min-h-[140px]">
          <div className="px-6 py-4 border-b border-[#222222]">
            <h2 className="text-base font-bold text-white">Selected File</h2>
          </div>
          <div className="p-6">
            <AnimatePresence mode="popLayout">
              {file ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[#333333] bg-[#1a1a1a]"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[#a78bfa]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate mb-1">{file.name}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#333333] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#7c3aed] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: isLoading ? `${state.progress}%` : '100%' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : isLoading ? (
                      <Loader2 className="w-5 h-5 text-[#a78bfa] animate-spin" />
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => setFile(null)} 
                        className="p-1.5 rounded-md hover:bg-[#333333] text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6 text-gray-600 text-sm font-medium">
                  No file selected yet
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Right Column - Form */}
      <div className="lg:col-span-7 bg-[#111111] rounded-2xl border border-[#222222] shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222222]">
          <h2 className="text-base font-bold text-white">File Information</h2>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          {/* File Name */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-400">File Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g. Data Structures Notes"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#333333] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
            />
            {errors.displayName && <p className="text-[10px] mt-1 text-red-500 font-bold">{errors.displayName}</p>}
          </div>

          {/* Subject & Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-400">Category (Subject)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#333333] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-400">Subcategory (Semester)</label>
              <input
                type="text"
                value={form.semester}
                onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
                placeholder="Semester"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#333333] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-400">Author Name</label>
            <input
              type="text"
              value={form.uploaderName}
              onChange={(e) => setForm((prev) => ({ ...prev, uploaderName: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#333333] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-400">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a detailed description of the file contents..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#333333] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-400">Tags</label>
            <div className="w-full rounded-xl bg-[#0a0a0a] border border-[#333333] p-2 min-h-[46px] flex flex-wrap gap-2 items-center focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed] transition-all">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-2 py-1 text-white placeholder-gray-600"
              />
            </div>
          </div>
          
        </div>
      </div>
    </form>
  );
}
