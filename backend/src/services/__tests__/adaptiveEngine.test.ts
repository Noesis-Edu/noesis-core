import { describe, expect, it } from 'vitest';
import { decideNextStep, getDefaultFirstStep } from '../adaptiveEngine.js';
import { LessonEvent } from '../../types/events.js';

const baseEvents: LessonEvent[] = [];

describe('adaptive engine', () => {
  it('returns first step when currentStepId is null', () => {
    const decision = decideNextStep({ sessionId: 's', currentStepId: null, events: baseEvents });
    expect(decision.nextStep.id).toEqual(getDefaultFirstStep().id);
  });

  it('switches representation after repeated errors', () => {
    const events: LessonEvent[] = Array.from({ length: 4 }).map((_, idx) => ({
      id: String(idx),
      sessionId: 's',
      eventType: 'answer_submitted',
      payload: { stepId: 'numberline_three_fourths', correct: false },
      createdAt: new Date(),
    }));
    const decision = decideNextStep({
      sessionId: 's',
      currentStepId: 'numberline_three_fourths',
      events,
    });
    expect(decision.adaptiveInfo.reason).toEqual('remedial_route');
  });

  it('advances when accuracy is high', () => {
    const events: LessonEvent[] = [
      {
        id: '1',
        sessionId: 's',
        eventType: 'answer_submitted',
        payload: { stepId: 'numberline_one_half', correct: true },
        createdAt: new Date(),
      },
      {
        id: '2',
        sessionId: 's',
        eventType: 'answer_submitted',
        payload: { stepId: 'numberline_one_half', correct: true },
        createdAt: new Date(),
      },
    ];
    const decision = decideNextStep({ sessionId: 's', currentStepId: 'numberline_one_half', events });
    expect(decision.adaptiveInfo.reason).toEqual('default_progress');
  });
});
