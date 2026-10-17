# 🎓 CareerChain

### AI-Powered Alumni–Student Networking & Career Guidance Platform

**CareerChain** is a full-stack, AI-enhanced career development and networking platform designed for **Daffodil International University (DIU)**. It connects students, alumni, and university administrators through intelligent job matching, AI-powered career guidance, mentorship opportunities, verified job referrals, and professional networking.

The platform aims to help students make informed career decisions, discover relevant opportunities, connect with experienced alumni, and prepare for the evolving job market—all within a unified digital ecosystem.

---

## ✨ Key Features

### 🔐 1. Role-Based Access Control (RBAC)

CareerChain provides dedicated experiences for students, alumni, and administrators.

**🎓 Students**

* Create and manage professional profiles.
* Explore job opportunities and verified referrals.
* Calculate AI-powered job fit scores.
* Identify matched and missing skills.
* Receive personalized career guidance and upskilling recommendations.
* Discover alumni mentors and request mentorship.
* Communicate with alumni through messaging.
* Read career insights, success stories, and university career blogs.

**👨‍💼 Alumni**

* Create and manage professional alumni profiles.
* Publish job openings and employee referral opportunities.
* Offer mentorship sessions to students.
* Share industry insights and career experiences.
* Publish professional articles and success stories.
* Connect and communicate with students.

**🛡️ Administrators**

* Manage student and alumni accounts.
* Review and verify alumni graduation credentials.
* Oversee job postings and referral submissions.
* Monitor platform activities and career events.
* Access administrative dashboards and platform metrics.

### 🤖 2. AI-Powered Job Fit Scoring Engine

CareerChain features a hybrid job-matching engine designed to evaluate how well a student's profile aligns with a job opportunity.

The engine combines skill matching, text similarity, experience alignment, and preferred-skill matching.

| Matching Component     | Weight | Description                                                                                    |
| ---------------------- | -----: | ---------------------------------------------------------------------------------------------- |
| Skill Match            |    50% | Evaluates overlap between a student's skills and required job skills.                          |
| Semantic Role Match    |    30% | Measures textual similarity between the student's target role/profile and the job description. |
| Experience Match       |    10% | Evaluates experience alignment against the job's minimum requirements.                         |
| Preferred Skills Match |    10% | Measures overlap with preferred or optional qualifications.                                    |

**Matching capabilities include:**

* Weighted job fit score calculation.
* Required-skill overlap analysis.
* Identification of matched and missing skills.
* Experience requirement evaluation.
* Personalized recommendations for improving job readiness.

**NLP technologies:**

* Scikit-learn TF-IDF vectorization.
* Cosine similarity.
* Optional Sentence-Transformers integration, subject to implementation and dependency configuration.

The default matching approach is designed to support local processing without requiring a paid external AI API.

*Note: The quality of matching depends on the implementation, available profile data, and the quality of job descriptions. TF-IDF-based similarity is a text-similarity technique and does not, by itself, provide deep semantic understanding.*

### 🧠 3. AI Career Assistant & Knowledge Retrieval

CareerChain includes an AI career assistant designed to provide DIU students with structured career guidance.

**Supported career paths include:**

* Frontend Development
* Backend Development
* Full-Stack Development
* Quality Assurance (QA)
* Data Analytics
* Data Science
* Data Engineering
* Machine Learning Engineering
* UI/UX Design
* DevOps Engineering

**Core capabilities:**

* Retrieve relevant information from a structured career knowledge base.
* Provide career-path guidance based on available knowledge.
* Help students explore relevant skills and learning directions.
* Support local, privacy-conscious knowledge retrieval.
* Offer optional external LLM integration through environment configuration.

**Technology highlights:**

* TF-IDF-based knowledge retrieval.
* Text vectorization and similarity-based ranking.
* Structured DIU-focused career knowledge.
* Optional OpenAI, Google Gemini, or Groq integration, depending on the implemented provider configuration.

The local retrieval component is designed to operate without mandatory paid LLM API calls. External LLM functionality requires the appropriate provider configuration and credentials.

### 💬 4. Alumni Networking & Mentorship

CareerChain brings students and alumni together through career-focused networking features.

* Alumni discovery and professional connections.
* Mentorship requests and guidance opportunities.
* Direct communication between students and alumni.
* Career insights and professional experience sharing.
* Job referrals and industry opportunity discovery.

### 📰 5. Career Content & Job Opportunities

The platform provides a shared space for career resources and professional opportunities.

* Job listings and referral postings.
* Career articles and blog publishing.
* Alumni success stories.
* Professional development resources.
* Searchable and filterable career content.

### 🎨 6. Modern, Responsive User Interface

The frontend is designed to provide an accessible and responsive experience across supported screen sizes.

**UI highlights:**

* Responsive layouts.
* Reusable React components.
* Interactive forms and modals.
* Loading states and skeleton loaders.
* Search and filtering interfaces.
* Iconography powered by Lucide.
* Tailwind CSS utility-based styling.
* Glassmorphism-inspired visual elements.

---

## 🛠️ Technology Stack

### Frontend

* React 18
* Vite
* JavaScript
* Tailwind CSS
* Lucide React
* Axios

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic v2
* Uvicorn
* JWT-based authentication
* Password hashing with Passlib and bcrypt

### Database

* SQLite
* MySQL support through PyMySQL

SQLite provides a lightweight local development option, while MySQL can be configured when a separate database server is available.

### AI & NLP

* Scikit-learn
* TF-IDF vectorization
* Cosine similarity
* Optional Sentence-Transformers support
* Local knowledge retrieval
* Optional external LLM providers

### Testing & Documentation

* Pytest
* FastAPI Swagger UI
* ReDoc
* Markdown-based technical documentation

---

## 🏗️ System Architecture

CareerChain follows a frontend–backend architecture.

```text
┌─────────────────────────────────────────────┐
│             CareerChain Frontend            │
│                                             │
│       React 18 + Vite + Tailwind CSS        │
│                                             │
│  Student Dashboard | Alumni | Admin Panel   │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTP / REST API
                       ▼
┌─────────────────────────────────────────────┐
│             FastAPI Backend                 │
│                                             │
│ Authentication | Authorization | Services   │
│                                             │
│ Job Matching | Career Assistant | Mentoring │
│                                             │
│ SQLAlchemy ORM | Pydantic Schemas            │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────────────────┐
│   Database   │  │       AI / NLP Layer     │
│              │  │                          │
│    SQLite    │  │ Job Fit Scoring          │
│  or MySQL    │  │ TF-IDF Retrieval         │
│              │  │ Career Knowledge Base    │
└──────────────┘  └──────────────────────────┘
```

---

## 📋 Prerequisites

Before running CareerChain locally, ensure that the following software is installed:

* **Python 3.9 or later**
* **Node.js 18 or later**
* **npm**
* **Git** (recommended)
* **VS Code** or another code editor

**Optional:**

* MySQL Server, if you want to use MySQL instead of SQLite.
* API credentials for an external LLM provider, if you want to enable a supported external AI integration.

---

## 🚀 Getting Started

Follow these instructions to set up and run CareerChain on your local machine.

### 1. Clone the Repository

If the project is hosted on GitHub:

```bash
git clone <YOUR_REPOSITORY_URL>
cd careerchain
```

If you already have the project downloaded, open its root directory in VS Code.

### 2. Set Up the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

#### Create a Virtual Environment

```bash
python3 -m venv venv
```

#### Activate the Virtual Environment

**macOS / Linux:**

```bash
source venv/bin/activate
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

#### Install Python Dependencies

```bash
python -m pip install -r requirements.txt
```

#### Configure Environment Variables

If the backend provides an `.env.example` file, create your local environment file:

```bash
cp .env.example .env
```

Review the available settings and update them when necessary. Do not commit secret API keys or other credentials to version control.

#### Initialize Demo Data

From the `backend` directory, run:

```bash
python seed.py
```

This initializes the database and populates it with the demo data supported by the seeding script.

**Important:** Check the seeder's behavior before running it against a database containing data you want to preserve. The current seeding implementation may clear existing records before inserting demo data.

#### Start the Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

When the server starts successfully, the backend will be available at:

* **API Base:** http://localhost:8000
* **Swagger UI:** http://localhost:8000/docs
* **ReDoc:** http://localhost:8000/redoc

Keep this terminal open while using the application.

### 3. Set Up the Frontend

Open a second terminal in VS Code.

Navigate to the frontend directory from the project root:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will typically be available at:

**http://localhost:5173**

Keep this terminal open while using the application.

### 4. Access CareerChain

Once both servers are running, open:

**http://localhost:5173**

The frontend communicates with the backend through the configured API URL. If API requests fail, check the frontend API configuration, backend availability, and CORS settings.

---

## 👥 Demo Accounts

The following demo credentials are documented for local development:

| Role                 | Email                       | Password      |
| -------------------- | --------------------------- | ------------- |
| System Administrator | `admin@careerchain.local`   | `Admin123!`   |
| Student              | `student@careerchain.local` | `Student123!` |
| Alumni               | `alumni@careerchain.local`  | `Alumni123!`  |

Additional demo profiles may be defined in `backend/seed.py`.

**Security note:** These are development credentials, not production credentials. Do not use default demo passwords in a deployed environment. Confirm that the database has been seeded successfully before attempting to log in.

---

## 📂 Project Structure

```text
careerchain/
│
├── backend/
│   ├── app/
│   │   ├── ai/                  # AI matching and career knowledge retrieval
│   │   ├── dependencies/        # Authentication dependencies
│   │   ├── models/              # SQLAlchemy database models
│   │   ├── routes/              # REST API endpoints
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Application business logic
│   │   ├── utils/               # Authentication and utility functions
│   │   ├── config.py            # Application configuration
│   │   ├── database.py          # Database connection and fallback logic
│   │   └── main.py              # FastAPI application entry point
│   │
│   ├── data/
│   │   └── career_knowledge/    # Structured career knowledge base
│   │
│   ├── tests/                   # Backend tests
│   ├── seed.py                  # Demo database seeder
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client and API modules
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # Authentication and global state
│   │   ├── layouts/             # Shared application layouts
│   │   ├── pages/               # Public, student, alumni, and admin pages
│   │   ├── App.jsx              # Main application and routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles and Tailwind utilities
│   │
│   └── package.json             # Frontend dependencies and scripts
│
├── docs/
│   ├── architecture.md          # System architecture
│   ├── database.md              # Database documentation
│   ├── api.md                   # API documentation
│   └── ai.md                    # AI/NLP documentation
│
├── .gitignore
└── README.md
```

---

## 🧪 Testing

CareerChain's backend tests use Pytest.

Navigate to the backend directory:

```bash
cd backend
```

Activate the virtual environment if it is not already active:

```bash
source venv/bin/activate
```

Run the test suite:

```bash
pytest tests/ -v
```

Review the test results to identify failing tests or implementation issues.

*Note: The presence of a test directory does not guarantee that every feature is covered. Actual test coverage depends on the implemented tests.*

---

## 🔧 Troubleshooting

### Backend Does Not Start

Check that the virtual environment is active and the dependencies are installed:

```bash
source venv/bin/activate
python -m pip install -r requirements.txt
```

Then start the server again:

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Does Not Start

Verify that Node.js and npm are available:

```bash
node -v
npm -v
```

Install the frontend dependencies and restart the development server:

```bash
npm install
npm run dev
```

### MySQL Connection Error

If MySQL is unavailable, CareerChain may fall back to SQLite according to its database configuration.

Check the backend logs to confirm which database is actually being used.

### Login or API Requests Fail

Verify the following:

* Both frontend and backend servers are running.
* The database has been initialized.
* Demo accounts exist in the database.
* The frontend uses the correct backend API URL.
* CORS settings allow requests from the frontend origin.
* Authentication tokens and request headers are handled correctly.

---

## 🔒 Security Considerations

CareerChain is intended as an academic capstone project.

Before deploying it publicly, review:

* Password hashing and authentication flows.
* Server-side role-based authorization.
* Alumni verification and administrative permissions.
* Input validation and error handling.
* Environment variables and secret management.
* Database access and backup procedures.
* CORS and allowed origins.
* Rate limiting and abuse prevention.
* Logging and sensitive-data exposure.
* Production configuration and HTTPS.

Client-side role checks alone are not sufficient to protect restricted functionality. Sensitive actions must also be authorized by the backend.

---

## 🗺️ Potential Future Enhancements

The following are possible future development directions, not claims about currently implemented functionality:

* Real-time messaging with WebSockets.
* Advanced semantic job matching using sentence embeddings.
* Improved mentor–student recommendation algorithms.
* Job application tracking and notifications.
* Resume analysis and skill-gap reporting.
* Calendar integration for mentorship scheduling.
* Expanded analytics for students, alumni, and administrators.
* Automated testing and deployment pipelines.

---

## 📄 License

**Academic Capstone Project — Daffodil International University (DIU)**

All rights reserved.

---

## 👨‍💻 Project Overview

CareerChain brings together career guidance, alumni networking, job discovery, and AI-assisted skill matching in one platform.

Its goal is to help DIU students explore career paths, identify relevant opportunities, learn from alumni experiences, and make more informed decisions about their professional development.

**CareerChain — Connect. Learn. Grow.**
