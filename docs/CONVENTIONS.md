# Conventions

## Tech stack (fixed, do not swap)
| Area | Choice | Status |
|---|---|---|
| Frontend | Vite + React | installed |
| Styling | Tailwind CSS | installed |
| Language | JavaScript (no TypeScript) | n/a |
| Charts | Recharts | `npm i recharts` when first chart is built |
| 3D body | Three.js | `npm i three` when the 3D stage starts |
| Backend | Python + FastAPI | not started |
| AI logic | Python + scikit-learn (inside the backend) | not started |
| Database | Firebase **or** MongoDB | undecided |
| Initial data | Simulated | not started |

Install a package only in the stage that uses it.

## Folders (`src/`)
| Folder | Put here |
|---|---|
| `components/ui` | Small reusable pieces (GlassCard, StatusBadge). No API calls. |
| `components/layout` | Page frames (AppShell). |
| `features/<name>` | Everything for one feature (its components, hooks, service). |
| `pages` | One file per screen; they assemble features. |
| `services` | API calls. Only `apiClient.js` uses `fetch`. |
| `hooks` | Shared hooks (`useXxx`). |
| `utils` | Pure helper functions. |
| `constants` | Shared constants (status, thresholds). |

## Components
1. One component per file, filename = component name (`PascalCase.jsx`), default export.
2. Search `components/` before creating one. Never duplicate.
3. Style with Tailwind classes only. Use token names (`text-primary`, `bg-space`), never raw hex.
4. Wrap panels in `<GlassCard>`. Show health state with `<StatusBadge>`.
5. Start with a 1–3 line comment: what it is and its props.

## Design tokens
Background `space` #0B0D17 · Primary #00D4FF · Healthy #00FF9C · Warning #FFB020 · Emergency #FC3D21 · Text `ink` / `ink-muted`.
Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (numbers, via `.telemetry`).
Mobile first: write the base style for phones, add `sm:` `lg:` for larger screens.
Emergency red is reserved for real emergencies.

## Naming
Hooks `useXxx` · services `getXxx` / `postXxx` · constants `UPPER_SNAKE` · branches `feature/<name>`.
