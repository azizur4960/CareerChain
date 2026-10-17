import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobs';
import { blogsApi } from '../../api/blogs';
import { alumniApi } from '../../api/alumni';
import {
  Briefcase,
  FilePlus,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const AlumniDashboard = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.alumni_profile || {};

  const [myJobs, setMyJobs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTogglingMentorship, setIsTogglingMentorship] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, blogsData] = await Promise.all([
        jobsApi.getMyJobs().catch(() => []),
        blogsApi.getMyBlogs().catch(() => []),
      ]);
      setMyJobs(jobsData);
      setMyBlogs(blogsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMentorship = async () => {
    try {
      setIsTogglingMentorship(true);
      await alumniApi.updateMyProfile({
        is_available_for_mentorship: !profile.is_available_for_mentorship,
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingMentorship(false);
    }
  };

  if (loading) return <Loader message="Loading your alumni workspace..." size="large" />;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-indigo-700">Alumni workspace · Batch {profile.graduation_batch || 'not set'}</p>
            {profile.is_verified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle className="h-3.5 w-3.5" />Verified alumnus</span>}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Share your experience, {user?.full_name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-600">{profile.current_position || 'Add your current role'}{profile.current_company ? ` · ${profile.current_company}` : ''}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600">Mentorship availability</span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(profile.is_available_for_mentorship)}
            aria-label="Accept mentorship inquiries"
            onClick={handleToggleMentorship}
            disabled={isTogglingMentorship}
            className={`inline-flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${profile.is_available_for_mentorship ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {isTogglingMentorship ? 'Updating…' : profile.is_available_for_mentorship ? 'Accepting inquiries' : 'Unavailable'}
            <span className={`relative h-5 w-9 rounded-full transition-colors ${profile.is_available_for_mentorship ? 'bg-emerald-700' : 'bg-slate-300'}`} aria-hidden="true">
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${profile.is_available_for_mentorship ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>
      </header>

      <nav aria-label="Alumni actions" className="flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200 pb-5">
        <Link to="/alumni/jobs/create" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800">
          <FilePlus className="h-4 w-4" />Create a job post
        </Link>
        <Link to="/alumni/blogs/create" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <BookOpen className="h-4 w-4" />Write career advice
        </Link>
        <Link to="/alumni/messages" className="inline-flex min-h-10 items-center gap-2 px-1 text-sm font-semibold text-slate-700 hover:text-indigo-800">
          <MessageSquare className="h-4 w-4" />Open messages
        </Link>
      </nav>

      {/* My Active Job Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Job Listings</h2>
            <p className="text-xs text-slate-500">Opportunities you have shared with DIU students</p>
          </div>
          <Link
            to="/alumni/jobs/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <FilePlus className="h-4 w-4" />
            Post New Job
          </Link>
        </div>

        {myJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white/60">
            <p className="text-xs text-slate-500">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {job.work_mode} • {job.employment_type}
                    </span>
                    {job.referral_available && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Referral Enabled
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{job.company} • {job.location}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Min. Exp: {job.minimum_experience} yrs</span>
                  <Link to={`/student/jobs/${job.id}`} className="font-bold text-indigo-600 hover:text-indigo-700">
                    View Live Page &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AlumniDashboard;
