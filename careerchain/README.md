# CareerChain 🎓⚡
> **AI-Powered Alumni–Student Networking & Career Guidance Platform for Daffodil International University (DIU)**

CareerChain is a modern, full-stack, AI-enhanced platform designed to bridge the gap between students, alumni, and campus administration. It features an intelligent **Hybrid Job Fit Matching Engine**, an offline/online **AI Career Assistant (RAG)**, alumni mentorship matching, job referrals, blog publishing, direct messaging, and administrative governance.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC):**
   - **Students:** Build profiles, explore jobs, calculate AI Fit Scores, interact with the AI Career Assistant, request mentorship, message alumni, and read campus career blogs.
   - **Alumni:** Post verified job openings & referrals, offer mentorship sessions, publish career insights & success stories, and chat directly with students.
   - **Admins:** Manage user accounts, verify alumni graduation credentials, oversee job posts, monitor events, and track platform metrics.

2. **Authentication & Community News Feed:**
   - Student and alumni registration accepts either a DIU university ID or an email address ending in `@diu.edu.bd`.
   - Passwords must be at least 8 characters and no more than 72 UTF-8 bytes; no symbol requirement is imposed. Sign-in uses the registered email and password. The login form includes a show/hide password control.
   - Role-based dashboards are protected by JWT authentication. Public registration cannot create admin accounts.
   - Students, alumni, and admins share one news feed for text/image updates and success stories, with comments, replies, owner deletion, and Like, Celebrate, Support, Applause, Love, and Smile reactions.
   - News Feed is the first dashboard navigation option and the default destination after sign-in or registration. Clicking the CareerChain logo returns to the signed-in user's News Feed.
   - Search loaded posts by text or member, filter updates and success stories, refresh the feed, and load older posts in batches.

3. **AI Job Fit Scoring Engine (Zero-Cost Local NLP):**
   - **Skill Match (50%):** Set intersection of student skills vs. job requirements (precision & recall).
   - **Semantic Role Match (30%):** Vector cosine similarity between target role/bio and job description via Scikit-Learn TF-IDF (with Sentence-Transformers fallback).
   - **Experience Match (10%):** Linear penalty scale against minimum experience thresholds.
   - **Preferred Skills Match (10%):** Bonus overlap ratio on preferred qualifications.
   - Detailed breakdown, matched/missing skills, and personalized upskilling advice.
   - Resume text or PDF/DOCX/TXT upload analysis against a selected job, with relevant verified alumni recommendations.

4. **Free ATS Resume Builder (Local, Private Assistance):**
   - Available to students, alumni, and admins from the dashboard navigation.
   - Guided resume editor with profile prefill, work experience, education, projects, skills, certifications, and a live single-column preview.
   - Local writing suggestions, job-description keyword overlap, and an explainable ATS-readiness checklist; no paid AI API or API key is required.
   - Drafts stay in the current browser and can be exported through the browser's print-to-PDF flow.

5. **AI Career Assistant & Knowledge RAG:**
   - 10+ DIU-tailored career paths (Frontend, Backend, Full-stack, QA, Data Analyst, Data Scientist, Data Engineer, ML Engineer, UI/UX, DevOps).
   - Local TF-IDF knowledge retriever for instant, zero-cost, privacy-friendly career guidance.
   - Expanded career playbooks for portfolios, internships, resumes, interviews, alumni outreach, and role-specific learning plans, with contextual follow-up prompts.
   - Browser voice input in English or Bangla and read-aloud responses where supported.
   - Optional Groq-compatible external LLM support via environment configuration.
   - Career-intent handling for resume, interview, roadmap, skills, job-search, and alumni-referral questions, with out-of-scope input handling.

6. **Identity & Privacy Controls:**
   - Registration requires a DIU university ID or institutional `@diu.edu.bd` address; admins can review identity claims.
   - Public profiles and conversation summaries omit email addresses and university IDs; private messages are available only to their participants.
   - Students, alumni, and admins can upload or remove a profile photo from their profile; JPEG, PNG, and WebP images are validated and normalized.

7. **Modern, Responsive SaaS Experience:**
   - Crafted with React 18, Vite, Tailwind CSS, Lucide icons, glassmorphism accents, and accessible design.
   - Interactive modals, skeleton loaders, and live search/filter panels.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.9+** (Python 3.10+ recommended)
- **Node.js 18+** & **npm**
- (Optional) MySQL Server (SQLite fallback is built-in and enabled by default for zero-friction setup!)

---

### 1. Backend Setup & Run

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure a stable signing key for deployments (generate with: python3 -c "import secrets; print(secrets.token_urlsafe(48))")
# Add SECRET_KEY=<generated value> to backend/.env. Local development generates a temporary key if omitted.

# Seed the database with realistic DIU demo data
python seed.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API Documentation:
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`

Profile photos are stored under `backend/media/profile-images`. Production deployments must mount this directory on persistent storage or replace it with durable object storage.

---

### 2. Frontend Setup & Run

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend Web Application:
- URL: `http://localhost:5173`

---

## 👥 Sample Login Accounts

The login page's **Student**, **Alumni**, and **Admin** buttons fill in the sample credentials; click **Sign In** to continue. You can also enter credentials manually.

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@careerchain.local` | `Admin123!` |
| **Student** | `student@careerchain.local` | `Student123!` |
| **Alumni (Brain Station 23)** | `alumni@careerchain.local` | `Alumni123!` |

*(Additional pre-seeded student and alumni profiles can be found in `backend/seed.py`)*

New users can create a student or alumni account with either their DIU ID or an institutional `@diu.edu.bd` email address. Use that same registered email and the password you chose to sign in. Passwords need at least 8 characters; a symbol is not required.

---

## 📁 Repository Structure

```text
careerchain/
├── backend/                  # FastAPI Application, SQLAlchemy ORM, AI Engine
│   ├── app/
│   │   ├── ai/               # AI Matcher & RAG Knowledge Assistant
│   │   ├── dependencies/     # JWT Auth Dependencies
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── routes/           # RESTful API Endpoints
│   │   ├── schemas/          # Pydantic v2 Request/Response Schemas
│   │   ├── services/         # Business Logic Layer
│   │   ├── utils/            # Password Hashing & Token Utils
│   │   ├── config.py         # App Configuration Settings
│   │   ├── database.py       # Engine & SQLite/MySQL Fallback
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── data/career_knowledge/# Structured DIU Career Knowledge Bases
│   ├── tests/                # Pytest Test Suite
│   ├── seed.py               # Database Seeder Script
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/              # Axios Client & Modular API Calls
│   │   ├── components/       # Reusable UI Components
│   │   ├── context/          # React Auth Context & Global State
│   │   ├── layouts/          # Main & Dashboard Layouts
│   │   ├── pages/            # Public, Student, Alumni, & Admin Pages
│   │   ├── App.jsx           # App Routing & Providers
│   │   ├── main.jsx          # React Entrypoint
│   │   └── index.css         # Tailwind & Custom Utilities
├── docs/                     # Architecture, Database, API, & AI Docs
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── ai.md
├── .gitignore
└── README.md
```

---

## 🧪 Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## 📄 License
Academic Capstone Project - Daffodil International University (DIU).
All rights reserved.
