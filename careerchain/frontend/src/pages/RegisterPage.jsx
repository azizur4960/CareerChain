import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, User, Mail, Lock, GraduationCap, Building2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    universityId: '',
    department: 'Computer Science and Engineering',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const newUser = await register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        university_id: formData.universityId,
        department: formData.department,
      });

      if (newUser.role === 'STUDENT') navigate('/student/feed');
      else if (newUser.role === 'ALUMNI') navigate('/alumni/feed');
      else navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(' ')
        : detail || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    const home = user?.role === 'STUDENT' ? '/student/feed' : user?.role === 'ALUMNI' ? '/alumni/feed' : '/admin/feed';
    return <Navigate to={home} replace />;
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your CareerChain Account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Join the official DIU student & alumni career network
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={formData.role === 'STUDENT'}
                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold border transition-all ${
                  formData.role === 'STUDENT'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Current Student
              </button>
              <button
                type="button"
                aria-pressed={formData.role === 'ALUMNI'}
                onClick={() => setFormData({ ...formData, role: 'ALUMNI' })}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold border transition-all ${
                  formData.role === 'ALUMNI'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="h-4 w-4" />
                DIU Alumni
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="register-name" className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                id="register-name"
                type="text"
                name="fullName"
                required
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Tanvir Ahmed"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                id="register-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tanvir@diu.edu.bd"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="register-university-id" className="block text-xs font-bold text-slate-700 mb-1">
                DIU Student / Alumni ID
              </label>
              <input
                id="register-university-id"
                type="text"
                name="universityId"
                required={!formData.email.trim().toLowerCase().endsWith('@diu.edu.bd')}
                value={formData.universityId}
                onChange={handleChange}
                placeholder="e.g. 211-15-4200"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-[10px] text-slate-500">Optional with a @diu.edu.bd email address.</p>
            </div>
            <div>
              <label htmlFor="register-department" className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                id="register-department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-2.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Computer Science and Engineering">CSE</option>
                <option value="Software Engineering">SWE</option>
                <option value="Information Technology">IT</option>
                <option value="Electrical and Electronic Engineering">EEE</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs font-bold text-slate-700 mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
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
            <p className="mt-1 text-[10px] text-slate-500">Use at least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
