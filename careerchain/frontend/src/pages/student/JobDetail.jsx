import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { aiApi } from '../../api/ai';
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Share2
} from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import FitScoreBadge from '../../components/FitScoreBadge';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import UserAvatar from '../../components/UserAvatar';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const data = await jobsApi.getJobById(id);
        setJob(data);

        // Fetch AI Job Fit score
        setMatchLoading(true);
        try {
          const fitData = await aiApi.matchJob({ job_id: parseInt(id, 10) });
          setMatchResult(fitData);
        } catch (fitErr) {
          console.warn('AI Match calculation failed:', fitErr);
        } finally {
          setMatchLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Job opening not found or has been closed.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  if (loading) return <Loader message="Loading job posting details..." size="large" />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/student/jobs')} />;
  if (!job) return null;

  // Parse skills
  let requiredSkills = [];
  try {
    if (job.required_skills?.startsWith('[')) {
      requiredSkills = JSON.parse(job.required_skills);
    } else {
      requiredSkills = (job.required_skills || '').split(',').map((s) => s.trim());
    }
  } catch {
    requiredSkills = (job.required_skills || '').split(',').map((s) => s.trim());
  }

  let preferredSkills = [];
  try {
    if (job.preferred_skills?.startsWith('[')) {
      preferredSkills = JSON.parse(job.preferred_skills);
    } else if (job.preferred_skills) {
      preferredSkills = job.preferred_skills.split(',').map((s) => s.trim());
    }
  } catch {
    preferredSkills = (job.preferred_skills || '').split(',').map((s) => s.trim());
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/student/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Board
      </button>

      {/* Main Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                <Briefcase className="h-3 w-3" />
                {job.work_mode}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {job.employment_type}
              </span>
              {job.referral_available && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Alumni Referral Available
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 text-slate-900 font-bold">
                <Building2 className="h-4 w-4 text-slate-400" />
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                {job.minimum_experience === 0 ? 'Fresh graduates welcome' : `${job.minimum_experience}+ Years Experience`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {job.posted_by && (
              <Link
                to={`/student/messages?recipient=${job.posted_by}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Request Referral
              </Link>
            )}

            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Apply Directly
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {job.referral_available && job.referral_url && (
              <a
                href={job.referral_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
              >
                Apply with referral
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Job Overview</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Key Responsibilities</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Required Technical Skills</h2>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} variant="default" size="large" />
                ))}
              </div>
            </div>

            {preferredSkills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Preferred Qualifications</h2>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} variant="neutral" size="default" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Match Meter Sidebar */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Your AI Job Compatibility</h3>
              </div>

              {matchLoading ? (
                <Loader message="Evaluating profile compatibility..." size="small" />
              ) : matchResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Calculated Score:</span>
                    <FitScoreBadge score={matchResult.fit_score} />
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-indigo-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Skill Intersection:</span>
                      <span className="font-bold text-slate-900">{matchResult.breakdown.skill_match}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Semantic Role:</span>
                      <span className="font-bold text-slate-900">{matchResult.breakdown.role_match}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Experience Alignment:</span>
                      <span className="font-bold text-slate-900">{matchResult.breakdown.experience_match}%</span>
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {matchResult.missing_skills.length > 0 && (
                    <div className="pt-3 border-t border-indigo-100">
                      <p className="text-[11px] font-bold text-rose-700 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Recommended Upskilling Areas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missing_skills.slice(0, 4).map((s, idx) => (
                          <SkillBadge key={idx} skill={s} variant="missing" size="small" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-indigo-100/60 p-3 text-[11px] text-indigo-950 leading-relaxed font-medium">
                    {matchResult.recommendation}
                  </div>

                  <p className="text-[9px] text-slate-400 italic">
                    {matchResult.disclaimer}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sign in as student to see AI Fit Score.</p>
              )}
            </div>

            {/* Poster Info */}
            {job.author && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Posted By</h3>
                <div className="flex items-center gap-3">
                  <UserAvatar user={job.author} size="small" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{job.author.full_name}</p>
                    <p className="text-[11px] text-slate-500">{job.author.department}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
