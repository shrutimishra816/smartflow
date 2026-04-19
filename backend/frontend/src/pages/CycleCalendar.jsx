import { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Droplets, Wind, Zap,
  Moon, Sun, Flower2, AlertTriangle, Leaf, X
} from 'lucide-react'
import { logsAPI, predictionsAPI } from '../api/client'
import toast from 'react-hot-toast'

// ── Constants ─────────────────────────────────────────────────────────────────
const PHASE_CONFIG = {
  Menstrual:  { color: '#E8647A', bg: 'bg-rose/10',   text: 'text-rose',   dot: 'bg-rose',   emoji: '🌑', label: 'Menstrual'  },
  Follicular: { color: '#7BAE9A', bg: 'bg-sage/10',   text: 'text-sage',   dot: 'bg-sage',   emoji: '🌱', label: 'Follicular' },
  Ovulation:  { color: '#64B5F6', bg: 'bg-sky-100',   text: 'text-sky-500',dot: 'bg-sky-400',emoji: '🌕', label: 'Ovulation'  },
  Luteal:     { color: '#E8A95C', bg: 'bg-amber/10',  text: 'text-amber',  dot: 'bg-amber',  emoji: '🍂', label: 'Luteal'     },
  Period:     { color: '#C62828', bg: 'bg-red-100',   text: 'text-red-600',dot: 'bg-red-500',emoji: '🩸', label: 'Period'     },
}

const FLOW_LEVELS = [
  { value: 'light',  label: 'Light',   emoji: '💧', color: 'text-sky-400' },
  { value: 'medium', label: 'Medium',  emoji: '💧💧', color: 'text-rose' },
  { value: 'heavy',  label: 'Heavy',   emoji: '💧💧💧', color: 'text-red-600' },
  { value: 'spotting',label:'Spotting',emoji: '•',  color: 'text-pink-400' },
]

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const FLOW_REMEDIES = {
  light: {
    title: 'Light Flow Comfort Tips',
    remedies: [
      { name: 'Stay hydrated', detail: 'Drink 2L of water daily. Light flow can cause mild dehydration and fatigue.' },
      { name: 'Iron maintenance', detail: 'Even light periods deplete iron. Add spinach, lentils, or jaggery to meals this week.' },
      { name: 'Gentle movement', detail: 'Light flow days are great for yoga and walking. Movement boosts endorphins and reduces cramp onset.' },
      { name: 'Chamomile tea', detail: '2 cups daily to support relaxation and mild anti-inflammatory effect.' },
    ]
  },
  medium: {
    title: 'Medium Flow Management',
    remedies: [
      { name: 'Ginger tea (3x daily)', detail: 'Ginger inhibits prostaglandins reducing cramp severity. Boil 1 inch ginger for 10 min.' },
      { name: 'Heat pad therapy', detail: 'Apply warm pad to lower abdomen for 20-min sessions every 1–2 hours.' },
      { name: 'Iron-rich meals', detail: 'Increase iron absorption: spinach + lemon juice, dal + amla, beetroot juice.' },
      { name: 'Magnesium foods', detail: 'Dark chocolate, pumpkin seeds, banana — reduce muscle cramping and bloating.' },
      { name: 'Reduce caffeine', detail: 'Caffeine constricts blood vessels and worsens cramps. Switch to herbal tea.' },
    ]
  },
  heavy: {
    title: 'Heavy Flow — Extra Care Needed',
    remedies: [
      { name: '⚠️ Track your flow', detail: 'If soaking 1+ pad per hour for 2+ hours, see a doctor. Log flow in SmartFlow daily.' },
      { name: 'Iron emergency foods', detail: 'Jaggery water, beetroot juice, pomegranate, spinach every meal. Consider iron supplements with doctor advice.' },
      { name: 'Electrolyte replenishment', detail: 'Coconut water twice daily. Heavy bleeding depletes potassium and sodium.' },
      { name: 'Raspberry leaf tea', detail: 'Traditional uterine tonic — may reduce heavy flow over time. 2 cups daily.' },
      { name: 'Rest prioritised', detail: 'Heavy flow causes significant fatigue. Reduce obligations and sleep 8–9 hours.' },
      { name: 'Medical evaluation', detail: 'Persistent heavy flow warrants investigation for fibroids, polyps, or clotting disorders.' },
    ]
  },
  spotting: {
    title: 'Spotting — What to Watch',
    remedies: [
      { name: 'Note the timing', detail: 'Mid-cycle spotting (day 12–16) is often normal ovulation spotting. Outside this window, log it carefully.' },
      { name: 'Stay hydrated', detail: 'Spotting can cause mild cramping. Warm ginger tea soothes the uterus.' },
      { name: 'Monitor for 2 cycles', detail: 'If spotting is recurrent, track it in SmartFlow and show the pattern to your gynaecologist.' },
      { name: 'Avoid aspirin', detail: 'Aspirin thins blood and can worsen spotting. Use paracetamol if needed for pain.' },
    ]
  },
}

// ── Cycle Prediction Engine ───────────────────────────────────────────────────
function predictFutureCycle(periodStart, periodEnd, cycleLength = 28, logs = []) {
  if (!periodStart) return {}

  const startDate = new Date(periodStart)
  const endDate   = periodEnd ? new Date(periodEnd) : null
  const periodLen = endDate
    ? Math.max(1, Math.round((endDate - startDate) / 86400000) + 1)
    : 5

  const phaseMap = {}
  const today = new Date()
  today.setHours(0,0,0,0)

  // Generate 3 months of predictions (past + future)
  for (let cycleOffset = -1; cycleOffset <= 3; cycleOffset++) {
    const cycleStart = new Date(startDate)
    cycleStart.setDate(cycleStart.getDate() + cycleOffset * cycleLength)

    for (let day = 0; day < cycleLength; day++) {
      const d = new Date(cycleStart)
      d.setDate(d.getDate() + day)
      const key = d.toISOString().split('T')[0]

      let phase
      if (day < periodLen)                              phase = 'Menstrual'
      else if (day < cycleLength * 0.46)               phase = 'Follicular'
      else if (day < cycleLength * 0.57)               phase = 'Ovulation'
      else                                              phase = 'Luteal'

      const isFuture = d >= today
      phaseMap[key] = {
        phase,
        cycleDay: day + 1,
        isPeriod:  day < periodLen,
        isFertile: day >= Math.round(cycleLength * 0.43) && day <= Math.round(cycleLength * 0.57),
        isPeak:    day === Math.round(cycleLength * 0.5),
        isPredicted: isFuture,
      }
    }
  }

  // Overlay actual logged phases
  logs.forEach(log => {
    const key = log.logged_at?.split('T')[0]
    if (key && phaseMap[key] && log.predicted_phase) {
      phaseMap[key].phase = log.predicted_phase
      phaseMap[key].isLogged = true
      phaseMap[key].logId = log.id
    }
  })

  return phaseMap
}

// ── Week Detail Panel ─────────────────────────────────────────────────────────
function WeekDetail({ week, phaseMap, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeUp">
        <div className="flex items-center justify-between p-4 border-b border-blush">
          <h3 className="font-display text-base text-ink">Week Detail</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-rose p-1"><X size={18}/></button>
        </div>
        <div className="p-4 space-y-2">
          {week.map(date => {
            if (!date) return null
            const key = date.toISOString().split('T')[0]
            const info = phaseMap[key]
            const pc   = info ? (PHASE_CONFIG[info.isPeriod ? 'Period' : info.phase] || PHASE_CONFIG.Follicular) : null
            const today = new Date(); today.setHours(0,0,0,0)
            const isToday = date.toDateString() === today.toDateString()

            return (
              <div key={key} className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${isToday ? 'bg-blush border border-rose/30' : 'hover:bg-blush/30'}`}>
                <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0
                  ${isToday ? 'bg-rose text-white' : 'bg-blush text-ink'}`}>
                  <span className="text-xs font-medium leading-none">{DAYS_OF_WEEK[date.getDay()]}</span>
                  <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                </div>
                {pc && info ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                        {pc.emoji} {info.isPeriod ? 'Period' : info.phase}
                      </span>
                      {info.isFertile && !info.isPeriod && (
                        <span className="text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full">🌿 Fertile</span>
                      )}
                      {info.isPeak && (
                        <span className="text-xs bg-sky-100 text-sky-500 px-2 py-0.5 rounded-full">⭐ Peak day</span>
                      )}
                      {info.isPredicted && (
                        <span className="text-[10px] text-ink-soft">predicted</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">Cycle day {info.cycleDay}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ink-soft font-body">No data yet</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Period Setup Modal ────────────────────────────────────────────────────────
function PeriodSetupModal({ onSave, onClose, initial }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    periodStart: initial?.periodStart || today,
    periodEnd:   initial?.periodEnd   || '',
    cycleLength: initial?.cycleLength || 28,
    flow:        initial?.flow        || 'medium',
  })
  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fadeUp">
        <div className="flex items-center justify-between p-4 border-b border-blush">
          <h3 className="font-display text-lg text-ink">🩸 Period Details</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-rose p-1"><X size={18}/></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">When did your period start?</label>
            <input type="date" value={form.periodStart} max={today}
              onChange={e => set('periodStart', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">When did it end? <span className="text-xs">(leave blank if ongoing)</span></label>
            <input type="date" value={form.periodEnd} min={form.periodStart} max={today}
              onChange={e => set('periodEnd', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">
              Average cycle length: <strong>{form.cycleLength} days</strong>
            </label>
            <input type="range" min={21} max={45} value={form.cycleLength}
              onChange={e => set('cycleLength', parseInt(e.target.value))}
              className="w-full accent-rose" />
            <div className="flex justify-between text-xs text-ink-soft mt-1">
              <span>21 days</span><span>45 days</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">Flow intensity</label>
            <div className="grid grid-cols-2 gap-2">
              {FLOW_LEVELS.map(fl => (
                <button key={fl.value} type="button" onClick={() => set('flow', fl.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all
                    ${form.flow===fl.value ? 'border-rose bg-blush text-rose' : 'border-blush-dark text-ink-soft hover:border-rose/30'}`}>
                  <span>{fl.emoji}</span>
                  <span className="font-medium">{fl.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onSave(form)}
            className="btn-primary w-full">
            Save & Predict My Cycle 🌊
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Remedy Suggestion Panel ───────────────────────────────────────────────────
function RemedySuggestions({ flow, phase }) {
  const [open, setOpen] = useState(false)
  if (!flow) return null
  const data = FLOW_REMEDIES[flow]
  if (!data) return null

  return (
    <div className="card border-rose/20">
      <button onClick={() => setOpen(o=>!o)}
        className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-sage" />
          <span className="font-medium text-ink text-sm">Recommended Remedies for Your Flow</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            flow==='heavy' ? 'bg-red-100 text-red-600' :
            flow==='medium' ? 'bg-rose/10 text-rose' :
            'bg-sage/10 text-sage'}`}>
            {flow.charAt(0).toUpperCase()+flow.slice(1)} flow
          </span>
        </div>
        <ChevronRight size={16} className={`text-ink-soft transition-transform ${open?'rotate-90':''}`}/>
      </button>
      {open && (
        <div className="mt-3 space-y-2 animate-fadeUp">
          <p className="text-sm font-semibold text-ink">{data.title}</p>
          {data.remedies.map((r,i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-rose font-bold shrink-0 mt-0.5">✦</span>
              <div>
                <span className="font-medium text-ink">{r.name}: </span>
                <span className="text-ink-soft font-body">{r.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Calendar Page ────────────────────────────────────────────────────────
export default function CycleCalendar() {
  const [currentMonth, setCurrentMonth]   = useState(new Date())
  const [selectedWeek, setSelectedWeek]   = useState(null)
  const [showSetup, setShowSetup]         = useState(false)
  const [periodData, setPeriodData]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_period_data') || 'null') } catch { return null }
  })
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    logsAPI.getAll(0, 200)
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const phaseMap = useMemo(() => {
    if (!periodData?.periodStart) return {}
    return predictFutureCycle(
      periodData.periodStart,
      periodData.periodEnd,
      periodData.cycleLength || 28,
      logs
    )
  }, [periodData, logs])

  const handleSavePeriod = (form) => {
    localStorage.setItem('sf_period_data', JSON.stringify(form))
    setPeriodData(form)
    setShowSetup(false)
    toast.success('Cycle predictions updated! 🌸')
  }

  // Calendar grid
  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(year, month, d))

  // Group into weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i+7))
  }

  // Today's info
  const todayKey  = today.toISOString().split('T')[0]
  const todayInfo = phaseMap[todayKey]
  const todayPhase = todayInfo ? (todayInfo.isPeriod ? 'Period' : todayInfo.phase) : null
  const todayPC   = todayPhase ? PHASE_CONFIG[todayPhase] : null

  // Next period prediction
  const nextPeriodKey = Object.keys(phaseMap).find(k => {
    const d = new Date(k)
    return d > today && phaseMap[k].isPeriod && phaseMap[k].cycleDay === 1
  })

  // Phase legend counts for this month
  const monthCounts = {}
  calendarDays.filter(Boolean).forEach(d => {
    const k = d.toISOString().split('T')[0]
    const info = phaseMap[k]
    if (info) {
      const ph = info.isPeriod ? 'Period' : info.phase
      monthCounts[ph] = (monthCounts[ph]||0)+1
    }
  })

  const prevMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))
  const nextMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display text-ink">Cycle Calendar</h1>
          <p className="text-sm text-ink-soft font-body">Phase predictions for the next 3 months</p>
        </div>
        <button onClick={() => setShowSetup(true)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
          <Droplets size={13}/> {periodData ? 'Update Period' : 'Set Period'}
        </button>
      </div>

      {/* Today's status bar */}
      {todayInfo && todayPC && (
        <div className={`rounded-2xl p-4 mb-4 ${todayPC.bg} border border-current/10`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-ink-soft font-body mb-0.5">Today — Cycle Day {todayInfo.cycleDay}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{todayPC.emoji}</span>
                <span className={`font-display text-lg ${todayPC.text}`}>
                  {todayInfo.isPeriod ? 'Period' : todayInfo.phase} Phase
                </span>
                {todayInfo.isFertile && !todayInfo.isPeriod && (
                  <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full">🌿 Fertile window</span>
                )}
                {todayInfo.isPredicted && (
                  <span className="text-[10px] text-ink-soft bg-white/60 px-1.5 py-0.5 rounded-full">Predicted</span>
                )}
              </div>
            </div>
            {nextPeriodKey && (
              <div className="text-right">
                <p className="text-xs text-ink-soft">Next period in</p>
                <p className={`text-xl font-display ${todayPC.text}`}>
                  {Math.round((new Date(nextPeriodKey)-today)/86400000)} days
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No period data state */}
      {!periodData && (
        <div className="card text-center py-8 mb-4">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display text-base text-ink mb-1">Set your period dates to see predictions</p>
          <p className="text-sm text-ink-soft font-body mb-4">
            Tell SmartFlow when your last period started and ended to generate your 3-month cycle calendar.
          </p>
          <button onClick={() => setShowSetup(true)} className="btn-primary">
            Get Started 🌸
          </button>
        </div>
      )}

      {/* Flow-based remedy suggestions */}
      {periodData?.flow && todayInfo?.isPeriod && (
        <div className="mb-4">
          <RemedySuggestions flow={periodData.flow} phase={todayPhase} />
        </div>
      )}

      {/* Calendar */}
      <div className="card p-3 mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1.5 hover:bg-blush rounded-full transition-colors">
            <ChevronLeft size={18} className="text-ink-soft"/>
          </button>
          <h2 className="font-display text-base text-ink">
            {currentMonth.toLocaleString('default', { month:'long', year:'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-blush rounded-full transition-colors">
            <ChevronRight size={18} className="text-ink-soft"/>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-ink-soft py-1">{d}</div>
          ))}
        </div>

        {/* Weeks — tap to see detail */}
        {weeks.map((week, wi) => (
          <button key={wi} onClick={() => setSelectedWeek(week)}
            className="grid grid-cols-7 w-full hover:bg-blush/30 rounded-xl transition-colors mb-0.5 group">
            {Array.from({length:7}).map((_,di) => {
              const date = week[di] || null
              if (!date) return <div key={di} className="h-10"/>
              const key   = date.toISOString().split('T')[0]
              const info  = phaseMap[key]
              const phase = info ? (info.isPeriod ? 'Period' : info.phase) : null
              const pc    = phase ? PHASE_CONFIG[phase] : null
              const isT   = date.toDateString() === today.toDateString()
              const isFuture = date > today

              return (
                <div key={di} className="flex flex-col items-center justify-center h-10 relative">
                  {/* Phase background dot */}
                  {pc && (
                    <div className="absolute inset-1 rounded-lg opacity-20"
                      style={{ backgroundColor: pc.color }} />
                  )}
                  {/* Today highlight */}
                  {isT && (
                    <div className="absolute inset-1 rounded-lg bg-rose opacity-90 z-10"/>
                  )}
                  <span className={`relative z-20 text-xs font-medium leading-none
                    ${isT ? 'text-white' :
                      pc ? 'text-ink' : 'text-ink-soft'}`}>
                    {date.getDate()}
                  </span>
                  {/* Phase dot */}
                  {pc && !isT && (
                    <span className={`relative z-20 w-1 h-1 rounded-full mt-0.5 ${pc.dot}
                      ${isFuture ? 'opacity-50' : 'opacity-100'}`} />
                  )}
                  {/* Fertile indicator */}
                  {info?.isFertile && !info?.isPeriod && !isT && (
                    <span className="absolute top-0.5 right-1 text-[7px]">🌿</span>
                  )}
                  {/* Peak day */}
                  {info?.isPeak && !isT && (
                    <span className="absolute top-0.5 right-1 text-[7px]">⭐</span>
                  )}
                </div>
              )
            })}
          </button>
        ))}

        {/* Tap hint */}
        <p className="text-center text-[10px] text-ink-soft mt-1">Tap any week row for day-by-day detail</p>
      </div>

      {/* Legend */}
      <div className="card p-3 mb-4">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Phase Legend</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PHASE_CONFIG).map(([phase, pc]) => (
            <div key={phase} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${pc.dot}`}/>
              <span className="text-xs text-ink">{pc.emoji} {pc.label}</span>
              {monthCounts[phase] && (
                <span className="text-[10px] text-ink-soft ml-auto">{monthCounts[phase]}d</span>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 col-span-2 mt-1 pt-1 border-t border-blush">
            <span className="text-[10px]">🌿</span><span className="text-xs text-ink">Fertile window</span>
            <span className="text-[10px] ml-3">⭐</span><span className="text-xs text-ink">Ovulation peak</span>
          </div>
        </div>
      </div>

      {/* Upcoming phase timeline */}
      {periodData && (
        <div className="card mb-4">
          <p className="text-sm font-semibold text-ink mb-3">📆 Next 14 Days</p>
          <div className="space-y-1">
            {Array.from({length:14}).map((_,i) => {
              const d = new Date(today)
              d.setDate(d.getDate()+i)
              const k = d.toISOString().split('T')[0]
              const info = phaseMap[k]
              if (!info) return null
              const phase = info.isPeriod ? 'Period' : info.phase
              const pc = PHASE_CONFIG[phase]
              return (
                <div key={k} className={`flex items-center gap-3 px-3 py-2 rounded-xl
                  ${i===0 ? 'bg-blush border border-rose/20' : ''}`}>
                  <div className="w-8 text-center">
                    <p className="text-[10px] text-ink-soft leading-none">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}
                    </p>
                    <p className="text-sm font-bold text-ink leading-tight">{d.getDate()}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${pc.dot} ${info.isPredicted?'opacity-50':'opacity-100'}`}/>
                  <div className="flex-1">
                    <span className={`text-xs font-medium ${pc.text}`}>
                      {pc.emoji} {phase}
                    </span>
                    <span className="text-xs text-ink-soft ml-2">Day {info.cycleDay}</span>
                  </div>
                  <div className="flex gap-1">
                    {info.isFertile && !info.isPeriod && (
                      <span className="text-[10px] bg-sage/10 text-sage px-1.5 py-0.5 rounded-full">Fertile</span>
                    )}
                    {info.isPeak && (
                      <span className="text-[10px] bg-sky-100 text-sky-500 px-1.5 py-0.5 rounded-full">Peak</span>
                    )}
                    {info.isPredicted && (
                      <span className="text-[10px] text-ink-soft">predicted</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showSetup && (
        <PeriodSetupModal
          initial={periodData}
          onSave={handleSavePeriod}
          onClose={() => setShowSetup(false)}
        />
      )}
      {selectedWeek && (
        <WeekDetail
          week={selectedWeek}
          phaseMap={phaseMap}
          onClose={() => setSelectedWeek(null)}
        />
      )}
    </div>
  )
}
