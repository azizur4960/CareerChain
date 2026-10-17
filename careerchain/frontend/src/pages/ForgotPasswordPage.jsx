import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', university_id: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const change = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (form.new_password !== form.confirm_password) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try {
      await authApi.resetPasswordWithVerification({ email: form.email, university_id: form.university_id, new_password: form.new_password });
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(' ') : detail || 'Could not update your password. Please try again.');
    } finally { setBusy(false); }
  };

  return <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md space-y-6">
      <header className="text-center"><div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-4"><Sparkles className="h-6 w-6" /></div><h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1><p className="mt-2 text-sm text-slate-500">Verify your account with your email and university ID, then choose a new password.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="recovery-email" className="mb-1 block text-xs font-bold text-slate-700">Account email</label><div className="relative"><Mail className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" /><input id="recovery-email" type="email" required autoComplete="email" value={form.email} onChange={change('email')} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="you@example.com" /></div></div>
        <div><label htmlFor="recovery-id" className="mb-1 block text-xs font-bold text-slate-700">University ID</label><input id="recovery-id" required autoComplete="off" value={form.university_id} onChange={change('university_id')} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Your registered university ID" /></div>
        <div><label htmlFor="new-password" className="mb-1 block text-xs font-bold text-slate-700">New password</label><div className="relative"><Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" /><input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={form.new_password} onChange={change('new_password')} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="At least 8 characters" /></div></div>
        <div><label htmlFor="confirm-password" className="mb-1 block text-xs font-bold text-slate-700">Confirm new password</label><input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={form.confirm_password} onChange={change('confirm_password')} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? 'Updating…' : 'Update password'}</button>
      </form>
      <p className="text-center"><Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link></p>
    </div>
  </div>;
}
