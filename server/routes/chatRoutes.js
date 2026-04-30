import express from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { protect as requireAuth } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, code: 'RATE_LIMIT', message: 'Too many messages. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @openapi
 * /api/chat/message:
 *   post:
 *     tags: [AI Coach]
 *     summary: Send a message to the AI training coach
 *     description: |
 *       Sends a message to Gemini with the user's training context (recent sessions, exercise 1RM, progression states) injected as the system prompt. Supports multi-turn conversation via the `history` array.
 *
 *       Rate limited to **20 requests per 15 minutes**.
 *     security:
 *       - ClerkBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *           examples:
 *             simple:
 *               summary: Single-turn question
 *               value:
 *                 message: Should I train today?
 *                 history: []
 *             multiTurn:
 *               summary: Multi-turn with history
 *               value:
 *                 message: What should I focus on next?
 *                 history:
 *                   - role: user
 *                     content: How is my bench progressing?
 *                   - role: assistant
 *                     content: Your bench is in 'up' state with an estimated 1RM of 110kg...
 *     responses:
 *       200:
 *         description: AI coach reply
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         reply:
 *                           type: string
 *                           example: "Based on your data, you trained yesterday — today is a good rest day. Your bench is progressing well (↑ UP state), so consider a light recovery session."
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: Gemini API not configured
 */
router.post('/message', requireAuth, chatLimiter, sendMessage);

export default router;
