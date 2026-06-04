import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from 'lucide-react';
import { validateFile } from '../../lib/validators';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
}

export function DropZone({ onFileAccepted }: DropZoneProps) {
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

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        {...getRootProps()}
        className={`w-full flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          isDragActive 
            ? 'border-[#7c3aed] bg-[#7c3aed]/10' 
            : 'border-[#333333] bg-[#0a0a0a] hover:border-[#7c3aed]/50 hover:bg-[#111111]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mb-4 border border-[#7c3aed]/20">
          <CloudUpload className="w-6 h-6 text-[#a78bfa]" />
        </div>
        <p className="text-sm font-bold text-white mb-1">
          Drop your files here
        </p>
        <p className="text-sm text-gray-400 mb-4">
          or <span className="text-[#a78bfa] font-bold">click to browse</span>
        </p>
        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
          PDF, PPTX, DOCX up to 50MB
        </p>
      </div>

      {error && (
        <p className="text-xs font-bold text-red-500 mt-3">{error}</p>
      )}
    </div>
  );
}
