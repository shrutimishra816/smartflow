"""
Feature engineering for menstrual cycle ML tracker.
"""

import pandas as pd
import numpy as np


def add_hormone_ratios(df: pd.DataFrame) -> pd.DataFrame:
    """Add hormone ratio features."""
    df = df.copy()
    df["estrogen_to_progesterone"] = df["estrogen_e2_pg_ml"] / (df["progesterone_ng_ml"] + 1e-6)
    df["lh_to_fsh_ratio"] = df["lh_miu_ml"] / (df["fsh_miu_ml"] + 1e-6)
    df["lh_surge"] = (df["lh_miu_ml"] > df["lh_miu_ml"].quantile(0.85)).astype(int)
    return df


def add_symptom_composite(df: pd.DataFrame) -> pd.DataFrame:
    """Combine symptoms into composite scores."""
    df = df.copy()
    df["physical_discomfort"] = (df["cramping_0_10"] + df["breast_tenderness_0_10"]) / 2
    df["wellbeing_score"] = (df["mood_score_1_10"] + df["energy_level_1_10"] + df["libido_1_10"]) / 3
    return df


def add_cycle_phase_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add cycle day-based features."""
    df = df.copy()
    df["is_early_cycle"] = (df["cycle_day"] <= 7).astype(int)
    df["is_mid_cycle"] = ((df["cycle_day"] > 7) & (df["cycle_day"] <= 21)).astype(int)
    df["is_late_cycle"] = (df["cycle_day"] > 21).astype(int)
    df["cycle_day_sin"] = np.sin(2 * np.pi * df["cycle_day"] / 28)
    df["cycle_day_cos"] = np.cos(2 * np.pi * df["cycle_day"] / 28)
    return df


def add_fertility_flag(df: pd.DataFrame) -> pd.DataFrame:
    """Flag likely fertile days based on LH surge and BBT."""
    df = df.copy()
    lh_threshold = df["lh_miu_ml"].quantile(0.85)
    df["fertility_flag"] = (
        (df["lh_miu_ml"] > lh_threshold) |
        (df["cervical_mucus_score"] >= 4)
    ).astype(int)
    return df


def add_anomaly_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add features useful for anomaly detection."""
    df = df.copy()
    for col in ["estrogen_e2_pg_ml", "progesterone_ng_ml", "lh_miu_ml", "bbt_celsius"]:
        mean = df[col].mean()
        std = df[col].std()
        df[f"{col}_zscore"] = (df[col] - mean) / (std + 1e-6)
    return df


def engineer_all_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply all feature engineering steps."""
    df = add_hormone_ratios(df)
    df = add_symptom_composite(df)
    df = add_cycle_phase_features(df)
    df = add_fertility_flag(df)
    df = add_anomaly_features(df)
    print(f"✅ Feature engineering done. Total features: {df.shape[1]}")
    return df


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from src.data.loader import load_config, load_raw_data

    config = load_config()
    df = load_raw_data(config["data"]["raw_path"])
    df_engineered = engineer_all_features(df)
    print(df_engineered.head())
