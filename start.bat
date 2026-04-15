@echo off
echo ============================================
echo   SmartFlow - Menstrual Cycle Tracker
echo ============================================
echo.

echo [1/3] Setting up ML models...
cd /d D:\Projects\smartflow\ml
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt -q
pip install pyyaml -q
python main.py
cd /d D:\Projects\smartflow

echo.
echo [2/3] Starting backend...
cd /d D:\Projects\smartflow\backend
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt -q
if not exist .env (
    copy .env.example .env
)
start "SmartFlow Backend" cmd /k "cd /d D:\Projects\smartflow\backend && call .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
cd /d D:\Projects\smartflow

echo.
echo [3/3] Starting frontend...
cd /d D:\Projects\smartflow\frontend
if not exist node_modules (
    npm install
)
if not exist .env (
    copy .env.example .env
)
start "SmartFlow Frontend" cmd /k "cd /d D:\Projects\smartflow\frontend && npm run dev"
cd /d D:\Projects\smartflow

echo.
echo ============================================
echo   SmartFlow is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000/docs
echo ============================================
pause
