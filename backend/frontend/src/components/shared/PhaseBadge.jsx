const PHASE_CONFIG = {
  Menstrual:  { emoji: '🔴', label: 'Menstrual',  cls: 'phase-menstrual'  },
  Follicular: { emoji: '🌱', label: 'Follicular', cls: 'phase-follicular' },
  Ovulation:  { emoji: '💙', label: 'Ovulation',  cls: 'phase-ovulation'  },
  Luteal:     { emoji: '🌕', label: 'Luteal',     cls: 'phase-luteal'     },
}

export default function PhaseBadge({ phase, size = 'md' }) {
  const config = PHASE_CONFIG[phase] || { emoji: '❓', label: phase, cls: '' }
  const sizeClass = size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-3 py-1'

  return (
    <span className={`phase-badge ${config.cls} ${sizeClass}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}

export { PHASE_CONFIG }
