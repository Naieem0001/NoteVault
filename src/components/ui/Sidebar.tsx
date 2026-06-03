import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Shield, Library, Search, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { to: '/', label: 'Gallery', icon: Home, end: true },
  { to: '/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/admin', label: 'Admin', icon: Shield, end: false },
];

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('nv_theme') as 'dark' | 'light' | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  // Apply theme on mount
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('light', theme === 'light');
  }

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nv_theme', next);
      document.documentElement.classList.toggle('light', next === 'light');
      return next;
    });
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      className="h-full glass-strong border-r border-[var(--border-default)] flex flex-col pt-7 pb-5 select-none flex-shrink-0 relative z-20 overflow-hidden"
      style={{ minWidth: collapsed ? 76 : 240 }}
    >
      {/* ── Brand ── */}
      <div className={`flex items-center mb-9 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <motion.div
          animate={{ scale: collapsed ? 1.1 : 1, y: [0, -4, 0] }}
          transition={{ y: { repeat: Infinity, duration: 6, ease: 'easeInOut' } }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-aurora-teal flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.4)] cursor-pointer"
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Library className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="text-lg font-display font-bold whitespace-nowrap overflow-hidden"
              style={{ color: 'var(--text-primary)' }}
            >
              NoteVault
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Search button ── */}
      <div className="px-3 mb-7">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          title="Search (⌘K)"
          className={`flex items-center ${
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 w-full px-3 py-2.5'
          } rounded-xl border transition-all duration-200`}
          style={{
            background: 'var(--input-bg)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)',
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden">
                Search...
              </span>
              <kbd
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                ⌘K
              </kbd>
            </>
          )}
        </motion.button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
        )}
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={link.label}
            className="block"
            onClick={onClose}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center ${
                  collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'
                } rounded-xl font-semibold text-sm transition-colors duration-200`}
                style={{
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.2)', borderLeft: '2px solid var(--brand)', boxShadow: 'inset 0 0 20px rgba(124,58,237,0.1)' }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all ${
                    isActive ? 'shadow-[0_0_12px_rgba(124,58,237,0.5)]' : ''
                  }`}
                  style={{
                    background: isActive ? 'rgba(124,58,237,0.22)' : 'transparent',
                  }}
                >
                  <link.icon className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap overflow-hidden">{link.label}</span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom controls ── */}
      <div className="px-3 pt-4 flex flex-col gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center ${
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'
          } rounded-xl text-sm font-semibold transition-colors duration-200`}
          style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-400" />}
            </motion.div>
          </AnimatePresence>
          {!collapsed && (
            <span className="whitespace-nowrap overflow-hidden">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </motion.button>

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`hidden md:flex items-center ${
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'
          } rounded-xl text-sm font-semibold transition-colors duration-200`}
          style={{ color: 'var(--text-muted)', background: 'transparent' }}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          )}
          {!collapsed && <span className="whitespace-nowrap overflow-hidden">Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
