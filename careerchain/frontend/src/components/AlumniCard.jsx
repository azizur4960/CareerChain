import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Award, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';
import SkillBadge from './SkillBadge';
import UserAvatar from './UserAvatar';

const AlumniCard = ({ user, onMessageClick = null }) => {
  const profile = user.alumni_profile || {};
  
  let skills = [];
  try {
    if (profile.skills) {
      if (profile.skills.startsWith('[')) {
        skills = JSON.parse(profile.skills);
      } else {
        skills = profile.skills.split(',').map((s) => s.trim());
      }
    }
  } catch {
    skills = (profile.skills || '').split(',').map((s) => s.trim());
  }

  // Generate initials for avatar
  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AL';

  return (
    <article className="cc-surface group flex flex-col justify-between p-5 transition-colors hover:border-indigo-300">
      <div>
        <div className="flex items-start gap-4">
          <UserAvatar user={user} size="medium" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                <Link to={`/student/alumni/${user.id}`} className="hover:text-indigo-600 transition-colors">
                  {user.full_name}
                </Link>
              </h3>
              {profile.is_verified && (
                <span title="Verified DIU Alumni">
                  <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-indigo-600 truncate mt-0.5">
              {profile.current_position || 'Software Professional'}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {profile.current_company || 'Tech Industry'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-slate-400" />
                Batch {profile.graduation_batch || 'DIU'}
              </span>
            </div>
          </div>
        </div>

        {/* Mentorship Status */}
        <div className="mt-3.5">
          {profile.is_available_for_mentorship ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available for Mentorship
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Unavailable for Mentorship
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} size="small" variant="neutral" />
            ))}
            {skills.length > 4 && (
              <span className="text-xs text-slate-400 font-medium self-center pl-1">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <Link
          to={`/student/alumni/${user.id}`}
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          View Profile
        </Link>

        {onMessageClick ? (
          <button
            onClick={() => onMessageClick(user)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </button>
        ) : (
          <Link
            to={`/student/messages?recipient=${user.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Link>
        )}
      </div>
    </article>
  );
};

export default AlumniCard;
