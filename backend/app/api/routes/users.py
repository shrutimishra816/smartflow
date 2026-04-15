from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import csv
import json
import io
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.symptom_log import SymptomLog
from app.schemas.schemas import UserOut
from app.core.security import get_current_user, hash_password, verify_password

router = APIRouter()


# --- Schemas ---

class UpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


# --- Endpoints ---

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.username:
        existing = db.query(User).filter(
            User.username == data.username,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username

    if data.email:
        existing = db.query(User).filter(
            User.email == data.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data.email

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Delete all logs first (cascade should handle it but being explicit)
    db.query(SymptomLog).filter(SymptomLog.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all data deleted successfully"}


@router.get("/export")
def export_data(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id)
        .order_by(SymptomLog.logged_at.asc())
        .all()
    )

    fields = [
        "id", "logged_at", "cycle_day", "estrogen_e2_pg_ml", "progesterone_ng_ml",
        "lh_miu_ml", "fsh_miu_ml", "bbt_celsius", "cervical_mucus_label",
        "cervical_mucus_score", "cramping_0_10", "breast_tenderness_0_10",
        "mood_score_1_10", "energy_level_1_10", "libido_1_10",
        "predicted_phase", "fertility_score", "is_fertile_window", "is_anomaly"
    ]

    if format == "json":
        data = []
        for log in logs:
            row = {f: str(getattr(log, f, "")) for f in fields}
            data.append(row)
        content = json.dumps({"user": current_user.username, "exported_at": str(datetime.utcnow()), "logs": data}, indent=2)
        return StreamingResponse(
            io.StringIO(content),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=smartflow_data_{current_user.username}.json"}
        )

    # Default: CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for log in logs:
        writer.writerow({f: getattr(log, f, "") for f in fields})

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=smartflow_data_{current_user.username}.csv"}
    )
