import { prisma } from '../db/client.js';
import { LearnerState } from '../types/learnerState.js';
import { LessonEvent } from '../types/events.js';

const conceptId = 'fractions-as-magnitudes';

export async function getLearnerState(sessionId: string): Promise<LearnerState> {
  const row = await prisma.learnerState.findUnique({ where: { sessionId } });
  if (!row) {
    return {
      sessionId,
      conceptId,
      mastery: 0,
      errorPatterns: [],
      bestRepresentation: null,
      hintUsageRate: 0,
      avgDwellTime: 0,
    };
  }
  return {
    sessionId: row.sessionId,
    conceptId: row.conceptId as typeof conceptId,
    mastery: row.mastery,
    errorPatterns: row.errorPatterns,
    bestRepresentation: row.bestRepresentation,
    hintUsageRate: row.hintUsageRate,
    avgDwellTime: row.avgDwellTime,
  };
}

interface Aggregates {
  mastery: number;
  errorPatterns: string[];
  bestRepresentation?: string | null;
  hintUsageRate: number;
  avgDwellTime: number;
}

export function aggregateLearnerSignals(events: LessonEvent[]): Aggregates {
  const answerEvents = events.filter((e) => e.eventType === 'answer_submitted');
  const hintRequests = events.filter((e) => e.eventType === 'hint_requested');
  const stepEndEvents = events.filter((e) => e.eventType === 'step_end');
  const accuracy =
    answerEvents.length === 0
      ? 0
      : answerEvents.filter((e) => e.payload.correct).length / answerEvents.length;

  const errorPatterns = Array.from(
    new Set(answerEvents.filter((e) => e.payload.errorType).map((e) => e.payload.errorType as string))
  );

  const dwellTimes = stepEndEvents
    .map((e) => e.payload.latencyMs ?? 0)
    .filter((latency) => latency > 0);
  const avgDwellTime = dwellTimes.length
    ? dwellTimes.reduce((sum, time) => sum + time, 0) / dwellTimes.length
    : 0;

  const repUsage = new Map<string, { attempts: number; correct: number }>();
  answerEvents.forEach((event) => {
    const rep = event.payload.representation ?? 'unknown';
    const bucket = repUsage.get(rep) ?? { attempts: 0, correct: 0 };
    bucket.attempts += 1;
    bucket.correct += event.payload.correct ? 1 : 0;
    repUsage.set(rep, bucket);
  });
  const bestRepresentation = Array.from(repUsage.entries()).sort((a, b) => {
    const aAccuracy = a[1].attempts ? a[1].correct / a[1].attempts : 0;
    const bAccuracy = b[1].attempts ? b[1].correct / b[1].attempts : 0;
    return bAccuracy - aAccuracy;
  })[0]?.[0];

  const mastery = Math.min(1, Math.max(0, accuracy));
  const hintUsageRate = answerEvents.length
    ? Math.min(1, hintRequests.length / answerEvents.length)
    : 0;

  return {
    mastery,
    errorPatterns,
    bestRepresentation,
    hintUsageRate,
    avgDwellTime,
  };
}

export async function persistLearnerState(sessionId: string, aggregates: Aggregates) {
  await prisma.learnerState.upsert({
    where: { sessionId },
    create: {
      sessionId,
      conceptId,
      mastery: aggregates.mastery,
      errorPatterns: aggregates.errorPatterns,
      bestRepresentation: aggregates.bestRepresentation,
      hintUsageRate: aggregates.hintUsageRate,
      avgDwellTime: aggregates.avgDwellTime,
    },
    update: {
      mastery: aggregates.mastery,
      errorPatterns: aggregates.errorPatterns,
      bestRepresentation: aggregates.bestRepresentation,
      hintUsageRate: aggregates.hintUsageRate,
      avgDwellTime: aggregates.avgDwellTime,
    },
  });
}
