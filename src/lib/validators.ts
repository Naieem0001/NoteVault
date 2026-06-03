export const ALLOWED_TYPES: Record<string, string> = {
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES[file.type]) {
    return {
      valid: false,
      error: `File type not allowed. Please upload PPT, PPTX, PDF, DOC, or DOCX files.`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 50 MB.`,
    };
  }
  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileType(mimeType: string): string {
  return ALLOWED_TYPES[mimeType] || 'file';
}

export function getFileTypeColor(fileType: string): string {
  const map: Record<string, string> = {
    pptx: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    ppt:  'text-orange-400 bg-orange-400/10 border-orange-400/20',
    pdf:  'text-red-400 bg-red-400/10 border-red-400/20',
    docx: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    doc:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };
  return map[fileType] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function getSubjectColor(subject: string): string {
  const colors = [
    'text-violet-400 bg-violet-400/10 border-violet-400/20',
    'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'text-teal-400 bg-teal-400/10 border-teal-400/20',
    'text-rose-400 bg-rose-400/10 border-rose-400/20',
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
