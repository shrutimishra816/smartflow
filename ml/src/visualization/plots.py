"""
Visualization for menstrual cycle ML tracker.
"""

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix
from pathlib import Path


PHASE_COLORS = {
    "Menstrual": "#E57373",
    "Follicular": "#81C784",
    "Ovulation": "#64B5F6",
    "Luteal": "#FFB74D"
}


def plot_phase_distribution(df: pd.DataFrame, save_path: str = None):
    """Plot phase distribution in the dataset."""
    fig, ax = plt.subplots(figsize=(8, 5))
    counts = df["phase_label"].value_counts()
    colors = [PHASE_COLORS.get(p, "#999") for p in counts.index]

    sns.barplot(x=counts.index, y=counts.values, palette=colors, ax=ax)
    ax.set_title("Phase Distribution in Dataset", fontsize=14, fontweight="bold")
    ax.set_xlabel("Phase")
    ax.set_ylabel("Count")

    for i, v in enumerate(counts.values):
        ax.text(i, v + 20, str(v), ha="center", fontweight="bold")

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
        print(f"📊 Saved: {save_path}")
    plt.show()


def plot_confusion_matrix(y_true, y_pred, class_names, save_path: str = None):
    """Plot confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(8, 6))

    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=ax)
    ax.set_title("Confusion Matrix", fontsize=14, fontweight="bold")
    ax.set_ylabel("True Label")
    ax.set_xlabel("Predicted Label")

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
        print(f"📊 Saved: {save_path}")
    plt.show()


def plot_feature_importance(model, feature_names, top_n: int = 15, save_path: str = None):
    """Plot top N feature importances."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(x=importances[indices], y=[feature_names[i] for i in indices],
                palette="viridis", ax=ax)
    ax.set_title(f"Top {top_n} Feature Importances", fontsize=14, fontweight="bold")
    ax.set_xlabel("Importance Score")

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
        print(f"📊 Saved: {save_path}")
    plt.show()


def plot_hormone_by_phase(df: pd.DataFrame, hormone: str, save_path: str = None):
    """Plot hormone levels across phases."""
    fig, ax = plt.subplots(figsize=(9, 5))
    order = ["Menstrual", "Follicular", "Ovulation", "Luteal"]
    colors = [PHASE_COLORS[p] for p in order]

    sns.boxplot(data=df, x="phase_label", y=hormone, order=order, palette=colors, ax=ax)
    ax.set_title(f"{hormone} by Menstrual Phase", fontsize=14, fontweight="bold")
    ax.set_xlabel("Phase")
    ax.set_ylabel(hormone)

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
        print(f"📊 Saved: {save_path}")
    plt.show()


def plot_cycle_heatmap(df: pd.DataFrame, save_path: str = None):
    """Plot symptom correlation heatmap."""
    symptom_cols = [
        "cramping_0_10", "breast_tenderness_0_10",
        "mood_score_1_10", "energy_level_1_10", "libido_1_10",
        "bbt_celsius", "cervical_mucus_score"
    ]
    corr = df[symptom_cols].corr()

    fig, ax = plt.subplots(figsize=(9, 7))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm",
                center=0, square=True, ax=ax)
    ax.set_title("Symptom Correlation Heatmap", fontsize=14, fontweight="bold")

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
        print(f"📊 Saved: {save_path}")
    plt.show()


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from src.data.loader import load_config, load_raw_data

    config = load_config()
    df = load_raw_data(config["data"]["raw_path"])
    plots_path = config["outputs"]["plots_path"]
    Path(plots_path).mkdir(parents=True, exist_ok=True)

    plot_phase_distribution(df, save_path=f"{plots_path}/phase_distribution.png")
    plot_hormone_by_phase(df, "estrogen_e2_pg_ml", save_path=f"{plots_path}/estrogen_by_phase.png")
    plot_cycle_heatmap(df, save_path=f"{plots_path}/symptom_correlation.png")
