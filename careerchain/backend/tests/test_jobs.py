# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, ensure_schema_compatibility

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()
    yield


def test_list_jobs():
    response = client.get("/api/v1/jobs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_job_unauthorized():
    # Attempting to post without token should fail
    response = client.post(
        "/api/v1/jobs",
        json={
            "title": "Unauthorized Test Job",
            "company": "Test Corp",
            "location": "Dhaka",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "description": "Test description",
            "required_skills": "Python, SQL"
        }
    )
    assert response.status_code in [401, 403]


def test_alumni_create_and_fetch_job():
    # Register an alumni
    alumni_email = "test_alumni_poster@careerchain.local"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": alumni_email,
            "password": "Password123!",
            "full_name": "Test Alumni Poster",
            "role": "ALUMNI",
            "university_id": "DIU-ALUMNI-TEST-002",
            "department": "Computer Science and Engineering"
        }
    )
    assert reg_resp.status_code in [200, 201]
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Post a job
    job_payload = {
        "title": "Software Engineer II",
        "company": "Innovative Solutions Ltd",
        "location": "Dhaka, Bangladesh",
        "work_mode": "Hybrid",
        "employment_type": "Full-time",
        "description": "Building high-throughput microservices in Go and Python.",
        "responsibilities": "Write clean code, mentor juniors, design schemas.",
        "required_skills": "Python, FastAPI, Docker, SQL",
        "preferred_skills": "Kubernetes, Redis",
        "minimum_experience": 2,
        "application_url": "https://example.com/apply",
        "referral_available": True,
        "referral_url": "https://example.com/referral/diu",
    }
    create_resp = client.post("/api/v1/jobs", json=job_payload, headers=headers)
    assert create_resp.status_code == 201
    created_job = create_resp.json()
    assert created_job["title"] == "Software Engineer II"
    assert created_job["referral_available"] is True
    assert created_job["referral_url"] == "https://example.com/referral/diu"

    # Retrieve job details
    job_id = created_job["id"]
    get_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == job_id
