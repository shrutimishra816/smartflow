# 🌸 SmartFlow — SmartFlow

A full-stack web app for menstrual cycle tracking with ML-powered phase prediction, fertility window detection, and anomaly alerts.

---

## Project Structure

```
smartflow-app/
├── backend/        FastAPI backend (Python) — auth, API, ML inference
├── frontend/       React frontend — dashboard, logging, history
├── ml/             ML pipeline — train models on your dataset
└── render.yaml     One-click Render deployment config
```

---

## ⚡ Quick Start (Local)

### Step 1 — Train the ML Models

```bash
cd ml

# Create & activate venv
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Mac/Linux

pip install -r requirements.txt
pip install pyyaml

python main.py
# Models saved to ml/outputs/models/
```

---

### Step 2 — Run the Backend

```bash
cd backend

# Create & activate venv
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Mac/Linux

pip install -r requirements.txt

# Set up environment
copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux

# Edit .env — set ML_MODELS_PATH=../ml/outputs/models

uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### Step 3 — Run the Frontend

```bash
cd frontend

npm install

copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux

# .env should contain: VITE_API_URL=http://localhost:8000/api

npm run dev
```

Open: http://localhost:3000 🌸

---

## 🚀 Deploy to Render

1. Push this entire folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → **Blueprint**
3. Connect your GitHub repo
4. Render reads `render.yaml` and auto-creates:
   - `smartflow-backend` — FastAPI web service
   - `smartflow-frontend` — React static site
   - `smartflow-db` — PostgreSQL database (free tier)
5. Done! Your app is live.

> **Important:** After deploy, update `ALLOWED_ORIGINS` in `backend/app/core/config.py` with your actual Render frontend URL.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS      |
| Backend    | FastAPI, SQLAlchemy, JWT Auth     |
| Database   | PostgreSQL (prod) / SQLite (dev)  |
| ML Models  | scikit-learn, XGBoost, SHAP       |
| Deployment | Render                            |

---

## Features

- ✅ User signup / login with JWT
- ✅ Daily symptom logging (BBT, mucus, mood, energy, cramping)
- ✅ ML phase prediction (Menstrual / Follicular / Ovulation / Luteal)
- ✅ Fertility window detection
- ✅ Anomaly detection with alerts
- ✅ Personal dashboard with charts
- ✅ Log history with delete
- ✅ Mobile-friendly UI
