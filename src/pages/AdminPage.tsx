import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogIn, LogOut, Trash2, CheckCircle, Loader2, AlertTriangle, Files, BookOpen, Download } from 'lucide-react';
import { supabase, type Submission } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '../lib/validators';
import { toast } from 'sonner';

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

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(!!s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load submissions when authenticated
  useEffect(() => {
    if (!session) return;
    setDataLoading(true);
    supabase
      .from('submissions')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSubmissions(data as Submission[]);
        setDataLoading(false);
      });
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      toast.error('Login failed: ' + error.message);
    } else {
      toast.success('Welcome back, CR! 👑');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully.');
  };

  const handleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from('submissions').update({ is_verified: verified }).eq('id', id);
    if (!error) {
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, is_verified: verified } : s));
      toast.success(verified ? '✓ File verified!' : 'Verification removed.');
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} file(s)? This cannot be undone.`)) return;
    const { error } = await supabase.from('submissions').delete().in('id', ids);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => !ids.includes(s.id)));
      setSelected(new Set());
      toast.success(`${ids.length} file(s) deleted.`);
    } else {
      toast.error('Delete failed: ' + error.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Stats
  const totalDownloads = submissions.reduce((a, s) => a + s.download_count, 0);
  const subjects = [...new Set(submissions.map((s) => s.subject))];
  const verified = submissions.filter((s) => s.is_verified).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-wrapper">
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="glass-md rounded-3xl p-8 border border-white/[0.10] shadow-card">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-aurora-teal flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-slate-400 text-sm mt-1">CR access only</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cr@college.edu"
                    required
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {loginError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loginLoading}
                  className="btn-brand flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2 disabled:opacity-50"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-brand-400" />
              Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage all submitted files</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-glass flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Files', value: submissions.length, icon: Files, color: 'text-brand-400' },
            { label: 'Verified', value: verified, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Subjects', value: subjects.length, icon: BookOpen, color: 'text-aurora-teal' },
            { label: 'Downloads', value: totalDownloads, icon: Download, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-2xl p-5 border border-white/[0.08]">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-red-400/20"
            >
              <span className="text-sm text-slate-300">{selected.size} selected</span>
              <button
                onClick={() => handleDelete([...selected])}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-sm text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-8">
                      <input
                        type="checkbox"
                        className="rounded accent-brand-500"
                        checked={selected.size === submissions.length && submissions.length > 0}
                        onChange={(e) =>
                          setSelected(e.target.checked ? new Set(submissions.map((s) => s.id)) : new Set())
                        }
                      />
                    </th>
                    <th className="px-4 py-3 text-left">File / Title</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Uploader</th>
                    <th className="px-4 py-3 text-left">Sem</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Uploaded</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${selected.has(s.id) ? 'bg-brand-500/05' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded accent-brand-500"
                          checked={selected.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200 max-w-[200px] truncate">{s.display_name}</div>
                        <div className="text-xs text-slate-600">{s.file_type.toUpperCase()}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate">{s.subject}</td>
                      <td className="px-4 py-3 text-slate-400">{s.uploader_name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.semester}</td>
                      <td className="px-4 py-3 text-slate-500">{formatFileSize(s.file_size)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(s.uploaded_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerify(s.id, !s.is_verified)}
                            className={`p-1.5 rounded-lg transition-all ${
                              s.is_verified
                                ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                                : 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10'
                            }`}
                            title={s.is_verified ? 'Remove verification' : 'Verify file'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete([s.id])}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {submissions.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <Files className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No submissions yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
