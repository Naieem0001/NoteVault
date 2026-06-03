import { useState, type ReactNode } from 'react';
import { Sidebar } from '../ui/Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { Menu, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container flex flex-col md:flex-row h-screen">
      {/* Animated mesh background */}
      <div className="bg-mesh" />

      {/* Mobile Header */}
      <div className="md:hidden glass-strong z-30 flex items-center justify-between p-4 border-b relative" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-aurora-teal flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Library className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>NoteVault</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg btn-glass">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar with mobile drawer support */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <main className="main-content flex-1 overflow-y-auto flex flex-col">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}

