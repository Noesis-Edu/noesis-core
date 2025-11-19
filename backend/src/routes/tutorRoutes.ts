import { Router } from 'express';
import { z } from 'zod';
import { fetchHint } from '../services/tutorService.js';

const router = Router();

const schema = z.object({
  sessionId: z.string(),
  stepId: z.string(),
  conceptId: z.string(),
  representation: z.string(),
  lastAnswer: z.string().nullable().optional(),
  errorType: z.string().nullable().optional(),
  attempts: z.number().default(1),
});

router.post('/tutor', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const hint = await fetchHint(body);
    res.json({ hint });
  } catch (error) {
    next(error);
  }
});

export default router;
