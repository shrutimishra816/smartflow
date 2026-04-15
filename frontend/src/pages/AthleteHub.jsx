import { useState } from 'react'
import { Dumbbell, Zap, Shield, Trophy, Apple, AlertTriangle,
         ChevronDown, ChevronUp, Activity, Heart, Moon } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────
const SPORTS = [
  { id:'running',    label:'🏃 Running',          icon:'🏃' },
  { id:'cycling',    label:'🚴 Cycling',           icon:'🚴' },
  { id:'swimming',   label:'🏊 Swimming',          icon:'🏊' },
  { id:'weightlifting',label:'🏋️ Weightlifting',   icon:'🏋️' },
  { id:'team',       label:'⚽ Team Sports',       icon:'⚽' },
  { id:'yoga_gym',   label:'🧘 Yoga / Gymnastics', icon:'🧘' },
  { id:'martial',    label:'🥋 Combat / Martial Arts',icon:'🥋' },
  { id:'dance',      label:'💃 Dance / Aerobics',  icon:'💃' },
]

const PHASES = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal']

const PHASE_META = {
  Menstrual:  { emoji:'🌑', color:'text-rose',  bg:'bg-rose/10',  border:'border-rose/20',  days:'Days 1–5'  },
  Follicular: { emoji:'🌱', color:'text-sage',  bg:'bg-sage/10',  border:'border-sage/20',  days:'Days 6–13' },
  Ovulation:  { emoji:'🌕', color:'text-sky-500',bg:'bg-sky-50',  border:'border-sky-200',  days:'Days 13–16'},
  Luteal:     { emoji:'🍂', color:'text-amber', bg:'bg-amber/10', border:'border-amber/20', days:'Days 17–28'},
}

// Sport-specific phase data
const SPORT_DATA = {
  running: {
    Menstrual: {
      trainingLoad: 'Low – Recovery Run',
      loadColor: 'text-rose',
      loadBg: 'bg-rose/10',
      training: [
        'Limit runs to 20–30 min at conversational pace (Zone 2 only)',
        'Replace one run with restorative yoga or a rest day',
        'If cramping: walk-run intervals with no pace pressure',
        'Focus on breathwork and form drills rather than mileage',
      ],
      nutrition: [
        'Iron-rich foods post-run: spinach smoothie, lentil soup, jaggery water',
        'Hydrate with electrolyte drinks — blood loss increases dehydration risk',
        'Small, carb-forward meals to maintain blood glucose during fatigue',
        'Ginger tea before runs to reduce prostaglandin-driven cramping',
      ],
      injury: [
        '⚠️ Progesterone relaxes ligaments — increased ACL risk during period',
        'Avoid steep descents and technical terrain where ankle control matters',
        'Warm up for at least 15 minutes before any run',
        'Watch for signs of iron-deficiency: racing heart, dizziness, pale nail beds',
      ],
      performance: 'Performance is typically below your peak. Focus on consistency, not speed. Running during menstruation maintains fitness without setting back recovery.',
      peak: false,
    },
    Follicular: {
      trainingLoad: 'High – Build Phase',
      loadColor: 'text-sage',
      loadBg: 'bg-sage/10',
      training: [
        'Best time to increase weekly mileage (up to 10% per week)',
        'Introduce speed work: tempo runs, interval training, fartlek sessions',
        'Hill repeats and trail running — neuromuscular coordination peaks here',
        'Schedule your hardest long runs in this phase',
        'This is the optimal phase for time trials and PRs',
      ],
      nutrition: [
        'Carbohydrate loading works best here — glycogen storage is efficient',
        'Pre-run: oats with banana and almond butter 90 min before',
        'Post-run recovery: protein + carb within 30 min (curd with fruit)',
        'Oestrogen enhances fat oxidation — longer runs can use slightly less carb',
      ],
      injury: [
        'Lower ACL and muscle injury risk than luteal phase',
        'Muscles are more responsive to training stimulus — great for strength work',
        'Still warm up properly — higher confidence can lead to skipping warm-up',
        'Monitor for overuse injuries as you increase mileage',
      ],
      performance: '⭐ Peak performance phase. Schedule races, time trials, and personal best attempts in the follicular phase. Oestrogen boosts muscle protein synthesis, aerobic capacity, and pain tolerance.',
      peak: true,
    },
    Ovulation: {
      trainingLoad: 'Peak – Compete',
      loadColor: 'text-sky-500',
      loadBg: 'bg-sky-50',
      training: [
        '⭐ Peak power and speed — ideal race day if possible',
        'VO2 max workouts, track intervals, and race simulations',
        'Reaction time and coordination are at their best',
        'Schedule your most important event or time trial this week',
      ],
      nutrition: [
        'Maintain carbohydrate intake — performance demand is highest',
        'Anti-inflammatory foods to counter ovulation inflammation: turmeric, berries',
        'Stay vigilant with hydration — LH surge increases core temperature',
        'Coconut water replenishes electrolytes efficiently',
      ],
      injury: [
        '⚠️ HIGHEST ACL INJURY RISK — oestrogen peak makes ligaments maximally lax',
        'Neuromuscular training (single-leg work, balance drills) is critical this week',
        'Prioritise landing mechanics and deceleration technique',
        'Wear supportive footwear, especially for trail running',
      ],
      performance: '⭐ Absolute peak. Oestrogen peaks alongside LH, maximising VO2 max, muscle strength, and mental drive. If you have one race this month, run it now.',
      peak: true,
    },
    Luteal: {
      trainingLoad: 'Moderate – Maintain',
      loadColor: 'text-amber',
      loadBg: 'bg-amber/10',
      training: [
        'Reduce intensity by 10–20% — perceived effort will feel higher',
        'Replace speed work with steady-state tempo and easy long runs',
        'Core strengthening sessions — reduces injury risk in late luteal',
        'Avoid comparing pace to follicular phase — the difference is hormonal',
        'Taper mileage in the final 3 days before expected period',
      ],
      nutrition: [
        'Increase carbohydrate intake — progesterone raises blood glucose usage',
        'Magnesium-rich foods reduce muscle cramps and PMS fatigue',
        'Anti-inflammatory diet: turmeric, omega-3, leafy greens',
        'Extra protein to counter progesterone-driven muscle breakdown',
        'Reduce caffeine — it amplifies luteal-phase anxiety',
      ],
      injury: [
        '⚠️ Elevated injury risk — progesterone further increases joint laxity',
        'Fatigue impairs neuromuscular control — most overuse injuries occur here',
        'Reduce volume before increasing intensity in any single session',
        'Take an extra rest day if feeling depleted — this is not weakness',
      ],
      performance: 'Performance naturally declines. Perceived exertion is higher for the same pace. Train smart, not hard. Your luteal-phase training builds the base that fuels follicular-phase PRs.',
      peak: false,
    },
  },
}

// Generic phase data for sports without specific profiles
function getGenericData(sport) {
  const sportLabels = {
    cycling:      { noun: 'cycling', intensity_high: 'sprint intervals and climbs', intensity_low: 'easy spins', injury: 'saddle discomfort and IT band issues' },
    swimming:     { noun: 'swimming', intensity_high: 'threshold sets and race pace', intensity_low: 'technique drills', injury: 'shoulder overuse' },
    weightlifting:{ noun: 'strength training', intensity_high: 'heavy compound lifts and PRs', intensity_low: 'mobility and bodyweight work', injury: 'ACL, tendon laxity' },
    team:         { noun: 'team sport training', intensity_high: 'match play and sprints', intensity_low: 'skill drills', injury: 'ACL and ankle sprains' },
    yoga_gym:     { noun: 'yoga and gymnastics', intensity_high: 'advanced inversions and flexibility work', intensity_low: 'restorative and yin yoga', injury: 'hypermobility-related joint strain' },
    martial:      { noun: 'martial arts', intensity_high: 'sparring and competition prep', intensity_low: 'kata and technique work', injury: 'joint hyperextension' },
    dance:        { noun: 'dance and aerobics', intensity_high: 'full choreography and competitions', intensity_low: 'stretching and conditioning', injury: 'ankle and knee overuse' },
  }
  const s = sportLabels[sport] || sportLabels.team

  return {
    Menstrual: {
      trainingLoad:'Low – Active Recovery', loadColor:'text-rose', loadBg:'bg-rose/10',
      training:[`Focus on ${s.intensity_low} rather than high intensity`,`Reduce ${s.noun} volume by 30–40%`,'Rest is training — muscle repair peaks during rest','Gentle movement maintains blood flow and reduces cramping'],
      nutrition:['Iron-rich foods to replenish blood loss','Warm ginger or chamomile tea to reduce inflammation','Small, frequent meals to maintain energy','Avoid processed foods and excess salt'],
      injury:[`⚠️ Ligament laxity risk — approach ${s.injury} with caution`,'Warm up thoroughly before any activity','Avoid explosive movements if cramping is severe','Stay hydrated — dehydration worsens muscle cramps'],
      performance:'Below average. Focus on technique refinement and mindset during this phase. Quality over quantity.', peak:false,
    },
    Follicular: {
      trainingLoad:'High – Build & Learn', loadColor:'text-sage', loadBg:'bg-sage/10',
      training:[`⭐ Schedule ${s.intensity_high} this week`,`Increase ${s.noun} volume progressively`,'Best time to learn new skills — motor learning peaks','High-intensity sessions have the best adaptation response here'],
      nutrition:['Carbohydrate loading is effective this phase','Pre-session: complex carbs 90 min before','Post-session: protein + carbs within 30 minutes','Oestrogen helps fat oxidation — slightly less carb needed for long sessions'],
      injury:['Lower injury risk than luteal/ovulation','Still warm up — confidence can lead to skipping prep','Monitor for overuse as volume increases','Strength training in this phase creates strongest muscle adaptations'],
      performance:'⭐ Near-peak. Schedule important training milestones, skill assessments, and competition prep here.', peak:true,
    },
    Ovulation: {
      trainingLoad:'Peak – Compete', loadColor:'text-sky-500', loadBg:'bg-sky-50',
      training:[`⭐ Best time for ${s.intensity_high}`,'Schedule competitions and key performance events now','Reaction time and coordination are at their absolute best','Power output is highest — use it for PRs and breakthroughs'],
      nutrition:['Maintain performance nutrition — no changes needed','Anti-inflammatory focus: turmeric, berries, omega-3','Hydrate more — LH surge raises core body temperature','Coconut water for electrolyte balance'],
      injury:[`⚠️ HIGHEST ACL AND LIGAMENT INJURY RISK — oestrogen peak causes maximal joint laxity`,'Prioritise neuromuscular warm-up before every session','Landing mechanics, deceleration drills, and balance work are essential','Wear proper support — footwear and bracing matter most this week'],
      performance:'⭐ Absolute peak performance. Compete, set PRs, and schedule your most important events during ovulation week.', peak:true,
    },
    Luteal: {
      trainingLoad:'Moderate – Maintain', loadColor:'text-amber', loadBg:'bg-amber/10',
      training:['Reduce intensity by 15–20% — this is physiologically required','Replace high-intensity sessions with moderate steady-state work','Skill refinement and technique work — less taxing than power sessions','Rest days are more important here — honour them'],
      nutrition:['Increase carbs — progesterone raises glucose demand','Magnesium-rich foods reduce PMS muscle symptoms','Protein slightly higher to counter muscle catabolism','Reduce caffeine — worsens anxiety and disrupts sleep'],
      injury:['⚠️ Elevated injury risk continues from ovulation','Neuromuscular fatigue means technique breakdown is more likely','Reduce session length before adding intensity','Most overuse injuries occur in the luteal phase — monitor carefully'],
      performance:'Performance typically 5–10% below follicular peak. This is normal and temporary. Luteal-phase training builds the aerobic base that powers follicular-phase results.', peak:false,
    },
  }
}

// Training examples / loading data
const TRAINING_EXAMPLES = [
  {
    athlete: 'Female Distance Runner (5K/10K)',
    cycle: 28,
    weekPlan: [
      { day:'Mon', phase:'Follicular', session:'Tempo run 8km at lactate threshold',     load:'Hard'  },
      { day:'Tue', phase:'Follicular', session:'Easy recovery run 5km + strength',       load:'Easy'  },
      { day:'Wed', phase:'Follicular', session:'Interval: 6×800m at 5K pace',           load:'Hard'  },
      { day:'Thu', phase:'Ovulation',  session:'Long run 15km at easy-moderate pace',   load:'Medium'},
      { day:'Fri', phase:'Ovulation',  session:'Rest or yoga',                           load:'Rest'  },
      { day:'Sat', phase:'Ovulation',  session:'⭐ RACE or time trial 5K',             load:'Race'  },
      { day:'Sun', phase:'Luteal',     session:'Easy long run 12km',                     load:'Easy'  },
    ]
  },
  {
    athlete: 'Recreational Weightlifter',
    cycle: 28,
    weekPlan: [
      { day:'Mon', phase:'Follicular', session:'Deadlift 4×5 @ 85% 1RM + accessory',   load:'Hard'  },
      { day:'Tue', phase:'Follicular', session:'Upper body push: bench + OHP PRs',      load:'Hard'  },
      { day:'Wed', phase:'Ovulation',  session:'⭐ 1RM attempt day — squat or deadlift',load:'Max'   },
      { day:'Thu', phase:'Ovulation',  session:'Rest — active recovery, mobility work', load:'Rest'  },
      { day:'Fri', phase:'Luteal',     session:'Full body moderate: 3×10 compound',    load:'Medium'},
      { day:'Sat', phase:'Luteal',     session:'Upper body pull + core conditioning',  load:'Medium'},
      { day:'Sun', phase:'Luteal',     session:'Rest or restorative yoga',              load:'Rest'  },
    ]
  },
  {
    athlete: 'Team Sport Athlete (Football / Basketball)',
    cycle: 28,
    weekPlan: [
      { day:'Mon', phase:'Menstrual',  session:'Active recovery: pool session or walk', load:'Easy'  },
      { day:'Tue', phase:'Follicular', session:'Sprints + agility drills at full speed',load:'Hard'  },
      { day:'Wed', phase:'Follicular', session:'Technical skills + scrimmage',          load:'Medium'},
      { day:'Thu', phase:'Ovulation',  session:'⭐ Match or full-intensity scrimmage', load:'Race'  },
      { day:'Fri', phase:'Ovulation',  session:'Neuromuscular warm-up + light drill',  load:'Easy'  },
      { day:'Sat', phase:'Luteal',     session:'Moderate training — reduced sprints',  load:'Medium'},
      { day:'Sun', phase:'Luteal',     session:'Rest + ice bath for recovery',         load:'Rest'  },
    ]
  },
]

const LOAD_COLORS = {
  Hard:   'bg-rose/10 text-rose border-rose/20',
  Medium: 'bg-amber/10 text-amber border-amber/20',
  Easy:   'bg-sage/10 text-sage border-sage/20',
  Rest:   'bg-gray-100 text-gray-500 border-gray-200',
  Race:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  Max:    'bg-purple-100 text-violet border-violet/20',
}

// ── Components ────────────────────────────────────────────────────────────────
function PhaseCard({ phase, data, sport }) {
  const [open, setOpen] = useState(false)
  const meta = PHASE_META[phase]

  return (
    <div className={`rounded-2xl border ${meta.border} overflow-hidden`}>
      <button onClick={() => setOpen(o=>!o)}
        className={`w-full flex items-center justify-between p-4 ${meta.bg} text-left`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-display text-base ${meta.color}`}>{phase} Phase</span>
              {data.peak && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Peak</span>}
            </div>
            <span className="text-xs text-ink-soft">{meta.days}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${data.loadBg} ${data.loadColor}`}>
            {data.trainingLoad}
          </span>
          {open ? <ChevronUp size={16} className="text-ink-soft"/> : <ChevronDown size={16} className="text-ink-soft"/>}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white animate-fadeUp">
          {/* Performance note */}
          <div className={`p-3 rounded-xl ${meta.bg} border ${meta.border}`}>
            <p className="text-xs font-semibold text-ink mb-1">📊 Performance Outlook</p>
            <p className="text-sm font-body text-ink-soft">{data.performance}</p>
          </div>

          {/* Training */}
          <div>
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Dumbbell size={12}/> Training Recommendations
            </p>
            <div className="space-y-1.5">
              {data.training.map((t,i) => (
                <div key={i} className="flex gap-2 text-sm font-body text-ink">
                  <span className={`${meta.color} font-bold shrink-0`}>›</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Apple size={12}/> Nutrition & Recovery
            </p>
            <div className="space-y-1.5">
              {data.nutrition.map((n,i) => (
                <div key={i} className="flex gap-2 text-sm font-body text-ink">
                  <span className="text-sage font-bold shrink-0">›</span>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Injury prevention */}
          <div>
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Shield size={12}/> Injury Prevention
            </p>
            <div className="space-y-1.5">
              {data.injury.map((inj,i) => (
                <div key={i} className={`flex gap-2 text-sm font-body
                  ${inj.startsWith('⚠️') ? 'text-amber' : 'text-ink'}`}>
                  <span className={`font-bold shrink-0 ${inj.startsWith('⚠️')?'text-amber':'text-amber'}`}>›</span>
                  <span>{inj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrainingExample({ example }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <button onClick={() => setOpen(o=>!o)} className="w-full flex items-center justify-between text-left">
        <div>
          <p className="font-medium text-ink text-sm">{example.athlete}</p>
          <p className="text-xs text-ink-soft font-body">{example.cycle}-day cycle plan</p>
        </div>
        {open ? <ChevronUp size={16} className="text-ink-soft"/> : <ChevronDown size={16} className="text-ink-soft"/>}
      </button>

      {open && (
        <div className="mt-3 space-y-2 animate-fadeUp">
          {example.weekPlan.map((day,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 text-center shrink-0">
                <p className="text-xs font-bold text-ink">{day.day}</p>
                <p className="text-[10px] text-ink-soft leading-none">{PHASE_META[day.phase]?.emoji}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink truncate">{day.session}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${LOAD_COLORS[day.load]}`}>
                {day.load}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-ink-soft mt-2 font-body">
            * Schedule high-intensity sessions in Follicular/Ovulation phases. Taper in Luteal. Rest during Menstrual days 1–2.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AthleteHub() {
  const [selectedSport, setSelectedSport] = useState('running')
  const [activeTab, setActiveTab]         = useState('phases')

  const sportData = selectedSport === 'running'
    ? SPORT_DATA.running
    : getGenericData(selectedSport)

  const sport = SPORTS.find(s => s.id === selectedSport)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeUp">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-display text-ink mb-0.5">🏅 Female Athlete Hub</h1>
        <p className="text-sm text-ink-soft font-body">
          Train smarter by syncing your sport with your cycle. Phase-specific guidance for every discipline.
        </p>
      </div>

      {/* Key stats banner */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { icon:Trophy, label:'Peak Phase', val:'Follicular + Ovulation', color:'text-sage' },
          { icon:Shield, label:'Highest Injury Risk', val:'Ovulation week', color:'text-amber' },
          { icon:Moon,   label:'Recovery Phase', val:'Menstrual + Late Luteal', color:'text-rose' },
        ].map(({icon:Icon, label, val, color}) => (
          <div key={label} className="card p-3 text-center">
            <Icon size={16} className={`${color} mx-auto mb-1`}/>
            <p className="text-[10px] text-ink-soft leading-tight">{label}</p>
            <p className={`text-xs font-medium ${color} leading-tight mt-0.5`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Sport selector */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Select Your Sport</p>
        <div className="grid grid-cols-4 gap-2">
          {SPORTS.map(s => (
            <button key={s.id} onClick={() => setSelectedSport(s.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all
                ${selectedSport===s.id
                  ? 'bg-rose text-white border-rose shadow-sm'
                  : 'bg-white border-blush-dark text-ink-soft hover:border-rose/40 hover:bg-blush/30'}`}>
              <span className="text-xl">{s.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{s.label.replace(/^.\s/,'')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {[
          ['phases','📋 Phase Guide'],
          ['examples','💡 Training Examples'],
          ['science','🔬 The Science'],
        ].map(([key,label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0
              ${activeTab===key ? 'bg-rose text-white' : 'bg-blush text-rose hover:bg-blush-dark'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Phase Guide Tab */}
      {activeTab === 'phases' && (
        <div className="space-y-3">
          <div className={`p-3 rounded-xl bg-blush border border-blush-dark flex items-center gap-2 mb-2`}>
            <span className="text-lg">{sport?.icon}</span>
            <div>
              <p className="text-sm font-medium text-ink">{sport?.label} — Cycle-Synced Plan</p>
              <p className="text-xs text-ink-soft font-body">Tap each phase to expand training, nutrition, and injury guidance</p>
            </div>
          </div>
          {PHASES.map(phase => (
            <PhaseCard key={phase} phase={phase} data={sportData[phase]} sport={selectedSport} />
          ))}
        </div>
      )}

      {/* Training Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          <div className="p-3 bg-blush rounded-xl mb-2">
            <p className="text-sm font-medium text-ink mb-1">📚 Sample Weekly Training Plans</p>
            <p className="text-xs text-ink-soft font-body">
              These are phase-synced training plans. Load them as inspiration — modify to suit your fitness level and cycle length.
            </p>
          </div>
          {TRAINING_EXAMPLES.map((ex,i) => <TrainingExample key={i} example={ex}/>)}

          {/* Printable load guide */}
          <div className="card">
            <p className="text-sm font-semibold text-ink mb-3">🎨 Phase Load Guide</p>
            <div className="space-y-2">
              {[
                { phase:'Menstrual (Days 1–5)', load:'20–40%', emoji:'🌑', note:'Active recovery, yoga, walking. Honour fatigue.'},
                { phase:'Follicular (Days 6–13)',load:'80–100%',emoji:'🌱', note:'Build, progress, attempt PRs. Highest adaptation.'},
                { phase:'Ovulation (Days 13–16)',load:'100%',   emoji:'🌕', note:'Compete, race, attempt max lifts. Peak power.'},
                { phase:'Luteal (Days 17–28)',  load:'60–75%', emoji:'🍂', note:'Maintain. Reduce intensity. Prioritise recovery.'},
              ].map(row => (
                <div key={row.phase} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{row.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink">{row.phase}</span>
                      <span className="text-xs bg-blush text-rose px-2 py-0.5 rounded-full font-mono">{row.load} load</span>
                    </div>
                    <p className="text-xs text-ink-soft font-body">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACL risk chart */}
          <div className="card border-amber/30 bg-amber/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber"/>
              <p className="text-sm font-semibold text-ink">ACL & Ligament Injury Risk by Phase</p>
            </div>
            {[
              { phase:'Menstrual',  risk:35, color:'bg-rose/60' },
              { phase:'Follicular', risk:25, color:'bg-sage/60' },
              { phase:'Ovulation',  risk:95, color:'bg-red-500' },
              { phase:'Luteal',     risk:60, color:'bg-amber/80'},
            ].map(r => (
              <div key={r.phase} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-ink">{r.phase}</span>
                  <span className="text-ink-soft font-mono">{r.risk}%</span>
                </div>
                <div className="h-2 bg-blush rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color} transition-all`} style={{width:`${r.risk}%`}}/>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-ink-soft mt-2 font-body">
              Relative risk index. Ovulation-phase ACL injury risk is 2–4× higher due to oestrogen-driven ligament laxity.
              Source: Wojtys et al. (1998), Malone et al. (2004), Shultz et al. (2010).
            </p>
          </div>
        </div>
      )}

      {/* Science Tab */}
      {activeTab === 'science' && (
        <div className="space-y-4">
          {[
            {
              title:'Oestrogen and Athletic Performance',
              emoji:'💪',
              content:`Oestrogen has a profound anabolic effect — it enhances muscle protein synthesis, improves collagen production in tendons, increases VO2 max efficiency, and reduces recovery time. During the follicular and ovulation phases, oestrogen peaks drive the best athletic performance windows.

Research by Sarwar et al. (1996) showed maximal voluntary muscle force was 11% higher in the follicular phase compared to the menstrual phase. Sung et al. (2014) confirmed that aerobic capacity improves by up to 12% during the follicular phase.`,
            },
            {
              title:'Progesterone: The Performance Dampener',
              emoji:'🌙',
              content:`Progesterone rises sharply in the luteal phase and has several performance-reducing effects. It raises resting core body temperature by 0.3–0.5°C (increasing heat stress during exercise), promotes muscle protein catabolism, reduces respiratory efficiency by increasing ventilation rate, and disrupts sleep architecture — compounding fatigue.

This is why luteal-phase training at the same effort feels harder. The body is doing more work for the same output. This is not a mindset issue — it is physiology.`,
            },
            {
              title:'ACL Injury and the Oestrogen Peak',
              emoji:'🦴',
              content:`The anterior cruciate ligament contains oestrogen receptors. When oestrogen peaks at ovulation, it dramatically increases ligament laxity — the ability of ligaments to stretch. Studies (Malone et al., 2004) found that female athletes are 2–8× more likely to suffer ACL tears during the ovulatory phase compared to other phases.

The practical implication: neuromuscular training (single-leg stability, deceleration drills, jump-landing technique) should be performed daily during the 5 days around ovulation.`,
            },
            {
              title:'Iron Deficiency and Endurance Athletes',
              emoji:'🩸',
              content:`Female athletes are among the highest-risk groups for iron-deficiency anaemia, due to the combination of menstrual iron loss, sweat-based iron loss, and exercise-induced haemolysis (destruction of red blood cells through impact, especially in runners). Even non-anaemic iron deficiency (low ferritin with normal haemoglobin) can reduce VO2 max and increase perceived exertion.

Target ferritin for female athletes: >50 ng/mL (optimal), >30 ng/mL (minimum). Ask your doctor for a full iron panel annually.`,
            },
            {
              title:'Relative Energy Deficiency in Sport (RED-S)',
              emoji:'⚠️',
              content:`RED-S (formerly the Female Athlete Triad) occurs when energy intake is chronically insufficient to meet the demands of training. Symptoms include irregular or absent periods, bone stress fractures, hormonal disruption, impaired immunity, and psychological issues.

If your periods become irregular after increasing training load or reducing calorie intake, see a sports medicine physician or endocrinologist immediately. Amenorrhoea in athletes is NOT normal or healthy — it indicates a hormonal crisis with long-term bone density consequences.`,
            },
            {
              title:'Research References',
              emoji:'📚',
              content:`• Sarwar R, et al. (1996). Br J Sports Med. Oestrogen and muscle strength across the cycle.
• Wojtys EM, et al. (1998). Am J Sports Med. ACL injury and the menstrual cycle.
• Malone TR, et al. (2004). J Athl Train. Relationship of gender to ACL injuries.
• Shultz SJ, et al. (2010). Am J Sports Med. Estradiol and knee laxity.
• Sung E, et al. (2014). Eur J Appl Physiol. Menstrual cycle effects on aerobic performance.
• Mountjoy M, et al. (2018). Br J Sports Med. IOC consensus on RED-S.
• Blagrove RC, et al. (2020). Sports Med. Female athlete physiology: menstrual cycle.`,
            },
          ].map((section,i) => (
            <div key={i} className="card">
              <h3 className="font-display text-base text-ink mb-2">{section.emoji} {section.title}</h3>
              {section.content.split('\n\n').map((para,j) => (
                <p key={j} className="text-sm font-body text-ink-soft mb-2 leading-relaxed">{para}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
