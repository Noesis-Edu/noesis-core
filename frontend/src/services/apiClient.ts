import { StepDefinition, AdaptiveInfo } from '../types/lesson';

const headers = { 'Content-Type': 'application/json' };

export async function createSession() {
  const res = await fetch('/api/session', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return (await res.json()) as { sessionId: string };
}

export interface EventPayload {
  eventType:
    | 'step_start'
    | 'step_end'
    | 'answer_submitted'
    | 'hint_requested'
    | 'hint_shown'
    | 'representation_switched';
  payload: Record<string, unknown>;
}

export async function sendEvents(sessionId: string, events: EventPayload[]) {
  await fetch('/api/events', {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, events }),
  });
}

export async function getNextStep(sessionId: string, currentStepId: string | null) {
  const res = await fetch('/api/next-step', {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, currentStepId }),
  });
  if (!res.ok) throw new Error('Failed to fetch next step');
  return (await res.json()) as {
    nextStep: StepDefinition;
    adaptiveInfo: AdaptiveInfo;
    learnerState: Record<string, unknown>;
  };
}

export async function requestHint(args: {
  sessionId: string;
  stepId: string;
  representation: string;
  lastAnswer?: string;
  errorType?: string;
  attempts: number;
}) {
  const res = await fetch('/api/tutor', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...args, conceptId: 'fractions-as-magnitudes' }),
  });
  if (!res.ok) throw new Error('Failed to fetch hint');
  return (await res.json()) as { hint: string };
}

export async function fetchSummary(sessionId: string) {
  const res = await fetch(`/api/session/${sessionId}/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return (await res.json()) as { conceptId: string; accuracy: number; message: string };
}
