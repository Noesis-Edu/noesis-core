import { Router } from 'express';
import { z } from 'zod';
import { getRecentEvents } from '../services/eventService.js';
import { decideNextStep } from '../services/adaptiveEngine.js';
import { aggregateLearnerSignals, persistLearnerState } from '../services/learnerStateService.js';

const router = Router();

const schema = z.object({
  sessionId: z.string(),
  currentStepId: z.string().nullable().optional(),
});

router.post('/next-step', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const events = await getRecentEvents(body.sessionId, 200);
    const decision = decideNextStep({
      sessionId: body.sessionId,
      currentStepId: body.currentStepId ?? null,
      events,
    });

    const aggregates = aggregateLearnerSignals(events);
    await persistLearnerState(body.sessionId, aggregates);

    res.json({
      nextStep: decision.nextStep,
      adaptiveInfo: decision.adaptiveInfo,
      learnerState: aggregates,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
