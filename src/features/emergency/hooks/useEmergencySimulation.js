import { useMemo, useState } from 'react'
import { EMERGENCY_SCENARIOS } from '../data/emergencyScenarios'
import { buildIncident, classifySeverity } from '../utils/emergencyUtils'

/** Owns one local training scenario, its progression and the session incident log. */
export default function useEmergencySimulation() {
  const [scenarioId, setScenarioId] = useState(EMERGENCY_SCENARIOS[0].id)
  const [value, setValue] = useState(EMERGENCY_SCENARIOS[0].abnormal)
  const [phase, setPhase] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [checkedSteps, setCheckedSteps] = useState([])
  const [incidents, setIncidents] = useState([])
  const [events, setEvents] = useState([])
  const scenario = EMERGENCY_SCENARIOS.find((item) => item.id === scenarioId) ?? EMERGENCY_SCENARIOS[0]
  const direction = scenario.direction
  const severity = useMemo(() => classifySeverity(value, scenario.baseline, scenario.abnormal, direction), [value, scenario, direction])

  function selectScenario(id) {
    const next = EMERGENCY_SCENARIOS.find((item) => item.id === id)
    if (!next) return
    setScenarioId(id); setValue(next.abnormal); setPhase('idle'); setElapsed(0); setCheckedSteps([]); setEvents([])
  }
  function start() {
    setPhase('monitoring'); setElapsed(0); setValue(scenario.abnormal); setCheckedSteps([])
    setEvents([{ id: Date.now(), label: 'Scenario initiated', detail: 'Abnormal simulated reading detected.' }])
  }
  function advance() {
    if (phase !== 'monitoring') return
    setElapsed((current) => current + 1)
    setValue((current) => Math.max(0, current + scenario.recoveryStep * 0.45))
  }
  function toggleStep(index) {
    setCheckedSteps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }
  function addEvent(label, detail) {
    setEvents((current) => [{ id: Date.now() + current.length, label, detail }, ...current])
  }
  function markStable() {
    setValue(scenario.recovery); setPhase('recovered')
    addEvent('Stable reading recorded', 'The scenario reached its configured recovery value.')
    setIncidents((current) => [buildIncident({ scenario, finalValue: scenario.recovery, outcome: 'recovered' }), ...current].slice(0, 12))
  }
  function escalate() {
    setPhase('escalated')
    addEvent('Escalation recorded', 'Training escalation sent to the simulated flight-surgeon workflow.')
    setIncidents((current) => [buildIncident({ scenario, finalValue: value, outcome: 'escalated' }), ...current].slice(0, 12))
  }
  function simulateDeterioration() {
    setValue(scenario.deteriorated); setPhase('monitoring')
    addEvent('Deterioration simulated', 'Reading moved further outside the scenario baseline.')
  }
  function reset() {
    setPhase('idle'); setElapsed(0); setValue(scenario.abnormal); setCheckedSteps([]); setEvents([])
  }

  return { scenario, scenarioId, selectScenario, value, severity, phase, elapsed, checkedSteps, toggleStep, events, incidents, start, advance, markStable, escalate, simulateDeterioration, reset }
}
