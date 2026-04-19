"""
Prediction and inference for menstrual cycle ML tracker.
"""

import numpy as np
import pandas as pd
import joblib


def load_artifacts(models_path: str) -> dict:
    """Load all saved models and encoders."""
    return {
        "phase_classifier": joblib.load(f"{models_path}/phase_classifier.pkl"),
        "cycle_predictor": joblib.load(f"{models_path}/cycle_predictor.pkl"),
        "anomaly_detector": joblib.load(f"{models_path}/anomaly_detector.pkl"),
        "label_encoder": joblib.load(f"{models_path}/label_encoder.pkl"),
        "scaler": joblib.load(f"{models_path}/scaler.pkl"),
    }


def predict_phase(artifacts: dict, input_data: pd.DataFrame) -> dict:
    """Predict menstrual phase for input data."""
    le = artifacts["label_encoder"]
    scaler = artifacts["scaler"]
    model = artifacts["phase_classifier"]

    input_scaled = scaler.transform(input_data)
    pred = model.predict(input_scaled)
    proba = model.predict_proba(input_scaled)

    phase = le.inverse_transform(pred)[0]
    confidence = {le.classes_[i]: round(float(p), 3) for i, p in enumerate(proba[0])}

    return {
        "predicted_phase": phase,
        "confidence": confidence
    }


def predict_fertility(artifacts: dict, input_data: pd.DataFrame) -> dict:
    """Predict fertility window based on phase prediction."""
    result = predict_phase(artifacts, input_data)
    phase = result["predicted_phase"]

    fertile_phases = ["Ovulation", "Follicular"]
    is_fertile = phase in fertile_phases

    fertility_score = (
        result["confidence"].get("Ovulation", 0) +
        result["confidence"].get("Follicular", 0) * 0.5
    )

    return {
        "predicted_phase": phase,
        "is_fertile_window": is_fertile,
        "fertility_score": round(fertility_score, 3),
        "phase_confidence": result["confidence"]
    }


def detect_anomaly(artifacts: dict, input_data: pd.DataFrame) -> dict:
    """Detect if input data represents an anomalous cycle pattern."""
    scaler = artifacts["scaler"]
    model = artifacts["anomaly_detector"]

    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)
    score = model.decision_function(input_scaled)

    is_anomaly = prediction[0] == -1

    return {
        "is_anomaly": bool(is_anomaly),
        "anomaly_score": round(float(score[0]), 4),
        "interpretation": "⚠️ Unusual pattern detected" if is_anomaly else "✅ Normal pattern"
    }


def full_prediction(artifacts: dict, input_data: pd.DataFrame) -> dict:
    """Run all predictions on input data."""
    fertility = predict_fertility(artifacts, input_data)
    anomaly = detect_anomaly(artifacts, input_data)

    return {
        **fertility,
        **anomaly
    }


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from src.data.loader import load_config, load_raw_data, preprocess

    config = load_config()
    artifacts = load_artifacts(config["outputs"]["models_path"])

    # Example: predict on a single sample
    df = load_raw_data(config["data"]["raw_path"])
    X_train, X_test, y_train, y_test, le, scaler = preprocess(df, config)

    sample = pd.DataFrame(X_test.iloc[[0]])
    result = full_prediction(artifacts, sample)

    print("\n🔮 Prediction Result:")
    for k, v in result.items():
        print(f"  {k}: {v}")
