import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Building2,
  Award,
  Clock,
  Mail,
  Linkedin,
  Github,
  Edit3,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import ProfilePhotoEditor from '../../components/ProfilePhotoEditor';
import UserAvatar from '../../components/UserAvatar';

const AlumniProfile = () => {
  const { user } = useAuth();
  const profile = user?.alumni_profile || {};

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

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AL';

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <ProfilePhotoEditor />
      <section className="cc-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <UserAvatar user={user} size="large" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.full_name}</h1>
                {profile.is_verified && (
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                    Verified Alumni
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                {profile.current_position || 'Software Professional'} at{' '}
                <span className="font-bold text-slate-900">{profile.current_company || 'Tech Industry'}</span>
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  Graduation Batch: {profile.graduation_batch || 'DIU'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {profile.years_of_experience || 0} Years Experience
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/alumni/profile/edit"
            className="cc-button-primary"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {profile.bio || 'No professional summary added yet. Click "Edit Profile" to add your career background.'}
          </p>
        </div>
      </section>

      {/* Skills & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="cc-surface p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Core Competencies & Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} variant="neutral" />
            ))}
          </div>
        </section>

        <section className="cc-surface p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Professional Profiles</h2>
          <div className="space-y-3 text-xs">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-blue-700 hover:bg-slate-50 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="truncate">LinkedIn profile</span>
              </a>
            )}
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span className="truncate">GitHub profile</span>
              </a>
            )}
            {!profile.linkedin_url && !profile.github_url && (
              <p className="text-xs text-slate-400 italic">No social links added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlumniProfile;
