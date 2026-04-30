<div align="center">

# WORKOUT MASTER

**AI-powered progressive overload training platform**

[![CI](https://github.com/00Manas-Singh00/Workout-Master/actions/workflows/ci.yml/badge.svg)](https://github.com/00Manas-Singh00/Workout-Master/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-19%20passing-brightgreen)](https://github.com/00Manas-Singh00/Workout-Master/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)](https://web.dev/progressive-web-apps/)
[![API Docs](https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger)](http://localhost:5000/api/docs)

[Live Demo](https://workout-master.vercel.app) · [API Documentation](http://localhost:5000/api/docs) · [Report Bug](https://github.com/00Manas-Singh00/Workout-Master/issues)

</div>

---

## What it does

Workout Master is not a simple workout logger. It tracks performance at the *set level*, computes per-exercise estimated 1-rep maxes, and runs a **progression state machine** that automatically decides whether each exercise should progress load, hold, or deload — all without manual input.

**Key differentiators over a basic CRUD fitness app:**
- Progression engine with 5 distinct states (up / hold / deload / stagnant / readiness-block)
- AI coaching grounded in real training data, not generic LLM outputs
- WebSocket-driven real-time rest timer (no polling)
- Full analytics pipeline from MongoDB aggregations to interactive charts
- Production-grade CI/CD, Redis caching, Zod validation, Winston logging, and Sentry monitoring

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)               │
│  Clerk Auth  ·  Recharts  ·  socket.io-client  ·  PWA  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + WSS
┌────────────────────────▼────────────────────────────────┐
│              EXPRESS SERVER (Node 20, ESM)              │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  REST API   │  │  socket.io   │  │  Swagger UI   │ │
│  │  /api/v1    │  │  (WS timer)  │  │  /api/docs    │ │
│  └──────┬──────┘  └──────────────┘  └───────────────┘ │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │              Middleware Stack                    │   │
│  │  Clerk JWT · Rate Limit · Redis Cache · Sentry  │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                               │
│  ┌──────▼──────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Progression │  │  Gemini AI │  │    Analytics   │  │
│  │   Engine    │  │  (Coach +  │  │  (Aggregation  │  │
│  │ (State FSM) │  │  Workouts) │  │   Pipelines)   │  │
│  └─────────────┘  └────────────┘  └────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼──────┐               ┌──────▼──────┐
   │   MongoDB   │               │    Redis    │
   │  (Mongoose) │               │  (Cache +   │
   │             │               │   Sessions) │
   └─────────────┘               └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite 5 | Fast HMR, ES module builds |
| Styling | Vanilla CSS (Utilitarian design) | Zero runtime, full control |
| Charts | Recharts | Composable, accessible SVG charts |
| Auth | Clerk | Production-grade auth without DIY JWT |
| Real-time | socket.io | WebSocket rest timer, no polling |
| AI | Google Gemini 2.5 Flash | Context-grounded coaching + workout generation |
| Backend | Node 20 + Express + ESM | Modern JS, no transpilation needed |
| Database | MongoDB + Mongoose | Flexible schema for exercise/set hierarchy |
| Caching | Redis | Sub-ms session reads, analytics cache |
| Validation | Zod | Schema-first, runtime-safe request parsing |
| Logging | Winston + Request IDs | Structured, traceable production logs |
| Security | Helmet + express-rate-limit | OWASP headers, per-route throttling |
| Monitoring | Sentry | Real-time error tracking + session replay |
| Testing | Jest + Supertest + mongodb-memory-server | Unit + integration, no live DB needed |
| CI/CD | GitHub Actions | Lint → Test → Build on every push |
| Deployment | Vercel | Zero-config frontend + serverless backend |
| PWA | vite-plugin-pwa + Workbox | Installable on iOS/Android, offline cache |

---

## Core Features

### 🧠 Progression State Machine
Every exercise independently tracks its progression state:

```
           ┌─────────────────────────────────────┐
           │         Session Completed            │
           └──────────────┬──────────────────────┘
                          │
           ┌──────────────▼──────────────────────┐
           │     Readiness Check (RPE + sleep)    │
           │         avg readiness ≤ 2.5?         │
           └──────────┬──────────────┬────────────┘
                      │ YES          │ NO
                ┌─────▼─────┐  ┌────▼──────────────────────┐
                │   HOLD    │  │   Failed min reps twice?   │
                └───────────┘  └────┬──────────────────┬────┘
                                    │ YES              │ NO
                              ┌─────▼──────┐    ┌─────▼──────────────┐
                              │   DELOAD   │    │ Hit rep max at      │
                              │ Load -5kg  │    │  low RPE twice?     │
                              └────────────┘    └──┬──────────────┬───┘
                                                   │ YES          │ NO
                                             ┌─────▼────┐  ┌─────▼──────┐
                                             │    UP    │  │    HOLD    │
                                             │ Load+2.5 │  │ Same load  │
                                             └──────────┘  └────────────┘
```

### 📊 Analytics Dashboard
- **Volume trend** — sessions per week (8-week window) via MongoDB `$isoWeek` aggregation
- **Muscle radar** — frequency breakdown across all completed sessions
- **1RM leaderboard** — exercises ranked by estimated max, with progression state badge
- **Adherence ring** — animated SVG arc of completion rate
- Animated count-up KPI cards on mount

### 🤖 AI Coach (`/coach`)
The Gemini prompt is dynamically built with the user's actual data before every call:
- Last 8 completed sessions with muscles targeted
- Top 10 exercises by estimated 1RM + their progression state
- Current streak and total session count

This means responses like *"Your squat is in deload state — reduce load by 5kg this session"* are grounded in real numbers, not generic advice.

### ⏱ WebSocket Rest Timer
After each set is logged, the server starts a countdown:
```
Client logs set → server:timer:start → server emits timer:tick every 1s
                                     → server emits timer:done at 0
```
Timer state lives on the server — no drift, no polling. The overlay is dismissed with "Skip Rest" or automatically after the "DONE" state.

### 📱 Progressive Web App
Add to Home Screen on iOS/Android. Workbox caches:
- Static assets (aggressive, CacheFirst)
- Google Fonts (1-year CacheFirst)
- Analytics API (StaleWhileRevalidate, 1h TTL)

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Clerk account (free)
- Google AI Studio key (free, Gemini 2.5 Flash)

### Installation

```bash
# Clone
git clone https://github.com/00Manas-Singh00/Workout-Master.git
cd Workout-Master

# Install all dependencies (root + frontend)
npm run install-all
```

### Environment Variables

**Server** (`/server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workout-master
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
GEMINI_API_KEY=AIza...
NODE_ENV=development
LOG_LEVEL=info

# Optional
SENTRY_DSN=https://...@sentry.io/...
ENABLE_SWAGGER=true
```

**Frontend** (`/frontend/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000

# Optional
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Running locally

```bash
# Start both frontend (port 5173) and backend (port 5000) concurrently
npm run dev
```

API documentation available at **http://localhost:5000/api/docs**

---

## Testing

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage
```

Tests cover:
- **`progressionService`** — 19 unit tests across all state machine branches + edge cases (cap/floor values, precedence rules)
- **Analytics API** — 4 integration tests (auth, shape, empty state)
- **Auth API** — sync, update, and retrieval flows

---

## CI/CD Pipeline

Every push triggers:
```
Push → ESLint → Jest (coverage) → Vite Build
                                       │
                             Artifacts uploaded
                             (coverage report, dist)
```

Vercel handles production deployment automatically on merge to `main`.

---

## API Reference

Full interactive documentation: **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Volume trends, 1RM leaderboard, adherence |
| `POST` | `/api/chat/message` | AI coach (Gemini, user-context grounded) |
| `POST` | `/api/sessions` | Create a planned session |
| `POST` | `/api/sessions/:id/start` | Start a session (begin tracking) |
| `POST` | `/api/sessions/:id/log-set` | Log a completed set |
| `POST` | `/api/sessions/:id/complete` | Complete session + trigger progression update |
| `GET` | `/api/recommendations/:exerciseKey` | Next load/rep suggestion from progression engine |
| `GET` | `/health` | Service health + uptime |

---

## Talking Points (For Interviews)

> *"It's a full-stack fitness platform with a Node/Express/MongoDB backend, Redis caching layer, Clerk authentication, and Gemini AI integration. The interesting part is the progression engine — it tracks per-exercise RPE, readiness scores, and 1RM estimates to automatically decide whether to progress load, hold, or deload each exercise using a state machine. I also built a WebSocket-driven live session timer, surfaced all training data into an analytics dashboard with MongoDB aggregation pipelines and Recharts, and added a context-aware AI coach that grounds Gemini responses in the user's actual training history. The whole thing is covered by CI/CD, has error monitoring via Sentry, and is installable as a PWA."*

---

<div align="center">
  <p>Built by <a href="https://github.com/00Manas-Singh00">Manas Singh</a></p>
</div>
