/** Pure helpers for the emergency training simulator. All scenario thresholds are illustrative. */
export function classifySeverity(value, baseline, abnormal, direction = 'high') {
  if (![value, baseline, abnormal].every(Number.isFinite)) return 'warning'
  const crossed = direction === 'low' ? value <= abnormal : value >= abnormal
  if (crossed) return 'emergency'
  const distance = Math.abs(abnormal - baseline)
  const warningLine = direction === 'low' ? baseline - distance * 0.5 : baseline + distance * 0.5
  const approaching = direction === 'low' ? value <= warningLine : value >= warningLine
  return approaching ? 'warning' : 'healthy'
}

export function formatReading(value, unit) {
  const formatted = Number.isInteger(value) ? String(value) : Number(value).toFixed(1)
  return `${formatted} ${unit}`.trim()
}

export function buildIncident({ scenario, finalValue, outcome, startedAt = new Date().toISOString() }) {
  return {
    id: `INC-${Date.parse(startedAt) || Date.now()}`,
    scenarioId: scenario.id,
    title: scenario.title,
    finalValue,
    unit: scenario.unit,
    outcome,
    startedAt,
    simulated: true,
  }
}
