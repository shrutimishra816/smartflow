import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionsAPI } from '../api/client'
import PhaseBadge from '../components/shared/PhaseBadge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { AlertTriangle, Leaf, PlusCircle, TrendingUp } from 'lucide-react'

const PHASE_COLORS = {
  Menstrual: '#E8647A', Follicular: '#7BAE9A', Ovulation: '#64B5F6', Luteal: '#E8A95C'
}

export default function Dashboard() {
  const [summary, setSummary]   = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([predictionsAPI.summary(), predictionsAPI.history()])
      .then(([s, h]) => { setSummary(s.data); setHistory(h.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-ink-soft animate-pulse-soft font-body">
      Loading your data…
    </div>
  )

  if (!summary || summary.total_logs === 0) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center animate-fadeUp">
      <div className="text-6xl mb-4">🌸</div>
      <h2 className="text-2xl font-display text-ink mb-2">Welcome to SmartFlow</h2>
      <p className="text-ink-soft font-body mb-8">Start by logging your first day to get personalised insights.</p>
      <Link to="/log" className="btn-primary">Log today's symptoms</Link>
    </div>
  )

  const phaseDistData = Object.entries(summary.phase_distribution || {}).map(([phase, count]) => ({ phase, count }))
  const moodData = history.slice(-14).map(h => ({ date: h.date.slice(5), mood: h.mood, energy: h.energy }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeUp pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-ink">Your Cycle</h1>
          <p className="text-ink-soft text-sm font-body mt-0.5">Here's what SmartFlow sees today</p>
        </div>
        <Link to="/log" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> Log Today
        </Link>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Current phase */}
        <div className="card col-span-2 sm:col-span-1 flex flex-col gap-2">
          <span className="text-xs font-medium text-ink-soft uppercase tracking-wide">Current Phase</span>
          <PhaseBadge phase={summary.current_phase} size="lg" />
          <span className="text-xs text-ink-soft font-body">Day {summary.current_cycle_day}</span>
        </div>

        {/* Fertility */}
        <div className="card">
          <span className="text-xs font-medium text-ink-soft uppercase tracking-wide block mb-2">Fertility</span>
          <div className="text-2xl font-display text-ink">
            {Math.round((summary.fertility_score || 0) * 100)}%
          </div>
          <span className={`text-xs font-medium mt-1 block ${summary.is_fertile_window ? 'text-sage' : 'text-ink-soft'}`}>
            {summary.is_fertile_window ? '🌿 Fertile window' : 'Outside window'}
          </span>
        </div>

        {/* Total logs */}
        <div className="card">
          <span className="text-xs font-medium text-ink-soft uppercase tracking-wide block mb-2">Logs</span>
          <div className="text-2xl font-display text-ink">{summary.total_logs}</div>
          <span className="text-xs text-ink-soft mt-1 block font-body">days tracked</span>
        </div>

        {/* Anomalies */}
        <div className={`card ${summary.anomalies_detected > 0 ? 'border-amber bg-amber/5' : ''}`}>
          <span className="text-xs font-medium text-ink-soft uppercase tracking-wide block mb-2">Alerts</span>
          <div className={`text-2xl font-display ${summary.anomalies_detected > 0 ? 'text-amber' : 'text-ink'}`}>
            {summary.anomalies_detected}
          </div>
          <span className="text-xs text-ink-soft mt-1 block font-body">
            {summary.anomalies_detected > 0 ? '⚠️ anomalies' : '✅ all clear'}
          </span>
        </div>
      </div>

      {/* Phase confidence */}
      {summary.phase_confidence && (
        <div className="card">
          <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Phase Confidence
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.phase_confidence).map(([phase, conf]) => (
              <div key={phase}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-body text-ink">{phase}</span>
                  <span className="font-mono text-ink-soft">{Math.round(conf * 100)}%</span>
                </div>
                <div className="h-2 bg-blush rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${conf * 100}%`, background: PHASE_COLORS[phase] || '#ccc' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood & Energy chart */}
      {moodData.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-4">Mood & Energy (Last 14 days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={moodData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B4F72' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#6B4F72' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0CFDA', fontFamily: 'DM Sans' }} />
              <Line type="monotone" dataKey="mood"   stroke="#E8647A" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#7BAE9A" strokeWidth={2} dot={false} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Phase distribution */}
      {phaseDistData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-4">Phase Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={phaseDistData} barSize={36}>
              <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#6B4F72' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B4F72' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0CFDA', fontFamily: 'DM Sans' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Days">
                {phaseDistData.map((entry) => (
                  <Cell key={entry.phase} fill={PHASE_COLORS[entry.phase] || '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
