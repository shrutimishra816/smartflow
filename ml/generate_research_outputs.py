"""
SmartFlow Research Paper — Output Generator
Run this from: D:\\Projects\\smartflow\\ml\\

Usage:
    python generate_research_outputs.py

Outputs saved to: research_outputs/
"""

import pandas as pd
import numpy as np
import matplotlib # type: ignore
matplotlib.use('Agg')
import matplotlib.pyplot as plt # type: ignore
import matplotlib.patches as mpatches # type: ignore
import seaborn as sns # type: ignore
import joblib
import json
import csv
import os
import warnings
warnings.filterwarnings('ignore')

from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
MODELS_PATH = BASE_DIR / "outputs" / "models"
DATA_PATH   = BASE_DIR / "data" / "raw" / "menstrual_phase_dataset_10k.csv"
OUT_DIR     = BASE_DIR / "research_outputs"

CHARTS_DIR = OUT_DIR / "charts"
TABLES_DIR = OUT_DIR / "tables"
LATEX_DIR  = OUT_DIR / "latex"

for d in [CHARTS_DIR, TABLES_DIR, LATEX_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Constants ─────────────────────────────────────────────────────────────────
PHASE_COLORS = {
    'Menstrual':  '#E8647A',
    'Follicular': '#7BAE9A',
    'Ovulation':  '#64B5F6',
    'Luteal':     '#E8A95C'
}
ORDER = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal']
DPI   = 300

# ── Load models & data ────────────────────────────────────────────────────────
print("Loading models and data...")
df            = pd.read_csv(DATA_PATH)
phase_model   = joblib.load(MODELS_PATH / "phase_classifier.pkl")
cycle_model   = joblib.load(MODELS_PATH / "cycle_predictor.pkl")
anomaly_model = joblib.load(MODELS_PATH / "anomaly_detector.pkl")
le            = joblib.load(MODELS_PATH / "label_encoder.pkl")
scaler        = joblib.load(MODELS_PATH / "scaler.pkl")
print(f"✅ Loaded dataset: {len(df)} rows | Models: phase, cycle, anomaly\n")


# ── Feature engineering (same as training) ────────────────────────────────────
def engineer_features(df):
    df = df.copy()
    df['estrogen_to_progesterone'] = df['estrogen_e2_pg_ml'] / (df['progesterone_ng_ml'] + 1e-6)
    df['lh_to_fsh_ratio']          = df['lh_miu_ml'] / (df['fsh_miu_ml'] + 1e-6)
    df['lh_surge']                 = (df['lh_miu_ml'] > df['lh_miu_ml'].quantile(0.85)).astype(int)
    df['physical_discomfort']      = (df['cramping_0_10'] + df['breast_tenderness_0_10']) / 2
    df['wellbeing_score']          = (df['mood_score_1_10'] + df['energy_level_1_10'] + df['libido_1_10']) / 3
    df['is_early_cycle']           = (df['cycle_day'] <= 7).astype(int)
    df['is_mid_cycle']             = ((df['cycle_day'] > 7) & (df['cycle_day'] <= 21)).astype(int)
    df['is_late_cycle']            = (df['cycle_day'] > 21).astype(int)
    df['cycle_day_sin']            = np.sin(2 * np.pi * df['cycle_day'] / 28)
    df['cycle_day_cos']            = np.cos(2 * np.pi * df['cycle_day'] / 28)
    df['fertility_flag']           = (
        (df['lh_miu_ml'] > df['lh_miu_ml'].quantile(0.85)) |
        (df['cervical_mucus_score'] >= 4)
    ).astype(int)
    for col in ['estrogen_e2_pg_ml', 'progesterone_ng_ml', 'lh_miu_ml', 'bbt_celsius']:
        df[f'{col}_zscore'] = (df[col] - df[col].mean()) / (df[col].std() + 1e-6)
    return df


# Prepare data
df_eng = engineer_features(df)
df_eng['cervical_mucus_label'] = LabelEncoder().fit_transform(df_eng['cervical_mucus_label'])
y = le.transform(df['phase_label'])
X = df_eng[phase_model.feature_names_in_]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

y_pred_rf  = phase_model.predict(X_test)
y_pred_xgb = cycle_model.predict(X_test)
print("✅ Data prepared\n")


# ════════════════════════════════════════════════════════════════════════
# CHARTS
# ════════════════════════════════════════════════════════════════════════

def save(fig, name):
    path = CHARTS_DIR / f"{name}.png"
    fig.savefig(path, dpi=DPI, bbox_inches='tight')
    plt.close(fig)
    print(f"  📊 Saved: charts/{name}.png")


# 1. Confusion Matrix — Random Forest
print("Generating charts...")
fig, ax = plt.subplots(figsize=(8, 6))
cm = confusion_matrix(y_test, y_pred_rf, labels=le.transform(ORDER))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=ORDER, yticklabels=ORDER, ax=ax,
            linewidths=0.8, linecolor='white', annot_kws={'size': 16, 'weight': 'bold'})
ax.set_title('Random Forest — Confusion Matrix', fontsize=15, fontweight='bold', pad=14)
ax.set_ylabel('True Label', fontsize=13)
ax.set_xlabel('Predicted Label', fontsize=13)
plt.tight_layout()
save(fig, '01_confusion_matrix_random_forest')


# 2. Confusion Matrix — XGBoost
fig, ax = plt.subplots(figsize=(8, 6))
cm_xgb = confusion_matrix(y_test, y_pred_xgb, labels=le.transform(ORDER))
sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Purples',
            xticklabels=ORDER, yticklabels=ORDER, ax=ax,
            linewidths=0.8, linecolor='white', annot_kws={'size': 16, 'weight': 'bold'})
ax.set_title('XGBoost — Confusion Matrix', fontsize=15, fontweight='bold', pad=14)
ax.set_ylabel('True Label', fontsize=13)
ax.set_xlabel('Predicted Label', fontsize=13)
plt.tight_layout()
save(fig, '02_confusion_matrix_xgboost')


# 3. Feature Importance — Random Forest
fig, ax = plt.subplots(figsize=(11, 8))
importances = phase_model.feature_importances_
indices     = np.argsort(importances)[::-1][:15]
feat_names  = [phase_model.feature_names_in_[i] for i in indices]
colors      = plt.cm.viridis(np.linspace(0.15, 0.95, 15))
ax.barh(feat_names[::-1], importances[indices][::-1], color=colors, edgecolor='white')
ax.set_title('Top 15 Feature Importances — Random Forest', fontsize=14, fontweight='bold')
ax.set_xlabel('Importance Score', fontsize=12)
ax.tick_params(axis='y', labelsize=10)
ax.grid(axis='x', alpha=0.3)
plt.tight_layout()
save(fig, '03_feature_importance_random_forest')


# 4. Feature Importance — XGBoost
fig, ax = plt.subplots(figsize=(11, 8))
importances_xgb = cycle_model.feature_importances_
indices_xgb     = np.argsort(importances_xgb)[::-1][:15]
feat_names_xgb  = [cycle_model.feature_names_in_[i] for i in indices_xgb]
colors_xgb      = plt.cm.plasma(np.linspace(0.15, 0.95, 15))
ax.barh(feat_names_xgb[::-1], importances_xgb[indices_xgb][::-1], color=colors_xgb, edgecolor='white')
ax.set_title('Top 15 Feature Importances — XGBoost', fontsize=14, fontweight='bold')
ax.set_xlabel('Importance Score', fontsize=12)
ax.tick_params(axis='y', labelsize=10)
ax.grid(axis='x', alpha=0.3)
plt.tight_layout()
save(fig, '04_feature_importance_xgboost')


# 5. Phase Distribution
fig, ax = plt.subplots(figsize=(9, 6))
counts = df['phase_label'].value_counts().reindex(ORDER)
bars   = ax.bar(ORDER, counts.values,
                color=[PHASE_COLORS[p] for p in ORDER],
                edgecolor='white', linewidth=1.5, width=0.6)
for bar, v in zip(bars, counts.values):
    ax.text(bar.get_x() + bar.get_width()/2, v + 30, str(v),
            ha='center', fontweight='bold', fontsize=12)
ax.set_title('Phase Distribution in Dataset (N=10,000)', fontweight='bold', fontsize=14)
ax.set_ylabel('Count', fontsize=12)
ax.set_ylim(0, counts.max() * 1.14)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '05_phase_distribution')


# 6. Cycle Day Distribution by Phase
fig, ax = plt.subplots(figsize=(10, 6))
for phase in ORDER:
    ax.hist(df[df['phase_label'] == phase]['cycle_day'],
            bins=20, alpha=0.65, label=phase, color=PHASE_COLORS[phase])
ax.set_title('Cycle Day Distribution by Phase', fontweight='bold', fontsize=14)
ax.set_xlabel('Cycle Day', fontsize=12)
ax.set_ylabel('Frequency', fontsize=12)
ax.legend(fontsize=11, framealpha=0.8)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '06_cycle_day_distribution')


# 7. Estrogen by Phase (boxplot)
fig, ax = plt.subplots(figsize=(9, 6))
data_e2 = [df[df['phase_label'] == p]['estrogen_e2_pg_ml'].values for p in ORDER]
bp = ax.boxplot(data_e2, labels=ORDER, patch_artist=True, notch=False, widths=0.55)
for patch, phase in zip(bp['boxes'], ORDER):
    patch.set_facecolor(PHASE_COLORS[phase])
    patch.set_alpha(0.78)
ax.set_title('Estrogen (E2) Levels by Phase', fontweight='bold', fontsize=14)
ax.set_ylabel('Estrogen (pg/mL)', fontsize=12)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '07_estrogen_by_phase')


# 8. Progesterone by Phase
fig, ax = plt.subplots(figsize=(9, 6))
data_prog = [df[df['phase_label'] == p]['progesterone_ng_ml'].values for p in ORDER]
bp = ax.boxplot(data_prog, labels=ORDER, patch_artist=True, notch=False, widths=0.55)
for patch, phase in zip(bp['boxes'], ORDER):
    patch.set_facecolor(PHASE_COLORS[phase])
    patch.set_alpha(0.78)
ax.set_title('Progesterone Levels by Phase', fontweight='bold', fontsize=14)
ax.set_ylabel('Progesterone (ng/mL)', fontsize=12)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '08_progesterone_by_phase')


# 9. LH by Phase
fig, ax = plt.subplots(figsize=(9, 6))
data_lh = [df[df['phase_label'] == p]['lh_miu_ml'].values for p in ORDER]
bp = ax.boxplot(data_lh, labels=ORDER, patch_artist=True, notch=False, widths=0.55)
for patch, phase in zip(bp['boxes'], ORDER):
    patch.set_facecolor(PHASE_COLORS[phase])
    patch.set_alpha(0.78)
ax.set_title('LH Levels by Phase', fontweight='bold', fontsize=14)
ax.set_ylabel('LH (mIU/mL)', fontsize=12)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '09_lh_by_phase')


# 10. BBT by Phase
fig, ax = plt.subplots(figsize=(9, 6))
data_bbt = [df[df['phase_label'] == p]['bbt_celsius'].values for p in ORDER]
bp = ax.boxplot(data_bbt, labels=ORDER, patch_artist=True, notch=False, widths=0.55)
for patch, phase in zip(bp['boxes'], ORDER):
    patch.set_facecolor(PHASE_COLORS[phase])
    patch.set_alpha(0.78)
ax.set_title('Basal Body Temperature (BBT) by Phase', fontweight='bold', fontsize=14)
ax.set_ylabel('Temperature (°C)', fontsize=12)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
save(fig, '10_bbt_by_phase')


# 11. Symptom Correlation Heatmap
fig, ax = plt.subplots(figsize=(10, 8))
sym_cols   = ['cramping_0_10', 'breast_tenderness_0_10', 'mood_score_1_10',
              'energy_level_1_10', 'libido_1_10', 'bbt_celsius', 'cervical_mucus_score']
sym_labels = ['Cramping', 'Breast Tend.', 'Mood', 'Energy', 'Libido', 'BBT', 'Mucus Score']
corr = df[sym_cols].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', center=0,
            ax=ax, xticklabels=sym_labels, yticklabels=sym_labels,
            annot_kws={'size': 11}, linewidths=0.4, square=True)
ax.set_title('Symptom Correlation Heatmap', fontweight='bold', fontsize=14)
ax.tick_params(axis='x', rotation=45, labelsize=10)
ax.tick_params(axis='y', rotation=0, labelsize=10)
plt.tight_layout()
save(fig, '11_symptom_correlation_heatmap')


# 12. Hormone Heatmap (normalized)
fig, ax = plt.subplots(figsize=(12, 5))
horm_cols   = ['estrogen_e2_pg_ml', 'progesterone_ng_ml', 'lh_miu_ml',
               'fsh_miu_ml', 'testosterone_ng_dl', 'prolactin_ng_ml']
horm_labels = ['Estrogen\n(pg/mL)', 'Progesterone\n(ng/mL)', 'LH\n(mIU/mL)',
               'FSH\n(mIU/mL)', 'Testosterone\n(ng/dL)', 'Prolactin\n(ng/mL)']
hp      = df.groupby('phase_label')[horm_cols].mean().loc[ORDER]
hp_norm = (hp - hp.min()) / (hp.max() - hp.min())
sns.heatmap(hp_norm, annot=hp.round(1), fmt='.1f', cmap='RdYlGn',
            ax=ax, xticklabels=horm_labels, yticklabels=ORDER,
            linewidths=0.5, annot_kws={'size': 11})
ax.set_title('Hormone Levels by Phase  (colour = normalised; values = actual mean)',
             fontweight='bold', fontsize=13)
ax.tick_params(axis='x', labelsize=9)
ax.tick_params(axis='y', labelsize=11, rotation=0)
plt.tight_layout()
save(fig, '12_hormone_phase_heatmap')


# 13. Metrics Comparison — Precision
report_rf  = classification_report(y_test, y_pred_rf,  target_names=le.classes_, output_dict=True)
report_xgb = classification_report(y_test, y_pred_xgb, target_names=le.classes_, output_dict=True)

for metric_key, metric_label, num in [
    ('precision', 'Precision', 13),
    ('recall',    'Recall',    14),
    ('f1-score',  'F1-Score',  15),
]:
    fig, ax = plt.subplots(figsize=(10, 6))
    phases   = list(le.classes_)          # use exact order from encoder
    x        = np.arange(len(phases))
    w        = 0.35
    rf_vals  = [report_rf[p][metric_key]  for p in phases]
    xgb_vals = [report_xgb[p][metric_key] for p in phases]
    b1 = ax.bar(x - w/2, rf_vals,  w, label='Random Forest', color='#7BAE9A', alpha=0.88, edgecolor='white')
    b2 = ax.bar(x + w/2, xgb_vals, w, label='XGBoost',       color='#64B5F6', alpha=0.88, edgecolor='white')
    ax.set_title(f'{metric_label} by Phase — RF vs XGBoost', fontweight='bold', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(phases, fontsize=11)
    ax.set_ylim(0, 1.15)
    ax.set_ylabel(metric_label, fontsize=12)
    ax.legend(fontsize=11)
    ax.grid(axis='y', alpha=0.3)
    for bar in list(b1) + list(b2):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f'{bar.get_height():.2f}', ha='center', fontsize=10, fontweight='bold')
    plt.tight_layout()
    save(fig, f'{num:02d}_metrics_{metric_key.replace("-","_")}')

# 14. SHAP-style mean importance (using RF permutation proxy)
fig, ax = plt.subplots(figsize=(11, 8))
importances = phase_model.feature_importances_
indices     = np.argsort(importances)[::-1][:20]
feat_names  = [phase_model.feature_names_in_[i] for i in indices]
imp_vals    = importances[indices]
colors_shap = ['#E8647A' if v > np.median(imp_vals) else '#7BAE9A' for v in imp_vals]
ax.barh(feat_names[::-1], imp_vals[::-1],
        color=colors_shap[::-1], edgecolor='white', height=0.7)
ax.axvline(x=np.median(imp_vals), color='gray', linestyle='--', alpha=0.5, label='Median')
ax.set_title('Feature Importance (Mean Decrease in Impurity)\nRed = Above Median Importance',
             fontweight='bold', fontsize=13)
ax.set_xlabel('Importance Score', fontsize=12)
ax.tick_params(axis='y', labelsize=9)
ax.grid(axis='x', alpha=0.3)
ax.legend(fontsize=10)
plt.tight_layout()
save(fig, '16_feature_importance_shap_style')

print("\n✅ All charts generated!\n")


# ════════════════════════════════════════════════════════════════════════
# TABLES (CSV)
# ════════════════════════════════════════════════════════════════════════
print("Generating CSV tables...")

# Per-class metrics
rows = []
for model_name, report in [('Random Forest', report_rf), ('XGBoost', report_xgb)]:
    for phase in le.classes_:
        rows.append({
            'Model':     model_name,
            'Phase':     phase,
            'Precision': round(report[phase]['precision'], 4),
            'Recall':    round(report[phase]['recall'],    4),
            'F1-Score':  round(report[phase]['f1-score'],  4),
            'Support':   int(report[phase]['support']),
        })
    rows.append({
        'Model':     model_name, 'Phase': 'Weighted Avg',
        'Precision': round(report['weighted avg']['precision'], 4),
        'Recall':    round(report['weighted avg']['recall'],    4),
        'F1-Score':  round(report['weighted avg']['f1-score'],  4),
        'Support':   int(report['weighted avg']['support']),
    })
pd.DataFrame(rows).to_csv(TABLES_DIR / 'per_class_metrics.csv', index=False)
print("  📄 Saved: tables/per_class_metrics.csv")

# Model summary
summary = []
for model_name, y_pred, report in [
    ('Random Forest', y_pred_rf,  report_rf),
    ('XGBoost',       y_pred_xgb, report_xgb),
]:
    summary.append({
        'Model':        model_name,
        'Accuracy':     round(accuracy_score(y_test, y_pred), 4),
        'Macro P':      round(report['macro avg']['precision'],    4),
        'Macro R':      round(report['macro avg']['recall'],       4),
        'Macro F1':     round(report['macro avg']['f1-score'],     4),
        'Weighted F1':  round(report['weighted avg']['f1-score'],  4),
        'Test Samples': int(report['weighted avg']['support']),
    })
pd.DataFrame(summary).to_csv(TABLES_DIR / 'model_summary.csv', index=False)
print("  📄 Saved: tables/model_summary.csv")

# Dataset stats
stats = df.groupby('phase_label').agg(
    Count              = ('cycle_day',             'count'),
    Mean_Cycle_Day     = ('cycle_day',             'mean'),
    Std_Cycle_Day      = ('cycle_day',             'std'),
    Mean_Estrogen      = ('estrogen_e2_pg_ml',     'mean'),
    Std_Estrogen       = ('estrogen_e2_pg_ml',     'std'),
    Mean_Progesterone  = ('progesterone_ng_ml',    'mean'),
    Std_Progesterone   = ('progesterone_ng_ml',    'std'),
    Mean_LH            = ('lh_miu_ml',             'mean'),
    Std_LH             = ('lh_miu_ml',             'std'),
    Mean_FSH           = ('fsh_miu_ml',            'mean'),
    Mean_BBT           = ('bbt_celsius',           'mean'),
    Std_BBT            = ('bbt_celsius',           'std'),
    Mean_Mood          = ('mood_score_1_10',       'mean'),
    Mean_Energy        = ('energy_level_1_10',     'mean'),
    Mean_Cramping      = ('cramping_0_10',         'mean'),
    Mean_Libido        = ('libido_1_10',           'mean'),
).round(3)
stats.reindex(ORDER).to_csv(TABLES_DIR / 'dataset_statistics.csv')
print("  📄 Saved: tables/dataset_statistics.csv")

# Feature importance
feat_imp_rows = []
for rank, i in enumerate(np.argsort(phase_model.feature_importances_)[::-1], 1):
    feat_imp_rows.append({
        'Rank':              rank,
        'Feature':           phase_model.feature_names_in_[i],
        'RF_Importance':     round(float(phase_model.feature_importances_[i]),  6),
        'XGB_Importance':    round(float(cycle_model.feature_importances_[i]),  6),
    })
pd.DataFrame(feat_imp_rows).to_csv(TABLES_DIR / 'feature_importance.csv', index=False)
print("  📄 Saved: tables/feature_importance.csv")

print("\n✅ All CSV tables generated!\n")


# ════════════════════════════════════════════════════════════════════════
# LATEX TABLES
# ════════════════════════════════════════════════════════════════════════
print("Generating LaTeX tables...")

metrics_df  = pd.DataFrame(rows)
stats_clean = stats.reindex(ORDER).reset_index()
feat_df     = pd.DataFrame(feat_imp_rows)

latex = "% ================================================================\n"
latex += "% SmartFlow Research Paper — LaTeX Tables\n"
latex += "% Auto-generated from trained models and dataset\n"
latex += "% ================================================================\n\n"

# Table 1: Model Summary
latex += r"""\begin{table}[h!]
\centering
\caption{Overall Classification Performance of SmartFlow Models}
\label{tab:model_summary}
\begin{tabular}{lccccc}
\hline\hline
\textbf{Model} & \textbf{Accuracy} & \textbf{Macro P} & \textbf{Macro R} & \textbf{Macro F1} & \textbf{Weighted F1} \\
\hline
"""
for _, r in pd.DataFrame(summary).iterrows():
    latex += f"{r['Model']} & {r['Accuracy']:.4f} & {r['Macro P']:.4f} & {r['Macro R']:.4f} & {r['Macro F1']:.4f} & {r['Weighted F1']:.4f} \\\\\n"
latex += r"""\hline\hline
\end{tabular}
\end{table}

"""

# Table 2: Per-class metrics
latex += r"""\begin{table}[h!]
\centering
\caption{Per-Class Classification Metrics for SmartFlow Models}
\label{tab:per_class_metrics}
\begin{tabular}{llcccc}
\hline\hline
\textbf{Model} & \textbf{Phase} & \textbf{Precision} & \textbf{Recall} & \textbf{F1-Score} & \textbf{Support} \\
\hline
"""
for _, r in metrics_df[metrics_df['Phase'] != 'Weighted Avg'].iterrows():
    latex += f"{r['Model']} & {r['Phase']} & {r['Precision']:.4f} & {r['Recall']:.4f} & {r['F1-Score']:.4f} & {r['Support']} \\\\\n"
latex += r"""\hline\hline
\end{tabular}
\end{table}

"""

# Table 3: Dataset stats
latex += r"""\begin{table}[h!]
\centering
\caption{Dataset Statistics by Menstrual Phase (N=10,000)}
\label{tab:dataset_stats}
\begin{tabular}{lcccccc}
\hline\hline
\textbf{Phase} & \textbf{N} & \textbf{Cycle Day} & \textbf{E2 (pg/mL)} & \textbf{Prog (ng/mL)} & \textbf{LH (mIU/mL)} & \textbf{BBT ($^\circ$C)} \\
\hline
"""
for _, r in stats_clean.iterrows():
    latex += f"{r['phase_label']} & {int(r['Count'])} & {r['Mean_Cycle_Day']:.2f} $\\pm$ {r['Std_Cycle_Day']:.2f} & {r['Mean_Estrogen']:.2f} & {r['Mean_Progesterone']:.2f} & {r['Mean_LH']:.2f} & {r['Mean_BBT']:.2f} $\\pm$ {r['Std_BBT']:.2f} \\\\\n"
latex += r"""\hline\hline
\end{tabular}
\end{table}

"""

# Table 4: Feature importance
latex += r"""\begin{table}[h!]
\centering
\caption{Top 15 Feature Importances — Random Forest vs XGBoost}
\label{tab:feature_importance}
\begin{tabular}{clcc}
\hline\hline
\textbf{Rank} & \textbf{Feature} & \textbf{RF Importance} & \textbf{XGB Importance} \\
\hline
"""
for _, r in feat_df.head(15).iterrows():
    latex += f"{int(r['Rank'])} & {r['Feature'].replace('_', '\\_')} & {r['RF_Importance']:.4f} & {r['XGB_Importance']:.4f} \\\\\n"
latex += r"""\hline\hline
\end{tabular}
\end{table}
"""

with open(LATEX_DIR / 'all_tables.tex', 'w') as f:
    f.write(latex)
print("  📄 Saved: latex/all_tables.tex")

print("\n✅ All LaTeX tables generated!\n")


# ════════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════════
print("=" * 60)
print("  🎉 All research outputs generated!")
print("=" * 60)
print(f"\n📁 Output folder: {OUT_DIR}")
print("\n📊 Charts (16 individual PNG files @ 300 DPI):")
for f in sorted(CHARTS_DIR.glob("*.png")):
    print(f"   {f.name}")
print("\n📄 Tables (4 CSV files):")
for f in sorted(TABLES_DIR.glob("*.csv")):
    print(f"   {f.name}")
print("\n📝 LaTeX (1 .tex file):")
for f in sorted(LATEX_DIR.glob("*.tex")):
    print(f"   {f.name}")
print()
