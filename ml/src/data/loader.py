"""
Data loading and preprocessing for menstrual cycle ML tracker.
"""

import pandas as pd
import numpy as np
import yaml
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


def load_config(config_path: str = "config/config.yaml") -> dict:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_raw_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"✅ Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def preprocess(df: pd.DataFrame, config: dict) -> tuple:
    """
    Preprocess raw data:
    - Drop unused columns
    - Encode categoricals
    - Scale numerics
    - Split into train/test
    """
    feature_cfg = config["features"]

    # Drop ID column
    df = df.drop(columns=feature_cfg["drop"], errors="ignore")

    # Encode target
    le = LabelEncoder()
    y = le.fit_transform(df[feature_cfg["target"]])
    X = df.drop(columns=[feature_cfg["target"]])

    # Encode categorical features
    for col in feature_cfg["categorical"]:
        if col in X.columns:
            X[col] = LabelEncoder().fit_transform(X[col])

    # Scale numerical features
    scaler = StandardScaler()
    X[feature_cfg["numerical"]] = scaler.fit_transform(X[feature_cfg["numerical"]])

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=config["data"]["test_size"],
        random_state=config["data"]["random_state"],
        stratify=y
    )

    print(f"✅ Train: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")
    print(f"✅ Classes: {le.classes_}")

    return X_train, X_test, y_train, y_test, le, scaler


def save_processed(X_train, X_test, y_train, y_test, output_path: str):
    Path(output_path).mkdir(parents=True, exist_ok=True)
    pd.DataFrame(X_train).to_csv(f"{output_path}/X_train.csv", index=False)
    pd.DataFrame(X_test).to_csv(f"{output_path}/X_test.csv", index=False)
    pd.Series(y_train).to_csv(f"{output_path}/y_train.csv", index=False)
    pd.Series(y_test).to_csv(f"{output_path}/y_test.csv", index=False)
    print(f"✅ Processed data saved to {output_path}")


if __name__ == "__main__":
    config = load_config()
    df = load_raw_data(config["data"]["raw_path"])
    X_train, X_test, y_train, y_test, le, scaler = preprocess(df, config)
    save_processed(X_train, X_test, y_train, y_test, config["data"]["processed_path"])
