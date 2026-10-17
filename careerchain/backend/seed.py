import datetime
import logging
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base, ensure_schema_compatibility
from app.models.user import User
from app.models.profile import StudentProfile, AlumniProfile
from app.models.job import Job
from app.models.blog import Blog
from app.models.event import Event
from app.models.message import Conversation, Message
from app.utils.security import get_password_hash

logger = logging.getLogger("careerchain.seeder")
logging.basicConfig(level=logging.INFO)


def seed_database():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        admin_check = db.query(User).filter(User.email == "admin@careerchain.local").first()
        if admin_check:
            logger.info("Database is already seeded. Resetting or skipping...")
            # We can clear and reseed for a fresh verified state
            db.query(Message).delete()
            db.query(Conversation).delete()
            db.query(Blog).delete()
            db.query(Event).delete()
            db.query(Job).delete()
            db.query(StudentProfile).delete()
            db.query(AlumniProfile).delete()
            db.query(User).delete()
            db.commit()
            logger.info("Cleared previous records for a clean re-seed.")

        logger.info("Seeding Users and Profiles...")

        # 1. PRIMARY ROLES
        admin_user = User(
            email="admin@careerchain.local",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Prof. Dr. Syed Akhter Hossain",
            role="ADMIN",
            university_id="ADMIN-001",
            department="Computer Science and Engineering",
            is_active=True
        )
        db.add(admin_user)

        primary_student = User(
            email="student@careerchain.local",
            hashed_password=get_password_hash("Student123!"),
            full_name="Tanvir Ahmed",
            role="STUDENT",
            university_id="DIU-211-15-4200",
            department="Computer Science and Engineering",
            is_active=True
        )
        db.add(primary_student)
        db.flush()

        student_prof_primary = StudentProfile(
            user_id=primary_student.id,
            semester=8,
            bio="Final year CSE student enthusiastic about Python, modern web development, and cloud computing. Actively preparing for full-time backend or full-stack software engineering roles.",
            skills="Python, FastAPI, Django, JavaScript, React, PostgreSQL, Docker, Git, REST APIs",
            target_role="Full-Stack Engineer",
            github_url="https://github.com/tanvir-ahmed-diu",
            linkedin_url="https://linkedin.com/in/tanvir-ahmed-diu",
            portfolio_url="https://tanvir-dev.vercel.app",
            cv_url="https://careerchain.local/resumes/tanvir-ahmed.pdf"
        )
        db.add(student_prof_primary)

        primary_alumni = User(
            email="alumni@careerchain.local",
            hashed_password=get_password_hash("Alumni123!"),
            full_name="Farhan Masud",
            role="ALUMNI",
            university_id="DIU-171-15-1024",
            department="Software Engineering",
            is_active=True
        )
        db.add(primary_alumni)
        db.flush()

        alumni_prof_primary = AlumniProfile(
            user_id=primary_alumni.id,
            graduation_batch="2021",
            current_company="Brain Station 23",
            current_position="Lead Software Engineer",
            skills="Python, Django, FastAPI, AWS, Docker, Kubernetes, PostgreSQL, Microservices, Redis",
            bio="Lead Software Engineer at Brain Station 23 with 4+ years of backend & enterprise systems experience. Passionate about DIU junior grooming and tech referrals.",
            years_of_experience=4,
            linkedin_url="https://linkedin.com/in/farhan-masud",
            github_url="https://github.com/farhan-masud",
            is_available_for_mentorship=True,
            is_verified=True
        )
        db.add(alumni_prof_primary)

        # 2. ADDITIONAL 8+ STUDENTS
        students_data = [
            {
                "email": "sadia.islam@careerchain.local",
                "name": "Sadia Islam",
                "sem": 6,
                "skills": "JavaScript, React, Tailwind CSS, TypeScript, HTML5, CSS3, Redux Toolkit, Figma",
                "target": "Frontend Engineer",
                "bio": "Frontend enthusiast focusing on responsive UX, React performance, and accessible web standards."
            },
            {
                "email": "rakibul.hasan@careerchain.local",
                "name": "Rakibul Hasan",
                "sem": 7,
                "skills": "Python, Pandas, NumPy, Scikit-Learn, SQL, Power BI, Matplotlib, Data Wrangling",
                "target": "Data Analyst",
                "bio": "Aspiring data analyst with strong SQL and business analytics acumen. Passionate about healthcare and fintech insights."
            },
            {
                "email": "mehedi.zaman@careerchain.local",
                "name": "Mehedi Zaman",
                "sem": 8,
                "skills": "Python, PyTorch, Scikit-Learn, TensorFlow, OpenCV, NLP, Docker, FastAPI",
                "target": "Machine Learning Engineer",
                "bio": "Machine learning researcher and engineer. Worked on Bengali NLP and sentiment analysis capstone research."
            },
            {
                "email": "nusrat.jahan@careerchain.local",
                "name": "Nusrat Jahan",
                "sem": 5,
                "skills": "Figma, User Research, Wireframing, Adobe XD, Design Systems, HTML, CSS",
                "target": "UI/UX Designer",
                "bio": "Passionate UI/UX designer crafting human-centric design tokens and interactive design systems."
            },
            {
                "email": "arifur.rahman@careerchain.local",
                "name": "Arifur Rahman",
                "sem": 7,
                "skills": "Linux, Docker, Kubernetes, GitHub Actions, AWS, Terraform, Nginx, Shell Scripting",
                "target": "DevOps Engineer",
                "bio": "DevOps advocate with AWS Certified Cloud Practitioner. Enjoys container orchestration and automated CI/CD pipelines."
            },
            {
                "email": "sumaiya.akter@careerchain.local",
                "name": "Sumaiya Akter",
                "sem": 6,
                "skills": "Selenium, Playwright, Python, Postman, Pytest, Manual Testing, Jira, Git",
                "target": "QA Automation Engineer",
                "bio": "Quality assurance tester specializing in automated browser testing, API test harnesses, and bug tracking."
            },
            {
                "email": "ashikur.chowdhury@careerchain.local",
                "name": "Ashikur Chowdhury",
                "sem": 4,
                "skills": "Flutter, Dart, Firebase, SQLite, REST APIs, Git, Mobile UX",
                "target": "Mobile App Engineer",
                "bio": "Mobile developer with 2 Flutter apps published. Interested in cross-platform state management and mobile performance."
            },
            {
                "email": "tahmina.tabassum@careerchain.local",
                "name": "Tahmina Tabassum",
                "sem": 8,
                "skills": "Java, Spring Boot, PostgreSQL, Microservices, Docker, Kafka, Git, JUnit",
                "target": "Backend Engineer",
                "bio": "Enterprise software enthusiast focusing on scalable Java microservices and event-driven architectures."
            }
        ]

        seeded_students = [primary_student]
        for idx, s in enumerate(students_data, start=2):
            u = User(
                email=s["email"],
                hashed_password=get_password_hash("Student123!"),
                full_name=s["name"],
                role="STUDENT",
                university_id=f"DIU-21{idx}-15-{4000+idx}",
                department="Computer Science and Engineering",
                is_active=True
            )
            db.add(u)
            db.flush()
            prof = StudentProfile(
                user_id=u.id,
                semester=s["sem"],
                bio=s["bio"],
                skills=s["skills"],
                target_role=s["target"],
                github_url=f"https://github.com/{s['email'].split('@')[0]}",
                linkedin_url=f"https://linkedin.com/in/{s['email'].split('@')[0]}"
            )
            db.add(prof)
            seeded_students.append(u)

        # 3. ADDITIONAL 10+ ALUMNI PROFILES
        alumni_data = [
            {
                "email": "mahmud.hassan@careerchain.local",
                "name": "Mahmudul Hassan",
                "company": "BJIT Group",
                "pos": "Senior Full-Stack Engineer",
                "exp": 5,
                "batch": "2019",
                "skills": "React, Node.js, TypeScript, PostgreSQL, AWS, Microservices, Jest",
                "bio": "Full-stack lead developing scalable FinTech solutions for international clients at BJIT."
            },
            {
                "email": "anika.tabassum@careerchain.local",
                "name": "Anika Tabassum",
                "company": "Enosis Solutions",
                "pos": "Senior QA Automation Engineer",
                "exp": 4,
                "batch": "2020",
                "skills": "Playwright, Selenium, Java, TestNG, Jenkins, Postman, Performance Testing",
                "bio": "Lead QA at Enosis Solutions. Passionate about automated testing frameworks and DIU student mentorship."
            },
            {
                "email": "hasan.tariq@careerchain.local",
                "name": "Hasan Tariq",
                "company": "Optimizely",
                "pos": "Senior Data Scientist",
                "exp": 6,
                "batch": "2018",
                "skills": "Python, Machine Learning, Scikit-Learn, PyTorch, SQL, Experimentation, Statistics",
                "bio": "Working on algorithmic experimentation and predictive models for Optimizely experimentation platform."
            },
            {
                "email": "tamim.iqbal@careerchain.local",
                "name": "Tamim Iqbal",
                "company": "TigerIT Bangladesh",
                "pos": "Principal DevOps Architect",
                "exp": 7,
                "batch": "2017",
                "skills": "Kubernetes, Docker, Terraform, Ansible, Linux, AWS, Grafana, Prometheus",
                "bio": "Infrastructure architect handling nationwide biometric and identity systems at TigerIT."
            },
            {
                "email": "fariha.zaman@careerchain.local",
                "name": "Fariha Zaman",
                "company": "Therap Services",
                "pos": "Lead UI/UX Architect",
                "exp": 5,
                "batch": "2019",
                "skills": "Figma, User Research, Accessibility, Design Systems, Design Tokens, Interaction Design",
                "bio": "Designing healthcare interfaces used by over 500,000 caregivers worldwide."
            },
            {
                "email": "kamrul.hasan@careerchain.local",
                "name": "Kamrul Hasan",
                "company": "Chaldal",
                "pos": "Engineering Manager",
                "exp": 8,
                "batch": "2016",
                "skills": "F#, C#, .NET Core, React, Event Sourcing, System Architecture, Agile",
                "bio": "Engineering manager leading grocery supply chain software and automated logistics."
            },
            {
                "email": "shirin.sultana@careerchain.local",
                "name": "Shirin Sultana",
                "company": "Samsung R&D Institute Bangladesh",
                "pos": "Staff Machine Learning Engineer",
                "exp": 6,
                "batch": "2018",
                "skills": "Python, Deep Learning, PyTorch, Computer Vision, Edge AI, C++",
                "bio": "On-device intelligence researcher at Samsung R&D Bangladesh. DIU Alumni batch 2018."
            },
            {
                "email": "zubair.alam@careerchain.local",
                "name": "Zubair Alam",
                "company": "Pathao",
                "pos": "Senior Backend Engineer",
                "exp": 4,
                "batch": "2020",
                "skills": "Go, Docker, Kafka, Redis, PostgreSQL, Distributed Systems, Microservices",
                "bio": "Ride-sharing and food delivery high-throughput backend systems specialist."
            },
            {
                "email": "nafis.fuad@careerchain.local",
                "name": "Nafis Fuad",
                "company": "ShopUp",
                "pos": "Senior Mobile Engineer",
                "exp": 4,
                "batch": "2020",
                "skills": "Flutter, Dart, Android Native, Kotlin, Clean Architecture, CI/CD",
                "bio": "B2B commerce mobile architect powering thousands of rural merchants across Bangladesh."
            },
            {
                "email": "sabrina.chowdhury@careerchain.local",
                "name": "Sabrina Chowdhury",
                "company": "Brain Station 23",
                "pos": "Cloud Solutions Consultant",
                "exp": 5,
                "batch": "2019",
                "skills": "AWS Solutions Architecture, Azure, Docker, Security, FinOps, Terraform",
                "bio": "Consulting enterprise banking and fintech transformations on cloud modernization."
            }
        ]

        seeded_alumni = [primary_alumni]
        for idx, a in enumerate(alumni_data, start=2):
            u = User(
                email=a["email"],
                hashed_password=get_password_hash("Alumni123!"),
                full_name=a["name"],
                role="ALUMNI",
                university_id=f"DIU-1{idx}-15-{1000+idx}",
                department="Computer Science and Engineering",
                is_active=True
            )
            db.add(u)
            db.flush()
            prof = AlumniProfile(
                user_id=u.id,
                graduation_batch=a["batch"],
                current_company=a["company"],
                current_position=a["pos"],
                skills=a["skills"],
                bio=a["bio"],
                years_of_experience=a["exp"],
                linkedin_url=f"https://linkedin.com/in/{a['email'].split('@')[0]}",
                github_url=f"https://github.com/{a['email'].split('@')[0]}",
                is_available_for_mentorship=True,
                is_verified=True
            )
            db.add(prof)
            seeded_alumni.append(u)

        db.flush()

        # 4. 10+ JOB POSTINGS WITH CLEAR SKILLS AND REFERRAL INDICATORS
        jobs_data = [
            {
                "title": "Associate Backend Engineer (Python / FastAPI)",
                "company": "Brain Station 23",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": primary_alumni.id,
                "skills": "Python, FastAPI, PostgreSQL, Docker, Git, REST APIs",
                "pref_skills": "Redis, AWS, Celery, Pytest",
                "desc": "Join Brain Station 23's Fintech Engineering Unit. You will design, build, and optimize high-concurrency microservices, write clean RESTful APIs, and contribute to production database architectures.",
                "resp": "Build performant REST APIs with FastAPI; collaborate with frontend teams; write unit and integration test suites; maintain CI/CD pipelines."
            },
            {
                "title": "Junior React & TypeScript Developer",
                "company": "BJIT Group",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[1].id,
                "skills": "JavaScript, TypeScript, React, Tailwind CSS, HTML5, CSS3, Git",
                "pref_skills": "Next.js, Redux Toolkit, Jest, Figma",
                "desc": "BJIT is looking for an enthusiastic Junior Frontend Developer to build clean, responsive web applications for international clients in Japan and Europe.",
                "resp": "Develop reusable React components; implement pixel-perfect Figma designs; optimize web performance; integrate REST APIs."
            },
            {
                "title": "QA Automation Engineer (Playwright / Python)",
                "company": "Enosis Solutions",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Onsite",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[2].id,
                "skills": "Python, Selenium, Playwright, Postman, Pytest, Git",
                "pref_skills": "Jenkins, Docker, Performance Testing, SQL",
                "desc": "Work directly with US-based enterprise partners to automate end-to-end regression test suites and API validation pipelines.",
                "resp": "Design automated test cases; integrate tests into continuous deployment pipelines; report and track bugs with engineering teams."
            },
            {
                "title": "Machine Learning Engineer (NLP & Computer Vision)",
                "company": "Optimizely",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Full-time",
                "min_exp": 2,
                "referral": True,
                "poster": seeded_alumni[3].id,
                "skills": "Python, PyTorch, Scikit-Learn, Pandas, NumPy, FastAPI, Docker",
                "pref_skills": "Transformers, HuggingFace, MLOps, MLflow, AWS",
                "desc": "Join our experimentation intelligence team. Develop predictive algorithms, customer segment clustering, and automated content recommendations.",
                "resp": "Train, tune, and deploy machine learning models; build inference endpoints in FastAPI; monitor model drift."
            },
            {
                "title": "Cloud & DevOps Associate",
                "company": "TigerIT Bangladesh",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Onsite",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[4].id,
                "skills": "Linux, Docker, Kubernetes, CI/CD, Shell Scripting, Git",
                "pref_skills": "Terraform, AWS, Prometheus, Grafana, Nginx",
                "desc": "TigerIT manages high-impact national identity infrastructure. We are hiring a junior DevOps engineer eager to work on container orchestration and Linux automation.",
                "resp": "Manage Docker containers; support Kubernetes cluster deployments; monitor server health and log aggregations."
            },
            {
                "title": "Associate UI/UX Product Designer",
                "company": "Therap Services",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Onsite",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[5].id,
                "skills": "Figma, User Research, Wireframing, Design Systems, HTML/CSS Basics",
                "pref_skills": "Design Tokens, Usability Testing, Adobe Creative Suite",
                "desc": "Create accessible, user-friendly digital healthcare experiences that support individuals with disabilities and clinical caregivers.",
                "resp": "Conduct user interviews; build interactive Figma prototypes; maintain component libraries; collaborate with developers."
            },
            {
                "title": "Junior Full-Stack Software Engineer",
                "company": "Chaldal",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Onsite",
                "emp_type": "Full-time",
                "min_exp": 0,
                "referral": False,
                "poster": seeded_alumni[6].id,
                "skills": "JavaScript, React, SQL, Git, Problem Solving, REST APIs",
                "pref_skills": "Node.js, C#, Docker, Tailwind CSS",
                "desc": "Chaldal is Bangladesh's leading grocery e-commerce. Fresh DIU graduates with strong problem-solving skills and web fundamentals are warmly welcomed!",
                "resp": "Develop customer-facing web features; write robust backend queries; participate in code reviews."
            },
            {
                "title": "Junior Data Analyst (SQL & BI)",
                "company": "Pathao",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[8].id,
                "skills": "SQL, Python, Pandas, Power BI, Excel, Data Visualization",
                "pref_skills": "Tableau, Statistical Modeling, BigQuery",
                "desc": "Help drive decision-making across rides, delivery, and payments. Translate complex business questions into clear analytical dashboards.",
                "resp": "Write advanced SQL queries; generate weekly executive reports; identify growth opportunities across merchant categories."
            },
            {
                "title": "Mobile App Developer (Flutter)",
                "company": "ShopUp",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Full-time",
                "min_exp": 1,
                "referral": True,
                "poster": seeded_alumni[9].id,
                "skills": "Flutter, Dart, Firebase, REST APIs, Git, State Management",
                "pref_skills": "Bloc pattern, SQLite, Android Native, Clean Architecture",
                "desc": "Build smooth, resilient mobile applications for thousands of micro-entrepreneurs throughout Bangladesh.",
                "resp": "Implement responsive mobile screens; integrate backend endpoints; ensure 60fps performance on low-end smartphones."
            },
            {
                "title": "Software Engineering Intern (Summer 2025)",
                "company": "Brain Station 23",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Hybrid",
                "emp_type": "Internship",
                "min_exp": 0,
                "referral": True,
                "poster": primary_alumni.id,
                "skills": "Python, JavaScript, Git, SQL, Data Structures & Algorithms",
                "pref_skills": "React, FastAPI, Docker",
                "desc": "3-month paid internship program designed exclusively for 3rd and 4th-year DIU Computer Science & Engineering students with fast-track full-time conversion opportunities.",
                "resp": "Complete rigorous engineering bootcamp; work alongside senior alumni mentors on real client deliverables; present capstone findings."
            },
            {
                "title": "Graduate Trainee Software Engineer",
                "company": "Enosis Solutions",
                "location": "Dhaka, Bangladesh",
                "work_mode": "Onsite",
                "emp_type": "Full-time",
                "min_exp": 0,
                "referral": False,
                "poster": seeded_alumni[2].id,
                "skills": "Object-Oriented Programming, C++ / Java / C#, SQL, Problem Solving",
                "pref_skills": "Git, Web Technologies, Database Design",
                "desc": "Annual campus recruitment intake for enthusiastic fresh graduates. Comprehensive 3-month paid training followed by placement into active development projects.",
                "resp": "Solve algorithmic and engineering challenges; learn enterprise software stacks; adhere to rigorous clean-code practices."
            }
        ]

        for j in jobs_data:
            job_obj = Job(
                title=j["title"],
                company=j["company"],
                location=j["location"],
                work_mode=j["work_mode"],
                employment_type=j["emp_type"],
                description=j["desc"],
                responsibilities=j["resp"],
                required_skills=j["skills"],
                preferred_skills=j["pref_skills"],
                minimum_experience=j["min_exp"],
                application_url="https://careerchain.local/apply",
                referral_available=j["referral"],
                posted_by=j["poster"],
                status="ACTIVE",
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=45)
            )
            db.add(job_obj)

        db.flush()

        # 5. 5+ CAREER BLOGS / SUCCESS STORIES
        blogs_data = [
            {
                "title": "From DIU Classroom to Lead Engineer at Brain Station 23: My 5-Year Journey",
                "category": "Success Story",
                "author": primary_alumni.id,
                "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                "content": "When I graduated from Daffodil International University in 2021, I felt both excited and uncertain. Landing an entry-level position required mastering three fundamentals: deep problem solving (solving 200+ LeetCode problems), understanding database internals rather than just memorizing ORM calls, and active networking with alumni.\n\nIn this article, I share the step-by-step roadmap I used to progress from an Associate Developer to a Lead Engineer managing a team of 12 engineers at Brain Station 23."
            },
            {
                "title": "Mastering the Technical Interview: A Complete DIU Student Guide",
                "category": "Interview Prep",
                "author": seeded_alumni[1].id,
                "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
                "content": "Most candidate rejections don't happen because of lack of coding ability—they happen because of poor communication during live coding rounds.\n\nAlways ask clarifying questions before jumping to code. State your initial brute-force approach clearly, analyze Big-O complexity, and only then write your optimized solution. Remember: interviewers evaluate how you collaborate as an engineering teammate."
            },
            {
                "title": "Why Every DIU Student Should Learn Docker & CI/CD Before Graduation",
                "category": "DevOps & Cloud",
                "author": seeded_alumni[4].id,
                "image": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
                "content": "The phrase 'it works on my machine' no longer flies in modern enterprise engineering. Learning containerization with Docker and automated testing via GitHub Actions will immediately distinguish your resume from 95% of fresh graduates.\n\nHere is a simple 30-minute exercise to containerize a FastAPI and React project."
            },
            {
                "title": "Building a Standout UI/UX Portfolio: What Hiring Managers Look For",
                "category": "Design & UX",
                "author": seeded_alumni[5].id,
                "image": "https://images.unsplash.com/photo-1581291518655-9523c932deb4?auto=format&fit=crop&w=800&q=80",
                "content": "A successful design portfolio doesn't merely showcase pretty Figma mockups; it details the complete problem-solving narrative.\n\nHighlight the user problem, your research findings, the wireframe iterations that failed, and the quantitative metric that improved after launching the final design."
            },
            {
                "title": "Cracking Data Science & Analytics Roles in Bangladesh Tech Scene",
                "category": "Data & AI",
                "author": seeded_alumni[3].id,
                "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                "content": "Data is the lifeblood of ride-sharing, fintech, and digital health in Dhaka. While deep learning models get the most hype, 80% of day-to-day work centers around robust SQL querying, data cleaning with Pandas, and clear executive stakeholder communication."
            }
        ]

        for b in blogs_data:
            blog_obj = Blog(
                title=b["title"],
                content=b["content"],
                category=b["category"],
                author_id=b["author"],
                image_url=b["image"],
                is_published=True
            )
            db.add(blog_obj)

        db.flush()

        # 6. 5+ UPCOMING WEBINARS AND CAMPUS EVENTS
        events_data = [
            {
                "title": "DIU Alumni Tech Summit 2025: Navigating Modern Software Careers",
                "desc": "Keynote panel featuring senior DIU alumni working at Brain Station 23, BJIT, Pathao, and Optimizely discussing the evolving AI landscape and hiring expectations.",
                "type": "Webinar",
                "date": "2025-11-20",
                "time": "07:30 PM BST",
                "location": "Online via Zoom",
                "meeting_url": "https://zoom.us/j/careerchain-summit-2025",
                "organizer": admin_user.id
            },
            {
                "title": "Hands-on Masterclass: Building Production APIs with FastAPI & Docker",
                "desc": "Live interactive coding workshop covering REST principles, Pydantic validation, JWT tokens, and multi-stage containerization.",
                "type": "Workshop",
                "date": "2025-11-28",
                "time": "06:00 PM BST",
                "location": "Lab 402, DIU Smart City Campus, Ashulia",
                "meeting_url": "https://careerchain.local/events/fastapi-workshop",
                "organizer": primary_alumni.id
            },
            {
                "title": "Mock Technical Interview Marathon (Fall Semester)",
                "desc": "One-on-one 45-minute live technical and behavioral mock interview sessions with verified alumni mentors for graduating DIU students.",
                "type": "Career Fair",
                "date": "2025-12-05",
                "time": "10:00 AM BST",
                "location": "DIU Auditorium & Google Meet",
                "meeting_url": "https://meet.google.com/diu-mock-2025",
                "organizer": admin_user.id
            },
            {
                "title": "Demystifying System Design: Microservices & Event Streams",
                "desc": "An architectural breakdown of how Pathao and Chaldal scale order processing and dispatch systems to millions of daily events.",
                "type": "Webinar",
                "date": "2025-12-12",
                "time": "08:00 PM BST",
                "location": "Online via YouTube Live",
                "meeting_url": "https://youtube.com/live/careerchain-sys-design",
                "organizer": seeded_alumni[8].id
            },
            {
                "title": "Resume Review & Portfolio Teardown Session",
                "desc": "Submit your CV for live, constructive critiques by top HR leads and engineering managers from Enosis Solutions and BJIT.",
                "type": "Workshop",
                "date": "2025-12-18",
                "time": "04:00 PM BST",
                "location": "Online via Google Meet",
                "meeting_url": "https://meet.google.com/diu-resume-teardown",
                "organizer": seeded_alumni[2].id
            }
        ]

        for e in events_data:
            ev_obj = Event(
                title=e["title"],
                description=e["desc"],
                event_type=e["type"],
                date=e["date"],
                time=e["time"],
                location=e["location"],
                meeting_url=e["meeting_url"],
                organizer_id=e["organizer"]
            )
            db.add(ev_obj)

        db.flush()

        # 7. 2+ PRE-POPULATED CONVERSATIONS & MESSAGES
        # Conv 1: Tanvir (Student) and Farhan (Alumni)
        conv1 = Conversation(
            participant1_id=primary_student.id,
            participant2_id=primary_alumni.id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            updated_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        )
        db.add(conv1)
        db.flush()

        m1 = Message(
            conversation_id=conv1.id,
            sender_id=primary_student.id,
            content="Hello Farhan Bhai! I noticed your posting for the Associate Backend Engineer role at Brain Station 23. I've been working with FastAPI, Docker, and PostgreSQL on my capstone project.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            is_read=True
        )
        m2 = Message(
            conversation_id=conv1.id,
            sender_id=primary_alumni.id,
            content="Hi Tanvir! Great to connect with a fellow DIU CSE student. Your GitHub portfolio looks solid. Have you worked with Redis caching or automated testing with Pytest?",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=20),
            is_read=True
        )
        m3 = Message(
            conversation_id=conv1.id,
            sender_id=primary_student.id,
            content="Yes, I recently integrated Redis caching for session tokens and wrote Pytest test suites covering 85% of our endpoints! Would it be possible to get an internal referral?",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            is_read=True
        )
        m4 = Message(
            conversation_id=conv1.id,
            sender_id=primary_alumni.id,
            content="Impressive! Send your resume over and I will gladly submit an internal referral for you today.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1),
            is_read=True
        )
        db.add_all([m1, m2, m3, m4])

        # Conv 2: Tanvir (Student) and Sadia Islam (Fellow Student)
        conv2 = Conversation(
            participant1_id=primary_student.id,
            participant2_id=seeded_students[1].id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            updated_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
        )
        db.add(conv2)
        db.flush()

        m2_1 = Message(
            conversation_id=conv2.id,
            sender_id=seeded_students[1].id,
            content="Hey Tanvir, are you attending the upcoming DIU Alumni Tech Summit on Zoom this weekend?",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5),
            is_read=True
        )
        m2_2 = Message(
            conversation_id=conv2.id,
            sender_id=primary_student.id,
            content="Definitely! The session on microservices and system design looks really promising.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30),
            is_read=False
        )
        db.add_all([m2_1, m2_2])

        db.commit()
        logger.info("Successfully seeded database with complete DIU demo data!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during database seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
