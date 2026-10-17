# CareerChain RESTful API Specification

The backend provides a standardized REST API rooted at `/api/v1`. Authentication uses the OAuth2 Bearer token scheme.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a student or alumni with a university ID or `@diu.edu.bd` address | Public |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password; returns JWT access token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user's current profile | Authenticated |

---

## 2. Students Endpoints (`/api/v1/students`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students/me` | Get current student profile | Student |
| `PUT` | `/api/v1/students/me` | Update current student profile and skills | Student |
| `GET` | `/api/v1/students` | List student profiles (filter by department, skills) | Authenticated |
| `GET` | `/api/v1/students/{id}` | Retrieve individual student profile | Authenticated |

---

## 3. Alumni Endpoints (`/api/v1/alumni`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/alumni` | Search and filter by batch, department, company, skills, mentorship, and verification | Authenticated |
| `GET` | `/api/v1/alumni/{id}` | Get detailed profile of specific alumni | Authenticated |
| `GET` | `/api/v1/alumni/me` | Get current alumni's profile | Alumni |
| `PUT` | `/api/v1/alumni/me` | Update alumni profile & mentorship availability | Alumni |

---

## 4. Jobs Endpoints (`/api/v1/jobs`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | Browse active job openings (filter by work mode, type, query)| Public / Auth |
| `GET` | `/api/v1/jobs/{id}` | Retrieve job details by ID | Authenticated |
| `POST` | `/api/v1/jobs` | Create a job with direct application and optional referral links | Alumni / Admin |
| `PUT` | `/api/v1/jobs/{id}` | Update job posting | Author / Admin |
| `DELETE`| `/api/v1/jobs/{id}` | Delete / Close job opening | Author / Admin |
| `GET` | `/api/v1/jobs/my/listings` | Retrieve jobs posted by current user | Alumni / Admin |

---

## 5. AI Endpoints (`/api/v1/ai`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/match-job` | Compute fit score breakdown for a student profile and a job | Authenticated |
| `GET` | `/api/v1/ai/match-jobs` | Automatically rank all active jobs against current student | Student |
| `GET` | `/api/v1/ai/recommend-mentors` | Recommend best-matching alumni mentors for student | Student |
| `POST` | `/api/v1/ai/assistant/chat` | Send prompt to AI Career Assistant (RAG knowledge retriever) | Authenticated |
| `POST` | `/api/v1/ai/resume-match` | Submit resume text or PDF/DOCX/TXT with a job ID for skill comparison and verified alumni matches | Student |

---

## 6. Blogs Endpoints (`/api/v1/blogs`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/blogs` | List published career blogs & advice articles | Public / Auth |
| `GET` | `/api/v1/blogs/{id}` | Read blog post | Public / Auth |
| `POST` | `/api/v1/blogs` | Create a new blog post | Alumni / Admin |
| `PUT` | `/api/v1/blogs/{id}` | Update blog post | Author / Admin |
| `DELETE`| `/api/v1/blogs/{id}` | Delete blog post | Author / Admin |

---

## 7. Events Endpoints (`/api/v1/events`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | List upcoming campus & alumni webinars/events | Public / Auth |
| `POST` | `/api/v1/events` | Create a new event | Admin / Alumni |
| `GET` | `/api/v1/events/{id}` | Get event details | Public / Auth |
| `DELETE`| `/api/v1/events/{id}` | Remove event | Admin / Organizer |

---

## 8. Messages Endpoints (`/api/v1/messages`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/messages/conversations` | Retrieve user's conversation threads | Authenticated |
| `GET` | `/api/v1/messages/conversations/{id}` | Get messages inside a conversation | Authenticated |
| `POST` | `/api/v1/messages/send` | Send a new message to another user | Authenticated |

---

## 9. Admin Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | Platform statistics (users, jobs, blogs, mentors) | Admin |
| `GET` | `/api/v1/admin/users` | List all registered users | Admin |
| `PATCH`| `/api/v1/admin/users/{id}/toggle-status` | Toggle user active status | Admin |
| `PATCH`| `/api/v1/admin/users/{id}/verify-identity` | Toggle manual university ID/institutional-email review status | Admin |
| `PATCH`| `/api/v1/admin/alumni/{id}/verify` | Verify or reject alumni profile | Admin |

Identity review is manual: admins verify the submitted university ID or institutional address in User Management. Email ownership codes are not sent because no SMTP provider is configured. Public alumni, student, job-author, and conversation-summary responses omit email addresses and university IDs; message history is limited to conversation participants.
