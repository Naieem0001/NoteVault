import { motion, type Variants } from 'framer-motion';
import { UploadForm } from '../components/upload/UploadForm';
import { Shield, Zap, Eye, CloudUpload } from 'lucide-react';

const TIPS = [
  {
    icon: Shield,
    title: 'Secure Storage',
    text: 'Files are permanently stored on Supabase and accessible globally to all students.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
  },
  {
    icon: Eye,
    title: 'Real-time Sync',
    text: 'Your upload instantly appears in the Gallery for all connected users.',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
  },
  {
    icon: Zap,
    title: 'Exam Priority',
    text: 'Verified materials get a special badge and are shown first in Exam Mode.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
  },
];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const leftVariants: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 } },
};

const rightVariants: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 } },
};

export function UploadPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full flex flex-col"
    >
      {/* Hero section */}
      <div
        className="relative overflow-hidden px-6 pt-6 pb-6 md:pt-10 md:pb-8"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 30% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
        />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-3"
          >
            <CloudUpload className="w-5 h-5" style={{ color: '#a78bfa' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Contribute
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl md:text-5xl font-display font-bold gradient-text-brand mb-2"
          >
            Upload to Vault
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Share your notes, past papers, and study materials with the academic community.
          </motion.p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* Left: Feature cards */}
          <motion.div
            variants={leftVariants}
            initial="initial"
            animate="animate"
            className="lg:col-span-2 flex flex-col gap-5"
          >
            <div className="mb-2">
              <h2 className="text-xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Why contribute?
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Help thousands of students access quality study materials.
              </p>
            </div>

            {TIPS.map(({ icon: Icon, title, text, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="glass rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 cursor-default"
                style={{ borderColor: `${color}20` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg, color, boxShadow: `0 0 16px ${color}30` }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Form */}
          <motion.div
            variants={rightVariants}
            initial="initial"
            animate="animate"
            className="lg:col-span-3"
          >
            <div
              className="glass-strong rounded-3xl p-8 relative overflow-hidden"
              style={{ border: '1px solid var(--border-default)' }}
            >
              {/* Subtle glow inside form */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 80%)' }}
              />
              <div className="relative z-10">
                <h2 className="text-xl font-display font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  File Details
                </h2>
                <UploadForm />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
