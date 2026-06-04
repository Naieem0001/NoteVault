import { motion, type Variants } from 'framer-motion';
import { UploadForm } from '../components/upload/UploadForm';
import { ArrowLeft, CloudUpload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

export function UploadPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full flex flex-col bg-[#0a0a0a]"
    >
      {/* Page header */}
      <div className="px-6 py-6 md:px-10 bg-[#111111] border-b border-[#222222] sticky top-0 z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-[#222222] transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-white leading-tight font-display">
              Contribute a Note
            </h1>
            <p className="text-sm text-gray-400">
              Create and publish a new note to the vault
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold text-gray-300 bg-[#1a1a1a] border border-[#333333] hover:bg-[#222222] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="upload-form"
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7c3aed] hover:bg-[#6d28d9] shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 transition-all"
          >
            <CloudUpload className="w-4 h-4" />
            Publish Item
          </button>
        </div>
      </div>

      {/* Main content - 2 columns */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        <UploadForm />
      </div>
    </motion.div>
  );
}
