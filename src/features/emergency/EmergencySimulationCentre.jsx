import GlassCard from '@/components/ui/GlassCard'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import { EMERGENCY_SCENARIOS } from './data/emergencyScenarios'
import useEmergencySimulation from './hooks/useEmergencySimulation'
import ScenarioSelector from './components/ScenarioSelector'
import SimulationMonitor from './components/SimulationMonitor'
import ActionProtocol from './components/ActionProtocol'
import IncidentHistory from './components/IncidentHistory'

/** EmergencySimulationCentre — assembles the local emergency-response training workflow. */
export default function EmergencySimulationCentre() {
  const simulation = useEmergencySimulation()
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-emergency/25 bg-gradient-to-br from-emergency/10 via-space-raised to-primary/5 p-5 sm:p-7">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-emergency/10" />
        <div className="absolute -right-4 -top-8 h-40 w-40 rounded-full border border-emergency/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl"><div className="mb-3 flex items-center gap-2"><span className="rounded-md border border-emergency/30 bg-emergency/10 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-emergency">MISSION SAFETY / TRAINING</span><SimulatedBadge /></div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Emergency Simulation Centre</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">Run controlled crew-health scenarios, practise response checklists and record recovery or escalation outcomes.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-space/50 px-4 py-3"><p className="text-[10px] tracking-[0.16em] text-ink-muted">SIMULATION MODE</p><p className="mt-1 font-mono text-sm text-primary">LOCAL / OFFLINE</p></div>
        </div>
      </div>

      <div className="rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 text-xs leading-relaxed text-ink-muted">
        <strong className="text-warning">Training disclaimer:</strong> All readings, thresholds, timelines and outcomes on this page are illustrative simulations. They are not medical advice, diagnostic criteria or validated flight rules. In a real mission, use approved procedures and qualified medical direction.
      </div>

      <ScenarioSelector scenarios={EMERGENCY_SCENARIOS} selectedId={simulation.scenarioId} onSelect={simulation.selectScenario} />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SimulationMonitor simulation={simulation} />
        <ActionProtocol scenario={simulation.scenario} checkedSteps={simulation.checkedSteps} onToggle={simulation.toggleStep} phase={simulation.phase} />
      </div>

      <IncidentHistory incidents={simulation.incidents} events={simulation.events} />

      <GlassCard className="!border-primary/15">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-ink">Simulation integrity</p><p className="mt-1 text-xs text-ink-muted">No wearable sensors, external services, emergency dispatch or medical records are connected.</p></div><span className="rounded-lg bg-healthy/10 px-3 py-2 text-xs font-medium text-healthy">Sandbox isolated</span></div>
      </GlassCard>
    </div>
  )
}
