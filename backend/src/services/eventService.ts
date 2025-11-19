import { prisma } from '../db/client.js';
import { EventType, LessonEvent, LessonEventPayload } from '../types/events.js';

export async function createSession() {
  const session = await prisma.session.create({ data: {} });
  return session.id;
}

interface IncomingEvent {
  eventType: EventType;
  payload: LessonEventPayload;
}

export async function recordEvents(sessionId: string, events: IncomingEvent[]) {
  if (!events.length) return;

  await prisma.event.createMany({
    data: events.map((event) => ({
      sessionId,
      eventType: event.eventType,
      payload: event.payload,
    })),
  });
}

export async function getRecentEvents(sessionId: string, limit = 50): Promise<LessonEvent[]> {
  const rows = await prisma.event.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    eventType: row.eventType,
    payload: row.payload as LessonEventPayload,
    createdAt: row.createdAt,
  }));
}

export async function getEventsForStep(sessionId: string, stepId: string) {
  const events = await prisma.event.findMany({
    where: { sessionId, payload: { path: ['stepId'], equals: stepId } },
    orderBy: { createdAt: 'asc' },
  });
  return events;
}
