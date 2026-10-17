import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, UserCheck, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice] = useState(location.state?.passwordReset ? 'Password updated. Sign in with your new password.' : '');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'STUDENT') navigate('/student/feed', { replace: true });
    else if (role === 'ALUMNI') navigate('/alumni/feed', { replace: true });
    else if (role === 'ADMIN') navigate('/admin/feed', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(' ')
        : detail || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    const home = user?.role === 'STUDENT' ? '/student/feed' : user?.role === 'ALUMNI' ? '/alumni/feed' : '/admin/feed';
    return <Navigate to={home} replace />;
  }

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CareerChain
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access your personalized student or alumni workspace
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-indigo-600" />
            Sample accounts · click to fill:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student@careerchain.local', 'Student123!')}
              className="rounded-xl border border-indigo-200 bg-white py-1.5 px-2 text-[11px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alumni@careerchain.local', 'Alumni123!')}
              className="rounded-xl border border-indigo-200 bg-white py-1.5 px-2 text-[11px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Alumni
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@careerchain.local', 'Admin123!')}
              className="rounded-xl border border-indigo-200 bg-white py-1.5 px-2 text-[11px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{notice}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@diu.edu.bd or your registered email"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-1 my-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
            Register here
          </Link>
        </p>
        <p className="text-center text-xs"><Link to="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
