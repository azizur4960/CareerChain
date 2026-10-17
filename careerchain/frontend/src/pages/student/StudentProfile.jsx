import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  GraduationCap,
  Building2,
  Mail,
  Github,
  Linkedin,
  Globe,
  FileText,
  Edit3,
  Sparkles
} from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import ProfilePhotoEditor from '../../components/ProfilePhotoEditor';
import UserAvatar from '../../components/UserAvatar';

const StudentProfile = () => {
  const { user } = useAuth();
  const profile = user?.student_profile || {};

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
    : 'ST';

  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
      <ProfilePhotoEditor />
      <section className="cc-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <UserAvatar user={user} size="large" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.full_name}</h1>
                <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  Semester {profile.semester || 1}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-0.5">
                Target Role: {profile.target_role || 'Software Engineer'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  ID: {user?.university_id || 'Not specified'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {user?.department || 'CSE'}
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
            to="/student/profile/edit"
            className="cc-button-primary"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Me</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {profile.bio || 'No personal bio added yet. Click "Edit Profile" to summarize your academic interests and career goals.'}
          </p>
        </div>
      </section>

      {/* Skills & Portfolio Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <section className="cc-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Technical Skills & Tools
            </h2>
            <span className="text-xs text-slate-400">{skills.length} skills listed</span>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} variant="default" size="default" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No skills added yet.</p>
          )}
        </section>

        {/* Links & Resume */}
        <section className="cc-surface p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Portfolio & Social Links</h2>
          <div className="space-y-3">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">GitHub Profile</span>
                </div>
                <span className="text-xs text-indigo-600 font-bold">&rarr;</span>
              </a>
            )}

            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">LinkedIn Profile</span>
                </div>
                <span className="text-xs text-indigo-600 font-bold">&rarr;</span>
              </a>
            )}

            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">Live Portfolio</span>
                </div>
                <span className="text-xs text-indigo-600 font-bold">&rarr;</span>
              </a>
            )}

            {profile.cv_url && (
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">Download CV / Resume</span>
                </div>
                <span className="text-xs text-indigo-600 font-bold">&rarr;</span>
              </a>
            )}

            {!profile.github_url && !profile.linkedin_url && !profile.portfolio_url && !profile.cv_url && (
              <p className="text-xs text-slate-400 italic">No links added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentProfile;
