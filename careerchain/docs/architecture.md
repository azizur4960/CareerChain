# CareerChain System Architecture

## 1. High-Level Architecture Overview

CareerChain is designed as a decoupled, multi-tier system combining a lightweight Single Page Application (SPA), a high-performance RESTful API backend, a relational database layer, and a dedicated AI/NLP engine.

```
+-------------------------------------------------------------------+
|                        Client Layer (SPA)                         |
|   React 18 + Vite + Tailwind CSS + Lucide React + Axios Interceptor|
+---------------------------------+---------------------------------+
                                  | HTTPS / JSON REST
                                  v
+---------------------------------+---------------------------------+
|                       API Gateway Layer                           |
|       FastAPI Application (ASGI) with CORS & Global Handlers      |
+---------------------------------+---------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
         v                                                 v
+-------------------------------+         +-------------------------------+
|     Service & Auth Layer      |         |          AI Engine            |
| - JWT Bearer Authentication   |         | - Scikit-Learn TF-IDF Matcher |
| - Password Hash (Bcrypt)      |         | - Cosine Similarity Engine    |
| - Role Authorization (RBAC)   |         | - Career RAG Knowledge Engine |
| - CRUD / Transaction Services |         | - Optional External LLM Router|
+---------------+---------------+         +---------------+---------------+
                |                                         |
                +--------------------+--------------------+
                                     |
                                     v
+------------------------------------+------------------------------+
|                        Data Persistence                           |
|  SQLAlchemy 2.0 ORM with Session Pool                             |
|  Primary: MySQL (PyMySQL) | Fallback: SQLite3 (Local Persistent)  |
+-------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### Frontend (SPA)
- **Framework:** React 18 initialized with Vite for rapid compilation and hot module replacement.
- **Routing:** React Router DOM (v6) with declarative nested routes, `ProtectedRoute` for authentication guards, and `RoleRoute` for RBAC.
- **State Management:** React Context API (`AuthContext`) handling JWT tokens, user identities, and session persistence.
- **Styling:** Tailwind CSS with modern design tokens, custom indigo/blue palette, responsive grid layouts, and accessible contrast.
- **API Client:** Axios instance pre-configured with request interceptors for dynamic `Bearer <token>` insertion and response interceptors for 401 handling.

### Backend (REST API)
- **Framework:** FastAPI running on Uvicorn (ASGI).
- **Type Validation:** Pydantic v2 schemas providing strict schema enforcement, serialization, and OpenAPI 3.0 generation.
- **Security:** OAuth2 password bearer flow with HMAC-SHA256 JWT tokens and Bcrypt password hashing.
- **Layered Architecture:** Clear division of concerns into:
  - `models/`: SQLAlchemy ORM entity models.
  - `schemas/`: Pydantic input and response schemas.
  - `routes/`: HTTP endpoint controllers organized by resource.
  - `services/`: Encapsulated domain business logic.
  - `dependencies/`: FastAPI dependency injection for DB sessions and authenticated users.
  - `ai/`: Zero-cost natural language processing and recommendation algorithms.

### Database Layer
- **Engine:** SQLAlchemy 2.0 engine abstraction.
- **Portability:** Configured to dynamically connect to MySQL if configured and available; otherwise, automatically initializes a persistent SQLite database (`careerchain.db`) with zero manual setup.
- **Foreign Keys:** Cascade rules and relationship back-references defined for user profiles, jobs, conversations, messages, and blogs.

---

## 3. AI & NLP Subsystem
- **Job Fit Matching:** Combines set-theoretic skill intersection (precision/recall), vector TF-IDF cosine similarity between student target roles and job descriptions, experience penalty scaling, and preferred skill overlap.
- **Knowledge RAG:** Offline, low-latency search querying structured DIU career domain knowledge files using TF-IDF term vectors to return authoritative, grounded guidance.
