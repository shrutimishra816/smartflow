import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logsAPI } from '../api/client'
import PhaseBadge from '../components/shared/PhaseBadge'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')

const SliderField = ({ label, name, value, onChange, min = 0, max = 10, emoji }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-ink font-body">{emoji} {label}</label>
      <span className="text-sm font-mono text-rose font-medium">{value ?? '—'}</span>
    </div>
    <input type="range" min={min} max={max} value={value ?? Math.round((min + max) / 2)}
      onChange={e => onChange(name, parseInt(e.target.value))}
      className="w-full accent-rose h-2 rounded-full" />
    <div className="flex justify-between text-xs text-ink-soft mt-1">
      <span>{min}</span><span>{max}</span>
    </div>
  </div>
)

const MUCUS_OPTIONS = ['Dry', 'Sticky', 'Creamy', 'Watery', 'EggWhite']
const MUCUS_SCORE   = { Dry: 1, Sticky: 2, Creamy: 3, Watery: 4, EggWhite: 5 }

export default function LogSymptoms({ prefill = null, editId = null, onSaved = null }) {
  const navigate  = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [form, setForm] = useState(prefill || {
    log_date: today,
    cycle_day: 1,
    bbt_celsius: 36.5,
    cervical_mucus_label: 'Dry',
    cervical_mucus_score: 1,
    cramping_0_10: 2,
    breast_tenderness_0_10: 2,
    mood_score_1_10: 6,
    energy_level_1_10: 6,
    libido_1_10: 5,
    estrogen_e2_pg_ml: null,
    progesterone_ng_ml: null,
    lh_miu_ml: null,
  })

  const set = (name, val) => setForm(f => ({ ...f, [name]: val }))

  const handleMucus = (label) =>
    setForm(f => ({ ...f, cervical_mucus_label: label, cervical_mucus_score: MUCUS_SCORE[label] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.log_date > today) {
      toast.error('Cannot log symptoms for a future date')
      return
    }
    setLoading(true)
    try {
      let res
      if (editId) {
        res = await logsAPI.update(editId, form)
        toast.success('Log updated! 🌊')
        if (onSaved) onSaved(res.data)
        return
      } else {
        res = await logsAPI.create(form)
        setPrediction(res.data)
        toast.success('Logged successfully! 🌸')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save log')
    } finally {
      setLoading(false)
    }
  }

  if (prediction) return (
    <div className="max-w-lg mx-auto px-4 py-10 animate-fadeUp pb-20 sm:pb-8">
      <div className="card text-center space-y-4">
        <div className="text-5xl">✨</div>
        <h2 className="text-2xl font-display text-ink">Today's Insight</h2>
        <div className="flex justify-center">
          <PhaseBadge phase={prediction.predicted_phase} size="lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blush rounded-xl p-4">
            <div className="text-xs text-ink-soft uppercase tracking-wide mb-1">Fertility Score</div>
            <div className="text-2xl font-display text-rose">{Math.round((prediction.fertility_score || 0) * 100)}%</div>
          </div>
          <div className={`rounded-xl p-4 ${prediction.is_fertile_window === 'True' ? 'bg-sage/10' : 'bg-blush'}`}>
            <div className="text-xs text-ink-soft uppercase tracking-wide mb-1">Fertile Window</div>
            <div className="text-lg font-display">
              {prediction.is_fertile_window === 'True' ? '🌿 Yes' : 'Not now'}
            </div>
          </div>
        </div>
        {prediction.is_anomaly === 'True' && (
          <div className="bg-amber/10 border border-amber/30 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-amber">⚠️ Unusual pattern detected</p>
            <p className="text-xs text-ink-soft mt-1 font-body">Your data looks different from typical patterns. Consider consulting a healthcare professional if this persists.</p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={() => setPrediction(null)} className="btn-ghost flex-1">Log another</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">Dashboard</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8 animate-fadeUp">
      <h1 className="text-2xl font-display text-ink mb-1">{editId ? 'Edit Log' : 'Log Today'}</h1>
      <p className="text-ink-soft text-sm font-body mb-6">
        {editId ? 'Update your symptoms and re-run prediction' : 'Track your symptoms to get personalised predictions'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Date + Cycle Day */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">Cycle Info</h3>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">📅 Date</label>
            <input
              type="date"
              className="input-field"
              value={form.log_date || today}
              max={today}
              onChange={e => set('log_date', e.target.value)}
            />
            {form.log_date && form.log_date < today && (
              <p className="text-xs text-amber mt-1">📝 Logging for a past date: {form.log_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">🔢 Cycle Day</label>
            <input type="number" min={1} max={40} value={form.cycle_day}
              onChange={e => set('cycle_day', parseInt(e.target.value))}
              className="input-field" required />
          </div>
        </div>

        {/* Physical */}
        <div className="card space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">Physical</h3>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">🌡️ BBT (°C)</label>
            <input type="number" step="0.1" min={35} max={38.5} value={form.bbt_celsius}
              onChange={e => set('bbt_celsius', parseFloat(e.target.value))}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">💧 Cervical Mucus</label>
            <div className="flex flex-wrap gap-2">
              {MUCUS_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => handleMucus(opt)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                    ${form.cervical_mucus_label === opt
                      ? 'bg-rose text-white border-rose'
                      : 'bg-white text-ink-soft border-blush-dark hover:border-rose/40'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">Symptoms</h3>
          <SliderField label="Cramping" name="cramping_0_10" value={form.cramping_0_10} onChange={set} emoji="🔴" />
          <SliderField label="Breast Tenderness" name="breast_tenderness_0_10" value={form.breast_tenderness_0_10} onChange={set} emoji="💗" />
        </div>

        {/* Wellbeing */}
        <div className="card space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">Wellbeing</h3>
          <SliderField label="Mood" name="mood_score_1_10" value={form.mood_score_1_10} onChange={set} min={1} emoji="😊" />
          <SliderField label="Energy Level" name="energy_level_1_10" value={form.energy_level_1_10} onChange={set} min={1} emoji="⚡" />
          <SliderField label="Libido" name="libido_1_10" value={form.libido_1_10} onChange={set} min={1} emoji="💫" />
        </div>

        <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
          {loading ? 'Analysing…' : editId ? 'Update Log 🌊' : 'Save & Get Prediction 🌸'}
        </button>
      </form>
    </div>
  )
}
