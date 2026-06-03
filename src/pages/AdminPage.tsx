import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Shield, LogIn, LogOut, Trash2, CheckCircle, Loader2,
  AlertTriangle, Files, BookOpen, Download,
} from 'lucide-react';
import { supabase, type Submission } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '../lib/validators';
import { toast } from 'sonner';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.08 } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const childVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const STAT_COLORS = [
  { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
  { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)'  },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
];

export function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loginError, setLoginError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null);
  const [shakeLogin, setShakeLogin] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(!!s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setDataLoading(true);
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (!error) setSubmissions(data as Submission[]);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setShakeLogin(true);
      setTimeout(() => setShakeLogin(false), 600);
      toast.error('Login failed');
    } else {
      toast.success('Authenticated');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
  };

  const handleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from('submissions').update({ is_verified: verified }).eq('id', id);
    if (!error) {
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, is_verified: verified } : s));
      toast.success(verified ? 'File verified' : 'Verification removed');
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { error } = await supabase.from('submissions').delete().in('id', deleteConfirm);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => !deleteConfirm.includes(s.id)));
      setSelected(new Set());
      toast.success(`${deleteConfirm.length} file(s) deleted`);
    } else {
      toast.error('Delete failed');
    }
    setDeleteConfirm(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalDownloads = submissions.reduce((a, s) => a + s.download_count, 0);
  const subjects = [...new Set(submissions.map((s) => s.subject))];
  const verified = submissions.filter((s) => s.is_verified).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#a78bfa' }}
        />
      </div>
    );
  }

  const labelStyle = {
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Background orbs */}
      <div className="absolute top-[5%] left-[5%] w-[28vw] h-[28vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[5%] right-[5%] w-[22vw] h-[22vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <AnimatePresence mode="wait">
        {!session ? (
          /* ── Login ── */
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 relative z-10"
          >
            <div
              ref={cardRef}
              className={`w-full max-w-[480px] glass-strong rounded-3xl p-8 relative overflow-hidden ${shakeLogin ? 'animate-shake' : ''}`}
              style={{ border: '1px solid var(--border-default)' }}
            >
              {/* Top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-24 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 80%)' }} />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Admin Portal</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Authorized access only</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
                <div>
                  <label className="block mb-2" style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@notevault.edu"
                    required
                    className="input-glass w-full px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-2" style={labelStyle}>Security Key</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-glass w-full px-4 py-3 text-sm"
                  />
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                      >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loginLoading}
                  className="w-full btn-brand flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold mt-2 disabled:opacity-50"
                >
                  {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {loginLoading ? 'Authenticating…' : 'Access Dashboard'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* ── Dashboard ── */
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6 md:py-8 flex flex-col gap-6 md:gap-8 relative z-10"
          >
            {/* Delete modal */}
            <AnimatePresence>
              {deleteConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 backdrop-blur-md"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setDeleteConfirm(null)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 16 }}
                    className="glass-strong rounded-2xl p-8 max-w-sm w-full relative z-10"
                    style={{ border: '1px solid var(--border-default)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                      Confirm Deletion
                    </h3>
                    <p className="text-sm text-center mb-7" style={{ color: 'var(--text-secondary)' }}>
                      Permanently delete {deleteConfirm.length} file(s)? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-glass"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={executeDelete}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.35)' }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Header */}
            <motion.div variants={childVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3 mb-1" style={{ color: 'var(--text-primary)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  System Operations
                </h1>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  Manage files, verify content, and monitor global usage.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="btn-glass flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[
                { label: 'Total Files', value: submissions.length, icon: Files },
                { label: 'Verified', value: verified, icon: CheckCircle },
                { label: 'Subjects', value: subjects.length, icon: BookOpen },
                { label: 'Downloads', value: totalDownloads, icon: Download },
              ].map(({ label, value, icon: Icon }, i) => {
                const c = STAT_COLORS[i];
                return (
                  <motion.div
                    variants={childVariants}
                    key={label}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="glass rounded-2xl p-6 relative overflow-hidden cursor-default"
                    style={{ border: `1px solid ${c.border}` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${c.bg} 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 relative z-10"
                      style={{ background: c.bg, color: c.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl md:text-4xl font-display font-bold mb-1 relative z-10" style={{ color: 'var(--text-primary)' }}>
                      {value.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest relative z-10" style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bulk action bar */}
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 px-5 py-3 rounded-2xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.18)', color: '#f87171' }}>
                      {selected.size} selected
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setDeleteConfirm([...selected])}
                      className="flex items-center gap-2 text-sm font-bold ml-auto px-4 py-2 rounded-xl transition-all"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </motion.button>
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-sm font-bold px-4 py-2 rounded-xl transition-all btn-glass"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            {dataLoading ? (
              <div className="flex items-center justify-center py-32 glass rounded-2xl" style={{ border: '1px solid var(--border-subtle)' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-transparent"
                  style={{ borderTopColor: '#a78bfa' }}
                />
              </div>
            ) : (
              <motion.div
                variants={childVariants}
                className="glass-strong rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(0,0,0,0.25)' }}>
                        <th className="px-6 py-4 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded cursor-pointer"
                            style={{ accentColor: '#7c3aed' }}
                            checked={selected.size === submissions.length && submissions.length > 0}
                            onChange={(e) =>
                              setSelected(e.target.checked ? new Set(submissions.map((s) => s.id)) : new Set())
                            }
                          />
                        </th>
                        {['File', 'Subject', 'Uploader', 'Details', 'Actions'].map((h) => (
                          <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {submissions.map((s) => (
                          <motion.tr
                            layout
                            key={s.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            style={{
                              borderBottom: '1px solid var(--border-subtle)',
                              background: selected.has(s.id) ? 'rgba(124,58,237,0.06)' : 'transparent',
                            }}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded cursor-pointer"
                                style={{ accentColor: '#7c3aed' }}
                                checked={selected.has(s.id)}
                                onChange={() => toggleSelect(s.id)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold max-w-[220px] truncate" style={{ color: 'var(--text-primary)' }}>
                                {s.display_name}
                              </div>
                              <div className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: '#a78bfa' }}>
                                {s.file_type}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm max-w-[150px] truncate" style={{ color: 'var(--text-secondary)' }}>
                              {s.subject}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}
                                >
                                  {s.uploader_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.uploader_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.semester}</div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {formatFileSize(s.file_size)} · {formatDistanceToNow(new Date(s.uploaded_at))} ago
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.93 }}
                                  onClick={() => handleVerify(s.id, !s.is_verified)}
                                  className="p-2 rounded-lg transition-all"
                                  style={
                                    s.is_verified
                                      ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', boxShadow: '0 0 12px rgba(52,211,153,0.3)' }
                                      : { background: 'var(--glass-bg)', color: 'var(--text-muted)' }
                                  }
                                  title={s.is_verified ? 'Remove verification' : 'Verify file'}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.93 }}
                                  onClick={() => setDeleteConfirm([s.id])}
                                  className="p-2 rounded-lg transition-all"
                                  style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}
                                  title="Delete file"
                                >
                                  <Trash2 className="w-4 h-4 hover:text-rose-400" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>

                  {submissions.length === 0 && !dataLoading && (
                    <div className="text-center py-24">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}>
                        <Files className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Vault is Empty</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No files have been submitted yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
