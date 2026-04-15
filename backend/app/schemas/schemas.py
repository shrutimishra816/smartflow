from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Auth Schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str


# --- User Schemas ---

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Symptom Log Schemas ---

class SymptomLogCreate(BaseModel):
    cycle_day: int

    # Hormones (optional)
    estrogen_e2_pg_ml:  Optional[float] = None
    progesterone_ng_ml: Optional[float] = None
    lh_miu_ml:          Optional[float] = None
    fsh_miu_ml:         Optional[float] = None
    testosterone_ng_dl: Optional[float] = None
    prolactin_ng_ml:    Optional[float] = None

    # Physical
    bbt_celsius:          Optional[float] = None
    cervical_mucus_score: Optional[int]   = None
    cervical_mucus_label: Optional[str]   = None

    # Symptoms
    cramping_0_10:          Optional[int] = None
    breast_tenderness_0_10: Optional[int] = None
    mood_score_1_10:        Optional[int] = None
    energy_level_1_10:      Optional[int] = None
    libido_1_10:            Optional[int] = None


class SymptomLogOut(SymptomLogCreate):
    id: int
    user_id: int
    logged_at: datetime
    predicted_phase:  Optional[str]   = None
    phase_confidence: Optional[str]   = None
    is_fertile_window: Optional[str]  = None
    fertility_score:  Optional[float] = None
    is_anomaly:       Optional[str]   = None

    class Config:
        from_attributes = True


# --- Prediction Schemas ---

class PredictionOut(BaseModel):
    predicted_phase:   str
    phase_confidence:  dict
    is_fertile_window: bool
    fertility_score:   float
    is_anomaly:        bool
    anomaly_score:     float
    interpretation:    str
