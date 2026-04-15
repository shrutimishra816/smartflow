"""
Watch Integration Routes
- Fitbit OAuth + status + disconnect
- Google Fit OAuth + status + disconnect
- Manual CSV/JSON import
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.orm import Session
import csv
import json
import io
import httpx

from app.db.database import get_db
from app.models.user import User
from app.models.symptom_log import SymptomLog
from app.core.security import get_current_user
from app.core.config import settings
from app.services.ml_service import ml_service

router = APIRouter()

FITBIT_CLIENT_ID     = settings.FITBIT_CLIENT_ID
FITBIT_CLIENT_SECRET = settings.FITBIT_CLIENT_SECRET
FITBIT_REDIRECT_URI  = settings.FITBIT_REDIRECT_URI
GOOGLE_CLIENT_ID     = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI  = settings.GOOGLE_REDIRECT_URI
FRONTEND_URL         = settings.FRONTEND_URL

# In-memory token store (persists while server is running)
_fitbit_tokens = {}
_google_tokens = {}


# ─── FITBIT ───────────────────────────────────────────────────────────────────

@router.get("/fitbit/status")
async def fitbit_status(current_user: User = Depends(get_current_user)):
    """Check if Fitbit is connected and return profile info."""
    token_data = _fitbit_tokens.get(current_user.id)
    if not token_data:
        return {"connected": False, "platform": "fitbit"}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.fitbit.com/1/user/-/profile.json",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
        if res.status_code == 200:
            profile = res.json().get("user", {})
            return {
                "connected":    True,
                "platform":     "fitbit",
                "display_name": profile.get("displayName", "Fitbit User"),
                "avatar":       profile.get("avatar150", None),
                "member_since": profile.get("memberSince", None),
            }
    except Exception:
        pass
    return {"connected": False, "platform": "fitbit"}


@router.get("/fitbit/auth")
def fitbit_auth(current_user: User = Depends(get_current_user)):
    if not FITBIT_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Fitbit integration not configured. Add FITBIT_CLIENT_ID to .env")
    scope = "heartrate sleep temperature activity profile"
    url = (
        f"https://www.fitbit.com/oauth2/authorize"
        f"?response_type=code&client_id={FITBIT_CLIENT_ID}"
        f"&redirect_uri={FITBIT_REDIRECT_URI}&scope={scope}&state={current_user.id}"
    )
    return {"auth_url": url}


@router.get("/fitbit/callback")
async def fitbit_callback(code: str, state: str):
    if not FITBIT_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Fitbit not configured")
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://api.fitbit.com/oauth2/token",
            data={"code": code, "grant_type": "authorization_code",
                  "redirect_uri": FITBIT_REDIRECT_URI, "client_id": FITBIT_CLIENT_ID},
            auth=(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET),
        )
    if token_res.status_code != 200:
        return RedirectResponse(url=f"{FRONTEND_URL}/settings?watch=fitbit&connected=false")
    _fitbit_tokens[int(state)] = token_res.json()
    return RedirectResponse(url=f"{FRONTEND_URL}/settings?watch=fitbit&connected=true")


@router.delete("/fitbit/disconnect")
def fitbit_disconnect(current_user: User = Depends(get_current_user)):
    _fitbit_tokens.pop(current_user.id, None)
    return {"message": "Fitbit disconnected"}


# ─── GOOGLE FIT ───────────────────────────────────────────────────────────────

@router.get("/googlefit/status")
def googlefit_status(current_user: User = Depends(get_current_user)):
    return {"connected": current_user.id in _google_tokens, "platform": "googlefit"}


@router.get("/googlefit/auth")
def googlefit_auth(current_user: User = Depends(get_current_user)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google Fit not configured. Add GOOGLE_CLIENT_ID to .env")
    scope = "https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}&scope={scope}&access_type=offline&state={current_user.id}"
    )
    return {"auth_url": url}


@router.get("/googlefit/callback")
async def googlefit_callback(code: str, state: str):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google Fit not configured")
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={"code": code, "grant_type": "authorization_code",
                  "redirect_uri": GOOGLE_REDIRECT_URI,
                  "client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET}
        )
    if token_res.status_code != 200:
        return RedirectResponse(url=f"{FRONTEND_URL}/settings?watch=googlefit&connected=false")
    _google_tokens[int(state)] = token_res.json()
    return RedirectResponse(url=f"{FRONTEND_URL}/settings?watch=googlefit&connected=true")


@router.delete("/googlefit/disconnect")
def googlefit_disconnect(current_user: User = Depends(get_current_user)):
    _google_tokens.pop(current_user.id, None)
    return {"message": "Google Fit disconnected"}


# ─── MANUAL IMPORT ────────────────────────────────────────────────────────────

IMPORT_FIELD_MAP = {
    "cycle_day":               ["cycle_day", "day"],
    "bbt_celsius":             ["bbt_celsius", "bbt", "temperature", "body_temp"],
    "mood_score_1_10":         ["mood_score_1_10", "mood"],
    "energy_level_1_10":       ["energy_level_1_10", "energy"],
    "cramping_0_10":           ["cramping_0_10", "cramping"],
    "breast_tenderness_0_10":  ["breast_tenderness_0_10", "breast_tenderness"],
    "libido_1_10":             ["libido_1_10", "libido"],
    "cervical_mucus_label":    ["cervical_mucus_label", "mucus"],
    "cervical_mucus_score":    ["cervical_mucus_score"],
    "lh_miu_ml":               ["lh_miu_ml", "lh"],
    "estrogen_e2_pg_ml":       ["estrogen_e2_pg_ml", "estrogen"],
    "progesterone_ng_ml":      ["progesterone_ng_ml", "progesterone"],
}


def map_row(row: dict) -> dict:
    result    = {}
    row_lower = {k.lower().strip(): v for k, v in row.items()}
    for sf_field, aliases in IMPORT_FIELD_MAP.items():
        for alias in aliases:
            if alias in row_lower and row_lower[alias] not in ("", None):
                try:
                    result[sf_field] = float(row_lower[alias]) if sf_field != "cervical_mucus_label" else row_lower[alias]
                except ValueError:
                    result[sf_field] = row_lower[alias]
                break
    return result


@router.post("/import")
async def import_watch_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content  = await file.read()
    filename = file.filename.lower()
    rows     = []
    try:
        if filename.endswith(".json"):
            data = json.loads(content)
            rows = data if isinstance(data, list) else data.get("logs", [])
        elif filename.endswith(".csv"):
            rows = list(csv.DictReader(io.StringIO(content.decode("utf-8-sig"))))
        else:
            raise HTTPException(status_code=400, detail="Only .csv or .json supported")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    imported = skipped = 0
    for row in rows:
        mapped = map_row(row)
        if "cycle_day" not in mapped:
            skipped += 1
            continue
        prediction = ml_service.predict(mapped)
        log = SymptomLog(
            user_id=current_user.id,
            **{k: v for k, v in mapped.items() if hasattr(SymptomLog, k)},
            predicted_phase=prediction["predicted_phase"],
            phase_confidence=json.dumps(prediction["phase_confidence"]),
            is_fertile_window=str(prediction["is_fertile_window"]),
            fertility_score=prediction["fertility_score"],
            is_anomaly=str(prediction["is_anomaly"])
        )
        db.add(log)
        imported += 1
    db.commit()
    return {"message": "Import complete", "imported": imported, "skipped": skipped}


@router.get("/import/template")
def download_template():
    fields  = ["cycle_day","bbt_celsius","cervical_mucus_label","cervical_mucus_score",
                "cramping_0_10","breast_tenderness_0_10","mood_score_1_10",
                "energy_level_1_10","libido_1_10","lh_miu_ml","estrogen_e2_pg_ml","progesterone_ng_ml"]
    example = {"cycle_day":"5","bbt_celsius":"36.4","cervical_mucus_label":"Dry",
                "cervical_mucus_score":"1","cramping_0_10":"6","breast_tenderness_0_10":"3",
                "mood_score_1_10":"5","energy_level_1_10":"4","libido_1_10":"3",
                "lh_miu_ml":"5.2","estrogen_e2_pg_ml":"60.0","progesterone_ng_ml":"0.8"}
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    writer.writerow(example)
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartflow_import_template.csv"})
