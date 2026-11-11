import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import { formatReading } from '../utils/emergencyUtils'
import SeverityIndicator from './SeverityIndicator'

/** SimulationMonitor — displays the active reading and training controls. Props: simulation. */
export default function SimulationMonitor({ simulation }) {
  const { scenario, value, severity, phase, elapsed, start, advance, markStable, escalate, simulateDeterioration, reset } = simulation
  const delta = Math.abs(value - scenario.baseline)
  const range = Math.max(Math.abs(scenario.abnormal - scenario.baseline) * 1.35, 1)
  const bar = Math.min(100, Math.max(4, (delta / range) * 100))
  return (
    <GlassCard className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[10px] font-semibold tracking-[0.18em] text-ink-muted">LIVE TRAINING MONITOR</p><h2 className="mt-1 text-lg font-semibold">{scenario.metric}</h2><p className="mt-1 text-xs text-ink-muted">{scenario.system}</p></div>
        <SimulatedBadge />
      </div>
      <div className="my-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-ink-muted">Current reading</p><p className={`telemetry mt-2 text-3xl font-semibold ${severity === 'emergency' ? 'text-emergency' : severity === 'warning' ? 'text-warning' : 'text-healthy'}`}>{formatReading(value, scenario.unit)}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-ink-muted">Scenario baseline</p><p className="telemetry mt-2 text-2xl font-semibold text-ink">{formatReading(scenario.baseline, scenario.unit)}</p><p className="mt-1 text-[11px] text-ink-muted">{scenario.healthyRange}</p></div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex justify-between text-xs text-ink-muted"><span>Deviation from baseline</span><span className="telemetry">{Math.round(bar)}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-all duration-500 ${severity === 'emergency' ? 'bg-emergency' : severity === 'warning' ? 'bg-warning' : 'bg-healthy'}`} style={{ width: `${bar}%` }} /></div>
      </div>
      <SeverityIndicator severity={severity} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted"><span>Elapsed simulation time</span><span className="telemetry text-ink">{String(elapsed).padStart(2, '0')} min</span></div>
      <div className="mt-5 flex flex-wrap gap-2">
        {phase === 'idle' && <Button onClick={start}>Start simulation</Button>}
        {phase === 'monitoring' && <><Button onClick={advance}>Advance 1 minute</Button><Button variant="secondary" onClick={markStable}>Record stable</Button><Button variant="danger" onClick={escalate}>Escalate</Button><Button variant="ghost" onClick={simulateDeterioration}>Simulate worsening</Button></>}
        {(phase === 'recovered' || phase === 'escalated') && <Button onClick={reset}>Reset scenario</Button>}
        {phase === 'idle' && <Button variant="ghost" onClick={reset}>Reset</Button>}
      </div>
      {phase === 'recovered' && <p className="mt-3 rounded-lg border border-healthy/30 bg-healthy/10 p-3 text-sm text-healthy">Stable reading recorded. Review the incident log before starting another exercise.</p>}
      {phase === 'escalated' && <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">Simulated escalation recorded. No real message was sent.</p>}
    </GlassCard>
  )
}
