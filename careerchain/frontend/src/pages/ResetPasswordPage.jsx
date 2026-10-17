import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { authApi } from '../api/auth';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try { await authApi.resetPassword(token, password); setDone(true); }
    catch (err) { setError(err.response?.data?.detail || 'This reset link is invalid or expired.'); }
    finally { setBusy(false); }
  };

  return <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4"><div className="w-full max-w-md space-y-6">
    <header className="text-center"><div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-4"><Sparkles className="h-6 w-6" /></div><h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1><p className="mt-2 text-sm text-slate-500">Choose a new password with at least 8 characters.</p></header>
    {done ? <div className="space-y-4 text-center"><p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Your password has been reset.</p><button onClick={() => navigate('/login')} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white">Continue to sign in</button></div> : !token ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">This reset link is missing its token. Request a new link.</div> : <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-xs font-bold text-slate-700" htmlFor="new-password">New password</label><div className="relative"><Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" /><input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
      <label className="block text-xs font-bold text-slate-700" htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
      <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? 'Saving…' : 'Save new password'}</button>
    </form>}
    <p className="text-center"><Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link></p>
  </div></div>;
}
