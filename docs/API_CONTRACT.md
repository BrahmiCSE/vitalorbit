# VitalOrbit API Contract (v1)

This is the agreement between frontend and backend. **If you change a shape, update this file in the same commit.**

- **Base URL:** `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`, the FastAPI dev server)
- **Format:** JSON, UTF-8. Field names are `camelCase`. Timestamps are ISO 8601 UTC (`2026-11-09T11:00:00Z`).
- **Auth:** not defined yet. Reserved for a later stage (`Authorization: Bearer <token>`).

## 1. Response envelope

Success:
```json
{ "data": { }, "meta": { } }
```
`meta` is optional (used for pagination: `{ "page": 1, "pageSize": 50, "total": 120 }`).

Error (any non-2xx):
```json
{ "error": { "code": "NOT_FOUND", "message": "Astronaut not found" } }
```
Codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `NOT_FOUND` (404), `INTERNAL_ERROR` (500).

## 2. Shared enums

| Name | Values |
|---|---|
| `status` | `healthy`, `warning`, `emergency` |
| `severity` (alerts) | `info`, `warning`, `emergency` |
| `riskLevel` | `low`, `moderate`, `high`, `critical` |

## 3. Data models

**Astronaut**
```json
{ "id": "ast_001", "name": "Cmdr. A. Rivera", "role": "Commander",
  "status": "healthy", "lastUpdated": "2026-11-09T11:00:00Z" }
```

**VitalReading**
```json
{ "astronautId": "ast_001", "timestamp": "2026-11-09T11:00:00Z",
  "heartRate": 72, "spo2": 98, "respiratoryRate": 16,
  "bloodPressure": { "systolic": 118, "diastolic": 76 },
  "bodyTemperatureC": 36.7, "stressIndex": 22,
  "sleepHours": 7.2, "radiationDoseMsv": 0.9,
  "source": "simulated" }
```
`source` is `simulated` or `sensor`. All data is `simulated` for now.
Units: heartRate bpm · spo2 % · respiratoryRate breaths/min · bloodPressure mmHg · stressIndex 0–100 · radiationDoseMsv millisieverts (per day).

**Alert**
```json
{ "id": "alt_104", "astronautId": "ast_001", "severity": "warning",
  "message": "SpO2 trending below 95%", "createdAt": "2026-11-09T10:55:00Z",
  "acknowledged": false }
```

**RiskAssessment** (AI output)
```json
{ "astronautId": "ast_001", "riskLevel": "low", "score": 18,
  "summary": "Vitals stable.", "factors": ["Sleep slightly below target"],
  "generatedAt": "2026-11-09T11:00:00Z" }
```
`score` is 0–100 (higher = riskier).

## 4. Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/astronauts` | `Astronaut[]` |
| GET | `/astronauts/:id` | `Astronaut` |
| GET | `/astronauts/:id/vitals/latest` | `VitalReading` |
| GET | `/astronauts/:id/vitals?from=&to=&page=&pageSize=` | `VitalReading[]` + `meta` |
| POST | `/astronauts/:id/vitals` | `VitalReading` (body: a VitalReading without `astronautId`) |
| GET | `/astronauts/:id/risk` | `RiskAssessment` |
| GET | `/alerts?status=open&severity=` | `Alert[]` |
| POST | `/alerts/:id/acknowledge` | `Alert` |

## 5. Backend notes (Python + FastAPI)

- **camelCase on the wire.** Python code uses `snake_case`. Pydantic models use `alias_generator=to_camel` so JSON still matches this file.
- **Error envelope.** FastAPI's default error is `{"detail": ...}`. The backend must add exception handlers so every error uses the envelope in section 1.
- **IDs are opaque strings.** This works with either Firebase document IDs or MongoDB ObjectIds. The frontend never parses an ID.
- **CORS.** Allow `http://localhost:5173` (Vite dev server).
- **Risk endpoint.** `/astronauts/:id/risk` is computed by the scikit-learn model in the backend. The frontend only displays it.
- **Simulated data.** The backend generates readings with a simulator (stage 3). Vitals can drift toward warning and emergency so the UI can be tested.
- **Docs.** FastAPI serves interactive docs at `/docs`. Keep them in sync with this file.

## 6. Mocking

Until the backend exists, frontend devs return fixtures shaped exactly like section 3 from `src/services/` functions. Components must not know whether data is mocked.
