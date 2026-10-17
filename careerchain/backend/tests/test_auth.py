from io import BytesIO
# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from PIL import Image
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
# pyrefly: ignore [missing-import]
from app.models.user import User
from app.utils.security import get_password_hash

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup test accounts if needed


def test_user_registration_student():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test_student@careerchain.local",
            "password": "Password123!",
            "full_name": "Test Student",
            "role": "STUDENT",
            "university_id": "DIU-TEST-001",
            "department": "Computer Science and Engineering"
        }
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_student@careerchain.local"
    assert data["user"]["role"] == "STUDENT"


def test_public_registration_cannot_create_admin():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "self_assigned_admin@careerchain.local",
            "password": "Password123!",
            "full_name": "Unauthorized Admin",
            "role": "ADMIN",
        }
    )
    assert response.status_code == 422


def test_user_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test_student@careerchain.local",
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_user_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test_student@careerchain.local",
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_get_current_user_authenticated():
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test_student@careerchain.local",
            "password": "Password123!"
        }
    )
    token = login_resp.json()["access_token"]
    
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["email"] == "test_student@careerchain.local"
    assert user_data["role"] == "STUDENT"


def test_get_current_user_unauthorized():
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 401


def test_identity_review_and_public_data_privacy():
    missing_id = client.post(
        "/api/v1/auth/register",
        json={
            "email": "no_identifier@example.com",
            "password": "Password123!",
            "full_name": "No Identifier",
        },
    )
    assert missing_id.status_code == 422

    institutional_email_registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "institutional_user@diu.edu.bd",
            "password": "Password123!",
            "full_name": "Institutional User",
        },
    )
    assert institutional_email_registration.status_code == 201
    assert institutional_email_registration.json()["user"]["university_id"] is None

    student_registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "privacy_student@careerchain.local",
            "password": "Password123!",
            "full_name": "Privacy Student",
            "university_id": "DIU-PRIVACY-001",
        },
    )
    assert student_registration.status_code == 201
    student_data = student_registration.json()
    assert student_data["user"]["is_identity_verified"] is False
    student_id = student_data["user"]["id"]

    db = SessionLocal()
    admin = User(
        email="verification_admin@careerchain.local",
        hashed_password=get_password_hash("Password123!"),
        full_name="Verification Admin",
        role="ADMIN",
        university_id="DIU-ADMIN-VERIFY",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    admin_id = admin.id
    db.close()

    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "verification_admin@careerchain.local", "password": "Password123!"},
    )
    admin_token = admin_login.json()["access_token"]
    verified = client.patch(
        f"/api/v1/admin/users/{student_id}/verify-identity",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert verified.status_code == 200
    assert verified.json()["is_identity_verified"] is True

    public_profile = client.get(
        f"/api/v1/students/{student_id}",
        headers={"Authorization": f"Bearer {student_data['access_token']}"},
    )
    assert public_profile.status_code == 200
    assert "email" not in public_profile.json()
    assert "university_id" not in public_profile.json()
    assert "cv_url" not in public_profile.json()["student_profile"]

    sent = client.post(
        "/api/v1/messages/send",
        headers={"Authorization": f"Bearer {student_data['access_token']}"},
        json={"recipient_id": admin_id, "content": "Hello"},
    )
    assert sent.status_code == 201
    conversations = client.get(
        "/api/v1/messages/conversations",
        headers={"Authorization": f"Bearer {student_data['access_token']}"},
    )
    assert conversations.status_code == 200
    conversation_json = conversations.json()[0]
    serialized = str(conversation_json)
    assert "hashed_password" not in serialized
    assert "verification_admin@careerchain.local" not in serialized

    job_response = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Python API Developer",
            "company": "Example Systems",
            "location": "Dhaka",
            "description": "Build and maintain backend APIs.",
            "required_skills": "Python, FastAPI, AWS",
        },
    )
    assert job_response.status_code == 201
    resume_response = client.post(
        "/api/v1/ai/resume-match",
        headers={"Authorization": f"Bearer {student_data['access_token']}"},
        data={"job_id": str(job_response.json()["id"])},
        files={"resume_file": ("resume.txt", b"Built APIs with Python and FastAPI.", "text/plain")},
    )
    assert resume_response.status_code == 200
    resume_result = resume_response.json()
    assert {"Python", "FastAPI"}.issubset(resume_result["extracted_skills"])
    assert "AWS" in resume_result["match_result"]["missing_skills"]

    invalid_resume = client.post(
        "/api/v1/ai/resume-match",
        headers={"Authorization": f"Bearer {student_data['access_token']}"},
        data={"job_id": str(job_response.json()["id"])},
        files={"resume_file": ("resume.exe", b"not a resume", "application/octet-stream")},
    )
    assert invalid_resume.status_code == 422


def test_avatar_upload_retrieval_and_removal():
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "avatar_student@careerchain.local",
            "password": "Password123!",
            "full_name": "Avatar Student",
            "university_id": "DIU-AVATAR-001",
        },
    )
    assert registration.status_code == 201
    token = registration.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    image_buffer = BytesIO()
    Image.new("RGB", (32, 24), color="seagreen").save(image_buffer, format="PNG")
    uploaded = client.post(
        "/api/v1/auth/me/avatar",
        headers=headers,
        files={"avatar": ("profile.png", image_buffer.getvalue(), "image/png")},
    )
    assert uploaded.status_code == 200
    image_url = uploaded.json()["profile_image_url"]
    assert image_url.startswith("/media/profile-images/")

    served_image = client.get(image_url)
    assert served_image.status_code == 200
    assert served_image.headers["content-type"] == "image/jpeg"

    invalid_image = client.post(
        "/api/v1/auth/me/avatar",
        headers=headers,
        files={"avatar": ("not-image.png", b"not an image", "image/png")},
    )
    assert invalid_image.status_code == 422

    removed = client.delete("/api/v1/auth/me/avatar", headers=headers)
    assert removed.status_code == 200
    assert removed.json()["profile_image_url"] is None
    assert client.get(image_url).status_code == 404
