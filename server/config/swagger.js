import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Workout Master API',
      version: '2.0.0',
      description: `
## Overview
Workout Master is an AI-powered progressive overload training platform.

The API provides endpoints for:
- **Auth** — Clerk-based user sync and profile management
- **Sessions** — Workout session lifecycle (plan → start → log sets → complete)
- **Analytics** — Training metrics, volume trends, and 1RM strength curves
- **AI Chat** — Context-aware coaching powered by Gemini, grounded in real training data
- **Recommendations** — Per-exercise load/rep suggestions from the progression engine

## Authentication
All endpoints except \`/health\` require a valid Clerk session token in the \`Authorization: Bearer <token>\` header.

The \`x-clerk-user-id\` header is also required (injected automatically by the frontend Clerk SDK).
      `,
      contact: {
        name: 'Manas Singh',
        url: 'https://github.com/00Manas-Singh00/Workout-Master',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: 'https://workout-master-api.vercel.app', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        ClerkBearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Clerk session token from `useAuth().getToken()`',
        },
      },
      schemas: {
        // ── Success envelope ───────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Email is required' },
          },
        },
        // ── Analytics ──────────────────────────────────────────────────────
        AnalyticsDashboard: {
          type: 'object',
          properties: {
            adherence28d: { type: 'number', example: 78, description: 'Session adherence % over last 28 days' },
            sessionsCompleted28d: { type: 'integer', example: 12 },
            prCount28d: { type: 'integer', example: 3 },
            streakDays: { type: 'integer', example: 7 },
            volumeTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: { type: 'string', example: 'Apr 14' },
                  sessions: { type: 'integer', example: 3 },
                },
              },
            },
            muscleBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  muscle: { type: 'string', example: 'Chest' },
                  count: { type: 'integer', example: 8 },
                },
              },
            },
            strengthTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exercise: { type: 'string', example: 'Bench Press' },
                  estimated1RM: { type: 'number', example: 110 },
                  progressionState: { type: 'string', enum: ['up', 'hold', 'deload'], example: 'up' },
                },
              },
            },
          },
        },
        // ── Chat ──────────────────────────────────────────────────────────
        ChatMessage: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', maxLength: 1000, example: 'Should I train today?' },
            history: {
              type: 'array',
              description: 'Previous turns for multi-turn context (max 20)',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        // ── Session ───────────────────────────────────────────────────────
        Session: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Push Day A' },
            type: { type: 'string', example: 'upper_lower' },
            goal: { type: 'string', enum: ['strength', 'hypertrophy', 'endurance'] },
            muscles: { type: 'array', items: { type: 'string' }, example: ['chest', 'triceps'] },
            status: { type: 'string', enum: ['planned', 'in_progress', 'completed', 'skipped'] },
            plannedDate: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ ClerkBearerAuth: [] }],
  },
  apis: ['./server/routes/*.js', './server/controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
