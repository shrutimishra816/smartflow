"""
SmartFlow — Extended ML Training Examples
==========================================
This script generates ADDITIONAL training samples to supplement the base
synthetic dataset, specifically targeting:
  1. Athlete-specific cycle patterns (higher BBT variability, lower body fat effects)
  2. PCOS-pattern samples (elevated LH:FSH, irregular cycles)
  3. Perimenopause-adjacent patterns (shorter cycles, hormone fluctuations)
  4. Flow-intensity labelled samples (light / medium / heavy)
  5. Edge cases (very short and long cycles, spotting patterns)

Run from: D:\\Projects\\smartflow\\ml\\
  python generate_training_examples.py

Output: data/raw/menstrual_extended_examples.csv  (2,000 additional rows)
        data/raw/athlete_examples.csv             (500 athlete-specific rows)
        data/raw/pcos_examples.csv                (300 PCOS-pattern rows)
"""

import pandas as pd
import numpy as np
import os
from pathlib import Path

np.random.seed(42)
BASE_DIR   = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Helpers ────────────────────────────────────────────────────────────────────
def rng(lo, hi, size=1, decimals=2):
    return np.round(np.random.uniform(lo, hi, size), decimals)

def rngi(lo, hi, size=1):
    return np.random.randint(lo, hi+1, size)

MUCUS_LABELS = ['Dry','Sticky','Creamy','Watery','EggWhite']

def mucus_for_phase(phase):
    """Return realistic cervical mucus label and score based on phase."""
    if phase == 'Menstrual':
        return np.random.choice(['Dry','Sticky'], p=[0.7,0.3]), np.random.randint(1,3)
    elif phase == 'Follicular':
        return np.random.choice(['Sticky','Creamy','Watery'], p=[0.3,0.5,0.2]), np.random.randint(2,4)
    elif phase == 'Ovulation':
        return np.random.choice(['Watery','EggWhite'], p=[0.35,0.65]), np.random.randint(4,6)
    else:  # Luteal
        return np.random.choice(['Dry','Sticky','Creamy'], p=[0.5,0.35,0.15]), np.random.randint(1,3)

PHASE_HORMONE_PROFILES = {
    'Menstrual': {
        'estrogen':      (20, 80),
        'progesterone':  (0.1, 0.8),
        'lh':            (2, 8),
        'fsh':           (3, 10),
        'testosterone':  (10, 35),
        'prolactin':     (5, 18),
        'bbt':           (36.1, 36.5),
        'cramping':      (3, 9),
        'breast':        (1, 4),
        'mood':          (3, 7),
        'energy':        (2, 6),
        'libido':        (2, 5),
    },
    'Follicular': {
        'estrogen':      (50, 250),
        'progesterone':  (0.2, 1.2),
        'lh':            (3, 12),
        'fsh':           (4, 13),
        'testosterone':  (15, 45),
        'prolactin':     (4, 15),
        'bbt':           (36.1, 36.55),
        'cramping':      (0, 3),
        'breast':        (0, 2),
        'mood':          (6, 10),
        'energy':        (6, 10),
        'libido':        (5, 9),
    },
    'Ovulation': {
        'estrogen':      (150, 500),
        'progesterone':  (0.5, 2.5),
        'lh':            (25, 100),
        'fsh':           (8, 22),
        'testosterone':  (20, 60),
        'prolactin':     (5, 20),
        'bbt':           (36.55, 36.9),
        'cramping':      (0, 4),
        'breast':        (1, 4),
        'mood':          (7, 10),
        'energy':        (7, 10),
        'libido':        (7, 10),
    },
    'Luteal': {
        'estrogen':      (60, 200),
        'progesterone':  (5, 22),
        'lh':            (1, 7),
        'fsh':           (2, 8),
        'testosterone':  (10, 35),
        'prolactin':     (6, 22),
        'bbt':           (36.55, 37.1),
        'cramping':      (1, 6),
        'breast':        (2, 7),
        'mood':          (3, 8),
        'energy':        (3, 7),
        'libido':        (2, 6),
    },
}


def generate_base_row(phase, cycle_day, sample_id, profile_override=None):
    """Generate a single training row for a given phase."""
    profile = profile_override or PHASE_HORMONE_PROFILES[phase]
    mucus_label, mucus_score = mucus_for_phase(phase)

    return {
        'sample_id':           sample_id,
        'phase_label':         phase,
        'cycle_day':           cycle_day,
        'estrogen_e2_pg_ml':   float(rng(*profile['estrogen'])[0]),
        'progesterone_ng_ml':  float(rng(*profile['progesterone'])[0]),
        'lh_miu_ml':           float(rng(*profile['lh'])[0]),
        'fsh_miu_ml':          float(rng(*profile['fsh'])[0]),
        'testosterone_ng_dl':  float(rng(*profile['testosterone'])[0]),
        'prolactin_ng_ml':     float(rng(*profile['prolactin'])[0]),
        'bbt_celsius':         float(rng(*profile['bbt'])[0]),
        'cervical_mucus_score':mucus_score,
        'cervical_mucus_label':mucus_label,
        'cramping_0_10':       int(rngi(*profile['cramping'])[0]),
        'breast_tenderness_0_10': int(rngi(*profile['breast'])[0]),
        'mood_score_1_10':     int(rngi(*profile['mood'])[0]),
        'energy_level_1_10':   int(rngi(*profile['energy'])[0]),
        'libido_1_10':         int(rngi(*profile['libido'])[0]),
    }


# ════════════════════════════════════════════════════════════════════════════
# DATASET 1: Extended general examples (2,000 rows)
# ════════════════════════════════════════════════════════════════════════════
print("Generating extended general training examples...")

PHASE_SCHEDULE = [
    ('Menstrual',  range(1, 6)),
    ('Follicular', range(6, 14)),
    ('Ovulation',  range(14, 17)),
    ('Luteal',     range(17, 29)),
]

rows_general = []
sample_id = 10001

for _ in range(2000):
    # Pick a random phase weighted by duration
    phase, day_range = PHASE_SCHEDULE[np.random.choice(
        len(PHASE_SCHEDULE), p=[0.18, 0.30, 0.12, 0.40])]
    cycle_day = int(np.random.choice(list(day_range)))
    row = generate_base_row(phase, cycle_day, sample_id)
    rows_general.append(row)
    sample_id += 1

df_general = pd.DataFrame(rows_general)
out_general = OUTPUT_DIR / "menstrual_extended_examples.csv"
df_general.to_csv(out_general, index=False)
print(f"  ✅ {len(df_general)} rows → {out_general}")
print(f"  Phase distribution:\n{df_general['phase_label'].value_counts().to_string()}\n")


# ════════════════════════════════════════════════════════════════════════════
# DATASET 2: Female Athlete Patterns (500 rows)
# Athletes: higher BBT, lower oestrogen (low body fat), compressed cycles
# ════════════════════════════════════════════════════════════════════════════
print("Generating female athlete training examples...")

ATHLETE_PROFILES = {
    'Menstrual': {
        **PHASE_HORMONE_PROFILES['Menstrual'],
        'estrogen':     (15, 60),   # Lower — low body fat reduces oestrogen
        'bbt':          (36.0, 36.45),  # Slightly lower baseline
        'energy':       (1, 5),     # Very low — heavy training + period
        'cramping':     (2, 8),
        'mood':         (3, 7),
    },
    'Follicular': {
        **PHASE_HORMONE_PROFILES['Follicular'],
        'bbt':          (36.0, 36.5),
        'energy':       (8, 10),    # Very high — athletes peak here
        'mood':         (7, 10),
        'testosterone': (20, 60),   # Higher — training raises testosterone
    },
    'Ovulation': {
        **PHASE_HORMONE_PROFILES['Ovulation'],
        'bbt':          (36.5, 36.95),
        'lh':           (30, 120),  # LH surge is pronounced
        'energy':       (8, 10),
        'libido':       (8, 10),
        'testosterone': (25, 70),
    },
    'Luteal': {
        **PHASE_HORMONE_PROFILES['Luteal'],
        'bbt':          (36.6, 37.15),  # Higher — progesterone + training heat
        'energy':       (3, 7),
        'cramping':     (1, 5),
        'progesterone': (8, 25),    # Higher peak in athletes
    },
}

rows_athlete = []
sample_id = 20001

for _ in range(500):
    phase, day_range = PHASE_SCHEDULE[np.random.choice(
        len(PHASE_SCHEDULE), p=[0.17, 0.30, 0.13, 0.40])]
    cycle_day = int(np.random.choice(list(day_range)))

    # Some athletes have shorter cycles (25–26 days)
    if np.random.random() < 0.3:
        cycle_day = max(1, min(cycle_day, 26))

    # RED-S cases: very low oestrogen and energy (5% of athlete samples)
    if np.random.random() < 0.05:
        profile = {**ATHLETE_PROFILES[phase], 'estrogen': (10, 40), 'energy': (1, 3)}
    else:
        profile = ATHLETE_PROFILES[phase]

    row = generate_base_row(phase, cycle_day, sample_id, profile_override=profile)
    row['athlete_profile'] = True
    rows_athlete.append(row)
    sample_id += 1

df_athlete = pd.DataFrame(rows_athlete)
out_athlete = OUTPUT_DIR / "athlete_examples.csv"
df_athlete.to_csv(out_athlete, index=False)
print(f"  ✅ {len(df_athlete)} rows → {out_athlete}")
print(f"  Phase distribution:\n{df_athlete['phase_label'].value_counts().to_string()}\n")


# ════════════════════════════════════════════════════════════════════════════
# DATASET 3: PCOS Patterns (300 rows)
# Characteristics: elevated LH:FSH (>2), long cycles, irregular ovulation,
# elevated testosterone, low progesterone in luteal, anovulatory cycles
# ════════════════════════════════════════════════════════════════════════════
print("Generating PCOS-pattern training examples...")

PCOS_PROFILES = {
    'Menstrual': {
        **PHASE_HORMONE_PROFILES['Menstrual'],
        'lh':           (8, 25),    # Elevated baseline LH
        'fsh':          (3, 7),     # Normal-low FSH → elevated LH:FSH ratio
        'testosterone': (40, 100),  # Hyperandrogenism
        'estrogen':     (30, 120),  # Variable
    },
    'Follicular': {
        **PHASE_HORMONE_PROFILES['Follicular'],
        'lh':           (10, 30),
        'fsh':          (3, 8),
        'testosterone': (45, 110),
        'mood':         (3, 7),     # Lower — androgenic effects
        'energy':       (3, 7),
    },
    'Ovulation': {
        # In PCOS, ovulation is often delayed or absent
        **PHASE_HORMONE_PROFILES['Ovulation'],
        'lh':           (15, 60),   # LH surge may be blunted or absent
        'progesterone': (0.5, 3.0), # Low if anovulatory
        'estrogen':     (80, 300),
        'cycle_day':    range(14, 28),  # Delayed ovulation
    },
    'Luteal': {
        **PHASE_HORMONE_PROFILES['Luteal'],
        'progesterone': (1.5, 10),  # Lower — inadequate luteal phase
        'lh':           (5, 20),    # Still elevated
        'testosterone': (35, 90),
        'breast':       (3, 8),
        'mood':         (2, 6),     # PMS amplified
    },
}

rows_pcos = []
sample_id = 30001

for _ in range(300):
    # PCOS cycles tend to be long (35–90 days) — weight towards Follicular/Luteal
    phase, day_range = PHASE_SCHEDULE[np.random.choice(
        len(PHASE_SCHEDULE), p=[0.12, 0.45, 0.08, 0.35])]
    cycle_day = int(np.random.choice(list(day_range)))

    # Extend cycle days for PCOS (longer cycles)
    if phase == 'Follicular':
        cycle_day = np.random.randint(6, 30)  # Extended follicular phase
    elif phase == 'Luteal':
        cycle_day = np.random.randint(25, 50)

    profile = PCOS_PROFILES[phase]
    row = generate_base_row(phase, cycle_day, sample_id, profile_override=profile)
    row['pcos_pattern'] = True
    rows_pcos.append(row)
    sample_id += 1

df_pcos = pd.DataFrame(rows_pcos)
out_pcos = OUTPUT_DIR / "pcos_examples.csv"
df_pcos.to_csv(out_pcos, index=False)
print(f"  ✅ {len(df_pcos)} rows → {out_pcos}")
print(f"  Phase distribution:\n{df_pcos['phase_label'].value_counts().to_string()}\n")


# ════════════════════════════════════════════════════════════════════════════
# DATASET 4: Flow-Intensity Labelled Examples (400 rows)
# Maps flow intensity to hormonal and symptomatic patterns
# ════════════════════════════════════════════════════════════════════════════
print("Generating flow-labelled training examples...")

FLOW_PROFILES = {
    'light': {
        'estrogen':     (20, 60),
        'progesterone': (0.1, 0.5),
        'cramping':     (0, 4),
        'energy':       (4, 7),
        'mood':         (5, 8),
    },
    'medium': {
        'estrogen':     (30, 90),
        'progesterone': (0.2, 0.8),
        'cramping':     (3, 7),
        'energy':       (3, 6),
        'mood':         (3, 7),
    },
    'heavy': {
        'estrogen':     (15, 50),
        'progesterone': (0.1, 0.4),
        'cramping':     (5, 10),
        'energy':       (1, 4),
        'mood':         (2, 6),
    },
}

rows_flow = []
sample_id = 40001

for flow_level, n in [('light', 120), ('medium', 180), ('heavy', 100)]:
    fp = FLOW_PROFILES[flow_level]
    base = {**PHASE_HORMONE_PROFILES['Menstrual'], **fp}
    for _ in range(n):
        cycle_day = int(np.random.randint(1, 6))
        row = generate_base_row('Menstrual', cycle_day, sample_id, profile_override=base)
        row['flow_intensity'] = flow_level
        rows_flow.append(row)
        sample_id += 1

df_flow = pd.DataFrame(rows_flow)
out_flow = OUTPUT_DIR / "flow_labelled_examples.csv"
df_flow.to_csv(out_flow, index=False)
print(f"  ✅ {len(df_flow)} rows → {out_flow}")
print(f"  Flow distribution:\n{df_flow['flow_intensity'].value_counts().to_string()}\n")


# ════════════════════════════════════════════════════════════════════════════
# MERGE ALL DATASETS FOR TRAINING
# ════════════════════════════════════════════════════════════════════════════
print("Merging all datasets into combined training set...")

CORE_COLS = [
    'sample_id', 'phase_label', 'cycle_day',
    'estrogen_e2_pg_ml', 'progesterone_ng_ml', 'lh_miu_ml',
    'fsh_miu_ml', 'testosterone_ng_dl', 'prolactin_ng_ml',
    'bbt_celsius', 'cervical_mucus_score', 'cervical_mucus_label',
    'cramping_0_10', 'breast_tenderness_0_10', 'mood_score_1_10',
    'energy_level_1_10', 'libido_1_10',
]

base_path = OUTPUT_DIR / "menstrual_phase_dataset_10k.csv"
if base_path.exists():
    df_base = pd.read_csv(base_path)[CORE_COLS]
    print(f"  Base dataset: {len(df_base)} rows")
else:
    print("  ⚠️  Base dataset not found — using extended datasets only")
    df_base = pd.DataFrame(columns=CORE_COLS)

dfs_to_merge = [
    df_base,
    df_general[CORE_COLS],
    df_athlete[[c for c in CORE_COLS if c in df_athlete.columns]],
    df_pcos[[c for c in CORE_COLS if c in df_pcos.columns]],
    df_flow[[c for c in CORE_COLS if c in df_flow.columns]],
]

df_combined = pd.concat(dfs_to_merge, ignore_index=True)
df_combined['sample_id'] = range(1, len(df_combined)+1)

out_combined = OUTPUT_DIR / "menstrual_combined_training.csv"
df_combined.to_csv(out_combined, index=False)

print(f"\n{'='*55}")
print(f"  COMBINED DATASET: {len(df_combined):,} total training samples")
print(f"  Phase distribution:")
print(df_combined['phase_label'].value_counts().to_string())
print(f"  Output: {out_combined}")
print(f"{'='*55}")


# ════════════════════════════════════════════════════════════════════════════
# VALIDATION — Check for data quality issues
# ════════════════════════════════════════════════════════════════════════════
print("\nRunning data quality checks...")

issues = []
# 1. Check for negative hormone values
for col in ['estrogen_e2_pg_ml','progesterone_ng_ml','lh_miu_ml','bbt_celsius']:
    neg = (df_combined[col] < 0).sum()
    if neg > 0:
        issues.append(f"  ⚠️  {col}: {neg} negative values")

# 2. Check for out-of-range cycle days
bad_days = ((df_combined['cycle_day'] < 1) | (df_combined['cycle_day'] > 60)).sum()
if bad_days > 0:
    issues.append(f"  ⚠️  cycle_day: {bad_days} values out of range [1,60]")

# 3. Check for missing phase labels
missing_phase = df_combined['phase_label'].isna().sum()
if missing_phase > 0:
    issues.append(f"  ⚠️  phase_label: {missing_phase} missing values")

# 4. Check mucus label validity
valid_mucus = set(MUCUS_LABELS)
invalid_mucus = (~df_combined['cervical_mucus_label'].isin(valid_mucus)).sum()
if invalid_mucus > 0:
    issues.append(f"  ⚠️  cervical_mucus_label: {invalid_mucus} invalid values")

if issues:
    print("  Issues found:")
    for iss in issues: print(iss)
else:
    print("  ✅ All quality checks passed!")

# 5. Summary statistics by phase
print("\n  Summary statistics — BBT by phase:")
print(df_combined.groupby('phase_label')['bbt_celsius'].agg(['mean','std']).round(3).to_string())

print("\n  Summary statistics — LH:FSH ratio by phase:")
df_combined['lh_fsh_ratio'] = df_combined['lh_miu_ml'] / (df_combined['fsh_miu_ml'] + 1e-6)
print(df_combined.groupby('phase_label')['lh_fsh_ratio'].agg(['mean','std']).round(3).to_string())

print("\n✅ All training example datasets generated successfully!")
print(f"\nFiles created in {OUTPUT_DIR}:")
for f in sorted(OUTPUT_DIR.glob("*.csv")):
    size_kb = f.stat().st_size // 1024
    rows    = sum(1 for _ in open(f)) - 1
    print(f"  {f.name:<45} {rows:>6} rows  {size_kb:>5} KB")
