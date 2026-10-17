import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobs';
import { alumniApi } from '../../api/alumni';
import { aiApi } from '../../api/ai';
import {
  Sparkles,
  Briefcase,
  Users,
  Bot,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';
import JobCard from '../../components/JobCard';
import AlumniCard from '../../components/AlumniCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import FitScoreBadge from '../../components/FitScoreBadge';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch active jobs and top alumni
        const [jobsData, alumniData] = await Promise.all([
          jobsApi.getJobs({ limit: 4 }),
          alumniApi.getAlumni({ mentorship_only: true, verified_only: true }),
        ]);
        setJobs(jobsData.slice(0, 4));
        setMentors(alumniData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const studentProfile = user?.student_profile;
  const targetRole = studentProfile?.target_role || 'Software Engineer';
  const semester = studentProfile?.semester || 8;

  if (loading) {
    return <Loader message="Preparing your student dashboard..." size="large" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-700">Student workspace · Semester {semester}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Your next step toward {targetRole}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Explore current roles, connect with alumni, and use your profile to guide your search.</p>
        </div>
        <Link to="/student/profile/edit" className="text-sm font-semibold text-indigo-700 underline decoration-slate-300 underline-offset-4 hover:text-indigo-900">
          Review your profile
        </Link>
      </header>

      <nav aria-label="Career next steps" className="grid grid-cols-1 border-y border-slate-200 sm:grid-cols-3">
        <Link
          to="/student/ai-match"
          className="group flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 px-1 py-4 hover:bg-white sm:border-b-0 sm:border-r sm:px-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Analyze resume fit</p>
              <p className="mt-0.5 text-xs text-slate-500">Compare skills with an open role</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" />
        </Link>
        <Link
          to="/student/alumni"
          className="group flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 px-1 py-4 hover:bg-white sm:border-b-0 sm:border-r sm:px-4"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Find an alumni mentor</p>
              <p className="mt-0.5 text-xs text-slate-500">Browse expertise and availability</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" />
        </Link>
        <Link
          to="/student/ai-chat"
          className="group flex min-h-20 items-center justify-between gap-4 px-1 py-4 hover:bg-white sm:px-4"
        >
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Ask the career assistant</p>
              <p className="mt-0.5 text-xs text-slate-500">Get guidance for your next move</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" />
        </Link>
      </nav>

      {/* Featured Jobs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Job Openings</h2>
            <p className="text-xs text-slate-500">Recent software and engineering roles posted by DIU alumni</p>
          </div>
          <Link
            to="/student/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Browse jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {jobs.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No open roles yet" description="New opportunities posted by alumni will appear here." actionLabel="Browse all jobs" actionLink="/student/jobs" />
        )}
      </section>

      {/* Verified Alumni Mentors */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Alumni Mentors</h2>
            <p className="text-xs text-slate-500">Connect for career guidance, mock interviews, and referral advice</p>
          </div>
          <Link
            to="/student/alumni"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Browse Directory <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {mentors.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {mentors.map((alumni) => <AlumniCard key={alumni.id} user={alumni} />)}
          </div>
        ) : (
          <EmptyState icon={Users} title="No mentors match yet" description="Try the alumni directory to broaden your search or adjust your profile skills." actionLabel="Explore alumni" actionLink="/student/alumni" />
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
