import { motion } from 'framer-motion';
import { UploadForm } from '../components/upload/UploadForm';
import { Upload, Shield, Zap, Eye } from 'lucide-react';

const TIPS = [
  { icon: Shield, text: 'Files are stored securely and accessible to all class members' },
  { icon: Eye, text: 'Uploaded files appear in the gallery in real-time' },
  { icon: Zap, text: 'Verified files are highlighted for exam prep' },
];

export function UploadPage() {
  return (
    <div className="page-wrapper">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-aurora-teal flex items-center justify-center mx-auto mb-5 shadow-glow-brand">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Share Your <span className="gradient-text">Notes</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Upload your study materials and help your classmates prepare better.
          </p>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {TIPS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="glass rounded-xl p-3.5 flex items-start gap-2.5 border border-white/[0.07]">
              <Icon className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="glass-md rounded-3xl p-6 sm:p-8 border border-white/[0.10] shadow-card"
        >
          <UploadForm />
        </motion.div>
      </div>
    </div>
  );
}
