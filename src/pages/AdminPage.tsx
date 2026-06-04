import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Shield, LogIn, LogOut, Trash2, CheckCircle, Loader2,
  AlertTriangle, Files, BookOpen, Download, User
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-[#0a0a0a] min-h-screen">
      
      {/* Background charting wavy SVG for login screen (Mimics Image 3) */}
      {!session && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 600 Q 300 400 600 500 T 1440 300 L 1440 800 L 0 800 Z" fill="url(#paint0_linear)" fillOpacity="0.05" />
            <path d="M0 600 Q 300 400 600 500 T 1440 300" stroke="#4ade80" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M0 500 Q 400 700 800 400 T 1440 500" stroke="#facc15" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
            <defs>
              <linearGradient id="paint0_linear" x1="720" y1="300" x2="720" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" stopOpacity="1" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!session ? (
          /* ═══════════════════ LOGIN VIEW (Matching Image 3) ═══════════════════ */
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 relative z-10"
          >
            <div className="w-full max-w-[420px] rounded-3xl p-8 bg-[#111111] border border-[#222222] shadow-2xl">
              <div className="flex justify-center mb-6">
                <Shield className="w-8 h-8 text-[#7c3aed]" />
              </div>
              <h1 className="text-2xl font-bold text-white text-center mb-1">
                Welcome back
              </h1>
              <p className="text-[13px] text-gray-400 text-center mb-8">
                Log in to access your administrative dashboard
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                
                {/* Fake Role Selector (to match image structure) */}
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-gray-400">Role</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222222]">
                    <User className="w-4 h-4 text-[#7c3aed]" />
                    <span className="text-sm font-medium text-white flex-1">System Administrator</span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-gray-400">Email / Username</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@domain.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222222] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-gray-400">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222222] text-white text-sm focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-[11px] font-medium text-[#7c3aed] cursor-pointer hover:underline">
                      Forgot password?
                    </span>
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-red-500 text-center">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full mt-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Access Dashboard
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* ═══════════════════ DASHBOARD VIEW ═══════════════════ */
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-8 relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">System Operations</h1>
                <p className="text-sm text-gray-400">Manage files, verify content, and monitor usage.</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#222222] text-sm font-bold text-gray-300 hover:bg-[#111111]"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Files', value: submissions.length, icon: Files },
                { label: 'Verified', value: submissions.filter(s => s.is_verified).length, icon: CheckCircle },
                { label: 'Subjects', value: new Set(submissions.map(s => s.subject)).size, icon: BookOpen },
                { label: 'Downloads', value: submissions.reduce((a, s) => a + s.download_count, 0), icon: Download },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{value}</p>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Data Table */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
              
              {/* Bulk actions */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 py-3 bg-[#1a1a1a] border-b border-[#222222] flex items-center justify-between">
                      <span className="text-sm font-bold text-[#7c3aed]">{selected.size} items selected</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(new Set())} className="text-sm font-bold text-gray-400 hover:text-white">Clear</button>
                        <button onClick={() => setDeleteConfirm([...selected])} className="text-sm font-bold text-white bg-red-600 px-4 py-1.5 rounded-lg flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0a0a0a] border-b border-[#222222]">
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#333] bg-[#111] cursor-pointer"
                          checked={selected.size === submissions.length && submissions.length > 0}
                          onChange={(e) => setSelected(e.target.checked ? new Set(submissions.map(s => s.id)) : new Set())}
                        />
                      </th>
                      {['File Details', 'Subject', 'Uploader', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-[#222222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[#333] bg-[#111] cursor-pointer"
                            checked={selected.has(s.id)}
                            onChange={() => toggleSelect(s.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm mb-1">{s.display_name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="uppercase font-bold text-[#7c3aed]">{s.file_type}</span>
                            <span>•</span>
                            <span>{formatFileSize(s.file_size)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-300 text-sm mb-1">{s.subject}</p>
                          <p className="text-xs text-gray-500">{s.semester}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-300 text-sm mb-1">{s.uploader_name}</p>
                          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(s.uploaded_at))} ago</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(s.id, !s.is_verified)}
                              className={`p-2 rounded-lg border ${s.is_verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[#111] border-[#333] text-gray-400 hover:text-emerald-500 hover:border-emerald-500/50'}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm([s.id])}
                              className="p-2 rounded-lg border bg-[#111] border-[#333] text-gray-400 hover:text-red-500 hover:border-red-500/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500 text-sm font-medium">No files uploaded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
              {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold text-white mb-2">Delete Files</h3>
                    <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete {deleteConfirm.length} file(s)? This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-[#333] text-white text-sm font-bold hover:bg-[#222]">Cancel</button>
                      <button onClick={executeDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">Delete</button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
