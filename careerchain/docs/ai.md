# CareerChain AI & Recommendation Engine Specification

## 1. Introduction
The CareerChain AI subsystem delivers high-accuracy candidate-to-job matching, alumni mentor recommendations, and interactive career guidance. It is designed to run self-contained without paid cloud API dependencies, utilizing **Scikit-Learn TF-IDF vectorization**, cosine similarity, and a structured local RAG (Retrieval-Augmented Generation) knowledge engine.

---

## 2. Job Fit Scoring Engine (`backend/app/ai/matcher.py`)

The overall **Fit Score** is a weighted ensemble score ranging from 0 to 100:

$$\text{Fit Score} = 0.50 \times S_{\text{skills}} + 0.30 \times S_{\text{role}} + 0.10 \times S_{\text{exp}} + 0.10 \times S_{\text{pref}}$$

### A. Skill Match ($S_{\text{skills}}$ - 50% Weight)
1. Both student skills and job required skills are normalized (lowercased, punctuation-stripped, trimmed).
2. Set intersection computes $M = \text{Skills}_{\text{student}} \cap \text{Skills}_{\text{required}}$.
3. Recall ratio:
   $$R = \frac{|M|}{|\text{Skills}_{\text{required}}|}$$
4. Precision ratio:
   $$P = \frac{|M|}{\max(|\text{Skills}_{\text{student}}|, 1)}$$
5. Recall-weighted combined score:
  $$S_{\text{skills}} = 100 \times \left(0.75 \times R + 0.25 \times P\right)$$

### B. Semantic Role Match ($S_{\text{role}}$ - 30% Weight)
- Compares the student's target role and bio with the job title and description.
- Also compares target role directly with job title, preventing unrelated descriptive text from drowning out an obvious role match.
- Computes cosine similarity using Scikit-Learn `TfidfVectorizer` (with `ngram_range=(1, 2)` and English stop words).
- If `sentence-transformers` is installed and model weights are cached, it seamlessly upgrades to dense embeddings (`all-MiniLM-L6-v2`); otherwise, it gracefully executes TF-IDF cosine similarity.
- Scaled to 0-100 range.

### C. Experience Match ($S_{\text{exp}}$ - 10% Weight)
- Evaluates student semester progress (approx. 0.5 years per semester beyond foundational year) or declared experience against job `minimum_experience`.
- If candidate meets or exceeds minimum requirement: $S_{\text{exp}} = 100$.
- If candidate falls short: linear penalty:
  $$S_{\text{exp}} = \max\left(20, 100 - (\text{req\_exp} - \text{cand\_exp}) \times 25\right)$$

### D. Preferred Skills Match ($S_{\text{pref}}$ - 10% Weight)
- Ratio of student skills matching job's `preferred_skills` list. If no preferred skills are listed for the job, defaults to $100\%$.

### Output Structure
```json
{
  "fit_score": 84,
  "breakdown": {
    "skill_match": 88,
    "role_match": 82,
    "experience_match": 100,
    "preferred_skills_match": 60
  },
  "matched_skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
  "missing_skills": ["Docker", "AWS", "Kubernetes"],
  "recommendation": "Strong match. Upskill on Docker and AWS fundamentals to maximize interview readiness.",
  "disclaimer": "CareerChain Fit Score is an AI-assisted compatibility estimate based on profile and job information. It does not represent a hiring decision or guarantee employment."
}
```

---

## 3. Alumni Mentor Recommendation Algorithm
- Analyzes candidate target role vs. alumni current position and company.
- Computes skill overlap count and semantic cosine similarity.
- Prioritizes alumni with `is_available_for_mentorship == True` and `is_verified == True`.
- Generates transparent match explanations: *"Matches your target role (Backend Engineer) and shares 4 skills (Python, Django, Docker, PostgreSQL)"*.

---

## 4. Local RAG Career Assistant (`backend/app/ai/assistant.py`)
- Ingests structured domain files from `backend/data/career_knowledge/`:
  - `software_engineering.json` (Frontend, Backend, Fullstack, Mobile)
  - `data_ai.json` (Data Analyst, Data Scientist, ML Engineer, Data Engineer)
  - `qa_devops.json` (QA Automation, DevOps, Cloud Engineering, Security)
  - `interview_prep.json` (Resume building, behavioral questions, technical interviews, DIU campus placements)
  - `career_playbooks.json` (portfolio projects, internships, resume evidence, interview practice, alumni outreach, learning plans, and workplace readiness)
- Vectorizes knowledge chunks using TF-IDF.
- Retrieves up to four relevant chunks, filters weak matches, and expands common Bangla and Banglish career terms for English-language knowledge retrieval.
- Uses recent conversation context and the student's target role to understand follow-up questions and personalize suggested next steps.
- Returns intent-aware guidance and clickable follow-up prompts for resume reviews, interview practice, roadmaps, project ideas, alumni outreach, and job search.
- When `LLM_API_KEY` is configured, the existing Groq-compatible model receives the retrieved knowledge and recent conversation to refine the answer; failures use the local response.
- Includes mandatory ethical disclaimer: *"AI-generated career guidance may contain errors. Verify important career decisions using trusted sources or professional advice."*

### Voice and interaction
- The chat page supports browser speech recognition for English and Bangla input. The user reviews the transcript before sending it.
- Assistant replies can be read aloud with browser text-to-speech; voice support depends on the browser and available system voices.
- This is retrieval-augmented generation, not fine-tuning. Add or edit JSON playbooks in `backend/data/career_knowledge/` to expand the local knowledge source; the index is rebuilt when the backend starts.

### Resume-to-job analysis
- Students can paste resume text or upload PDF, DOCX, or TXT files (2 MB maximum).
- Files are parsed in memory and are not persisted. Scanned PDFs are rejected with an OCR-specific message.
- Skill extraction uses a bounded technology vocabulary, aliases, and skills explicitly listed by the selected job. It is deterministic NLP, not a general-purpose resume parser; users should review the detected skills.
- Extracted skills are compared with required and preferred job skills using the same match scorer. The response includes matched and missing required skills.
- The API recommends up to five verified alumni who share detected skills. Alumni contact proceeds through the authenticated messaging feature.

### Chat intent handling
- The assistant classifies greetings, interview preparation, resume review, learning roadmaps, project ideas, alumni referrals, skill guidance, job search, and general career guidance in English and common Bangla/Banglish phrasing.
- Up to eight recent user/assistant turns are sent for follow-up context. Out-of-scope messages receive a safe supported-topics response.
- Local retrieval is the default. An external Groq-compatible endpoint is used only when `LLM_API_KEY` is configured; failures fall back to local guidance.
