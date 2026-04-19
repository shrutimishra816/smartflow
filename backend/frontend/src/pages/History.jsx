import { useEffect, useState } from 'react'
import { logsAPI } from '../api/client'
import PhaseBadge from '../components/shared/PhaseBadge'
import { Trash2, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import LogSymptoms from './LogSymptoms'

function EditModal({ log, onClose, onSaved }) {
  const prefill = {
    log_date:               log.logged_at?.slice(0, 10),
    cycle_day:              log.cycle_day,
    bbt_celsius:            log.bbt_celsius,
    cervical_mucus_label:   log.cervical_mucus_label || 'Dry',
    cervical_mucus_score:   log.cervical_mucus_score || 1,
    cramping_0_10:          log.cramping_0_10,
    breast_tenderness_0_10: log.breast_tenderness_0_10,
    mood_score_1_10:        log.mood_score_1_10,
    energy_level_1_10:      log.energy_level_1_10,
    libido_1_10:            log.libido_1_10,
    estrogen_e2_pg_ml:      log.estrogen_e2_pg_ml,
    progesterone_ng_ml:     log.progesterone_ng_ml,
    lh_miu_ml:              log.lh_miu_ml,
  }

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-blush">
          <h2 className="font-display text-lg text-ink">Edit Log</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-rose p-1 rounded-full hover:bg-blush transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">
          <LogSymptoms prefill={prefill} editId={log.id} onSaved={onSaved} />
        </div>
      </div>
    </div>
  )
}

function LogCard({ log, onDelete, onEdit }) {
  const [open, setOpen] = useState(false)
  const date = format(new Date(log.logged_at), 'MMM d, yyyy')

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PhaseBadge phase={log.predicted_phase} />
          <div>
            <div className="text-sm font-medium text-ink font-body">{date}</div>
            <div className="text-xs text-ink-soft">Day {log.cycle_day}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {log.is_anomaly === 'True' && (
            <span className="text-xs bg-amber/10 text-amber px-2 py-1 rounded-full">⚠️ Anomaly</span>
          )}
          {log.is_fertile_window === 'True' && (
            <span className="text-xs bg-sage/10 text-sage px-2 py-1 rounded-full">🌿 Fertile</span>
          )}
          <button onClick={() => setOpen(o => !o)} className="text-ink-soft hover:text-ink p-1.5">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onEdit(log)}
            className="text-ink-soft hover:text-rose p-1.5 transition-colors" title="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(log.id)}
            className="text-ink-soft hover:text-rose p-1.5 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-blush pt-3 grid grid-cols-3 gap-3 text-center animate-fadeUp">
          {[
            { label: 'Mood',     val: log.mood_score_1_10,      emoji: '😊' },
            { label: 'Energy',   val: log.energy_level_1_10,    emoji: '⚡' },
            { label: 'Cramping', val: log.cramping_0_10,         emoji: '🔴' },
            { label: 'BBT',      val: log.bbt_celsius ? `${log.bbt_celsius}°C` : '—', emoji: '🌡️' },
            { label: 'Mucus',    val: log.cervical_mucus_label || '—', emoji: '💧' },
            { label: 'Fertility',val: log.fertility_score ? `${Math.round(log.fertility_score * 100)}%` : '—', emoji: '🌸' },
          ].map(({ label, val, emoji }) => (
            <div key={label} className="bg-blush rounded-xl p-2">
              <div className="text-base">{emoji}</div>
              <div className="text-xs text-ink-soft mt-0.5">{label}</div>
              <div className="text-sm font-medium text-ink font-body">{val ?? '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function History() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [editingLog, setEditingLog] = useState(null)

  useEffect(() => {
    logsAPI.getAll()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this log?')) return
    try {
      await logsAPI.delete(id)
      setLogs(prev => prev.filter(l => l.id !== id))
      toast.success('Log deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleSaved = (updatedLog) => {
    setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l))
    setEditingLog(null)
    toast.success('Log updated! 🌊')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-ink-soft animate-pulse-soft">Loading…</div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8 animate-fadeUp">
      <h1 className="text-2xl font-display text-ink mb-1">History</h1>
      <p className="text-ink-soft text-sm font-body mb-6">{logs.length} logs recorded</p>

      {logs.length === 0 ? (
        <div className="text-center text-ink-soft py-16 font-body">No logs yet. Start tracking today! 🌸</div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <LogCard key={log.id} log={log} onDelete={handleDelete} onEdit={setEditingLog} />
          ))}
        </div>
      )}

      {editingLog && (
        <EditModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
