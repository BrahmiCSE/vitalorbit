// Simulated crew and mission. Everything here is fictional demo data.
// Each profile sets resting values and, optionally, a repeating "episode" that pushes some
// vitals toward warning or emergency so the UI states can be seen without a real backend.
//   episode.effects = change applied at the peak of the episode (added to the resting value)
//   episode.periodMin = length of one cycle, phase = shifts when the cycle starts (radians)

export const MOCK_MISSION = {
  id: 'msn_001',
  name: 'Orbital Station Alpha, Expedition 7',
  vehicle: 'Orbital Station Alpha',
  phase: 'On-orbit operations',
  launchDate: '2026-09-10T00:00:00Z',
  plannedEndDate: '2027-03-09T00:00:00Z',
  source: 'simulated',
}

export const MOCK_CREW = [
  {
    id: 'ast_001', name: 'Cmdr. A. Rivera', role: 'Commander', seed: 1,
    base: { heartRate: 68, spo2: 97, respiratoryRate: 16, systolic: 124, diastolic: 80, bodyTemperatureC: 36.9, stressIndex: 30, sleepHours: 7.1, radiationDoseMsv: 0.8 },
    episode: null,
  },
  {
    id: 'ast_002', name: 'Eng. K. Tanaka', role: 'Flight Engineer', seed: 2,
    // Borderline sleep and recurring stress peaks: crosses into warning when stress peaks.
    base: { heartRate: 72, spo2: 97, respiratoryRate: 16, systolic: 122, diastolic: 79, bodyTemperatureC: 36.8, stressIndex: 50, sleepHours: 6.3, radiationDoseMsv: 0.9 },
    episode: { periodMin: 35, phase: 0.6, effects: { stressIndex: 22, heartRate: 14, systolic: 8 } },
  },
  {
    id: 'ast_003', name: 'Dr. N. Okafor', role: 'Medical Officer', seed: 3,
    base: { heartRate: 63, spo2: 98, respiratoryRate: 14, systolic: 118, diastolic: 77, bodyTemperatureC: 36.7, stressIndex: 24, sleepHours: 7.6, radiationDoseMsv: 0.7 },
    episode: null,
  },
  {
    id: 'ast_004', name: 'Spec. L. Haddad', role: 'Mission Specialist', seed: 4,
    // Oxygen saturation dips on a 50 minute cycle: warning most cycles, emergency near the peak.
    base: { heartRate: 74, spo2: 97, respiratoryRate: 16, systolic: 120, diastolic: 78, bodyTemperatureC: 36.8, stressIndex: 30, sleepHours: 6.6, radiationDoseMsv: 0.9 },
    episode: { periodMin: 50, phase: 2.2, effects: { spo2: -8, heartRate: 24, respiratoryRate: 6, stressIndex: 18 } },
  },
]
