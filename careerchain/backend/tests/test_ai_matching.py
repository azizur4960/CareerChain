from app.ai.matcher import match_student_to_job, normalize_skills, compute_semantic_similarity
from app.ai.assistant import generate_rag_response, identify_career_intent
from app.ai.knowledge_base import knowledge_base
from app.ai.matcher import extract_skills_from_text
from app.ai.resume_parser import extract_resume_text


def test_normalize_skills():
    skills_csv = "Python, FastAPI, Docker, postgresql,   REACT  "
    normalized = normalize_skills(skills_csv)
    assert "python" in normalized
    assert "fastapi" in normalized
    assert "docker" in normalized
    assert "postgresql" in normalized
    assert "react" in normalized


def test_match_student_to_job_high_fit():
    result = match_student_to_job(
        student_skills_raw="Python, FastAPI, PostgreSQL, Docker, Git",
        student_target_role="Backend Engineer",
        student_bio="Passionate about building scalable REST APIs and database design.",
        student_semester=8,
        job_title="Associate Backend Engineer (Python / FastAPI)",
        job_description="Seeking a backend developer with Python, FastAPI, and relational database skills.",
        job_required_skills_raw="Python, FastAPI, PostgreSQL, Docker",
        job_preferred_skills_raw="Redis, AWS",
        job_min_experience=1
    )

    assert "fit_score" in result
    assert result["fit_score"] >= 75.0
    assert "breakdown" in result
    assert "matched_skills" in result
    assert "missing_skills" in result
    assert "recommendation" in result
    assert "disclaimer" in result
    assert "Python" in result["matched_skills"] or "python" in [s.lower() for s in result["matched_skills"]]


def test_match_student_to_job_low_fit():
    result = match_student_to_job(
        student_skills_raw="Figma, Adobe XD, User Research, Wireframing",
        student_target_role="UI/UX Designer",
        student_bio="Designer crafting visual interfaces.",
        student_semester=2,
        job_title="Senior DevOps & Kubernetes Architect",
        job_description="Manage large-scale Kubernetes clusters, Linux kernels, and Terraform IaC.",
        job_required_skills_raw="Kubernetes, Terraform, Linux, Golang, CI/CD",
        job_preferred_skills_raw="Prometheus, AWS",
        job_min_experience=5
    )

    assert result["fit_score"] < 60.0
    assert len(result["missing_skills"]) >= 3


def test_knowledge_base_search():
    results = knowledge_base.search("React frontend hooks state management", top_k=2)
    assert len(results) > 0
    top_doc = results[0]
    assert "title" in top_doc
    assert "relevance_score" in top_doc


def test_career_assistant_rag_response():
    resp = generate_rag_response("How should I prepare for a backend interview and build my resume?")
    assert "reply" in resp
    assert len(resp["reply"]) > 50
    assert "retrieved_sources" in resp
    assert "disclaimer" in resp
    assert resp["intent"] == "interview_prep"
    assert resp["supported"] is True


def test_career_assistant_rejects_unrelated_questions():
    response = generate_rag_response("What is the weather today?")
    assert identify_career_intent("Can you review my resume?") == "resume_review"
    assert response["intent"] == "unsupported"
    assert response["supported"] is False


def test_career_assistant_uses_prior_user_context():
    response = generate_rag_response(
        "Can you give me a project example?",
        history=[{"role": "user", "content": "Give me a backend learning roadmap."}],
    )
    assert response["supported"] is True


def test_resume_skill_extraction_uses_job_vocabulary_without_alias_false_positives():
    skills = extract_skills_from_text(
        "Built a REST API with Python, FastAPI, Node.js, and PostgreSQL.",
        "Kubernetes, Redis",
    )
    assert {"Python", "FastAPI", "Node.js", "PostgreSQL"}.issubset(skills)
    assert "JavaScript" not in skills
    assert "Redis" not in skills


def test_resume_text_parser_handles_invalid_inputs():
    assert extract_resume_text("resume.txt", b"Python and FastAPI") == "Python and FastAPI"
    for filename, content in (("resume.exe", b"no"), ("resume.txt", b""), ("resume.txt", b"\xff")):
        try:
            extract_resume_text(filename, content)
            assert False, "Expected resume input to be rejected"
        except ValueError:
            pass
