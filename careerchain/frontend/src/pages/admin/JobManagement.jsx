import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { Briefcase, Trash2, ExternalLink, Search } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      setActionError('');
      await jobsApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.detail || 'The job could not be removed. Please try again.');
    }
  };

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Job Posting Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, moderate, and remove corporate job postings and referrals.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by job title or company..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {actionError && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>}

      {loading ? (
        <Loader message="Loading job listings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchJobs} />
      ) : (
        <>
        {filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No job postings match" description="Try a different title or company search." actionLabel="Clear search" onAction={() => setSearch('')} />
        ) : (
        <div className="space-y-3 md:hidden">
          {filtered.map((job) => (
            <article key={job.id} className="cc-surface space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{job.title}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-600">{job.company} · {job.location}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-600">{job.status}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-y border-slate-200 py-3 text-xs text-slate-600">
                <span>{job.work_mode}</span>
                <span>{job.referral_available ? 'Referral available' : 'Direct application'}</span>
              </div>
              <div className="flex justify-end gap-2">
                <Link to={`/student/jobs/${job.id}`} className="cc-button-secondary text-xs"><ExternalLink className="h-3.5 w-3.5" />View listing</Link>
                <button type="button" onClick={() => handleDelete(job.id)} className="min-h-10 rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-50"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove</button>
              </div>
            </article>
          ))}
        </div>
        )}

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Title & Company</th>
                  <th className="py-3.5 px-4">Work Mode</th>
                  <th className="py-3.5 px-4">Referral Available</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{j.title}</div>
                      <div className="text-[11px] text-slate-500">{j.company} • {j.location}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {j.work_mode}
                    </td>
                    <td className="py-3.5 px-4">
                      {j.referral_available ? (
                        <span className="text-emerald-700 font-bold">Yes (Alumni Referral)</span>
                      ) : (
                        <span className="text-slate-400">Standard Apply</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {j.status}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/student/jobs/${j.id}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3 w-3 inline mr-1" />
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3 inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default JobManagement;
