import json
import re
import logging
from typing import List, Dict, Any, Set, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("careerchain.ai.matcher")

SKILL_ALIASES = {
    "aws": ("aws", "amazon web services"),
    "c++": ("c++", "c plus plus"),
    "c#": ("c#", "c sharp"),
    "css": ("css", "css3"),
    "docker": ("docker",),
    "fastapi": ("fastapi",),
    "git": ("git", "github"),
    "html": ("html", "html5"),
    "java": ("java",),
    "javascript": ("javascript",),
    "kubernetes": ("kubernetes", "k8s"),
    "mongodb": ("mongodb", "mongo db"),
    "mysql": ("mysql",),
    "node.js": ("node.js", "nodejs", "node js"),
    "postgresql": ("postgresql", "postgres"),
    "python": ("python",),
    "react": ("react", "react.js", "reactjs"),
    "redis": ("redis",),
    "sql": ("sql",),
    "tensorflow": ("tensorflow",),
    "typescript": ("typescript",),
}

SKILL_DISPLAY_NAMES = {
    "aws": "AWS",
    "c++": "C++",
    "c#": "C#",
    "css": "CSS",
    "fastapi": "FastAPI",
    "html": "HTML",
    "javascript": "JavaScript",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "node.js": "Node.js",
    "postgresql": "PostgreSQL",
    "sql": "SQL",
    "tensorflow": "TensorFlow",
    "typescript": "TypeScript",
}

# Try importing SentenceTransformer gracefully with fallback to TF-IDF
_SENTENCE_TRANSFORMER = None
_TRY_LOAD_ST = True

def get_sentence_transformer():
    global _SENTENCE_TRANSFORMER, _TRY_LOAD_ST
    if _SENTENCE_TRANSFORMER is None and _TRY_LOAD_ST:
        try:
            # pyrefly: ignore [missing-import]
            from sentence_transformers import SentenceTransformer
            # pyrefly: ignore [missing-import]
            # Only load if local or quick
            _SENTENCE_TRANSFORMER = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded SentenceTransformer ('all-MiniLM-L6-v2') for dense role embeddings.")
        except Exception:
            _TRY_LOAD_ST = False
            _SENTENCE_TRANSFORMER = None
            logger.info("SentenceTransformer not available or weights not downloaded. Utilizing Scikit-Learn TF-IDF for semantic role match.")
    return _SENTENCE_TRANSFORMER


def normalize_skills(skills_input: Any) -> Set[str]:
    """Parse and normalize skills list from string (comma/newline separated or JSON) into cleaned set."""
    if not skills_input:
        return set()
    
    skill_items = []
    if isinstance(skills_input, list):
        skill_items = [str(s).strip() for s in skills_input if s]
    elif isinstance(skills_input, str):
        # Try JSON parsing
        try:
            parsed = json.loads(skills_input)
            if isinstance(parsed, list):
                skill_items = [str(s).strip() for s in parsed if s]
            else:
                skill_items = [s.strip() for s in skills_input.split(",") if s.strip()]
        except Exception:
            # Split on commas, semicolons or newlines
            skill_items = [s.strip() for s in re.split(r"[,;\n]+", skills_input) if s.strip()]

    # Normalize: lowercase, remove special characters for matching
    normalized = set()
    for item in skill_items:
        clean = item.strip().lower()
        if clean:
            normalized.add(clean)
    return normalized


def extract_skills_from_text(resume_text: str, additional_skills: Any = None) -> List[str]:
    """Extract known technologies from resume text using aliases and word boundaries."""
    text = (resume_text or "").lower()
    if not text.strip():
        return []

    candidates = dict(SKILL_ALIASES)
    for skill in normalize_skills(additional_skills):
        candidates.setdefault(skill, (skill,))

    extracted = set()
    for canonical, aliases in candidates.items():
        for alias in aliases:
            escaped_alias = re.escape(alias.lower()).replace(r"\ ", r"\s+")
            if re.search(rf"(?<![a-z0-9]){escaped_alias}(?![a-z0-9])", text):
                extracted.add(canonical)
                break

    return sorted(SKILL_DISPLAY_NAMES.get(skill, skill.title()) for skill in extracted)


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """Calculate semantic cosine similarity between two texts using SentenceTransformer or TF-IDF."""
    if not text1.strip() or not text2.strip():
        return 0.3  # Neutral baseline if text is missing

    model = get_sentence_transformer()
    if model is not None:
        try:
            embeddings = model.encode([text1, text2])
            sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(max(0.0, min(1.0, sim)))
        except Exception as e:
            logger.warning(f"Sentence transformer encoding failed: {e}. Falling back to TF-IDF.")

    # Scikit-Learn TF-IDF Fallback
    try:
        tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = tfidf.fit_transform([text1, text2])
        sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        # Calibrate TF-IDF similarity slightly to 0.0 - 1.0 curve
        calibrated = min(1.0, float(sim) * 1.35)
        return max(0.0, calibrated)
    except Exception:
        # If vocabulary is empty (e.g. only stop words)
        return 0.4


def match_student_to_job(
    student_skills_raw: Any,
    student_target_role: str,
    student_bio: str,
    student_semester: int,
    job_title: str,
    job_description: str,
    job_required_skills_raw: Any,
    job_preferred_skills_raw: Any,
    job_min_experience: int
) -> Dict[str, Any]:
    """
    Job Fit Score Algorithm:
    - Skill Match (50%): Set intersection of normalized student skills vs job required skills.
    - Semantic Role Match (30%): Vector cosine similarity between Student Target Role / Bio and Job Title / Description.
    - Experience Match (10%): Linear penalty scale if student semester/experience is below minimum.
    - Preferred Skills Match (10%): Overlap ratio on bonus/preferred skills.
    """
    student_skills = normalize_skills(student_skills_raw)
    job_required_skills = normalize_skills(job_required_skills_raw)
    job_preferred_skills = normalize_skills(job_preferred_skills_raw)

    # 1. Skill Match (50%)
    if not job_required_skills:
        skill_score = 80.0
        matched_skills_set = student_skills
        missing_skills_set = set()
    else:
        matched_skills_set = student_skills.intersection(job_required_skills)
        missing_skills_set = job_required_skills - student_skills
        
        recall = len(matched_skills_set) / max(len(job_required_skills), 1)
        precision = len(matched_skills_set) / max(len(student_skills), 1)
        
        # Weighted combination favoring recall (coverage of required skills)
        skill_score = min(100.0, (0.75 * recall + 0.25 * precision) * 100.0)

    # Convert sets to display lists
    matched_skills = sorted(SKILL_DISPLAY_NAMES.get(skill, skill.title()) for skill in matched_skills_set)
    missing_skills = sorted(SKILL_DISPLAY_NAMES.get(skill, skill.title()) for skill in missing_skills_set)

    # 2. Semantic Role Match (30%)
    student_text = f"{student_target_role or ''} {student_bio or ''}".strip()
    job_text = f"{job_title or ''} {job_description or ''}".strip()
    role_similarity = max(
        compute_semantic_similarity(student_text, job_text),
        compute_semantic_similarity(student_target_role or "", job_title or ""),
    )
    role_score = min(100.0, role_similarity * 100.0)

    # 3. Experience Match (10%)
    # In university context: Semester 1-4 = 0 exp, Semester 5-8 = 0.5 - 1.5 yrs, 9-12 = 1.5 - 2.5 yrs
    estimated_experience_years = max(0.0, (student_semester - 4) * 0.35)
    if estimated_experience_years >= job_min_experience or job_min_experience == 0:
        experience_score = 100.0
    else:
        gap = job_min_experience - estimated_experience_years
        experience_score = max(20.0, 100.0 - (gap * 25.0))

    # 4. Preferred Skills Match (10%)
    if not job_preferred_skills:
        preferred_score = 100.0
    else:
        pref_matched = student_skills.intersection(job_preferred_skills)
        preferred_score = min(100.0, (len(pref_matched) / len(job_preferred_skills)) * 100.0)

    # Total Weighted Fit Score
    total_fit_score = (
        0.50 * skill_score +
        0.30 * role_score +
        0.10 * experience_score +
        0.10 * preferred_score
    )
    total_fit_score = round(max(0.0, min(100.0, total_fit_score)), 1)

    # Recommendation synthesis
    if total_fit_score >= 80:
        if missing_skills:
            top_missing = ", ".join(missing_skills[:3])
            recommendation = (
                f"Exceptional match! You possess strong foundation for this role. "
                f"Brush up on {top_missing} to maximize interview readiness."
            )
        else:
            recommendation = "Outstanding match! Your profile aligns directly with all requirements. Highly recommended to apply or request a referral."
    elif total_fit_score >= 60:
        if missing_skills:
            top_missing = ", ".join(missing_skills[:4])
            recommendation = (
                f"Competitive match. Upskilling on {top_missing} will significantly strengthen your candidacy."
            )
        else:
            recommendation = "Good overall alignment. Prepare for system design and role-specific technical questions."
    else:
        top_missing = ", ".join(missing_skills[:4]) if missing_skills else "the required core technologies"
        recommendation = (
            f"Developing match. We suggest targeted coursework, personal projects focusing on {top_missing}, "
            f"and connecting with alumni mentors in this domain."
        )

    return {
        "fit_score": total_fit_score,
        "breakdown": {
            "skill_match": round(skill_score, 1),
            "role_match": round(role_score, 1),
            "experience_match": round(experience_score, 1),
            "preferred_skills_match": round(preferred_score, 1)
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation,
        "disclaimer": (
            "CareerChain Fit Score is an AI-assisted compatibility estimate based on profile "
            "and job information. It does not represent a hiring decision or guarantee employment."
        )
    }


def recommend_alumni_mentors(
    student_target_role: str,
    student_skills_raw: Any,
    student_department: str,
    alumni_list: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """Rank alumni mentors based on mentorship availability, role synergy, and shared skills."""
    student_skills = normalize_skills(student_skills_raw)
    ranked = []

    for item in alumni_list:
        alumni_user = item["user"]
        alumni_profile = item["profile"]
        
        # Base availability check
        is_available = alumni_profile.is_available_for_mentorship if alumni_profile else True
        is_verified = alumni_profile.is_verified if alumni_profile else False

        alumni_position = (alumni_profile.current_position or "") if alumni_profile else ""
        alumni_company = (alumni_profile.current_company or "") if alumni_profile else ""
        alumni_skills = normalize_skills(alumni_profile.skills if alumni_profile else "")

        # 1. Shared Skills
        shared = student_skills.intersection(alumni_skills)
        skill_score = min(100.0, (len(shared) / max(len(alumni_skills), 1)) * 100.0) if alumni_skills else 50.0

        # 2. Role Synergy
        role_sim = compute_semantic_similarity(
            student_target_role or student_department or "",
            f"{alumni_position} {alumni_company}"
        )
        role_score = role_sim * 100.0

        # 3. Verification & Experience Bonus
        exp_years = (alumni_profile.years_of_experience or 0) if alumni_profile else 1
        exp_score = min(100.0, exp_years * 12.0)
        verified_bonus = 15.0 if is_verified else 0.0
        mentorship_bonus = 20.0 if is_available else -30.0

        total_score = (
            0.40 * role_score +
            0.35 * skill_score +
            0.15 * exp_score +
            verified_bonus +
            mentorship_bonus
        )
        total_score = round(max(10.0, min(100.0, total_score)), 1)

        # Generate contextual explanation
        shared_list = sorted([s.title() for s in shared])
        if shared_list:
            skills_txt = f"shares {len(shared_list)} skills ({', '.join(shared_list[:3])})"
        else:
            skills_txt = "broad engineering background"

        explanation = (
            f"Alumni at {alumni_company or 'Tech Industry'} working as {alumni_position or 'Professional'}; "
            f"{skills_txt} and offers valuable guidance for {student_target_role or 'your career path'}."
        )

        ranked.append({
            "alumni": alumni_user,
            "match_score": total_score,
            "shared_skills": shared_list,
            "explanation": explanation
        })

    # Sort descending by match score
    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked[:top_k]
