# Workout Master Industry-Ready Implementation Spec

## 1. Scope and Goal

This spec defines a production-ready implementation plan for evolving Workout Master from MVP into an adaptive training product.

Deliverables in this spec:
- Exact Mongoose schemas (drop-in model definitions)
- API contract with request/response payloads
- Ticket-by-ticket acceptance criteria

Out of scope for this iteration:
- Native mobile apps
- Wearable integrations (Apple Health, Garmin, etc.)
- AI LLM coaching chat

---

## 2. Technical Standards

- Runtime: Node.js 20+
- API: Express 4.x
- Database: MongoDB (Mongoose 8)
- Auth provider: Clerk (JWT verification on backend)
- Validation: Zod
- Test stack: Vitest + Supertest
- Logging: Pino

Conventions:
- All timestamps stored in UTC
- IDs in responses serialized as strings
- Error payload format is standardized:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [{ "field": "goal", "issue": "Required" }]
  }
}
```

---

## 3. Data Model (Mongoose Schemas)

Create new models under `server/models/`.

### 3.1 User (`server/models/userModel.js`)

```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },

    profile: {
      age: { type: Number, min: 13, max: 100, default: null },
      sex: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
      heightCm: { type: Number, min: 100, max: 250, default: null },
      weightKg: { type: Number, min: 25, max: 300, default: null },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      equipmentAccess: [{ type: String, enum: ['bodyweight', 'dumbbells', 'barbell', 'machines', 'bands', 'kettlebell'] }]
    },

    goals: [{ type: String, enum: ['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance'] }],

    stats: {
      workoutsCompleted: { type: Number, default: 0 },
      adherenceLast28d: { type: Number, default: 0 },
      currentStreakDays: { type: Number, default: 0 },
      lastWorkoutAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
```

Indexes:
- `clerkUserId` unique
- `email` index

### 3.2 Program (`server/models/programModel.js`)

```js
import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    goal: { type: String, required: true, enum: ['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance'] },
    splitType: { type: String, required: true, enum: ['full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'individual'] },
    daysPerWeek: { type: Number, required: true, min: 2, max: 7 },
    sessionDurationMin: { type: Number, min: 20, max: 180, default: 60 },
    currentWeek: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

programSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('Program', programSchema);
```

### 3.3 Session (`server/models/sessionModel.js`)

```js
import mongoose from 'mongoose';

const readinessSchema = new mongoose.Schema(
  {
    sleepScore: { type: Number, min: 1, max: 5, default: null },
    sorenessScore: { type: Number, min: 1, max: 5, default: null },
    stressScore: { type: Number, min: 1, max: 5, default: null },
    energyScore: { type: Number, min: 1, max: 5, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    plannedDate: { type: Date, required: true, index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    status: { type: String, required: true, enum: ['planned', 'in_progress', 'completed', 'skipped'], default: 'planned', index: true },
    readiness: { type: readinessSchema, default: () => ({}) },
    coachNotes: { type: String, trim: true, maxlength: 1000, default: '' }
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, plannedDate: -1 });

export default mongoose.model('Session', sessionSchema);
```

### 3.4 SessionExercise (`server/models/sessionExerciseModel.js`)

```js
import mongoose from 'mongoose';

const performedSetSchema = new mongoose.Schema(
  {
    setNo: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 0, max: 100 },
    loadKg: { type: Number, required: true, min: 0, max: 1000 },
    rpe: { type: Number, min: 1, max: 10, default: null },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    sets: { type: Number, required: true, min: 1, max: 12 },
    repMin: { type: Number, required: true, min: 1, max: 50 },
    repMax: { type: Number, required: true, min: 1, max: 50 },
    targetRpe: { type: Number, min: 1, max: 10, default: null },
    restSec: { type: Number, min: 15, max: 600, default: 90 }
  },
  { _id: false }
);

const sessionExerciseSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseKey: { type: String, required: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    muscles: [{ type: String, trim: true }],
    equipment: [{ type: String, trim: true }],
    prescription: { type: prescriptionSchema, required: true },
    performedSets: { type: [performedSetSchema], default: [] },
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

sessionExerciseSchema.index({ sessionId: 1, order: 1 }, { unique: true });

export default mongoose.model('SessionExercise', sessionExerciseSchema);
```

### 3.5 ExerciseMetrics (`server/models/exerciseMetricsModel.js`)

```js
import mongoose from 'mongoose';

const exerciseMetricsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseKey: { type: String, required: true, index: true },
    estimated1RM: { type: Number, default: 0 },
    bestSet: {
      reps: { type: Number, default: 0 },
      loadKg: { type: Number, default: 0 },
      at: { type: Date, default: null }
    },
    rollingVolume4w: { type: Number, default: 0 },
    rollingSets4w: { type: Number, default: 0 },
    progressionState: { type: String, enum: ['up', 'hold', 'deload'], default: 'hold' },
    stagnationCounter: { type: Number, default: 0 },
    lastPerformedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

exerciseMetricsSchema.index({ userId: 1, exerciseKey: 1 }, { unique: true });

export default mongoose.model('ExerciseMetrics', exerciseMetricsSchema);
```

### 3.6 BodyMetrics (`server/models/bodyMetricsModel.js`)

```js
import mongoose from 'mongoose';

const bodyMetricsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number, min: 25, max: 300, required: true },
    waistCm: { type: Number, min: 30, max: 250, default: null },
    bodyFatPct: { type: Number, min: 2, max: 70, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true }
);

bodyMetricsSchema.index({ userId: 1, date: -1 });

export default mongoose.model('BodyMetrics', bodyMetricsSchema);
```

---

## 4. API Contract

Base path: `/api`
Auth: `Authorization: Bearer <clerk_jwt>`

### 4.1 Auth Sync

#### POST `/api/auth/sync`
Create/update internal user from Clerk claims.

Request:
```json
{
  "email": "manas@example.com",
  "name": "Manas",
  "profile": {
    "level": "intermediate",
    "units": "metric",
    "equipmentAccess": ["barbell", "dumbbells", "machines"]
  },
  "goals": ["strength", "hypertrophy"]
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "665f1cc8fa5cf9a7e1b3a610",
    "clerkUserId": "user_2abc...",
    "email": "manas@example.com",
    "name": "Manas"
  }
}
```

### 4.2 Programs

#### POST `/api/programs`
Request:
```json
{
  "name": "12 Week Strength Block",
  "goal": "strength",
  "splitType": "upper_lower",
  "daysPerWeek": 4,
  "sessionDurationMin": 70
}
```

Response 201:
```json
{
  "success": true,
  "data": {
    "id": "665f1f76fa5cf9a7e1b3a62c",
    "name": "12 Week Strength Block",
    "isActive": true
  }
}
```

#### GET `/api/programs/active`
Response 200:
```json
{
  "success": true,
  "data": {
    "id": "665f1f76fa5cf9a7e1b3a62c",
    "goal": "strength",
    "splitType": "upper_lower",
    "currentWeek": 3
  }
}
```

### 4.3 Sessions

#### GET `/api/sessions/today`
Response 200:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "665f2129fa5cf9a7e1b3a646",
      "status": "planned",
      "plannedDate": "2026-04-27T00:00:00.000Z"
    },
    "exercises": [
      {
        "id": "665f219afa5cf9a7e1b3a651",
        "exerciseKey": "barbell_bench_press",
        "displayName": "Barbell Bench Press",
        "order": 1,
        "prescription": { "sets": 4, "repMin": 4, "repMax": 6, "targetRpe": 8, "restSec": 150 }
      }
    ]
  }
}
```

#### POST `/api/sessions/:id/start`
Request:
```json
{
  "readiness": {
    "sleepScore": 4,
    "sorenessScore": 2,
    "stressScore": 3,
    "energyScore": 4,
    "notes": "Slept well"
  }
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "665f2129fa5cf9a7e1b3a646",
    "status": "in_progress",
    "startedAt": "2026-04-27T12:10:30.000Z"
  }
}
```

#### POST `/api/sessions/:id/log-set`
Request:
```json
{
  "sessionExerciseId": "665f219afa5cf9a7e1b3a651",
  "setNo": 1,
  "reps": 6,
  "loadKg": 80,
  "rpe": 8
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "sessionExerciseId": "665f219afa5cf9a7e1b3a651",
    "performedSets": [
      { "setNo": 1, "reps": 6, "loadKg": 80, "rpe": 8, "completedAt": "2026-04-27T12:15:01.000Z" }
    ],
    "nextSetSuggestion": {
      "loadKg": 80,
      "repTarget": "5-6",
      "note": "Keep load, aim same reps"
    }
  }
}
```

#### POST `/api/sessions/:id/complete`
Request:
```json
{
  "feedback": {
    "sessionRpe": 7,
    "notes": "Felt strong"
  }
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "665f2129fa5cf9a7e1b3a646",
    "status": "completed",
    "completedAt": "2026-04-27T13:05:15.000Z",
    "summary": {
      "totalSets": 18,
      "totalVolumeKg": 8460,
      "prs": ["barbell_bench_press"]
    }
  }
}
```

#### POST `/api/sessions/:id/skip`
Request:
```json
{
  "reason": "travel"
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "665f2129fa5cf9a7e1b3a646",
    "status": "skipped"
  }
}
```

### 4.4 Recommendations

#### GET `/api/recommendations/exercise/:exerciseKey/next-load`
Response 200:
```json
{
  "success": true,
  "data": {
    "exerciseKey": "barbell_bench_press",
    "currentEstimated1RM": 102.3,
    "progressionState": "up",
    "recommendation": {
      "loadKg": 82.5,
      "sets": 4,
      "repMin": 4,
      "repMax": 6,
      "targetRpe": 8
    },
    "rationale": "Hit top rep range at <=8 RPE for 2 sessions"
  }
}
```

### 4.5 Analytics

#### GET `/api/analytics/dashboard`
Response 200:
```json
{
  "success": true,
  "data": {
    "adherence28d": 78,
    "sessionsCompleted28d": 14,
    "volumeTrend": [
      { "week": "2026-W14", "volumeKg": 24500 },
      { "week": "2026-W15", "volumeKg": 25800 }
    ],
    "prCount28d": 5,
    "streakDays": 6
  }
}
```

---

## 5. Progression Engine (Service Rules)

Implement in `server/services/progressionService.js`.

Rules:
1. If user achieves `repMax` on top set with `rpe <= 8` for 2 consecutive sessions -> load up by 2.5-5%.
2. If user fails to hit `repMin` for 2 consecutive sessions -> reduce load by 5-7.5%.
3. If readiness average <= 2.5 over last 3 sessions -> hold load and reduce sets by 1 for that session.
4. If no meaningful e1RM increase across 3 sessions and rising fatigue -> set `progressionState = deload` for next week.

E1RM formula (Epley):
`estimated1RM = load * (1 + reps/30)`

---

## 6. Ticket Backlog with Acceptance Criteria

### BE-001: Clerk JWT Verification Middleware

Scope:
- Add `server/middleware/clerkAuthMiddleware.js`
- Verify Clerk token
- Map claims to `req.auth` and internal user in `req.user`

Acceptance criteria:
1. Requests without `Authorization` return `401 AUTH_REQUIRED`.
2. Invalid/expired token returns `401 AUTH_INVALID`.
3. Valid token sets `req.auth.clerkUserId` and loads internal user if present.
4. Middleware covered by unit tests for happy and failure paths.

### BE-002: Add `clerkUserId` and User Sync

Scope:
- Update user schema
- Add `/api/auth/sync` endpoint

Acceptance criteria:
1. First sync creates user with `clerkUserId`.
2. Repeated sync updates name/email/profile without duplicate user creation.
3. Unique constraint on `clerkUserId` enforced.
4. Endpoint returns normalized user payload (`id`, `clerkUserId`, `email`, `name`).

### BE-003: Sessions + SessionExercise Models

Scope:
- Add `Session` and `SessionExercise` models
- Migration utility from old `Workout` docs

Acceptance criteria:
1. New documents created with valid indexes.
2. Session supports states: `planned`, `in_progress`, `completed`, `skipped`.
3. SessionExercise unique `(sessionId, order)` enforced.
4. Migration script transforms existing completed workouts into completed sessions.

### BE-004: Log Set Endpoint

Scope:
- Add `POST /api/sessions/:id/log-set`
- Persist set into `performedSets`

Acceptance criteria:
1. Rejects invalid payload with `400 VALIDATION_ERROR`.
2. Rejects logging to session not owned by user with `403 FORBIDDEN`.
3. Appends/updates set in idempotent way by `(sessionExerciseId, setNo)`.
4. Returns updated `performedSets` and next-set suggestion.

### BE-005: Complete Session Endpoint + Metrics Update

Scope:
- Add `POST /api/sessions/:id/complete`
- Mark session completed
- Trigger metrics update service

Acceptance criteria:
1. Session status transitions from `in_progress` to `completed`.
2. `completedAt` is populated in UTC.
3. User aggregate stats updated (`workoutsCompleted`, `lastWorkoutAt`, streak).
4. Response summary includes total sets, volume, and PR list.

### BE-006: Exercise Metrics Updater

Scope:
- Add `ExerciseMetrics` model + service
- Update after session completion

Acceptance criteria:
1. `estimated1RM`, `bestSet`, `rollingVolume4w` recalculated per exercise.
2. `progressionState` computed from rule engine.
3. Upsert behavior for first-time exercise logs.
4. Unit tests cover `up`, `hold`, and `deload` outcomes.

### FE-001: Today Screen + Readiness Check-In

Scope:
- New route `/today`
- Fetch today session and start flow

Acceptance criteria:
1. User sees planned session + exercise list for today.
2. Starting session submits readiness and updates status to `in_progress`.
3. Loading/error states are visible and accessible.
4. Mobile layout works from 360px width and above.

### FE-002: Live Session Set Logger + Rest Timer

Scope:
- Real-time logging UI
- Rest countdown component

Acceptance criteria:
1. User can log reps/load/RPE for each set.
2. Rest timer starts automatically after set log and is manually adjustable.
3. Last logged set can be edited before completion.
4. No data loss on refresh (state reloads from API).

### FE-003: Previous Best + Inline Suggestions

Scope:
- Show per-exercise previous best and next-set suggestions

Acceptance criteria:
1. Previous best shown before first set entry.
2. Next-set suggestion updates after each logged set.
3. Suggestion source is API-driven, not hardcoded.
4. UI gracefully handles missing metrics.

### FE-004: Progress Dashboard

Scope:
- Charts for adherence, volume trend, PRs, streak

Acceptance criteria:
1. Dashboard loads from `/api/analytics/dashboard`.
2. Date range selector supports 4w/8w/12w.
3. Charts are responsive and readable on mobile.
4. Empty states shown for new users.

### QA-001: End-to-End Workout Lifecycle Test

Scope:
- Integration test flow: sync -> create program -> today session -> start -> log sets -> complete

Acceptance criteria:
1. Test passes in CI with isolated test DB.
2. Asserts API status codes and key payload fields.
3. Validates session state transitions and metrics persistence.
4. Includes negative tests for unauthorized access.

### OPS-001: Observability + Error Tracking

Scope:
- Structured logs + request IDs
- Sentry (or equivalent) integration

Acceptance criteria:
1. Every request has correlation/request ID in logs.
2. Unhandled exceptions captured with context.
3. Health endpoint `/api/health` reports app and DB status.
4. Production log level configurable via env.

---

## 7. Definition of Done (Release Gate)

Release is considered ready when:
1. All P0/P1 tickets above are complete and merged.
2. CI pipeline passes lint + unit + integration tests.
3. API documentation updated and published.
4. No open critical/high severity security findings.
5. Staging sign-off done for full workout lifecycle.

---

## 8. Suggested File/Folder Additions

```text
server/
  middleware/
    clerkAuthMiddleware.js
  models/
    programModel.js
    sessionModel.js
    sessionExerciseModel.js
    exerciseMetricsModel.js
    bodyMetricsModel.js
  routes/
    authRoutes.js
    programRoutes.js
    sessionRoutes.js
    recommendationRoutes.js
    analyticsRoutes.js
  controllers/
    authController.js
    programController.js
    sessionController.js
    recommendationController.js
    analyticsController.js
  services/
    progressionService.js
    metricsService.js
  validators/
    authValidators.js
    programValidators.js
    sessionValidators.js

frontend/src/
  pages/
    Today.jsx
    LiveSession.jsx
    Progress.jsx
  services/
    programsApi.js
    sessionsApi.js
    analyticsApi.js
```

