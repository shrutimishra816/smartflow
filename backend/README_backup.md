# 🌸 SmartFlow — Backend

FastAPI backend with JWT auth, PostgreSQL, and ML model inference.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |

### Symptom Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logs/` | Log symptoms + get prediction |
| GET | `/api/logs/` | Get all my logs |
| GET | `/api/logs/{id}` | Get specific log |
| DELETE | `/api/logs/{id}` | Delete a log |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/predict` | One-off prediction |
| GET | `/api/predictions/summary` | Cycle summary stats |
| GET | `/api/predictions/history` | History for charts |

## Local Setup

```bash
cd backend

# Create and activate venv
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment
copy .env.example .env        # Windows
cp .env.example .env          # Mac/Linux

# Run the server
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs for interactive API docs (Swagger UI)

## Train ML Models First

Before running the backend with ML predictions:

```bash
cd ../
python main.py   # trains and saves models to ml/outputs/models/
```

If models aren't found, the backend falls back to rule-based phase prediction automatically.
