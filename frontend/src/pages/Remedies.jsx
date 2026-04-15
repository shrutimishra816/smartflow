import { useState } from 'react'
import { Leaf, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

const SYMPTOMS = [
  {
    id: 'cramps', label: 'Period Cramps', emoji: '🔴',
    remedies: [
      { name: 'Ginger Tea', ingredients: ['1 inch fresh ginger','2 cups water','Honey to taste'],
        steps: ['Grate or thinly slice fresh ginger.','Boil in water for 10 minutes.','Strain, add honey. Drink warm 2–3 times daily.'],
        why: 'Ginger contains gingerols and shogaols that inhibit prostaglandin production — the same target as ibuprofen — reducing uterine contractions.',
        evidence: 'High', caution: null },
      { name: 'Heat Therapy', ingredients: ['Hot water bottle or heating pad'],
        steps: ['Fill a hot water bottle with warm (not boiling) water.','Wrap in a thin cloth.','Apply to lower abdomen for 20-minute sessions.','Repeat every 1–2 hours as needed.'],
        why: 'Heat relaxes uterine smooth muscle, increases blood flow, and activates heat receptors that override pain signals via the same pathway as analgesics.',
        evidence: 'High', caution: null },
      { name: 'Ajwain (Carom Seed) Water', ingredients: ['1 tsp ajwain seeds','1 glass warm water'],
        steps: ['Soak ajwain seeds in warm water for 5 minutes.','Strain and drink on an empty stomach.'],
        why: 'Ajwain is a natural antispasmodic commonly used in Ayurveda for abdominal cramps, gas, and muscle spasms.',
        evidence: 'Traditional', caution: 'Avoid in pregnancy.' },
      { name: 'Magnesium-Rich Snack', ingredients: ['Dark chocolate (70%+)','Pumpkin seeds','Banana'],
        steps: ['Eat a small square of dark chocolate with a handful of pumpkin seeds.','Eat 1 banana for potassium.'],
        why: 'Magnesium deficiency is strongly linked to increased prostaglandin production. Supplementing via food can reduce cramping significantly.',
        evidence: 'Moderate', caution: null },
    ]
  },
  {
    id: 'bloating', label: 'Bloating', emoji: '🫧',
    remedies: [
      { name: 'Fennel Seed Tea (Saunf)', ingredients: ['1 tsp fennel seeds','1 cup boiling water'],
        steps: ['Crush fennel seeds lightly.','Steep in boiling water for 10 minutes.','Strain and sip slowly after meals.'],
        why: 'Fennel contains anethole, which relaxes intestinal muscle and expels trapped gas, reducing bloating rapidly.',
        evidence: 'Moderate', caution: null },
      { name: 'Reduce Salt Intake', ingredients: ['Avoid pickles, packaged foods, papads','Increase potassium: banana, coconut water'],
        steps: ['Eliminate added salt for 3–5 days around your period.','Drink coconut water once daily — its potassium counters sodium-driven water retention.'],
        why: 'High sodium causes water retention, worsening luteal-phase bloating. Potassium is a natural diuretic that helps excrete excess sodium.',
        evidence: 'High', caution: null },
      { name: 'Peppermint Tea', ingredients: ['5–6 fresh peppermint leaves or 1 peppermint tea bag','1 cup hot water'],
        steps: ['Steep for 7–10 minutes.','Drink after meals, especially dinner.'],
        why: 'Menthol in peppermint acts as an antispasmodic on intestinal smooth muscle, relieving gas and bloating.',
        evidence: 'Moderate', caution: 'Avoid if you have acid reflux — can worsen it.' },
    ]
  },
  {
    id: 'headache', label: 'Menstrual Headache', emoji: '🤕',
    remedies: [
      { name: 'Peppermint Oil Temple Massage', ingredients: ['2 drops peppermint essential oil','1 tsp coconut oil (carrier)'],
        steps: ['Mix peppermint oil in coconut oil.','Apply gently to temples and forehead.','Massage in slow circular motions for 5 minutes.','Lie in a quiet, dark room.'],
        why: 'Menthol in peppermint produces a cooling sensation and may dilate blood vessels, relieving tension headaches as effectively as paracetamol in some studies.',
        evidence: 'Moderate', caution: 'Keep away from eyes. Dilute before skin contact.' },
      { name: 'Hydration Protocol', ingredients: ['Electrolyte water or ORS','Coconut water'],
        steps: ['Drink 2–3 litres of water throughout the day.','Sip coconut water — it replaces electrolytes lost with heavy bleeding.','Avoid caffeine, which causes vasoconstriction and rebound headaches.'],
        why: 'Menstrual headaches are often triggered or worsened by dehydration. Blood volume drops slightly during menstruation, and adequate hydration counters this.',
        evidence: 'High', caution: null },
      { name: 'Clove Compress', ingredients: ['4–5 whole cloves','Warm water','Small cloth'],
        steps: ['Crush cloves lightly.','Steep in warm water for 5 minutes.','Soak cloth, wring, and apply to forehead.'],
        why: 'Cloves contain eugenol, a natural analgesic and anti-inflammatory compound used in traditional Indian medicine for pain relief.',
        evidence: 'Traditional', caution: null },
    ]
  },
  {
    id: 'fatigue', label: 'Fatigue & Low Energy', emoji: '😴',
    remedies: [
      { name: 'Iron-Boosting Tonic', ingredients: ['1 tsp jaggery (gud)','1 tsp sesame seeds (til)','Warm milk or water'],
        steps: ['Dissolve jaggery in warm liquid.','Add sesame seeds.','Drink once daily during menstruation.'],
        why: 'Iron loss through blood causes menstrual fatigue. Jaggery is rich in non-haem iron and sesame seeds provide calcium and iron — both more readily absorbed with a warm liquid vehicle.',
        evidence: 'Traditional', caution: 'Monitor if you have diabetes — jaggery raises blood sugar.' },
      { name: 'Ashwagandha Milk', ingredients: ['1 tsp ashwagandha powder','1 cup warm milk','A pinch of turmeric','Honey to taste'],
        steps: ['Warm milk gently.','Stir in ashwagandha powder and turmeric.','Add honey after removing from heat.','Drink before bed.'],
        why: 'Ashwagandha is an adaptogen shown in multiple RCTs to reduce cortisol (the stress hormone that worsens fatigue) and improve energy and sleep quality.',
        evidence: 'Moderate', caution: 'Avoid in pregnancy and thyroid conditions without doctor approval.' },
      { name: 'Power Nap + Sunlight', ingredients: ['Quiet space','Natural sunlight (morning preferred)'],
        steps: ['Take a 20-minute nap in the afternoon — no longer, to avoid grogginess.','Get 10–15 minutes of morning sunlight after waking to reset your circadian rhythm.','Avoid screens 1 hour before bed.'],
        why: 'Low progesterone disrupts sleep architecture during menstruation. A 20-minute nap restores alertness without entering deep sleep, while morning light synchronises melatonin release.',
        evidence: 'High', caution: null },
    ]
  },
  {
    id: 'mood', label: 'Mood Swings & Anxiety', emoji: '😤',
    remedies: [
      { name: 'Chamomile Tea', ingredients: ['1 chamomile tea bag or 2 tsp dried chamomile','1 cup hot water'],
        steps: ['Steep for 10 minutes.','Drink warm — avoid adding sugar.','1–2 cups daily in the luteal phase.'],
        why: 'Chamomile contains apigenin, which binds to GABA receptors in the brain — the same mechanism as many anti-anxiety medications — producing a mild calming effect.',
        evidence: 'Moderate', caution: 'Avoid if allergic to ragweed or daisy family plants.' },
      { name: 'Pranayama (Alternate Nostril Breathing)', ingredients: ['5–10 minutes of quiet time'],
        steps: ['Sit comfortably.','Close your right nostril with your right thumb. Inhale through the left for 4 counts.','Close both nostrils for 2 counts.','Release the right nostril and exhale for 4 counts.','Inhale right, hold both, exhale left. This is one cycle.','Repeat for 5–10 cycles.'],
        why: 'Nadi Shodhana pranayama activates the parasympathetic nervous system, reducing cortisol and adrenaline levels within minutes — equivalent to the effect of short-duration meditation.',
        evidence: 'Moderate', caution: null },
      { name: 'Magnesium Glycinate Supplement', ingredients: ['250–300mg magnesium glycinate','Available at pharmacies'],
        steps: ['Take one tablet at night with water.','Consistent daily use for 2 menstrual cycles is needed to see full benefit.','Do not exceed 400mg without medical advice.'],
        why: 'Magnesium glycinate is the most bioavailable form of magnesium. Magnesium deficiency amplifies HPA axis activation (the stress response) and reduces GABA activity, worsening anxiety and irritability.',
        evidence: 'High', caution: 'May cause loose stools in higher doses. Start at 150mg.' },
    ]
  },
  {
    id: 'breast', label: 'Breast Tenderness', emoji: '💗',
    remedies: [
      { name: 'Evening Primrose Oil', ingredients: ['500–1000mg capsule daily','Available at health food stores'],
        steps: ['Take one 500mg capsule with food daily throughout the luteal phase.','Continue for 3 months for full effect.'],
        why: 'Evening primrose oil contains GLA (gamma-linolenic acid), which modulates the inflammatory pathway responsible for cyclic breast pain (mastalgia) by altering prostaglandin balance.',
        evidence: 'Moderate', caution: 'Avoid if on blood thinners. Not suitable in pregnancy.' },
      { name: 'Cold Compress', ingredients: ['Ice cubes in a zip-lock bag','Thin cloth'],
        steps: ['Wrap ice in cloth.','Apply to the breast for 10 minutes.','Switch sides if both are affected.','Repeat 2–3 times daily.'],
        why: 'Cold reduces blood flow to the area, decreasing swelling and dulling nerve pain signals temporarily.',
        evidence: 'Traditional', caution: null },
      { name: 'Reduce Caffeine', ingredients: ['Replace coffee/chai with herbal tea','Avoid cola and energy drinks'],
        steps: ['Cut caffeine gradually 1 week before your expected period.','Switch to rooibos, chamomile, or cinnamon tea.'],
        why: 'Methylxanthines in caffeine (and chocolate) may stimulate fibrous breast tissue, worsening hormonal breast tenderness in susceptible individuals.',
        evidence: 'Moderate', caution: null },
    ]
  },
  {
    id: 'acne', label: 'Hormonal Acne', emoji: '😣',
    remedies: [
      { name: 'Turmeric Honey Face Mask', ingredients: ['1 tsp turmeric','1 tsp raw honey','A few drops of lemon juice (optional)'],
        steps: ['Mix into a paste.','Apply to clean face, avoiding eye area.','Leave for 15 minutes.','Rinse with lukewarm water.','Use 2–3 times per week.'],
        why: 'Curcumin in turmeric is a potent anti-inflammatory and antibacterial compound. Honey is a natural humectant with antibacterial properties from hydrogen peroxide.',
        evidence: 'Traditional', caution: 'Turmeric may stain skin temporarily — do a patch test first. Lemon juice increases sun sensitivity.' },
      { name: 'Spearmint Tea', ingredients: ['2 tsp dried spearmint or 1 spearmint tea bag','1 cup hot water'],
        steps: ['Steep for 7 minutes.','Drink 2 cups daily, especially in the luteal phase.'],
        why: 'Spearmint has anti-androgenic properties — two RCTs showed it significantly reduces free testosterone, which drives hormonal acne along the jawline.',
        evidence: 'Moderate', caution: null },
      { name: 'Gut Health Protocol', ingredients: ['Probiotic foods: curd, kanji, idli','Prebiotic foods: banana, oats'],
        steps: ['Eat 1 cup of curd daily.','Include at least 2 servings of prebiotic foods per day.','Reduce refined sugar and white flour.'],
        why: 'Gut dysbiosis increases systemic inflammation and may affect oestrogen metabolism (via the "oestrobolome"), worsening hormonal acne.',
        evidence: 'Emerging', caution: null },
    ]
  },
  {
    id: 'sleep', label: 'Sleep Disruption', emoji: '🌙',
    remedies: [
      { name: 'Tart Cherry Juice', ingredients: ['200ml unsweetened tart cherry juice','Or 2 tsp tart cherry concentrate in water'],
        steps: ['Drink 30 minutes before bedtime.','Consistent use for 7+ days shows the strongest effect.'],
        why: 'Tart cherries are one of the few natural sources of melatonin and also contain tryptophan (melatonin precursor) and anthocyanins that reduce inflammation-related sleep disruption.',
        evidence: 'Moderate', caution: null },
      { name: 'Ashwagandha + Warm Milk', ingredients: ['1 tsp ashwagandha powder','1 cup warm milk','Pinch of nutmeg'],
        steps: ['Heat milk gently.','Stir in ashwagandha and nutmeg.','Drink 45 minutes before bed.'],
        why: 'Ashwagandha increases GABA activity and reduces cortisol. Nutmeg contains myristicin, a mild sedative compound used in Ayurveda for centuries.',
        evidence: 'Moderate', caution: 'Avoid more than 1 tsp ashwagandha daily.' },
      { name: 'Digital Sunset Routine', ingredients: ['Blue-light filtering glasses (optional)','Dim lighting'],
        steps: ['Stop using screens 60 minutes before bed.','Dim all lights in your room.','Read a physical book or journal.','Keep room temperature cool (18–20°C optimal for sleep).'],
        why: 'Progesterone-sensitive individuals are more susceptible to blue light disrupting melatonin during the luteal phase. A digital sunset dramatically improves sleep onset latency.',
        evidence: 'High', caution: null },
    ]
  },
]

const EVIDENCE_COLORS = {
  'High': 'bg-sage/10 text-sage',
  'Moderate': 'bg-amber/10 text-amber',
  'Traditional': 'bg-violet/10 text-violet',
  'Emerging': 'bg-blue-100 text-blue-600',
}

function RemedyCard({ remedy }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-blush-dark rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blush/30 transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-ink text-sm">{remedy.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EVIDENCE_COLORS[remedy.evidence]}`}>
              {remedy.evidence} evidence
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            {remedy.ingredients.slice(0,2).join(' · ')}
            {remedy.ingredients.length > 2 ? ` +${remedy.ingredients.length-2} more` : ''}
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-ink-soft shrink-0" />
               : <ChevronDown size={16} className="text-ink-soft shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 bg-white">
          <div>
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">Ingredients</p>
            <div className="flex flex-wrap gap-1.5">
              {remedy.ingredients.map((ing,i) => (
                <span key={i} className="text-xs bg-blush text-rose px-2 py-0.5 rounded-full">{ing}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">Steps</p>
            <ol className="space-y-1">
              {remedy.steps.map((step,i) => (
                <li key={i} className="text-xs text-ink font-body flex gap-2">
                  <span className="text-rose font-bold shrink-0">{i+1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-blush rounded-lg p-3">
            <p className="text-xs font-semibold text-ink mb-1">🔬 Why it works</p>
            <p className="text-xs text-ink-soft font-body">{remedy.why}</p>
          </div>
          {remedy.caution && (
            <div className="flex items-start gap-2 bg-amber/10 rounded-lg p-3">
              <AlertTriangle size={13} className="text-amber shrink-0 mt-0.5" />
              <p className="text-xs text-amber font-body">{remedy.caution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Remedies() {
  const [selected, setSelected] = useState('cramps')
  const symptom = SYMPTOMS.find(s => s.id === selected)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeUp">
      <div className="mb-5">
        <h1 className="text-2xl font-display text-ink mb-0.5">Home Remedies</h1>
        <p className="text-sm text-ink-soft font-body">
          Select a symptom to see evidence-based natural remedies
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber/10 border border-amber/30 rounded-xl p-3 mb-5">
        <AlertTriangle size={15} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-amber font-body">
          These remedies support symptom management and are not a substitute for medical treatment.
          Consult a doctor for severe or persistent symptoms.
        </p>
      </div>

      {/* Symptom selector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {SYMPTOMS.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all
              ${selected===s.id
                ? 'bg-rose text-white border-rose shadow-sm'
                : 'bg-white border-blush-dark text-ink-soft hover:border-rose/40 hover:bg-blush/30'}`}>
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-xs font-medium leading-tight">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Selected symptom remedies */}
      {symptom && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
            <span>{symptom.emoji}</span> Remedies for {symptom.label}
          </h2>
          <div className="space-y-3">
            {symptom.remedies.map((r,i) => <RemedyCard key={i} remedy={r} />)}
          </div>
          <div className="mt-5 p-4 bg-sage/10 border border-sage/30 rounded-xl">
            <p className="text-sm font-medium text-sage mb-1">💡 When to see a doctor</p>
            <p className="text-xs text-ink-soft font-body">
              If your symptoms significantly interfere with daily life, do not respond to home remedies,
              or have worsened over time, please visit a specialist. Use the <strong>Doctor Finder</strong> to
              find a qualified gynaecologist or endocrinologist near you.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
