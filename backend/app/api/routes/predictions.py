import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.models.symptom_log import SymptomLog
from app.schemas.schemas import SymptomLogCreate, PredictionOut
from app.core.security import get_current_user
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/predict", response_model=PredictionOut)
def predict(
    data: SymptomLogCreate,
    current_user: User = Depends(get_current_user)
):
    """Run a one-off prediction without saving to DB."""
    result = ml_service.predict(data.model_dump())
    return result


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cycle summary stats for the current user."""
    logs = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id)
        .order_by(SymptomLog.logged_at.desc())
        .all()
    )

    if not logs:
        return {"message": "No logs yet", "total_logs": 0}

    phases = [l.predicted_phase for l in logs if l.predicted_phase]
    phase_counts = {}
    for p in phases:
        phase_counts[p] = phase_counts.get(p, 0) + 1

    fertile_days = sum(1 for l in logs if l.is_fertile_window == "True")
    anomalies = sum(1 for l in logs if l.is_anomaly == "True")

    latest = logs[0]
    latest_confidence = {}
    if latest.phase_confidence:
        try:
            latest_confidence = json.loads(latest.phase_confidence)
        except Exception:
            pass

    return {
        "total_logs": len(logs),
        "current_phase": latest.predicted_phase,
        "current_cycle_day": latest.cycle_day,
        "fertility_score": latest.fertility_score,
        "is_fertile_window": latest.is_fertile_window == "True",
        "phase_confidence": latest_confidence,
        "phase_distribution": phase_counts,
        "fertile_days_logged": fertile_days,
        "anomalies_detected": anomalies,
        "latest_logged_at": latest.logged_at,
    }


@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get prediction history for charting."""
    logs = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id)
        .order_by(SymptomLog.logged_at.asc())
        .all()
    )

    return [
        {
            "date": l.logged_at.strftime("%Y-%m-%d"),
            "cycle_day": l.cycle_day,
            "predicted_phase": l.predicted_phase,
            "fertility_score": l.fertility_score,
            "mood": l.mood_score_1_10,
            "energy": l.energy_level_1_10,
            "cramping": l.cramping_0_10,
            "bbt": l.bbt_celsius,
            "is_anomaly": l.is_anomaly == "True"
        }
        for l in logs
    ]
