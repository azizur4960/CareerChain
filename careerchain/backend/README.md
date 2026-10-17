# CareerChain Backend

FastAPI, SQLAlchemy, and AI Recommendation Engine for the CareerChain platform.

## Setup & Running

```bash
# 1. Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed database
python seed.py

# 4. Run tests
pytest tests/ -v

# 5. Start development server
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

## Password recovery

Users can reset a password without email by entering their registered account email and university ID at `/forgot-password`. Both values must match the account.
