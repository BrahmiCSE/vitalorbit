/** Educational scenarios for exercising the emergency-response interface. Values are illustrative, not clinical thresholds. */
export const EMERGENCY_SCENARIOS = [
  {
    id: 'high-heart-rate', title: 'Elevated heart rate', system: 'Cardiovascular', metric: 'Heart rate', unit: 'bpm',
    baseline: 74, abnormal: 132, direction: 'high', recoveryStep: -8, healthyRange: 'Illustrative baseline: 60–100 bpm',
    explanation: 'The simulated heart-rate reading has risen above this scenario’s configured baseline.',
    protocol: ['Confirm the reading and sensor contact.', 'Check the astronaut’s symptoms and recent activity.', 'Pause strenuous activity and follow the mission medical checklist.', 'Recheck the reading and record the response.', 'Escalate to the flight surgeon if the reading persists or symptoms worsen.'],
    recovery: 88, deteriorated: 158,
  },
  {
    id: 'low-spo2', title: 'Reduced oxygen saturation', system: 'Respiratory', metric: 'SpO₂', unit: '%',
    baseline: 98, abnormal: 89, direction: 'low', recoveryStep: 2, healthyRange: 'Illustrative baseline: 95–100%',
    explanation: 'The simulated oxygen-saturation reading has fallen below this scenario’s configured baseline.',
    protocol: ['Verify sensor placement and signal quality.', 'Assess breathing, alertness and reported symptoms.', 'Follow the spacecraft oxygen-system and medical checklist.', 'Repeat the measurement and document the trend.', 'Escalate immediately through the mission medical chain if the reading remains abnormal or symptoms are present.'],
    recovery: 95, deteriorated: 82,
  },
  {
    id: 'radiation-spike', title: 'Radiation exposure spike', system: 'Radiation', metric: 'Radiation dose', unit: 'mSv/day',
    baseline: 0.8, abnormal: 4.6, direction: 'high', recoveryStep: -0.8, healthyRange: 'Illustrative mission baseline: 0.8 mSv/day',
    explanation: 'The simulated dose-rate indicator has increased relative to the scenario baseline.',
    protocol: ['Verify the dosimeter reading and timestamp.', 'Check mission radiation and space-weather advisories.', 'Follow the mission shelter / exposure-minimisation checklist.', 'Record the estimated exposure and duration.', 'Notify mission control and the radiation-health specialist.'],
    recovery: 1.2, deteriorated: 7.2,
  },
  {
    id: 'stress-sleep', title: 'High stress / sleep deficit', system: 'Behavioural health', metric: 'Stress index', unit: '/100',
    baseline: 24, abnormal: 86, direction: 'high', recoveryStep: -9, healthyRange: 'Illustrative baseline: stress index 0–40; sleep target is mission-defined',
    explanation: 'The simulated stress index is elevated and the associated sleep record is below the scenario target.',
    protocol: ['Confirm the self-report and sleep-log data.', 'Check workload, schedule and recent sleep opportunity.', 'Offer the approved rest and wellbeing resources.', 'Arrange a private check-in with the crew medical / behavioural-health lead.', 'Escalate if distress affects safety or the astronaut requests urgent support.'],
    recovery: 39, deteriorated: 96,
  },
  {
    id: 'temperature', title: 'Elevated body temperature', system: 'Thermoregulation', metric: 'Body temperature', unit: '°C',
    baseline: 36.7, abnormal: 38.4, direction: 'high', recoveryStep: -0.3, healthyRange: 'Illustrative baseline: 36.1–37.2 °C',
    explanation: 'The simulated temperature is above the configured scenario baseline.',
    protocol: ['Repeat the measurement using the approved method.', 'Check symptoms, recent exercise and environmental conditions.', 'Follow the mission medical checklist for elevated temperature.', 'Record repeat readings and associated symptoms.', 'Contact the flight surgeon for persistent elevation or concerning symptoms.'],
    recovery: 37.1, deteriorated: 39.2,
  },
  {
    id: 'respiration', title: 'Abnormal respiration rate', system: 'Respiratory', metric: 'Respiratory rate', unit: 'breaths/min',
    baseline: 16, abnormal: 31, direction: 'high', recoveryStep: -3, healthyRange: 'Illustrative baseline: 12–20 breaths/min',
    explanation: 'The simulated breathing-rate reading is outside this scenario’s configured baseline.',
    protocol: ['Verify the measurement and observe breathing pattern.', 'Ask about breathlessness, chest discomfort or dizziness.', 'Follow the mission respiratory assessment checklist.', 'Repeat the measurement after the approved observation interval.', 'Escalate promptly if abnormal breathing persists or symptoms are present.'],
    recovery: 19, deteriorated: 38,
  },
]
