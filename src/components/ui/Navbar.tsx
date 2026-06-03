import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Shield, Zap } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Browse', icon: BookOpen, end: true },
  { to: '/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/admin', label: 'Admin', icon: Shield, end: false },
];

export function Navbar() {
  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-aurora-teal flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text-brand">NoteVault</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-brand-500/15 border border-brand-500/25 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
