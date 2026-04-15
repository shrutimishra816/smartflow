import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.models.symptom_log import SymptomLog
from app.schemas.schemas import SymptomLogCreate, SymptomLogOut
from app.core.security import get_current_user
from app.services.ml_service import ml_service

router = APIRouter()


class SymptomLogUpdate(BaseModel):
    cycle_day:              Optional[int]   = None
    log_date:               Optional[str]   = None
    estrogen_e2_pg_ml:      Optional[float] = None
    progesterone_ng_ml:     Optional[float] = None
    lh_miu_ml:              Optional[float] = None
    fsh_miu_ml:             Optional[float] = None
    testosterone_ng_dl:     Optional[float] = None
    prolactin_ng_ml:        Optional[float] = None
    bbt_celsius:            Optional[float] = None
    cervical_mucus_score:   Optional[int]   = None
    cervical_mucus_label:   Optional[str]   = None
    cramping_0_10:          Optional[int]   = None
    breast_tenderness_0_10: Optional[int]   = None
    mood_score_1_10:        Optional[int]   = None
    energy_level_1_10:      Optional[int]   = None
    libido_1_10:            Optional[int]   = None


@router.post("/", response_model=SymptomLogOut, status_code=201)
def create_log(
    data: SymptomLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_dict     = data.model_dump()
    log_date_str = log_dict.pop("log_date", None)

    if log_date_str:
        try:
            log_date = datetime.strptime(log_date_str, "%Y-%m-%d").date()
            if log_date > date.today():
                raise HTTPException(status_code=400, detail="Cannot log symptoms for a future date")
            logged_at = datetime.combine(log_date, datetime.min.time())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        logged_at = datetime.utcnow()

    prediction = ml_service.predict(log_dict)
    log = SymptomLog(
        user_id=current_user.id,
        logged_at=logged_at,
        **log_dict,
        predicted_phase=prediction["predicted_phase"],
        phase_confidence=json.dumps(prediction["phase_confidence"]),
        is_fertile_window=str(prediction["is_fertile_window"]),
        fertility_score=prediction["fertility_score"],
        is_anomaly=str(prediction["is_anomaly"])
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/", response_model=List[SymptomLogOut])
def get_my_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id)
        .order_by(SymptomLog.logged_at.desc())
        .offset(skip).limit(limit)
        .all()
    )


@router.get("/{log_id}", response_model=SymptomLogOut)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(SymptomLog).filter(
        SymptomLog.id == log_id,
        SymptomLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.put("/{log_id}", response_model=SymptomLogOut)
def update_log(
    log_id: int,
    data: SymptomLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Edit an existing log and re-run ML prediction."""
    log = db.query(SymptomLog).filter(
        SymptomLog.id == log_id,
        SymptomLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    update_dict  = data.model_dump(exclude_none=True)
    log_date_str = update_dict.pop("log_date", None)

    if log_date_str:
        try:
            log_date = datetime.strptime(log_date_str, "%Y-%m-%d").date()
            if log_date > date.today():
                raise HTTPException(status_code=400, detail="Cannot set a future date")
            log.logged_at = datetime.combine(log_date, datetime.min.time())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    for field, value in update_dict.items():
        if hasattr(log, field):
            setattr(log, field, value)

    # Re-run ML prediction
    log_data = {
        "cycle_day": log.cycle_day, "estrogen_e2_pg_ml": log.estrogen_e2_pg_ml,
        "progesterone_ng_ml": log.progesterone_ng_ml, "lh_miu_ml": log.lh_miu_ml,
        "fsh_miu_ml": log.fsh_miu_ml, "testosterone_ng_dl": log.testosterone_ng_dl,
        "prolactin_ng_ml": log.prolactin_ng_ml, "bbt_celsius": log.bbt_celsius,
        "cervical_mucus_score": log.cervical_mucus_score, "cervical_mucus_label": log.cervical_mucus_label,
        "cramping_0_10": log.cramping_0_10, "breast_tenderness_0_10": log.breast_tenderness_0_10,
        "mood_score_1_10": log.mood_score_1_10, "energy_level_1_10": log.energy_level_1_10,
        "libido_1_10": log.libido_1_10,
    }
    prediction            = ml_service.predict(log_data)
    log.predicted_phase   = prediction["predicted_phase"]
    log.phase_confidence  = json.dumps(prediction["phase_confidence"])
    log.is_fertile_window = str(prediction["is_fertile_window"])
    log.fertility_score   = prediction["fertility_score"]
    log.is_anomaly        = str(prediction["is_anomaly"])

    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(SymptomLog).filter(
        SymptomLog.id == log_id,
        SymptomLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
