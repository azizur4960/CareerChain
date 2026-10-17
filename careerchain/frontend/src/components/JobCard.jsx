import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import SkillBadge from './SkillBadge';
import FitScoreBadge from './FitScoreBadge';

const JobCard = ({ job, fitScore = null, onMatchClick = null }) => {
  // Parse skills safely
  let skills = [];
  try {
    if (job.required_skills) {
      if (job.required_skills.startsWith('[')) {
        skills = JSON.parse(job.required_skills);
      } else {
        skills = job.required_skills.split(',').map((s) => s.trim());
      }
    }
  } catch {
    skills = (job.required_skills || '').split(',').map((s) => s.trim());
  }

  return (
    <article className="cc-surface group flex flex-col justify-between p-5 transition-colors hover:border-indigo-300">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                <Briefcase className="h-3 w-3" />
                {job.work_mode}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {job.employment_type}
              </span>
              {job.referral_available && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  DIU Referral Available
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              <Link to={`/student/jobs/${job.id}`}>{job.title}</Link>
            </h3>

            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {job.minimum_experience === 0 ? 'Freshers welcome' : `${job.minimum_experience}+ yrs exp`}
              </span>
            </div>
          </div>

          {fitScore !== null && (
            <div className="flex-shrink-0">
              <FitScoreBadge score={fitScore} size="compact" />
            </div>
          )}
        </div>

        <p className="mt-3.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} size="small" />
            ))}
            {skills.length > 5 && (
              <span className="text-xs text-slate-400 font-medium self-center pl-1">
                +{skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <Link
          to={`/student/jobs/${job.id}`}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Details &rarr;
        </Link>

        {onMatchClick && (
          <button
            onClick={() => onMatchClick(job)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Check AI Fit
          </button>
        )}
      </div>
    </article>
  );
};

export default JobCard;
