import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { Briefcase, ArrowLeft, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Dhaka, Bangladesh',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    description: '',
    responsibilities: '',
    required_skills: '',
    preferred_skills: '',
    minimum_experience: 0,
    application_url: '',
    referral_available: true,
    referral_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'minimum_experience'
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await jobsApi.createJob(formData);
      navigate('/alumni/jobs');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/alumni/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div>
          <p className="text-xs font-semibold text-indigo-700">Share an opportunity</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Create a job listing</h1>
        </div>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="cc-surface space-y-5 p-4 sm:p-6">
        <div>
          <label htmlFor="job-title" className="mb-1 block text-xs font-semibold text-slate-700">
            Job Title
          </label>
          <input
            type="text"
            id="job-title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Associate Backend Engineer (Python / FastAPI)"
            className="cc-control w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job-company" className="mb-1 block text-xs font-semibold text-slate-700">
              Hiring Company
            </label>
            <input
              type="text"
              id="job-company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Brain Station 23, BJIT, Pathao"
              className="cc-control w-full"
            />
          </div>

          <div>
            <label htmlFor="job-location" className="mb-1 block text-xs font-semibold text-slate-700">
              Job Location
            </label>
            <input
              type="text"
              id="job-location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Dhaka, Bangladesh (or Remote)"
              className="cc-control w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="job-work-mode" className="mb-1 block text-xs font-semibold text-slate-700">
              Work Mode
            </label>
            <select
              name="work_mode"
              id="job-work-mode"
              value={formData.work_mode}
              onChange={handleChange}
              className="cc-control w-full"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label htmlFor="job-employment-type" className="mb-1 block text-xs font-semibold text-slate-700">
              Employment Type
            </label>
            <select
              name="employment_type"
              id="job-employment-type"
              value={formData.employment_type}
              onChange={handleChange}
              className="cc-control w-full"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="job-experience" className="mb-1 block text-xs font-semibold text-slate-700">
              Min. Experience (Years)
            </label>
            <input
              type="number"
              name="minimum_experience"
              id="job-experience"
              min={0}
              max={15}
              value={formData.minimum_experience}
              onChange={handleChange}
              className="cc-control w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="job-description" className="mb-1 block text-xs font-semibold text-slate-700">
            Job Overview & Description
          </label>
          <textarea
            name="description"
            id="job-description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the role, engineering team, and culture..."
            className="cc-control w-full py-2.5"
          />
        </div>

        <div>
          <label htmlFor="job-responsibilities" className="mb-1 block text-xs font-semibold text-slate-700">
            Key Responsibilities
          </label>
          <textarea
            name="responsibilities"
            id="job-responsibilities"
            rows={3}
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="Build REST APIs; collaborate on architecture; write unit tests..."
            className="cc-control w-full py-2.5"
          />
        </div>

        <div>
          <label htmlFor="job-required-skills" className="mb-1 block text-xs font-semibold text-slate-700">
            Required Technical Skills (Comma-separated)
          </label>
          <input
            type="text"
            name="required_skills"
            id="job-required-skills"
            required
            value={formData.required_skills}
            onChange={handleChange}
            placeholder="Python, FastAPI, PostgreSQL, Docker, Git"
            className="cc-control w-full"
          />
        </div>

        <div>
          <label htmlFor="job-preferred-skills" className="mb-1 block text-xs font-semibold text-slate-700">
            Preferred / Nice-to-have Skills (Comma-separated)
          </label>
          <input
            type="text"
            name="preferred_skills"
            id="job-preferred-skills"
            value={formData.preferred_skills}
            onChange={handleChange}
            placeholder="Redis, AWS, Kubernetes, Celery"
            className="cc-control w-full"
          />
        </div>

        <div>
          <label htmlFor="job-application-url" className="mb-1 block text-xs font-semibold text-slate-700">
            Direct Application Link or Email
          </label>
          <input
            type="url"
            name="application_url"
            id="job-application-url"
            value={formData.application_url}
            onChange={handleChange}
            placeholder="https://company.com/careers/job-123"
            className="cc-control w-full"
          />
        </div>

        {formData.referral_available && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="referral_url">
              Referral Application Link
            </label>
            <input
              id="referral_url"
              type="url"
              name="referral_url"
              value={formData.referral_url}
              onChange={handleChange}
              placeholder="https://company.com/careers/referral/…"
              className="cc-control w-full"
            />
            <p className="mt-1 text-[11px] text-slate-500">Students see this link separately from the standard application link.</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-y border-slate-200 py-4">
          <label htmlFor="job-referral-available" className="cursor-pointer">
            <span className="block text-sm font-semibold text-slate-900">Alumni referral available</span>
            <span className="mt-0.5 block text-xs text-slate-600">Let students know they can ask you about a referral.</span>
          </label>
          <input
            id="job-referral-available"
            type="checkbox"
            name="referral_available"
            checked={formData.referral_available}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => navigate('/alumni/dashboard')}
            className="cc-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="cc-button-primary"
          >
            <PlusCircle className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
