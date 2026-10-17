import React, { useState, useEffect } from 'react';
import { jobsApi } from '../../api/jobs';
import { aiApi } from '../../api/ai';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import FitScoreBadge from '../../components/FitScoreBadge';
import SkillBadge from '../../components/SkillBadge';
import { Briefcase, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    workMode: '',
    employmentType: '',
  });

  // AI Fit Modal State
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [search, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getJobs({
        search: search || undefined,
        work_mode: filters.workMode || undefined,
        employment_type: filters.employmentType || undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ workMode: '', employmentType: '' });
  };

  const handleOpenMatchModal = async (job) => {
    setSelectedJobForMatch(job);
    setMatchLoading(true);
    setMatchResult(null);

    try {
      const res = await aiApi.matchJob({ job_id: job.id });
      setMatchResult(res);
    } catch (err) {
      console.error('Match failed:', err);
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus & Alumni Job Board
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Explore verified career opportunities and alumni referral programs across top tech companies.
          </p>
        </div>

        <Link
          to="/student/ai-match"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          Rank All Jobs by My Skills &rarr;
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by job title, company, technology, or skills..."
        />
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          description="Narrow opportunities by work arrangement and employment type."
          options={{ workMode: true, employmentType: true }}
        />
      </div>

      {/* Listings Grid */}
      {loading ? (
        <Loader message="Loading available positions..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try modifying your keyword search or resetting filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onMatchClick={handleOpenMatchModal}
            />
          ))}
        </div>
      )}

      {/* AI Fit Match Modal */}
      <Modal
        isOpen={!!selectedJobForMatch}
        onClose={() => setSelectedJobForMatch(null)}
        title={selectedJobForMatch ? `AI Fit Analysis: ${selectedJobForMatch.title}` : 'AI Fit Analysis'}
        maxWidth="max-w-xl"
      >
        {matchLoading ? (
          <Loader message="Computing 4-factor compatibility score..." />
        ) : matchResult ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <div>
                <p className="text-xs font-semibold text-indigo-900">Calculated Compatibility</p>
                <p className="text-xs text-indigo-700/80">Based on your profile skills, target role & experience</p>
              </div>
              <FitScoreBadge score={matchResult.fit_score} size="large" />
            </div>

            {/* Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Score Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <span className="text-slate-500 font-medium">Skill Overlap (50%):</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{matchResult.breakdown.skill_match}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <span className="text-slate-500 font-medium">Role Semantic (30%):</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{matchResult.breakdown.role_match}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <span className="text-slate-500 font-medium">Experience Gap (10%):</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{matchResult.breakdown.experience_match}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <span className="text-slate-500 font-medium">Preferred Skills (10%):</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{matchResult.breakdown.preferred_skills_match}%</p>
                </div>
              </div>
            </div>

            {/* Skills Details */}
            <div className="space-y-3">
              {matchResult.matched_skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Matched Skills ({matchResult.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matched_skills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} variant="matched" size="small" />
                    ))}
                  </div>
                </div>
              )}

              {matchResult.missing_skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Recommended Skills to Upskill ({matchResult.missing_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing_skills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} variant="missing" size="small" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-950 leading-relaxed">
              <span className="font-bold block mb-1">AI Recommendation:</span>
              {matchResult.recommendation}
            </div>

            <p className="text-[10px] text-slate-400 italic">
              {matchResult.disclaimer}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                to={`/student/jobs/${selectedJobForMatch?.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                View Full Job Listing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Unable to generate match score.</p>
        )}
      </Modal>
    </div>
  );
};

export default JobsBoard;
