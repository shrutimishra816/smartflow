"""
ML Service — loads trained models and runs predictions.
Falls back to rule-based logic if models aren't trained yet.
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from app.core.config import settings

MUCUS_LABEL_MAP = {
    "Dry": 0, "Sticky": 1, "Creamy": 2, "Watery": 3, "EggWhite": 4
}

DEFAULTS = {
    "estrogen_e2_pg_ml": 80.0,
    "progesterone_ng_ml": 1.0,
    "lh_miu_ml": 5.0,
    "fsh_miu_ml": 5.0,
    "testosterone_ng_dl": 30.0,
    "prolactin_ng_ml": 10.0,
    "bbt_celsius": 36.5,
    "cervical_mucus_score": 2,
    "cervical_mucus_label": "Dry",
    "cramping_0_10": 2,
    "breast_tenderness_0_10": 2,
    "mood_score_1_10": 6,
    "energy_level_1_10": 6,
    "libido_1_10": 5,
}

# Exact feature order the model was trained with
MODEL_FEATURES = [
    "cycle_day", "estrogen_e2_pg_ml", "progesterone_ng_ml",
    "lh_miu_ml", "fsh_miu_ml", "testosterone_ng_dl", "prolactin_ng_ml",
    "bbt_celsius", "cervical_mucus_score", "cervical_mucus_label",
    "cramping_0_10", "breast_tenderness_0_10", "mood_score_1_10",
    "energy_level_1_10", "libido_1_10",
    "estrogen_to_progesterone", "lh_to_fsh_ratio", "lh_surge",
    "physical_discomfort", "wellbeing_score",
    "is_early_cycle", "is_mid_cycle", "is_late_cycle",
    "cycle_day_sin", "cycle_day_cos", "fertility_flag",
    "estrogen_e2_pg_ml_zscore", "progesterone_ng_ml_zscore",
    "lh_miu_ml_zscore", "bbt_celsius_zscore"
]

# Columns scaler was fitted on (14 raw features only)
SCALER_FEATURES = [
    "cycle_day", "estrogen_e2_pg_ml", "progesterone_ng_ml",
    "lh_miu_ml", "fsh_miu_ml", "testosterone_ng_dl", "prolactin_ng_ml",
    "bbt_celsius", "cervical_mucus_score", "cramping_0_10",
    "breast_tenderness_0_10", "mood_score_1_10", "energy_level_1_10", "libido_1_10"
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Encode cervical mucus label
    df["cervical_mucus_label"] = df["cervical_mucus_label"].map(MUCUS_LABEL_MAP).fillna(0)

    # Hormone ratios
    df["estrogen_to_progesterone"] = df["estrogen_e2_pg_ml"] / (df["progesterone_ng_ml"] + 1e-6)
    df["lh_to_fsh_ratio"] = df["lh_miu_ml"] / (df["fsh_miu_ml"] + 1e-6)
    df["lh_surge"] = (df["lh_miu_ml"] > 15).astype(int)

    # Symptom composites
    df["physical_discomfort"] = (df["cramping_0_10"] + df["breast_tenderness_0_10"]) / 2
    df["wellbeing_score"] = (df["mood_score_1_10"] + df["energy_level_1_10"] + df["libido_1_10"]) / 3

    # Cycle day features
    df["is_early_cycle"] = (df["cycle_day"] <= 7).astype(int)
    df["is_mid_cycle"] = ((df["cycle_day"] > 7) & (df["cycle_day"] <= 21)).astype(int)
    df["is_late_cycle"] = (df["cycle_day"] > 21).astype(int)
    df["cycle_day_sin"] = np.sin(2 * np.pi * df["cycle_day"] / 28)
    df["cycle_day_cos"] = np.cos(2 * np.pi * df["cycle_day"] / 28)

    # Fertility flag
    df["fertility_flag"] = (
        (df["lh_miu_ml"] > 15) | (df["cervical_mucus_score"] >= 4)
    ).astype(int)

    # Z-scores using fixed population means from training data
    MEANS = {"estrogen_e2_pg_ml": 120.0, "progesterone_ng_ml": 5.0, "lh_miu_ml": 10.0, "bbt_celsius": 36.6}
    STDS  = {"estrogen_e2_pg_ml": 80.0,  "progesterone_ng_ml": 5.0, "lh_miu_ml": 10.0, "bbt_celsius": 0.3}
    for col in ["estrogen_e2_pg_ml", "progesterone_ng_ml", "lh_miu_ml", "bbt_celsius"]:
        df[f"{col}_zscore"] = (df[col] - MEANS[col]) / (STDS[col] + 1e-6)

    return df


class MLService:
    def __init__(self):
        self.phase_model = None
        self.anomaly_model = None
        self.label_encoder = None
        self.scaler = None
        self._load_models()

    def _load_models(self):
        models_path = Path(settings.ML_MODELS_PATH)
        try:
            self.phase_model   = joblib.load(models_path / "phase_classifier.pkl")
            self.anomaly_model = joblib.load(models_path / "anomaly_detector.pkl")
            self.label_encoder = joblib.load(models_path / "label_encoder.pkl")
            self.scaler        = joblib.load(models_path / "scaler.pkl")
            print("✅ ML models loaded successfully")
        except Exception as e:
            print(f"⚠️  ML models not found ({e}). Using rule-based fallback.")

    def _rule_based_phase(self, cycle_day: int) -> str:
        if cycle_day <= 5:
            return "Menstrual"
        elif cycle_day <= 13:
            return "Follicular"
        elif cycle_day <= 16:
            return "Ovulation"
        else:
            return "Luteal"

    def _build_input(self, log_data: dict) -> pd.DataFrame:
        row = {}
        for col in SCALER_FEATURES:
            val = log_data.get(col)
            row[col] = val if val is not None else DEFAULTS.get(col, 0)
        row["cervical_mucus_label"] = log_data.get("cervical_mucus_label") or DEFAULTS["cervical_mucus_label"]
        return pd.DataFrame([row])

    def predict(self, log_data: dict) -> dict:
        cycle_day = log_data.get("cycle_day", 14)

        if self.phase_model is None:
            phase = self._rule_based_phase(cycle_day)
            return {
                "predicted_phase": phase,
                "phase_confidence": {phase: 1.0},
                "is_fertile_window": phase in ["Ovulation", "Follicular"],
                "fertility_score": 0.8 if phase == "Ovulation" else 0.4 if phase == "Follicular" else 0.1,
                "is_anomaly": False,
                "anomaly_score": 0.0,
                "interpretation": "✅ Normal pattern (rule-based)"
            }

        # Build raw input
        X_raw = self._build_input(log_data)

        # Scale the 14 raw numeric features
        X_raw_scaled = self.scaler.transform(X_raw[SCALER_FEATURES])
        raw_scaled_df = pd.DataFrame(X_raw_scaled, columns=SCALER_FEATURES)

        # Engineer all features on raw (unscaled) input
        X_eng = engineer_features(X_raw)

        # Replace raw columns with scaled values
        for col in SCALER_FEATURES:
            X_eng[col] = raw_scaled_df[col].values

        # Select exact feature order matching training
        X_final = X_eng[MODEL_FEATURES]

        # Phase prediction
        pred  = self.phase_model.predict(X_final)
        proba = self.phase_model.predict_proba(X_final)[0]
        phase = self.label_encoder.inverse_transform(pred)[0]
        confidence = {
            self.label_encoder.classes_[i]: round(float(p), 3)
            for i, p in enumerate(proba)
        }

        # Fertility
        is_fertile = phase in ["Ovulation", "Follicular"]
        fertility_score = round(
            confidence.get("Ovulation", 0) + confidence.get("Follicular", 0) * 0.5, 3
        )

        # Anomaly detection
        anomaly_pred  = self.anomaly_model.predict(X_final)[0]
        anomaly_score = round(float(self.anomaly_model.decision_function(X_final)[0]), 4)
        is_anomaly    = anomaly_pred == -1

        return {
            "predicted_phase": phase,
            "phase_confidence": confidence,
            "is_fertile_window": is_fertile,
            "fertility_score": fertility_score,
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "interpretation": "⚠️ Unusual pattern detected" if is_anomaly else "✅ Normal pattern"
        }


# Singleton instance
ml_service = MLService()
