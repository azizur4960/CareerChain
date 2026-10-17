import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';
import { messagesApi } from '../../api/messages';
import {
  Building2,
  Award,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Github,
  Linkedin,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import UserAvatar from '../../components/UserAvatar';

const AlumniDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const data = await alumniApi.getAlumniById(id);
        setAlumni(data);
      } catch (err) {
        console.error(err);
        setError('Alumni profile not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setIsSending(true);
      setSendError('');
      await messagesApi.sendMessage({
        recipient_id: parseInt(id, 10),
        content: messageContent.trim(),
      });
      setSendSuccess(true);
      setMessageContent('');
      setTimeout(() => {
        navigate('/student/messages');
      }, 1200);
    } catch (err) {
      console.error(err);
      setSendError(err.response?.data?.detail || 'Your message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <Loader message="Loading alumni profile..." size="large" />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/student/alumni')} />;
  if (!alumni) return null;

  const profile = alumni.alumni_profile || {};
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

  const initials = alumni.full_name
    ? alumni.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AL';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/alumni')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Alumni Directory
      </button>

      {/* Main Profile Header */}
      <section className="cc-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <UserAvatar user={alumni} size="large" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{alumni.full_name}</h1>
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                    Verified Alumni
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-semibold text-indigo-700">
                {profile.current_position || 'Position not listed'}
                {profile.current_company && <span className="font-bold text-slate-900"> · {profile.current_company}</span>}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  Graduation Batch: {profile.graduation_batch || 'Not listed'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {profile.years_of_experience || 0} Years Experience
                </span>
                <span>•</span>
                <span>{alumni.department || 'Department not listed'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.is_available_for_mentorship ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Open for Mentorship
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Mentorship Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Career Path</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {profile.bio || 'No professional summary has been added.'}
          </p>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Expertise & Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} variant="neutral" />
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Profile
            </a>
          )}
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:underline"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          )}
        </div>
      </section>

      {/* Direct Messaging Box */}
      <section className="cc-surface p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          Send a Mentorship or Referral Inquiry to {alumni.full_name}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Be specific about your background, career interests, and why you are reaching out.
        </p>

        {sendSuccess ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
            Message sent! Redirecting to your active conversation thread...
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-3">
            {sendError && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{sendError}</p>}
            <textarea
              aria-label="Mentorship or referral message"
              rows={3}
              required
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Hi Farhan Bhai, I'm a 7th semester CSE student interested in your team's backend work at Brain Station 23..."
              className="cc-control w-full py-2.5"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending || !messageContent.trim()}
                className="cc-button-primary"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default AlumniDetail;
