import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { ok, fail } from '../utils/http.js';
import Session from '../models/sessionModel.js';
import ExerciseMetrics from '../models/exerciseMetricsModel.js';
import User from '../models/userModel.js';

const genAI = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

const fmtExercise = (m) =>
  `${m.exerciseKey.replace(/_/g, ' ')} — est. 1RM: ${Math.round(m.estimated1RM)}kg, state: ${m.progressionState}`;

/**
 * Build the system prompt grounded in real user data.
 */
async function buildSystemPrompt(userId) {
  const [user, recentSessions, metrics] = await Promise.all([
    User.findById(userId).lean(),
    Session.find({ userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(8)
      .lean(),
    ExerciseMetrics.find({ userId }).sort({ estimated1RM: -1 }).limit(10).lean(),
  ]);

  const streak = user?.stats?.currentStreakDays ?? 0;
  const totalWorkouts = user?.stats?.workoutsCompleted ?? recentSessions.length;

  const sessionsSummary =
    recentSessions.length === 0
      ? 'No completed sessions on record yet.'
      : recentSessions
          .map((s) => {
            const date = new Date(s.completedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const muscles = s.muscles?.slice(0, 3).join(', ') || 'unknown';
            return `• ${date}: ${s.name || s.type} (${muscles})`;
          })
          .join('\n');

  const metricsSummary =
    metrics.length === 0
      ? 'No exercise metrics tracked yet.'
      : metrics.map(fmtExercise).join('\n');

  return `You are the Workout Master AI Coach — a knowledgeable, direct, and data-driven personal training assistant.
You have access to this user's actual training data. Ground every response in their specific situation.

## User Training Context
- Current streak: ${streak} days
- Total sessions logged: ${totalWorkouts}

### Recent Sessions (last 8)
${sessionsSummary}

### Top Exercises by Estimated 1RM
${metricsSummary}

## Behavior Rules
- Be concise and direct. No excessive disclaimers.
- Reference the user's actual data when relevant (specific exercises, states, dates).
- If asked about readiness, consider their recent session frequency.
- If an exercise is in "deload" state, proactively mention they should back off load.
- If asked something outside fitness/training, politely redirect.
- Use bullet points and short paragraphs — not walls of text.
- Never fabricate data you don't have.`;
}

// ── Controller ────────────────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  if (!req.user?._id) return fail(res, 'USER_NOT_SYNCED', 'User must sync profile first', 409);
  if (!genAI) return fail(res, 'AI_UNAVAILABLE', 'AI service not configured', 503);

  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return fail(res, 'INVALID_MESSAGE', 'Message is required', 400);
  }
  if (message.length > 1000) {
    return fail(res, 'MESSAGE_TOO_LONG', 'Message must be under 1000 characters', 400);
  }

  try {
    const systemPrompt = await buildSystemPrompt(req.user._id);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Build conversation history for multi-turn context (max 20 turns)
    const chatHistory = history
      .slice(-20)
      .filter((m) => m.role && m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    logger.info('AI coach message processed', { userId: req.user._id });

    return ok(res, { reply });
  } catch (error) {
    logger.error('Chat message failed', { error: error.message, userId: req.user._id });
    return fail(res, 'AI_ERROR', 'Failed to get AI response', 500);
  }
};
