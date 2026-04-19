"""
Model training for menstrual cycle ML tracker.
Covers: Phase classification, Cycle prediction, Anomaly detection.
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE


def train_phase_classifier(X_train, y_train, config: dict):
    """Train phase classification model with SMOTE for class imbalance."""
    print("\n🔄 Training Phase Classifier...")

    # Handle class imbalance with SMOTE
    smote = SMOTE(random_state=config["data"]["random_state"])
    X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
    print(f"  After SMOTE: {X_resampled.shape[0]} samples")

    params = config["models"]["phase_classifier"]["params"]
    model = RandomForestClassifier(**params)
    model.fit(X_resampled, y_resampled)

    print("✅ Phase Classifier trained!")
    return model


def train_cycle_predictor(X_train, y_train, config: dict):
    """Train XGBoost model for cycle day prediction."""
    print("\n🔄 Training Cycle Predictor (XGBoost)...")

    params = config["models"]["cycle_predictor"]["params"]
    model = XGBClassifier(**params, eval_metric="mlogloss", use_label_encoder=False)
    model.fit(X_train, y_train)

    print("✅ Cycle Predictor trained!")
    return model


def train_anomaly_detector(X_train, contamination: float = 0.05):
    """Train Isolation Forest for anomaly detection."""
    print("\n🔄 Training Anomaly Detector (Isolation Forest)...")

    model = IsolationForest(contamination=contamination, random_state=42)
    model.fit(X_train)

    print("✅ Anomaly Detector trained!")
    return model


def evaluate_model(model, X_test, y_test, label_encoder, model_name: str):
    """Evaluate and print classification metrics."""
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n📊 {model_name} Evaluation:")
    print(f"  Accuracy: {acc:.4f}")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    return y_pred


def save_model(model, path: str, name: str):
    """Save trained model to disk."""
    Path(path).mkdir(parents=True, exist_ok=True)
    filepath = f"{path}/{name}.pkl"
    joblib.dump(model, filepath)
    print(f"💾 Model saved: {filepath}")


def load_model(path: str):
    """Load a saved model."""
    return joblib.load(path)


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from src.data.loader import load_config, load_raw_data, preprocess

    config = load_config()
    df = load_raw_data(config["data"]["raw_path"])
    X_train, X_test, y_train, y_test, le, scaler = preprocess(df, config)

    # Train models
    phase_model = train_phase_classifier(X_train, y_train, config)
    cycle_model = train_cycle_predictor(X_train, y_train, config)
    anomaly_model = train_anomaly_detector(X_train)

    # Evaluate
    evaluate_model(phase_model, X_test, y_test, le, "Random Forest Phase Classifier")
    evaluate_model(cycle_model, X_test, y_test, le, "XGBoost Cycle Predictor")

    # Save
    save_model(phase_model, config["outputs"]["models_path"], "phase_classifier")
    save_model(cycle_model, config["outputs"]["models_path"], "cycle_predictor")
    save_model(anomaly_model, config["outputs"]["models_path"], "anomaly_detector")
    save_model(le, config["outputs"]["models_path"], "label_encoder")
    save_model(scaler, config["outputs"]["models_path"], "scaler")
