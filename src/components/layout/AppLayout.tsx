import { useState, type ReactNode } from 'react';
import { Sidebar } from '../ui/Sidebar';
import { Menu, BookOpen, X, Home, Upload, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const MOBILE_LINKS = [
  { to: '/', label: 'Gallery', icon: Home, end: true },
  { to: '/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/admin', label: 'Admin', icon: Shield, end: false },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container flex flex-col md:flex-row h-screen bg-[#0a0a0a]">
      {/* Mobile Header */}
      <div className="md:hidden z-50 flex items-center justify-between p-4 bg-[#111111] border-b border-[#222222] relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#7c3aed] shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">
            NoteVault
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#1a1a1a] border border-[#333333] text-gray-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu (App-like) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[73px] bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed top-[73px] left-0 right-0 z-50 bg-[#111111] border-b border-[#222222] p-4 flex flex-col gap-2 shadow-2xl"
            >
              {MOBILE_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20'
                        : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-transparent'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-40">
        <Sidebar />
      </div>

      <main className="main-content flex-1 overflow-y-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
