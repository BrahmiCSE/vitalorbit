import GlassCard from '@/components/ui/GlassCard'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import AlertSeverityBadge from './AlertSeverityBadge'
import useRisk from '../hooks/useRisk'
import useNow from '@/hooks/useNow'
import { STATUS_STYLES } from '@/constants/status'
import { formatTimeAgo } from '@/utils/format'
import { formatWithUnit } from '@/utils/vitalStatus'

/**
 * AiSummaryPanel — risk level, summary, detected anomalies and plain-language explanations for one astronaut.
 * It loads its own RiskAssessment. Props: astronaut (Astronaut).
 * Until the backend model exists this is rule-based simulated output, and it says so.
 */
const RISK_TO_STATUS = { low: 'healthy', moderate: 'warning', high: 'warning', critical: 'emergency' }
const RISK_LABEL = { low: 'Low risk', moderate: 'Moderate risk', high: 'High risk', critical: 'Critical risk' }

export default function AiSummaryPanel({ astronaut }) {
  const { data: risk, loading, error, refresh } = useRisk(astronaut.id)
  const now = useNow(15000)
  const anomalies = risk?.anomalies ?? []
  const style = risk ? STATUS_STYLES[RISK_TO_STATUS[risk.riskLevel] ?? 'healthy'] : null

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink-muted">AI health summary</h2>
        <SimulatedBadge label="Simulated AI" />
      </div>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-8 w-40" label="Loading AI summary" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {!loading && error && !risk && (
        <ErrorState compact title="Could not load the AI summary" message="The assessment for this astronaut is unavailable right now." onRetry={refresh} />
      )}

      {risk && (
        <>
          {error && <p role="status" className="mb-3 text-sm text-warning">Could not refresh. Showing the last assessment received.</p>}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.text} ${style.bg} ${style.ring}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {RISK_LABEL[risk.riskLevel] ?? risk.riskLevel}
            </span>
            <span className="text-sm text-ink-muted">
              Risk score <span className="telemetry text-ink">{risk.score}</span>/100 (higher is riskier)
            </span>
          </div>

          <p className="mt-3 text-sm">{risk.summary}</p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-ink-muted">Detected anomalies</h3>
          {anomalies.length > 0 ? (
            <ul className="space-y-3">
              {anomalies.map((a) => (
                <li key={`${a.metric}-${a.kind}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertSeverityBadge severity={a.severity} />
                    <span className="text-sm font-medium">{a.label}</span>
                    {a.kind === 'trend' && <span className="text-xs text-ink-muted">Early signal</span>}
                  </div>
                  <p className="telemetry mt-2 text-sm">
                    {formatWithUnit(a.observed, a.unit)}
                    <span className="font-sans text-xs text-ink-muted"> observed, expected {a.expected}</span>
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{a.explanation}</p>
                </li>
              ))}
            </ul>
          ) : risk.factors?.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-sm text-ink-muted">
              {risk.factors.map((f) => <li key={f}>{f}</li>)}
            </ul>
          ) : (
            <EmptyState icon="check" tone="healthy" title="No anomalies detected" message="Every monitored vital is inside its normal range." />
          )}

          <p className="mt-4 text-xs text-ink-muted">
            Updated {formatTimeAgo(risk.generatedAt, now)}. Simulated, rule-based output for the demo. Not medical advice.
          </p>
        </>
      )}
    </GlassCard>
  )
}
