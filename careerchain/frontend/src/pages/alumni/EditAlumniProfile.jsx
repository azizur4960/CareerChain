import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';
import { useAuth } from '../../hooks/useAuth';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const EditAlumniProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    graduation_batch: '2021',
    current_company: '',
    current_position: '',
    skills: '',
    bio: '',
    years_of_experience: 2,
    linkedin_url: '',
    github_url: '',
    is_available_for_mentorship: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.alumni_profile) {
      const ap = user.alumni_profile;
      setFormData({
        graduation_batch: ap.graduation_batch || '2021',
        current_company: ap.current_company || '',
        current_position: ap.current_position || '',
        skills: ap.skills || '',
        bio: ap.bio || '',
        years_of_experience: ap.years_of_experience || 0,
        linkedin_url: ap.linkedin_url || '',
        github_url: ap.github_url || '',
        is_available_for_mentorship: ap.is_available_for_mentorship ?? true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'years_of_experience'
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await alumniApi.updateMyProfile(formData);
      await refreshUser();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        navigate('/alumni/profile');
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/alumni/profile')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel & Back to Profile
        </button>
        <h1 className="text-xl font-extrabold text-slate-900">Edit Alumni Profile</h1>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Company / Organization
            </label>
            <input
              type="text"
              name="current_company"
              required
              value={formData.current_company}
              onChange={handleChange}
              placeholder="e.g. Brain Station 23, BJIT, Pathao"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Position / Title
            </label>
            <input
              type="text"
              name="current_position"
              required
              value={formData.current_position}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Graduation Batch / Year
            </label>
            <input
              type="text"
              name="graduation_batch"
              value={formData.graduation_batch}
              onChange={handleChange}
              placeholder="e.g. 2021"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Years of Professional Experience
            </label>
            <input
              type="number"
              name="years_of_experience"
              min={0}
              max={40}
              value={formData.years_of_experience}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Technical Stack & Core Skills (Comma-separated)
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Python, FastAPI, Django, Docker, Kubernetes, AWS, SQL"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Career Bio & Mentorship Summary
          </label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Describe your current engineering work, background, and how you can guide DIU students..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GitHub Profile URL
            </label>
            <input
              type="url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-950 block">Available for Student Mentorship</span>
            <span className="text-[11px] text-indigo-800/80">Allow DIU students to message you for career advice and referrals</span>
          </div>
          <input
            type="checkbox"
            name="is_available_for_mentorship"
            checked={formData.is_available_for_mentorship}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/alumni/profile')}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAlumniProfile;
