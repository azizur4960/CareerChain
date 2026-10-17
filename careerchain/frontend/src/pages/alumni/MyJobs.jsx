import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { Briefcase, FilePlus, Trash2, ExternalLink } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete job.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Posted Job Vacancies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company referral openings and track applicants.
          </p>
        </div>

        <Link
          to="/alumni/jobs/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <FilePlus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {loading ? (
        <Loader message="Loading your job postings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMyJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Share exciting engineering opportunities from your company with DIU students."
          actionLabel="Post First Job"
          actionLink="/alumni/jobs/create"
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 px-2 py-0.5">
                    {job.work_mode} • {job.employment_type}
                  </span>
                  {job.referral_available && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Referral Active
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {job.company} • {job.location} • Status: <span className="font-semibold text-emerald-600">{job.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/student/jobs/${job.id}`}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Live
                </Link>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
