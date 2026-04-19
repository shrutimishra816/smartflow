import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, ArrowRight, RotateCcw, Leaf, BookOpen, Stethoscope } from 'lucide-react'

// ── Symptom Tree ──────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'q1',
    question: 'What is your primary concern right now?',
    options: [
      { label: '🔴 Pain or cramps',          next: 'q_pain' },
      { label: '😴 Fatigue or low energy',   next: 'q_fatigue' },
      { label: '😤 Mood changes',            next: 'q_mood' },
      { label: '🩸 Irregular or heavy bleeding', next: 'q_bleeding' },
      { label: '🫧 Bloating or digestion',   next: 'q_bloat' },
      { label: '😣 Skin or hair changes',    next: 'q_skin' },
    ]
  },
  // ── Pain branch
  {
    id: 'q_pain',
    question: 'Where is the pain located?',
    options: [
      { label: 'Lower abdomen / uterine cramps', next: 'q_pain_severity' },
      { label: 'Lower back pain',               next: 'q_pain_back' },
      { label: 'Breast tenderness',             next: 'result_breast' },
      { label: 'Headache or migraine',          next: 'result_headache' },
    ]
  },
  {
    id: 'q_pain_severity',
    question: 'How severe are the cramps?',
    options: [
      { label: 'Mild — manageable, barely noticeable', next: 'result_cramps_mild' },
      { label: 'Moderate — noticeable but I can carry on', next: 'result_cramps_moderate' },
      { label: 'Severe — interfering with daily life', next: 'result_cramps_severe' },
      { label: 'Excruciating — I cannot function',     next: 'result_cramps_urgent' },
    ]
  },
  {
    id: 'q_pain_back',
    question: 'Is the back pain related to your period?',
    options: [
      { label: 'Yes, it comes before/during my period', next: 'result_back_period' },
      { label: 'No, it is persistent or unrelated',     next: 'result_back_nonperiod' },
    ]
  },
  // ── Fatigue branch
  {
    id: 'q_fatigue',
    question: 'When does the fatigue occur?',
    options: [
      { label: 'During my period (day 1–5)',     next: 'result_fatigue_menstrual' },
      { label: 'Week before my period',          next: 'result_fatigue_luteal' },
      { label: 'Throughout the whole month',     next: 'result_fatigue_constant' },
      { label: 'I cannot sleep during my cycle', next: 'result_sleep' },
    ]
  },
  // ── Mood branch
  {
    id: 'q_mood',
    question: 'Describe your mood symptoms:',
    options: [
      { label: 'Irritability and mood swings',  next: 'result_pms_mood' },
      { label: 'Anxiety or worry',              next: 'result_anxiety' },
      { label: 'Low mood or sadness',           next: 'result_depression' },
      { label: 'Severe mood disruption (PMDD)', next: 'result_pmdd' },
    ]
  },
  // ── Bleeding branch
  {
    id: 'q_bleeding',
    question: 'Describe your bleeding pattern:',
    options: [
      { label: 'Very heavy flow (soaking 1+ pad/hour)', next: 'result_heavy_urgent' },
      { label: 'Periods are irregular or unpredictable', next: 'result_irregular' },
      { label: 'Periods are very infrequent (>35 days)', next: 'result_pcos_suspect' },
      { label: 'Spotting between periods',              next: 'result_spotting' },
      { label: 'Periods have stopped completely',       next: 'result_amenorrhea' },
    ]
  },
  // ── Bloat branch
  {
    id: 'q_bloat',
    question: 'When does bloating occur?',
    options: [
      { label: 'Week before my period',        next: 'result_bloat_luteal' },
      { label: 'During my period',             next: 'result_bloat_menstrual' },
      { label: 'Throughout the month',         next: 'result_bloat_chronic' },
    ]
  },
  // ── Skin branch
  {
    id: 'q_skin',
    question: 'What type of skin or hair concern?',
    options: [
      { label: 'Acne, especially on jawline',     next: 'result_hormonal_acne' },
      { label: 'Excess facial or body hair',      next: 'result_hirsutism' },
      { label: 'Hair thinning or hair loss',      next: 'result_hair_loss' },
      { label: 'Skin darkening (neck/armpits)',   next: 'result_acanthosis' },
    ]
  },
]

// ── Results ───────────────────────────────────────────────────────────────────
const RESULTS = {
  result_cramps_mild: {
    title: 'Mild Menstrual Cramps',
    severity: 'low',
    emoji: '🌿',
    summary: 'Mild cramps are very common and usually managed well with home remedies.',
    suggestions: ['Apply a warm heat pad to your lower abdomen for 20 minutes.','Drink ginger tea 2–3 times daily during your period.','Try gentle yoga — poses like Child\'s Pose and Cat-Cow reduce prostaglandin tension.','Magnesium-rich foods (pumpkin seeds, dark chocolate) can reduce cramp intensity.'],
    remedyLinks: ['cramps'],
    docNeeded: false,
    articleLinks: ['Dos and Don\'ts'],
  },
  result_cramps_moderate: {
    title: 'Moderate Menstrual Cramps (Dysmenorrhoea)',
    severity: 'medium',
    emoji: '🔴',
    summary: 'Moderate cramps that disrupt daily life may benefit from both lifestyle changes and medical evaluation.',
    suggestions: ['Heat therapy + ginger tea combination is effective for moderate cramps.','Over-the-counter NSAIDs (ibuprofen) taken at the onset of pain are clinically first-line.','Track pain severity in SmartFlow across cycles — a consistent pattern is clinically significant.','Consider omega-3 supplementation (fish oil 1–2g daily) — shown to reduce dysmenorrhoea severity.'],
    remedyLinks: ['cramps'],
    docNeeded: false,
    articleLinks: ['Cycle Basics'],
  },
  result_cramps_severe: {
    title: 'Severe Dysmenorrhoea — Medical Evaluation Recommended',
    severity: 'high',
    emoji: '⚠️',
    summary: 'Severe cramps interfering with daily life may indicate an underlying condition such as endometriosis or fibroids. Medical evaluation is strongly recommended.',
    suggestions: ['Document pain level (1–10), duration, and associated symptoms in SmartFlow for your doctor.','Note whether pain starts before, during, or after your period — this helps differentiate conditions.','Pelvic ultrasound is typically the first investigation ordered.','Laparoscopy is the gold standard for diagnosing endometriosis.'],
    remedyLinks: ['cramps'],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: ['Health Conditions'],
  },
  result_cramps_urgent: {
    title: '🚨 Seek Medical Attention',
    severity: 'urgent',
    emoji: '🚨',
    summary: 'Excruciating period pain that prevents normal functioning requires prompt medical evaluation. This is not something you should manage alone.',
    suggestions: ['Visit a gynaecologist or emergency department if pain is unbearable.','Severe, sudden-onset pelvic pain may also indicate an ovarian cyst, ectopic pregnancy, or appendicitis.','Do not delay — bring your SmartFlow cycle history to your appointment.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: [],
  },
  result_breast: {
    title: 'Cyclic Breast Tenderness (Mastalgia)',
    severity: 'low',
    emoji: '💗',
    summary: 'Breast tenderness before or during your period is usually caused by progesterone and prolactin fluctuations — very common and manageable.',
    suggestions: ['Reduce caffeine 1 week before your expected period.','Evening primrose oil (500mg daily) has moderate evidence for reducing mastalgia.','Wear a well-fitting, supportive bra — even at night if needed.','Cold compress for 10 minutes can provide temporary relief.'],
    remedyLinks: ['breast'],
    docNeeded: false,
    articleLinks: ['Cycle Basics'],
  },
  result_headache: {
    title: 'Menstrual Migraine or Hormone Headache',
    severity: 'medium',
    emoji: '🤕',
    summary: 'Hormonal headaches occur due to the sharp drop in oestrogen just before or during menstruation. They affect up to 60% of women who get migraines.',
    suggestions: ['Stay well-hydrated — dehydration dramatically worsens hormonal headaches.','Apply peppermint oil (diluted in coconut oil) to temples.','Maintain consistent sleep and wake times during your luteal phase.','Track headache occurrence alongside cycle phase in SmartFlow — if consistently menstrual, discuss hormonal migraine management with a neurologist or gynaecologist.'],
    remedyLinks: ['headache'],
    docNeeded: false,
    articleLinks: ['Cycle Basics'],
  },
  result_back_period: {
    title: 'Period-Related Lower Back Pain',
    severity: 'low',
    emoji: '🔴',
    summary: 'Lower back pain during menstruation is caused by prostaglandins radiating pain from the uterus to the back — common and manageable.',
    suggestions: ['Heat pad applied to the lower back (not just the abdomen) is highly effective.','Gentle stretching: Child\'s Pose, Pigeon Pose, and Knee-to-Chest stretches.','Ginger tea reduces prostaglandin-driven referred back pain.','Anti-inflammatory diet (turmeric, omega-3s) in the week before your period.'],
    remedyLinks: ['cramps'],
    docNeeded: false,
    articleLinks: ['Exercise'],
  },
  result_back_nonperiod: {
    title: 'Persistent Back Pain — Broader Evaluation Recommended',
    severity: 'medium',
    emoji: '⚠️',
    summary: 'Persistent back pain unrelated to your cycle may have musculoskeletal or other causes and warrants medical evaluation.',
    suggestions: ['Keep a log of when back pain occurs relative to your cycle in SmartFlow.','See a physiotherapist for musculoskeletal assessment.','If accompanied by pelvic pain, see a gynaecologist to rule out endometriosis.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: [],
  },
  result_fatigue_menstrual: {
    title: 'Menstrual Fatigue (Iron Depletion)',
    severity: 'low',
    emoji: '😴',
    summary: 'Fatigue during menstruation is primarily driven by blood and iron loss, combined with low oestrogen and progesterone.',
    suggestions: ['Eat iron-rich foods: spinach, lentils, jaggery, beetroot, tofu.','Pair iron foods with vitamin C (lemon juice, amla) to increase absorption.','Avoid tea and coffee within 1 hour of iron-rich meals — they block absorption.','Rest is productive — reduce high-intensity exercise during heavy flow days.'],
    remedyLinks: ['fatigue'],
    docNeeded: false,
    articleLinks: ['Nutrition', 'Exercise'],
  },
  result_fatigue_luteal: {
    title: 'Luteal Phase Fatigue (PMS Fatigue)',
    severity: 'low',
    emoji: '😴',
    summary: 'Fatigue in the week before your period is a hallmark PMS symptom driven by progesterone\'s sedating effect and blood sugar instability.',
    suggestions: ['Eat small, frequent, protein-rich meals to stabilise blood sugar.','Magnesium supplementation (200–400mg daily) reduces PMS fatigue.','Prioritise sleep — progesterone can disrupt sleep architecture.','Light-moderate exercise (walking, yoga) boosts energy more than rest alone.'],
    remedyLinks: ['fatigue', 'sleep'],
    docNeeded: false,
    articleLinks: ['Nutrition', 'Exercise'],
  },
  result_fatigue_constant: {
    title: 'Persistent Fatigue — Thyroid or Iron Evaluation Recommended',
    severity: 'high',
    emoji: '⚠️',
    summary: 'Fatigue throughout the entire month — not just around your period — may indicate thyroid dysfunction, anaemia, or other systemic issues requiring investigation.',
    suggestions: ['Ask your doctor for: TSH (thyroid), full blood count (iron, haemoglobin, ferritin), vitamin D, and vitamin B12.','Hypothyroidism is extremely common in Indian women and frequently missed.','Track energy levels in SmartFlow daily — a graph showing persistent low energy is useful clinical evidence.'],
    remedyLinks: ['fatigue'],
    docNeeded: true,
    docSpecialisation: 'Endocrinologist',
    articleLinks: ['Health Conditions'],
  },
  result_sleep: {
    title: 'Cycle-Related Sleep Disruption',
    severity: 'low',
    emoji: '🌙',
    summary: 'Progesterone disrupts sleep architecture in the luteal phase. Poor sleep worsens almost every other cycle symptom.',
    suggestions: ['Digital sunset: no screens 60 minutes before bed.','Ashwagandha + warm milk before bed reduces sleep onset time.','Keep your bedroom cool (18–20°C) and dark.','Avoid heavy meals within 3 hours of bed during the luteal phase.'],
    remedyLinks: ['sleep'],
    docNeeded: false,
    articleLinks: ["Dos and Don'ts"],
  },
  result_pms_mood: {
    title: 'PMS Mood Symptoms',
    severity: 'low',
    emoji: '😤',
    summary: 'Irritability and mood swings in the week before your period are classic PMS symptoms driven by declining oestrogen and serotonin.',
    suggestions: ['Calcium (1000–1200mg daily from diet or supplements) is clinically shown to reduce mood PMS symptoms.','Regular aerobic exercise in the follicular phase improves serotonin baseline.','Chamomile tea and pranayama breathing for immediate calm.','Track mood in SmartFlow — recognising the pattern reduces its emotional impact.'],
    remedyLinks: ['mood'],
    docNeeded: false,
    articleLinks: ['Mental Health'],
  },
  result_anxiety: {
    title: 'Hormonal Anxiety',
    severity: 'medium',
    emoji: '😰',
    summary: 'Progesterone withdrawal in the late luteal phase reduces GABA activity — the brain\'s calming neurotransmitter — causing anxiety spikes before your period.',
    suggestions: ['Magnesium glycinate (250–300mg at night) directly supports GABA receptors.','Limit caffeine entirely in the 5 days before your period.','Pranayama breathing activates the parasympathetic nervous system within minutes.','If anxiety is severe or persistent, discuss hormonal options with a gynaecologist.'],
    remedyLinks: ['mood'],
    docNeeded: false,
    articleLinks: ['Mental Health'],
  },
  result_depression: {
    title: 'Luteal Phase Low Mood',
    severity: 'medium',
    emoji: '😔',
    summary: 'Low mood before periods is common and tied to oestrogen-serotonin relationships. If it resolves within a few days of menstruation, this is PMS. If it persists, please seek support.',
    suggestions: ['Saffron (kesar) in warm milk — 2 strands daily — has moderate evidence for mood improvement via serotonin modulation.','Morning sunlight exposure (15 minutes) raises serotonin and resets circadian rhythm.','Consistent sleep and regular meals stabilise mood more than most supplements.','If low mood is severe or does not resolve with menstruation, speak to a mental health professional.'],
    remedyLinks: ['mood'],
    docNeeded: false,
    articleLinks: ['Mental Health'],
  },
  result_pmdd: {
    title: 'Possible PMDD — Specialist Consultation Recommended',
    severity: 'high',
    emoji: '🧠',
    summary: 'If mood symptoms severely impair your ability to work, study, or maintain relationships, and resolve shortly after menstruation starts, this pattern is consistent with PMDD — a treatable condition.',
    suggestions: ['Track your symptoms daily in SmartFlow for 2 cycles — this documentation is required for clinical diagnosis.','PMDD is treated with SSRIs, hormonal therapy, or CBT — all with strong evidence.','iCall India (free counselling): 9152987821.','Please do not manage severe PMDD alone — help is available and effective.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: ['Mental Health'],
  },
  result_heavy_urgent: {
    title: 'Heavy Menstrual Bleeding (Menorrhagia)',
    severity: 'high',
    emoji: '⚠️',
    summary: 'Soaking through one or more pads per hour for several hours, or passing large clots, constitutes heavy menstrual bleeding and warrants medical evaluation.',
    suggestions: ['Seek evaluation: causes include fibroids, polyps, adenomyosis, bleeding disorders, and hormonal imbalance.','In the interim: iron-rich foods and hydration to counter blood loss.','Keep a log of pad usage per day in SmartFlow\'s notes — this is the standard clinical measure for menorrhagia.','Do not self-treat with herbal remedies for heavy bleeding — see a doctor.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: [],
  },
  result_irregular: {
    title: 'Irregular Menstrual Cycles',
    severity: 'medium',
    emoji: '📅',
    summary: 'Cycle variation of ±7 days is normal. Greater irregularity may indicate hormonal imbalance, stress, nutritional deficiency, or PCOS.',
    suggestions: ['Track your cycle consistently in SmartFlow — 3 months of data gives meaningful patterns.','Reduce high-intensity exercise and under-eating, which are common causes of cycle irregularity.','Stress management through yoga and sleep improvement can regulate cycles significantly.','If irregularity persists beyond 3 cycles, see a gynaecologist or endocrinologist.'],
    remedyLinks: [],
    docNeeded: false,
    articleLinks: ['Cycle Basics'],
  },
  result_pcos_suspect: {
    title: 'Possible PCOS — Medical Evaluation Recommended',
    severity: 'high',
    emoji: '🔬',
    summary: 'Infrequent periods (oligomenorrhoea) with cycles longer than 35 days is one of the three diagnostic criteria for PCOS. Early diagnosis and management significantly reduces long-term health risks.',
    suggestions: ['Ask your doctor for: LH:FSH ratio, free testosterone, fasting insulin, glucose, pelvic ultrasound.','SmartFlow\'s anomaly detector looks for elevated LH:FSH ratios — check your prediction history.','Lifestyle modification (low-GI diet, regular exercise) is first-line treatment and highly effective.','Read the PCOS article in the Education Hub for detailed guidance.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: ['Health Conditions'],
  },
  result_spotting: {
    title: 'Intermenstrual Spotting',
    severity: 'medium',
    emoji: '🩸',
    summary: 'Light spotting around ovulation is normal for some people. Spotting at other times or consistently may need investigation.',
    suggestions: ['Note timing: ovulation spotting occurs mid-cycle (day 12–16) and is usually pink or light brown.','Spotting after sex, consistently mid-cycle, or post-menopause warrants a gynaecologist visit.','Track spotting days in SmartFlow — duration, colour, and associated symptoms help your doctor significantly.'],
    remedyLinks: [],
    docNeeded: false,
    articleLinks: ['Cycle Basics'],
  },
  result_amenorrhea: {
    title: 'Absent Periods (Amenorrhoea) — Medical Evaluation Required',
    severity: 'urgent',
    emoji: '🚨',
    summary: 'Absent periods for 3+ months (in someone who previously had regular cycles) requires prompt medical evaluation. Causes range from pregnancy and stress to thyroid disorders and hypothalamic dysfunction.',
    suggestions: ['Rule out pregnancy first (home pregnancy test).','Common causes: dramatic weight change, excessive exercise, stress, thyroid disorders, PCOS, early menopause.','See a gynaecologist promptly — prolonged oestrogen deficiency affects bone density.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Gynaecologist',
    articleLinks: ['Health Conditions'],
  },
  result_bloat_luteal: {
    title: 'Pre-Period Bloating',
    severity: 'low',
    emoji: '🫧',
    summary: 'Bloating in the luteal phase is caused by progesterone slowing gastrointestinal transit, combined with water retention from dropping oestrogen.',
    suggestions: ['Reduce salt and processed foods from day 21 onwards.','Drink coconut water — its potassium counteracts sodium-driven fluid retention.','Fennel seed tea after meals relieves intestinal gas rapidly.','Peppermint tea reduces intestinal spasm and bloating.'],
    remedyLinks: ['bloating'],
    docNeeded: false,
    articleLinks: ['Nutrition'],
  },
  result_bloat_menstrual: {
    title: 'Period Bloating',
    severity: 'low',
    emoji: '🫧',
    summary: 'Bloating during your period is caused by prostaglandins affecting the gut alongside the uterus.',
    suggestions: ['Avoid carbonated drinks and chewing gum during your period.','Warm ginger or fennel tea after meals.','Light walking after eating helps move gas through the digestive tract.','Avoid raw cruciferous vegetables (broccoli, cauliflower) which worsen gas.'],
    remedyLinks: ['bloating'],
    docNeeded: false,
    articleLinks: ['Nutrition'],
  },
  result_bloat_chronic: {
    title: 'Chronic Bloating — Broader Evaluation Recommended',
    severity: 'medium',
    emoji: '⚠️',
    summary: 'Bloating throughout the entire month may indicate IBS, food intolerances, gut dysbiosis, or other digestive conditions beyond hormonal causes.',
    suggestions: ['Try an elimination diet (remove gluten and dairy for 4 weeks) to identify triggers.','Probiotic-rich foods: curd, kanji, fermented rice.','See a gastroenterologist if bloating is persistent and severe.'],
    remedyLinks: ['bloating'],
    docNeeded: false,
    articleLinks: ['Nutrition'],
  },
  result_hormonal_acne: {
    title: 'Hormonal Acne',
    severity: 'low',
    emoji: '😣',
    summary: 'Jawline and chin acne that worsens before your period is driven by androgens — particularly free testosterone — stimulating excess sebum production.',
    suggestions: ['Spearmint tea (2 cups daily) has anti-androgenic evidence in RCTs.','Turmeric honey mask 2–3 times per week.','Support gut health — emerging research links gut microbiome to hormonal acne.','If persistent, a dermatologist can prescribe topical retinoids or spironolactone.'],
    remedyLinks: ['acne'],
    docNeeded: false,
    articleLinks: ['Health Conditions'],
  },
  result_hirsutism: {
    title: 'Excess Facial/Body Hair (Hirsutism) — Evaluation Recommended',
    severity: 'high',
    emoji: '⚠️',
    summary: 'Excess hair growth in a male pattern (face, abdomen, chest) is a sign of elevated androgens. This is a clinical symptom of PCOS or other hormonal conditions.',
    suggestions: ['This symptom requires blood tests: free testosterone, DHEA-S, LH:FSH ratio.','PCOS is the most common cause — see the PCOS article in the Education Hub.','SmartFlow\'s LH:FSH ratio feature may already be flagging anomalies in your logs.','See a gynaecologist or endocrinologist.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Endocrinologist',
    articleLinks: ['Health Conditions'],
  },
  result_hair_loss: {
    title: 'Hormonal Hair Thinning',
    severity: 'medium',
    emoji: '😟',
    summary: 'Hair thinning related to the menstrual cycle may be caused by iron deficiency, thyroid disorders, PCOS-related androgens, or telogen effluvium triggered by nutritional stress.',
    suggestions: ['Get blood tests: ferritin, TSH, free testosterone, vitamin D, vitamin B12.','Iron-rich diet is critical — hair follicles are highly sensitive to iron deficiency.','Avoid tight hairstyles and heat styling during periods of active thinning.','Biotin (Vitamin B7) and protein adequacy support hair growth.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Endocrinologist',
    articleLinks: ['Health Conditions'],
  },
  result_acanthosis: {
    title: 'Skin Darkening (Acanthosis Nigricans) — Metabolic Evaluation Recommended',
    severity: 'high',
    emoji: '⚠️',
    summary: 'Darkening of the skin at the neck, armpits, or groin is a clinical sign of insulin resistance — strongly associated with PCOS and pre-diabetes.',
    suggestions: ['This symptom requires: fasting glucose, fasting insulin, HbA1c, and HOMA-IR calculation.','Insulin resistance responds very well to lifestyle modification — low-GI diet and regular exercise.','See an endocrinologist or gynaecologist promptly.','The Education Hub has a full PCOS article with management guidance.'],
    remedyLinks: [],
    docNeeded: true,
    docSpecialisation: 'Endocrinologist',
    articleLinks: ['Health Conditions'],
  },
}

const SEVERITY_CONFIG = {
  low:    { color:'text-sage',   bg:'bg-sage/10',   border:'border-sage/30',   label:'Manageable at home' },
  medium: { color:'text-amber',  bg:'bg-amber/10',  border:'border-amber/30',  label:'Monitor & consider advice' },
  high:   { color:'text-rose',   bg:'bg-rose/10',   border:'border-rose/30',   label:'Seek medical advice' },
  urgent: { color:'text-red-600',bg:'bg-red-50',    border:'border-red-200',   label:'Seek help promptly' },
}

export default function SymptomCheck() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [currentId, setCurrentId] = useState('q1')
  const [result, setResult] = useState(null)

  const current = QUESTIONS.find(q => q.id === currentId)

  const handleOption = (opt) => {
    if (opt.next.startsWith('result_')) {
      setResult(RESULTS[opt.next])
    } else {
      setHistory(h => [...h, currentId])
      setCurrentId(opt.next)
    }
  }

  const handleBack = () => {
    if (result) { setResult(null); return }
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0,-1))
    setCurrentId(prev)
  }

  const reset = () => {
    setHistory([]); setCurrentId('q1'); setResult(null)
  }

  const sev = result ? SEVERITY_CONFIG[result.severity] : null

  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-fadeUp">
      <div className="mb-5">
        <h1 className="text-2xl font-display text-ink mb-0.5">Symptom Checker</h1>
        <p className="text-sm text-ink-soft font-body">
          Answer a few questions to get personalised guidance
        </p>
      </div>

      <div className="flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-xl p-3 mb-5">
        <AlertTriangle size={14} className="text-amber shrink-0" />
        <p className="text-xs text-amber font-body">
          This tool provides general guidance only. It is not a substitute for professional medical advice.
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-blush rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-rose rounded-full transition-all"
          style={{ width: result ? '100%' : `${(history.length / 3) * 100}%` }} />
      </div>

      {!result ? (
        /* Question */
        <div className="card space-y-4">
          <h2 className="font-display text-lg text-ink">{current?.question}</h2>
          <div className="space-y-2">
            {current?.options.map((opt, i) => (
              <button key={i} onClick={() => handleOption(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border border-blush-dark
                           hover:border-rose/50 hover:bg-blush/30 text-sm font-body text-ink
                           transition-all flex items-center justify-between group">
                <span>{opt.label}</span>
                <ArrowRight size={14} className="text-ink-soft group-hover:text-rose transition-colors shrink-0" />
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            {history.length > 0 && (
              <button onClick={handleBack} className="btn-ghost text-sm py-1.5 flex items-center gap-1.5">
                ← Back
              </button>
            )}
            <button onClick={reset} className="btn-ghost text-sm py-1.5 flex items-center gap-1.5 ml-auto">
              <RotateCcw size={13} /> Restart
            </button>
          </div>
        </div>
      ) : (
        /* Result */
        <div className="space-y-4">
          <div className={`card border ${sev.border} ${sev.bg}`}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-4xl">{result.emoji}</span>
              <div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1 ${sev.bg} ${sev.color} border ${sev.border}`}>
                  {sev.label}
                </div>
                <h2 className="font-display text-lg text-ink">{result.title}</h2>
              </div>
            </div>
            <p className="text-sm font-body text-ink-soft">{result.summary}</p>
          </div>

          {result.suggestions.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-medium text-ink text-sm">💡 Suggestions</h3>
              {result.suggestions.map((s,i) => (
                <div key={i} className="flex gap-2 text-sm font-body text-ink">
                  <CheckCircle size={14} className="text-sage shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {result.remedyLinks?.length > 0 && (
              <button onClick={() => navigate('/remedies')}
                className="btn-primary w-full flex items-center justify-center gap-2">
                <Leaf size={15} /> View Home Remedies
              </button>
            )}
            {result.articleLinks?.length > 0 && (
              <button onClick={() => navigate('/education')}
                className="btn-ghost w-full flex items-center justify-center gap-2">
                <BookOpen size={15} /> Read Related Articles
              </button>
            )}
            {result.docNeeded && (
              <button onClick={() => navigate('/doctors')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full
                           bg-rose/10 text-rose border border-rose/30 text-sm font-medium hover:bg-rose/20 transition-all">
                <Stethoscope size={15} /> Find a {result.docSpecialisation}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleBack} className="btn-ghost flex-1 text-sm py-2">← Back</button>
            <button onClick={reset} className="btn-ghost flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
              <RotateCcw size={13} /> Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
