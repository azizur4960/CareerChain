import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/ai';
import { useAuth } from '../../hooks/useAuth';
import JobCard from '../../components/JobCard';
import FitScoreBadge from '../../components/FitScoreBadge';
import SkillBadge from '../../components/SkillBadge';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  FileUp,
  Loader2,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AIJobMatchPage = () => {
  const { user } = useAuth();
  const [rankedList, setRankedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulator State
  const [customSkills, setCustomSkills] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [resumeInputMode, setResumeInputMode] = useState('text');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  useEffect(() => {
    if (user?.student_profile) {
      setCustomSkills(user.student_profile.skills || '');
      setCustomRole(user.student_profile.target_role || 'Software Engineer');
    }
    fetchRankedJobs();
  }, [user]);

  const fetchRankedJobs = async () => {
    try {
      setLoading(true);
      const data = await aiApi.getRankedJobs();
      setRankedList(data);
      setSelectedJobId((current) => current || String(data[0]?.job.id || ''));
    } catch (err) {
      console.error(err);
      setError('Failed to compute job rankings. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSubmit = async (event) => {
    event.preventDefault();
    setResumeError('');
    setResumeResult(null);
    setIsAnalyzingResume(true);

    const formData = new FormData();
    formData.append('job_id', selectedJobId);
    if (resumeInputMode === 'file' && resumeFile) {
      formData.append('resume_file', resumeFile);
    } else if (resumeInputMode === 'text' && resumeText.trim()) {
      formData.append('resume_text', resumeText.trim());
    } else {
      setResumeError(resumeInputMode === 'file' ? 'Choose a resume file to analyze.' : 'Paste resume text to analyze.');
      setIsAnalyzingResume(false);
      return;
    }

    try {
      const result = await aiApi.analyzeResume(formData);
      setResumeResult(result);
    } catch (err) {
      setResumeError(err.response?.data?.detail || 'Could not analyze this resume. Check the file and try again.');
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      // Re-score each job with simulated skills
      const updatedList = await Promise.all(
        rankedList.map(async (item) => {
          const matchRes = await aiApi.matchJob({
            job_id: item.job.id,
            custom_skills: customSkills,
            custom_target_role: customRole,
          });
          return {
            ...item,
            match_result: matchRes,
          };
        })
      );

      // Re-sort descending
      updatedList.sort((a, b) => b.match_result.fit_score - a.match_result.fit_score);
      setRankedList(updatedList);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Automated 4-Factor NLP Scoring Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Job Match Rankings
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            All active job postings automatically ranked against your profile skills, semester seniority, and career goals.
          </p>
        </div>

        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all self-start sm:self-auto"
        >
          <Sliders className="h-4 w-4" />
          {showSimulator ? 'Hide Skill Simulator' : 'Simulate Upskilling'}
        </button>
      </div>

      {/* Simulator Panel */}
      {showSimulator && (
        <form onSubmit={handleSimulate} className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Interactive Fit Score Simulator
            </h3>
          </div>
          <p className="text-xs text-indigo-800/80">
            Add skills you plan to learn or test different target specializations to see how your compatibility scores will improve.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Simulated Skills (Comma-separated)</label>
              <input
                type="text"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                placeholder="Python, Docker, AWS, React, Kubernetes..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Specialization</label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Backend Engineer, Full-Stack Engineer"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Re-scoring All Listings...' : 'Recalculate Fit Scores'}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-5 border-y border-slate-200 py-6" aria-labelledby="resume-match-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="resume-match-title" className="text-base font-bold text-slate-900">
              Resume skill analysis
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Compare detected skills with a job and find verified alumni with relevant experience.
            </p>
          </div>
          <div className="inline-flex w-fit rounded-lg border border-slate-200 p-1" role="group" aria-label="Resume input method">
            {['text', 'file'].map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={resumeInputMode === mode}
                onClick={() => {
                  setResumeInputMode(mode);
                  setResumeError('');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${resumeInputMode === mode ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {mode === 'text' ? 'Paste text' : 'Upload file'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleResumeSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]">
            <div>
              <label htmlFor="resume-job" className="mb-1.5 block text-xs font-semibold text-slate-700">Compare with job</label>
              <select
                id="resume-job"
                required
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                disabled={!rankedList.length}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {!rankedList.length && <option value="">No active jobs available</option>}
                {rankedList.map(({ job }) => <option key={job.id} value={job.id}>{job.title} · {job.company}</option>)}
              </select>
            </div>

            {resumeInputMode === 'text' ? (
              <div>
                <label htmlFor="resume-text" className="mb-1.5 block text-xs font-semibold text-slate-700">Resume text</label>
                <textarea
                  id="resume-text"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value.slice(0, 20000))}
                  maxLength={20000}
                  rows={5}
                  placeholder="Paste your resume, including experience, projects, and skills."
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
                <p className="mt-1 text-right text-[11px] text-slate-400">{resumeText.length.toLocaleString()} / 20,000</p>
              </div>
            ) : (
              <div>
                <label htmlFor="resume-file" className="mb-1.5 block text-xs font-semibold text-slate-700">Resume file</label>
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2.5 file:text-xs file:font-semibold file:text-slate-700"
                />
                <p className="mt-1 text-[11px] text-slate-500">PDF, DOCX, or TXT · up to 2 MB. Scanned PDFs require OCR.</p>
                {resumeFile && <p className="mt-2 truncate text-xs text-slate-600">{resumeFile.name}</p>}
              </div>
            )}
          </div>

          {resumeError && <p role="alert" className="text-xs font-medium text-red-700">{resumeError}</p>}
          <button
            type="submit"
            disabled={isAnalyzingResume || !selectedJobId || (resumeInputMode === 'file' && !resumeFile)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {isAnalyzingResume ? 'Analyzing resume' : 'Analyze against job'}
          </button>
        </form>

        {resumeResult && (
          <div className="space-y-4 border-t border-slate-200 pt-5" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{resumeResult.job_title} at {resumeResult.company}</p>
                <p className="mt-1 text-xs text-slate-500">{resumeResult.note}</p>
              </div>
              <FitScoreBadge score={resumeResult.match_result.fit_score} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Matched skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeResult.match_result.matched_skills.length ? resumeResult.match_result.matched_skills.map((skill) => <SkillBadge key={skill} skill={skill} size="small" variant="matched" />) : <span className="text-xs text-slate-500">No required skills matched.</span>}
                </div>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800"><AlertTriangle className="h-4 w-4" />Skills to build</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeResult.match_result.missing_skills.length ? resumeResult.match_result.missing_skills.map((skill) => <SkillBadge key={skill} skill={skill} size="small" variant="missing" />) : <span className="text-xs text-slate-500">No required skills missing.</span>}
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold text-slate-800">Skills detected in resume</h3>
              <div className="flex flex-wrap gap-1.5">
                {resumeResult.extracted_skills.length ? resumeResult.extracted_skills.map((skill) => <SkillBadge key={skill} skill={skill} size="small" variant="neutral" />) : <span className="text-xs text-slate-500">No supported skills found.</span>}
              </div>
            </div>
            {resumeResult.recommended_alumni.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800"><UserRound className="h-4 w-4" />Verified alumni with shared skills</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {resumeResult.recommended_alumni.map((alumnus) => (
                    <Link key={alumnus.id} to={`/student/alumni/${alumnus.id}`} className="flex items-start justify-between gap-3 border-t border-slate-200 py-3 hover:text-indigo-700">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold">{alumnus.full_name}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">{alumnus.position || 'Professional'}{alumnus.company ? ` · ${alumnus.company}` : ''}</span>
                        <span className="mt-1 block text-[11px] text-slate-500">Shared: {alumnus.shared_skills.join(', ')}</span>
                      </span>
                      <span className="shrink-0 text-xs font-bold">{alumnus.match_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Rankings List */}
      {loading ? (
        <Loader message="Running NLP vector similarity on active job postings..." size="large" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRankedJobs} />
      ) : (
        <div className="space-y-4">
          {rankedList.map(({ job, match_result }) => (
            <div
              key={job.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {job.work_mode}
                  </span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {job.employment_type}
                  </span>
                  {job.referral_available && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      DIU Referral Available
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  <Link to={`/student/jobs/${job.id}`} className="hover:text-indigo-600 transition-colors">
                    {job.title}
                  </Link>
                </h3>

                <p className="text-xs font-medium text-slate-500">
                  {job.company} • {job.location} • {job.minimum_experience === 0 ? 'Freshers welcome' : `${job.minimum_experience}+ yrs exp`}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {match_result.matched_skills.map((s, idx) => (
                    <SkillBadge key={idx} skill={s} variant="matched" size="small" />
                  ))}
                  {match_result.missing_skills.map((s, idx) => (
                    <SkillBadge key={idx} skill={s} variant="missing" size="small" />
                  ))}
                </div>

                <p className="text-xs text-slate-600 italic pt-1">
                  💡 {match_result.recommendation}
                </p>
              </div>

              {/* Fit Score & Action */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0 w-full md:w-auto">
                <FitScoreBadge score={match_result.fit_score} />
                <div className="text-[11px] text-slate-400 text-right">
                  <span>Skill {match_result.breakdown.skill_match}%</span> •{' '}
                  <span>Role {match_result.breakdown.role_match}%</span>
                </div>
                <Link
                  to={`/student/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIJobMatchPage;
