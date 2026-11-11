# VitalOrbit
AI-powered astronaut health monitoring.
Frontend: React + Vite + Tailwind CSS (JavaScript). Planned: Recharts, Three.js, FastAPI + scikit-learn backend, Firebase or MongoDB. See `docs/CONVENTIONS.md`.

## Run
```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
npm run build    # production build
npm test         # unit tests (Node 20 or newer)
```
The dashboard uses simulated data until the backend exists (see `VITE_USE_MOCK_DATA` in `.env.example`).
See `docs/API_CONTRACT.md` and `docs/CONVENTIONS.md` before contributing.
