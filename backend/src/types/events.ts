export type EventType =
  | 'step_start'
  | 'step_end'
  | 'answer_submitted'
  | 'hint_requested'
  | 'hint_shown'
  | 'representation_switched';

export interface LessonEventPayload {
  stepId?: string;
  correct?: boolean;
  errorType?: string;
  latencyMs?: number;
  representation?: string;
  attempts?: number;
}

export interface LessonEvent {
  id: string;
  sessionId: string;
  eventType: EventType;
  payload: LessonEventPayload;
  createdAt: Date;
}
