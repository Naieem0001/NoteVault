import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Shield, BookOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { to: '/', label: 'Gallery', icon: Home, end: true },
  { to: '/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/admin', label: 'Admin', icon: Shield, end: false },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      className="h-full border-r flex flex-col pt-7 pb-5 select-none flex-shrink-0 relative z-20 overflow-hidden"
      style={{
        minWidth: collapsed ? 76 : 240,
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border)',
      }}
    >
      {/* ── Brand ── */}
      <div className={`flex items-center mb-9 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <motion.div
          animate={{ scale: collapsed ? 1.1 : 1 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
          style={{
            background: 'var(--brand)',
            boxShadow: '0 2px 12px rgba(124,58,237,0.3)',
          }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <BookOpen className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="text-lg font-display font-bold whitespace-nowrap overflow-hidden"
              style={{ color: 'var(--heading)' }}
            >
              NoteVault
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {!collapsed && (
          <p
            className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2 font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
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
                  color: isActive ? 'var(--brand)' : 'var(--sub-text)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'var(--tag-pill-bg)',
                      borderLeft: '3px solid var(--brand)',
                    }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all`}
                  style={{
                    background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                  }}
                >
                  <link.icon className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap overflow-hidden">
                    {link.label}
                  </span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom controls ── */}
      <div
        className="px-3 pt-4 flex flex-col gap-2 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
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
