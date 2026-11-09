import { STATUS, STATUS_STYLES } from '@/constants/status'

/**
 * HealthScoreRing — circular gauge for a 0 to 100 health score.
 * Props: score (number or null), status ('healthy' | 'warning' | 'emergency'), size (px, default 112).
 * The colour follows the astronaut's status, not the number, so it always matches the badges.
 */
export default function HealthScoreRing({ score, status = STATUS.HEALTHY, size = 112 }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.healthy
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const hasScore = typeof score === 'number'
  const offset = circumference * (1 - (hasScore ? score : 0) / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={hasScore ? `Health score ${score} out of 100` : 'Health score not available'}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
        {hasScore && (
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className={`${style.text} transition-[stroke-dashoffset] duration-500`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="telemetry text-3xl font-medium">{hasScore ? score : '--'}</span>
        <span className="text-xs text-ink-muted">Health score</span>
      </div>
    </div>
  )
}
