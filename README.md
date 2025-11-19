# Noesis Foundations

A monorepo demo of **Noesis Foundations: Fractions as Magnitudes**, featuring a Vite + React frontend, an Express + Prisma backend, and a PostgreSQL database. The lesson flow demonstrates diagnostics, adaptive sequencing, telemetry, and LLM-powered hints.

## Tech stack

- Frontend: Vite, React, TypeScript
- Backend: Express, TypeScript, Prisma ORM
- Database: PostgreSQL
- Testing: Vitest (backend adaptive engine)

## Repository layout

```
/frontend    # Vite React app
/backend     # Express API, Prisma schema, adaptive engine
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   npm install --workspace backend
   npm install --workspace frontend
   ```
2. **Environment variables**
   ```bash
   cp .env.example .env
   # update DATABASE_URL and OPENAI_API_KEY
   ```
3. **Database setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run db:seed   # optional reset helper
   cd ..
   ```
4. **Run dev servers**
   ```bash
   npm run dev
   ```
   The backend listens on `http://localhost:4000`, and the Vite dev server runs on `http://localhost:5173` with `/api` proxied to the backend.

## Key backend endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/session` | Create a learner session |
| POST | `/api/events` | Ingest telemetry events |
| POST | `/api/next-step` | Get next lesson step from adaptive engine |
| POST | `/api/tutor` | Fetch LLM hint |
| GET | `/api/session/:sessionId/summary` | Retrieve aggregate summary |

## Adaptive engine

- Tracks recent accuracy, attempts, hint usage, and dwell time from telemetry events.
- Switches representations or sends remedial steps when accuracy drops.
- Persists learner state aggregates in PostgreSQL for summary view.
- Unit tests live in `backend/src/services/__tests__/adaptiveEngine.test.ts`.

## Frontend flow

1. **Welcome** → starts session via `/api/session`.
2. **Diagnostic** → captures quick answers and emits events.
3. **Lesson** → renders adaptive steps, supports numeric/choice inputs, and surfaces hints via `/api/tutor`.
4. **Summary** → fetches summary metrics from backend and presents guidance.

The lesson UI includes interactive number lines, bars, and circles plus event logging for answers, hints, and step timing.

## Telemetry & analytics

- Frontend batches events with `/api/events` (answer submissions, hints, step timing).
- Backend stores events in PostgreSQL and aggregates learner performance for adaptive decisions and summary copy.

## Testing

Run backend unit tests (adaptive engine) with:

```bash
npm run test
```

## Notes

- Set `OPENAI_API_KEY` to enable real tutor hints; without it, the backend returns a generic helper message.
- The repo avoids bundling secrets—configure everything via `.env`.
- When running inside Docker, forward ports 4000 (API) and 5173 (frontend).
