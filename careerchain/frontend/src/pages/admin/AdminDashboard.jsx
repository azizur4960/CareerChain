import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import {
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Compiling platform metrics..." size="large" />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold text-indigo-700">Administration</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Platform overview</h1>
        <p className="mt-1 text-sm text-slate-600">Review account activity and keep the career community up to date.</p>
      </header>

      <dl className="grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
        {[
          ['Registered users', stats?.total_users],
          ['Students', stats?.total_students],
          ['Verified alumni', stats?.verified_alumni],
          ['Active jobs', stats?.active_jobs],
        ].map(([label, value], index) => (
          <div key={label} className={`py-4 ${index % 2 === 0 ? 'pr-4' : 'pl-4'} ${index < 2 ? 'border-b border-slate-200 sm:border-b-0' : ''} ${index % 2 === 0 ? 'sm:border-r sm:border-slate-200 sm:pl-4 sm:pr-5' : 'sm:pl-5'}`}>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value ?? 0}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="admin-actions-title">
        <h2 id="admin-actions-title" className="mb-2 text-base font-bold text-slate-900">Operations</h2>
        <nav aria-label="Administration tasks" className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            { to: '/admin/users', icon: Users, title: 'User accounts', description: 'Review identity claims and manage account access.' },
            { to: '/admin/alumni-verify', icon: CheckCircle, title: 'Alumni credentials', description: 'Review graduation details and verified-alumni status.' },
            { to: '/admin/jobs', icon: Briefcase, title: 'Job listings', description: 'Review active openings and referral information.' },
            { to: '/admin/events', icon: Calendar, title: 'Campus events', description: 'Publish and maintain webinars and career events.' },
          ].map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to} className="group flex min-h-[68px] items-center gap-3 py-3 hover:bg-white">
              <Icon className="h-4 w-4 flex-shrink-0 text-indigo-700" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-800">{title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
};

export default AdminDashboard;
