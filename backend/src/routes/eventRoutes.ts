import { Router } from 'express';
import { recordEvents } from '../services/eventService.js';
import { z } from 'zod';

const eventsSchema = z.object({
  sessionId: z.string(),
  events: z
    .array(
      z.object({
        eventType: z.enum([
          'step_start',
          'step_end',
          'answer_submitted',
          'hint_requested',
          'hint_shown',
          'representation_switched',
        ]),
        payload: z.record(z.any()).default({}),
      })
    )
    .nonempty(),
});

const router = Router();

router.post('/events', async (req, res, next) => {
  try {
    const body = eventsSchema.parse(req.body);
    await recordEvents(body.sessionId, body.events);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export default router;
