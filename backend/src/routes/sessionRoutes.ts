import { Router } from 'express';
import { createSession, getRecentEvents } from '../services/eventService.js';
import { mapEventsToSummary } from '../services/adaptiveEngine.js';

const router = Router();

router.post('/session', async (_req, res, next) => {
  try {
    const sessionId = await createSession();
    res.json({ sessionId });
  } catch (error) {
    next(error);
  }
});

router.get('/session/:sessionId/summary', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const events = await getRecentEvents(sessionId, 200);
    const summary = mapEventsToSummary(events);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
