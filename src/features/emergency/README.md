# Emergency Simulation Centre

A local-only training feature for six illustrative crew-health scenarios: elevated heart rate, reduced SpO₂, radiation exposure spike, stress/sleep deficit, elevated temperature and abnormal respiration rate.

## Behaviour

- Scenario fixtures and all state are local to the feature.
- `Start simulation` opens the response workflow.
- `Advance 1 minute` moves the simulated reading toward its configured baseline.
- `Simulate worsening` demonstrates deterioration.
- `Record stable` and `Escalate` close the exercise and add a session incident record.
- The event timeline and incident history are held in memory for the current page session only.

## Safety and scope

All thresholds, readings, outcomes and protocol text are illustrative educational content, not validated medical thresholds, diagnoses, treatment recommendations or flight rules. The feature does not connect to sensors, the backend, medical records, mission control or emergency dispatch. Real operations must use approved mission procedures and qualified medical direction.

## Tests

Pure classification, formatting and incident helpers are tested in `utils/emergencyUtils.test.js` using Node's built-in test runner.
