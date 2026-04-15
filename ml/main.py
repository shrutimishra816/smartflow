"""
Main pipeline - runs the full ML workflow end to end.
Usage: python main.py
"""

import sys
from pathlib import Path

sys.path.append(".")

from src.data.loader import load_config, load_raw_data, preprocess, save_processed
from src.features.engineer import engineer_all_features
from src.models.train import (
    train_phase_classifier, train_cycle_predictor,
    train_anomaly_detector, evaluate_model, save_model
)
from src.visualization.plots import (
    plot_phase_distribution, plot_confusion_matrix,
    plot_feature_importance, plot_cycle_heatmap
)


def run_pipeline():
    print("=" * 60)
    print("  🌸 SmartFlow - Full Pipeline")
    print("=" * 60)

    # 1. Load config
    config = load_config()
    Path(config["outputs"]["models_path"]).mkdir(parents=True, exist_ok=True)
    Path(config["outputs"]["plots_path"]).mkdir(parents=True, exist_ok=True)

    # 2. Load data
    print("\n📂 Step 1: Loading Data...")
    df = load_raw_data(config["data"]["raw_path"])

    # 3. Feature engineering
    print("\n⚙️  Step 2: Feature Engineering...")
    df_engineered = engineer_all_features(df)

    # 4. Preprocess
    print("\n🔧 Step 3: Preprocessing...")
    X_train, X_test, y_train, y_test, le, scaler = preprocess(df_engineered, config)

    # 5. Visualize data
    print("\n📊 Step 4: Generating EDA Plots...")
    plots_path = config["outputs"]["plots_path"]
    plot_phase_distribution(df, save_path=f"{plots_path}/phase_distribution.png")
    plot_cycle_heatmap(df, save_path=f"{plots_path}/symptom_correlation.png")

    # 6. Train models
    print("\n🤖 Step 5: Training Models...")
    phase_model = train_phase_classifier(X_train, y_train, config)
    cycle_model = train_cycle_predictor(X_train, y_train, config)
    anomaly_model = train_anomaly_detector(X_train)

    # 7. Evaluate
    print("\n📈 Step 6: Evaluating Models...")
    y_pred_phase = evaluate_model(phase_model, X_test, y_test, le, "Random Forest Phase Classifier")
    evaluate_model(cycle_model, X_test, y_test, le, "XGBoost Cycle Predictor")

    # 8. Plot results
    plot_confusion_matrix(
        y_test, y_pred_phase, le.classes_,
        save_path=f"{plots_path}/confusion_matrix.png"
    )
    plot_feature_importance(
        phase_model, list(X_train.columns),
        save_path=f"{plots_path}/feature_importance.png"
    )

    # 9. Save models
    print("\n💾 Step 7: Saving Models...")
    models_path = config["outputs"]["models_path"]
    save_model(phase_model, models_path, "phase_classifier")
    save_model(cycle_model, models_path, "cycle_predictor")
    save_model(anomaly_model, models_path, "anomaly_detector")
    save_model(le, models_path, "label_encoder")
    save_model(scaler, models_path, "scaler")

    print("\n" + "=" * 60)
    print("  ✅ Pipeline complete! Check outputs/ for results.")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
