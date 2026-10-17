import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Plus, Sparkles, Trash2, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const blankResume = {
  fullName: '', headline: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '',
  summary: '', skills: '', experience: [], education: [], projects: [], certifications: '',
};

const verbs = ['Built', 'Developed', 'Designed', 'Led', 'Created', 'Improved', 'Automated', 'Delivered', 'Analyzed', 'Implemented', 'Launched', 'Streamlined'];
const stopWords = new Set('the and for with from into that this have has are was were will your our you their about using use used work working experience role team skills ability strong plus preferred required responsibilities'.split(' '));
const newEntry = (type) => type === 'experience'
  ? { title: '', company: '', dates: '', location: '', bullets: '' }
  : type === 'education'
    ? { degree: '', institution: '', dates: '', details: '' }
    : { name: '', link: '', bullets: '' };

function profileResume(user) {
  const profile = user?.student_profile || user?.alumni_profile || {};
  return {
    ...blankResume,
    fullName: user?.full_name || '',
    email: user?.email || '',
    headline: profile.target_role || profile.current_position || '',
    location: 'Dhaka, Bangladesh',
    summary: profile.bio || '',
    skills: profile.skills || '',
    linkedin: profile.linkedin_url || '',
    github: profile.github_url || '',
    portfolio: profile.portfolio_url || '',
  };
}

function analyzeResume(resume, jobDescription) {
  const content = [resume.headline, resume.summary, resume.skills, resume.experience.map((item) => `${item.title} ${item.company} ${item.bullets}`).join(' '), resume.projects.map((item) => `${item.name} ${item.bullets}`).join(' '), resume.education.map((item) => `${item.degree} ${item.institution}`).join(' '), resume.certifications].join(' ').toLowerCase();
  const words = (jobDescription.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || []).filter((word) => !stopWords.has(word));
  const frequency = words.reduce((result, word) => ({ ...result, [word]: (result[word] || 0) + 1 }), {});
  const keywords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]).slice(0, 30);
  const matched = keywords.filter((word) => content.includes(word));
  const checks = [
    { label: 'Contact details', ok: Boolean(resume.email && resume.fullName), tip: 'Add your name and a professional email address.' },
    { label: 'Target role headline', ok: Boolean(resume.headline.trim()), tip: 'Add a clear headline that matches your target role.' },
    { label: 'Professional summary', ok: resume.summary.trim().length >= 60, tip: 'Write a concise 2–4 line summary with your role, strengths, and evidence.' },
    { label: 'Skills section', ok: resume.skills.split(',').filter((item) => item.trim()).length >= 5, tip: 'Include at least five relevant skills, using the job description’s wording where accurate.' },
    { label: 'Experience or projects', ok: resume.experience.some((item) => item.title || item.bullets) || resume.projects.some((item) => item.name || item.bullets), tip: 'Add relevant experience, internships, research, or projects.' },
    { label: 'Education', ok: resume.education.some((item) => item.degree || item.institution), tip: 'Add your degree and institution.' },
    { label: 'Evidence and outcomes', ok: /\b\d+\s*%|\b\d+\+|\b\d{2,}\b/.test(content), tip: 'Where truthful, show scale or results with numbers (for example, users served or time saved).' },
    { label: 'Readable length', ok: content.trim().split(/\s+/).length >= 120, tip: 'Add relevant detail; most resumes benefit from concise, complete evidence.' },
  ];
  const base = Math.round((checks.filter((check) => check.ok).length / checks.length) * 75);
  const keywordPoints = jobDescription.trim() ? Math.round((matched.length / Math.max(keywords.length, 1)) * 25) : 0;
  return { score: Math.min(100, base + keywordPoints), checks, keywords, matched };
}

function improveBullet(value) {
  const text = value.trim().replace(/^[•\-\s]+/, '').replace(/\s+— add a truthful metric or outcome if you can support one\.?$/i, '');
  if (!text) return '';
  const hasVerb = verbs.some((verb) => new RegExp(`^${verb}\\b`, 'i').test(text));
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  const result = hasVerb ? capitalized : `${verbs[0]} ${capitalized.charAt(0).toLowerCase()}${capitalized.slice(1)}`;
  if (/\b\d+\s*%|\b\d+\+|\b\d{2,}\b/.test(result)) return result;
  return `${result} — add a truthful metric or outcome if you can support one.`;
}

const Field = ({ label, value, onChange, placeholder = '', type = 'text', rows, hint }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
    {rows ? <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="cc-control w-full" />
      : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="cc-control w-full" />}
    {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

const Section = ({ title, description, children, action }) => (
  <section className="resume-editor-section cc-surface space-y-4 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="text-base font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>
      {action}
    </div>
    {children}
  </section>
);

function ResumeBuilder() {
  const { user } = useAuth();
  const storageKey = `careerchain-resume-${user?.id || 'guest'}`;
  const [resume, setResume] = useState(() => profileResume(user));
  const [jobDescription, setJobDescription] = useState('');
  const [saveState, setSaveState] = useState('Saved in this browser');
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    let loaded = null;
    try { loaded = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { /* Ignore damaged local drafts. */ }
    setResume(loaded ? { ...profileResume(user), ...loaded } : profileResume(user));
  }, [storageKey, user]);

  useEffect(() => {
    setSaveState('Saving…');
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(resume));
        setSaveState('Saved in this browser');
      } catch {
        setSaveState('Could not save draft — check browser storage');
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [resume, storageKey]);

  const report = useMemo(() => analyzeResume(resume, jobDescription), [resume, jobDescription]);
  const change = (key, value) => setResume((current) => ({ ...current, [key]: value }));
  const changeEntry = (type, index, key, value) => setResume((current) => ({ ...current, [type]: current[type].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addEntry = (type) => setResume((current) => ({ ...current, [type]: [...current[type], newEntry(type)] }));
  const removeEntry = (type, index) => setResume((current) => ({ ...current, [type]: current[type].filter((_, itemIndex) => itemIndex !== index) }));
  const resetDraft = () => {
    if (!window.confirm('Clear this resume draft and start again from your profile?')) return;
    setResume(profileResume(user));
    setJobDescription('');
    setShowScore(false);
  };
  const generateSummary = () => {
    const role = resume.headline.trim() || 'early-career professional';
    const skills = resume.skills.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4);
    const projects = resume.projects.map((item) => item.name.trim()).filter(Boolean);
    const experience = resume.experience.map((item) => item.title.trim()).filter(Boolean);
    const focus = [...experience, ...projects].slice(0, 2);
    const text = `${role} with strengths in ${skills.length ? skills.join(', ') : 'problem-solving and collaboration'}.${focus.length ? ` Experienced in ${focus.join(' and ')}.` : ''} Seeking to contribute to a team building useful, reliable products.`;
    change('summary', text);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><Sparkles className="h-3.5 w-3.5" />Free · private · no API key</div>
          <h1 className="text-2xl font-bold text-slate-900">ATS Resume Builder</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Build a clear, role-focused resume with local writing guidance, job keyword checks, and a print-ready preview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span aria-live="polite" className="mr-1 text-xs text-slate-500">{saveState}</span>
          <button type="button" onClick={resetDraft} className="cc-button-secondary"><RotateCcw className="h-4 w-4" />Reset</button>
          <button type="button" onClick={() => window.print()} className="cc-button-primary"><Download className="h-4 w-4" />Export PDF</button>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <div className="space-y-4">
          <Section title="Contact & target role" description="Keep your contact information professional and easy to find.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={resume.fullName} onChange={(value) => change('fullName', value)} placeholder="Your name" />
              <Field label="Target role / headline" value={resume.headline} onChange={(value) => change('headline', value)} placeholder="e.g. Frontend Developer" />
              <Field label="Email" value={resume.email} onChange={(value) => change('email', value)} type="email" placeholder="name@example.com" />
              <Field label="Phone" value={resume.phone} onChange={(value) => change('phone', value)} placeholder="+880 1XXX-XXXXXX" />
              <Field label="Location" value={resume.location} onChange={(value) => change('location', value)} placeholder="City, Country" />
              <Field label="LinkedIn URL" value={resume.linkedin} onChange={(value) => change('linkedin', value)} placeholder="linkedin.com/in/yourname" />
              <Field label="GitHub URL" value={resume.github} onChange={(value) => change('github', value)} placeholder="github.com/yourname" />
              <Field label="Portfolio URL" value={resume.portfolio} onChange={(value) => change('portfolio', value)} placeholder="yourportfolio.com" />
            </div>
          </Section>

          <Section title="Professional summary" description="Aim for 2–4 specific lines. Keep every claim accurate." action={<button type="button" onClick={generateSummary} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"><Sparkles className="h-3.5 w-3.5" />Draft with AI</button>}>
            <Field label="Summary" value={resume.summary} onChange={(value) => change('summary', value)} rows={4} placeholder="Who you are, your strongest relevant skills, and the value you bring." hint="Drafting runs locally in your browser using your resume details; review and edit the suggestion." />
          </Section>

          <Section title="Work experience" description="Include internships, freelance work, research, or relevant volunteering." action={<button type="button" onClick={() => addEntry('experience')} className="cc-button-secondary px-3"><Plus className="h-4 w-4" />Add role</button>}>
            {resume.experience.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">No experience yet? Add projects, coursework, research, or volunteer work below and describe what you contributed.</p>}
            {resume.experience.map((item, index) => <div key={`experience-${index}`} className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Role {index + 1}</p><button type="button" aria-label={`Remove role ${index + 1}`} onClick={() => removeEntry('experience', index)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Job title" value={item.title} onChange={(value) => changeEntry('experience', index, 'title', value)} placeholder="Software Engineering Intern" /><Field label="Company" value={item.company} onChange={(value) => changeEntry('experience', index, 'company', value)} placeholder="Company name" /><Field label="Dates" value={item.dates} onChange={(value) => changeEntry('experience', index, 'dates', value)} placeholder="Jun 2024 – Aug 2024" /><Field label="Location" value={item.location} onChange={(value) => changeEntry('experience', index, 'location', value)} placeholder="Dhaka / Remote" /></div>
              <Field label="Impact bullets (one per line)" value={item.bullets} onChange={(value) => changeEntry('experience', index, 'bullets', value)} rows={4} placeholder={'Built a feature used by 200 students\nReduced page load time by 25%'} hint="Start with an action verb; explain what you did, how, and the truthful result." />
              {item.bullets.trim() && <button type="button" onClick={() => changeEntry('experience', index, 'bullets', item.bullets.split('\n').map(improveBullet).join('\n'))} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"><Sparkles className="h-3.5 w-3.5" />Improve bullet wording</button>}
            </div>)}
          </Section>

          <Section title="Projects" description="Show relevant work and what you personally built." action={<button type="button" onClick={() => addEntry('projects')} className="cc-button-secondary px-3"><Plus className="h-4 w-4" />Add project</button>}>
            {resume.projects.length === 0 && <p className="text-xs text-slate-500">Personal, academic, and open-source projects all count.</p>}
            {resume.projects.map((item, index) => <div key={`project-${index}`} className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Project {index + 1}</p><button type="button" aria-label={`Remove project ${index + 1}`} onClick={() => removeEntry('projects', index)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Project name" value={item.name} onChange={(value) => changeEntry('projects', index, 'name', value)} placeholder="CareerChain" /><Field label="Project URL (optional)" value={item.link} onChange={(value) => changeEntry('projects', index, 'link', value)} placeholder="github.com/..." /></div>
              <Field label="What you built (one point per line)" value={item.bullets} onChange={(value) => changeEntry('projects', index, 'bullets', value)} rows={3} placeholder="Built a job matching feature using FastAPI and React" />
              {item.bullets.trim() && <button type="button" onClick={() => changeEntry('projects', index, 'bullets', item.bullets.split('\n').map(improveBullet).join('\n'))} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"><Sparkles className="h-3.5 w-3.5" />Improve bullet wording</button>}
            </div>)}
          </Section>

          <Section title="Education" description="Add your degree, institution, and relevant academic details." action={<button type="button" onClick={() => addEntry('education')} className="cc-button-secondary px-3"><Plus className="h-4 w-4" />Add education</button>}>
            {resume.education.length === 0 && <p className="text-xs text-slate-500">Add your university, degree, and expected or completed graduation date.</p>}
            {resume.education.map((item, index) => <div key={`education-${index}`} className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Education {index + 1}</p><button type="button" aria-label={`Remove education ${index + 1}`} onClick={() => removeEntry('education', index)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Degree / program" value={item.degree} onChange={(value) => changeEntry('education', index, 'degree', value)} placeholder="B.Sc. in Computer Science & Engineering" /><Field label="Institution" value={item.institution} onChange={(value) => changeEntry('education', index, 'institution', value)} placeholder="Daffodil International University" /><Field label="Dates" value={item.dates} onChange={(value) => changeEntry('education', index, 'dates', value)} placeholder="2022 – 2026" /></div>
              <Field label="Relevant details (optional)" value={item.details} onChange={(value) => changeEntry('education', index, 'details', value)} placeholder="Relevant coursework, honors, GPA (if useful)" />
            </div>)}
          </Section>

          <Section title="Skills & certifications" description="Use simple, searchable terms that reflect your actual experience.">
            <Field label="Skills (comma separated)" value={resume.skills} onChange={(value) => change('skills', value)} rows={3} placeholder="JavaScript, React, Python, SQL, Git, Communication" />
            <Field label="Certifications / courses (optional)" value={resume.certifications} onChange={(value) => change('certifications', value)} rows={2} placeholder="Certification — Issuer, Year" />
          </Section>

          <Section title="Check against a job" description="Paste a job description to see overlapping keywords and tailored resume checks. This analysis stays in your browser.">
            <Field label="Job description (optional)" value={jobDescription} onChange={setJobDescription} rows={6} placeholder="Paste the job description here to check whether your resume uses relevant, truthful terms." />
            <button type="button" onClick={() => setShowScore(true)} className="cc-button-primary"><Sparkles className="h-4 w-4" />Analyze ATS readiness</button>
            {showScore && <div aria-live="polite" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-900">Readiness estimate</p><p className="text-[11px] text-slate-500">A checklist, not a hiring prediction.</p></div><span className="text-2xl font-bold text-indigo-700">{report.score}<span className="text-sm text-slate-500">/100</span></span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${report.score}%` }} /></div>
              <ul className="space-y-2">{report.checks.map((check) => <li key={check.label} className="flex items-start gap-2 text-xs"><CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${check.ok ? 'text-emerald-600' : 'text-slate-300'}`} /><span className={check.ok ? 'text-slate-700' : 'text-slate-600'}>{check.ok ? check.label : check.tip}</span></li>)}</ul>
              {jobDescription.trim() && <div><p className="mb-1 text-xs font-bold text-slate-700">Job keywords found in your resume ({report.matched.length}/{report.keywords.length})</p><p className="text-xs leading-5 text-slate-600">{report.matched.length ? report.matched.join(' · ') : 'No overlapping keywords detected yet. Add matching terms only when they accurately describe your experience.'}</p></div>}
            </div>}
          </Section>
        </div>

        <aside className="resume-preview-column space-y-4 xl:sticky xl:top-20">
          <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-900">Live preview</p><p className="text-xs text-slate-500">ATS-friendly single-column layout</p></div><button type="button" onClick={() => window.print()} aria-label="Print or save resume as PDF" className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><Download className="h-5 w-5" /></button></div>
          <article className="resume-print-area min-h-[680px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Resume preview">
            <header className="border-b-2 border-slate-800 pb-4">
              <h2 className="break-words text-2xl font-bold uppercase tracking-wide text-slate-900">{resume.fullName || 'Your Name'}</h2>
              {resume.headline && <p className="mt-1 text-sm font-semibold text-slate-700">{resume.headline}</p>}
              <p className="mt-2 break-words text-[10px] leading-5 text-slate-600">{[resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.portfolio].filter(Boolean).join('  ·  ') || 'Email · Phone · Location · LinkedIn'}</p>
            </header>
            {resume.summary && <section className="resume-preview-section"><h3>Professional Summary</h3><p>{resume.summary}</p></section>}
            {resume.experience.some((item) => item.title || item.bullets || item.company) && <section className="resume-preview-section"><h3>Experience</h3>{resume.experience.filter((item) => item.title || item.bullets || item.company).map((item, index) => <div className="resume-preview-entry" key={index}><div className="flex justify-between gap-2"><strong>{item.title || 'Role'}{item.company && ` · ${item.company}`}</strong><span>{item.dates}</span></div>{item.location && <p>{item.location}</p>}{item.bullets.split('\n').filter(Boolean).map((bullet, bulletIndex) => <p className="resume-preview-bullet" key={bulletIndex}>• {bullet}</p>)}</div>)}</section>}
            {resume.projects.some((item) => item.name || item.bullets) && <section className="resume-preview-section"><h3>Projects</h3>{resume.projects.filter((item) => item.name || item.bullets).map((item, index) => <div className="resume-preview-entry" key={index}><strong>{item.name || 'Project'}</strong>{item.link && <p>{item.link}</p>}{item.bullets.split('\n').filter(Boolean).map((bullet, bulletIndex) => <p className="resume-preview-bullet" key={bulletIndex}>• {bullet}</p>)}</div>)}</section>}
            {resume.education.some((item) => item.degree || item.institution) && <section className="resume-preview-section"><h3>Education</h3>{resume.education.filter((item) => item.degree || item.institution).map((item, index) => <div className="resume-preview-entry" key={index}><div className="flex justify-between gap-2"><strong>{item.degree || 'Degree'}{item.institution && ` · ${item.institution}`}</strong><span>{item.dates}</span></div>{item.details && <p>{item.details}</p>}</div>)}</section>}
            {resume.skills.trim() && <section className="resume-preview-section"><h3>Skills</h3><p>{resume.skills}</p></section>}
            {resume.certifications.trim() && <section className="resume-preview-section"><h3>Certifications</h3><p>{resume.certifications}</p></section>}
            {!resume.summary && !resume.experience.length && !resume.projects.length && !resume.education.length && !resume.skills && <div className="mt-16 text-center text-sm text-slate-400"><FileText className="mx-auto mb-2 h-8 w-8" />Your resume preview will appear as you add details.</div>}
          </article>
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900"><Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" /><p>ATS tools vary. Use standard section names, a simple layout, and truthful role-specific keywords. Proofread your exported PDF before applying.</p></div>
          <p className="text-[11px] leading-5 text-slate-500">Your draft is saved to this browser only. It is not uploaded or synced to another device.</p>
        </aside>
      </div>
    </div>
  );
}

export default ResumeBuilder;
