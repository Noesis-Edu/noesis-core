import { orderedLessonSteps, lessonSteps } from '../lesson/lessonDefinition.js';
import { AdaptiveInfo, StepDefinition } from '../types/lesson.js';
import { LessonEvent } from '../types/events.js';

interface DecisionInput {
  sessionId: string;
  currentStepId: string | null;
  events: LessonEvent[];
}

interface DecisionOutput {
  nextStep: StepDefinition;
  adaptiveInfo: AdaptiveInfo;
}

const conceptId = 'fractions-as-magnitudes';

export function getDefaultFirstStep() {
  return orderedLessonSteps[0];
}

function getDefaultNextStep(currentStepId: string): StepDefinition | undefined {
  const index = orderedLessonSteps.findIndex((step) => step.id === currentStepId);
  return orderedLessonSteps[index + 1];
}

function findAlternateStep(forStepId: string): StepDefinition | undefined {
  return lessonSteps.find((step) => step.metadata?.alternateFor === forStepId);
}

function computeAccuracy(events: LessonEvent[], window = 3) {
  const answerEvents = events.filter((event) => event.eventType === 'answer_submitted');
  const recent = answerEvents.slice(-window);
  if (!recent.length) return 1;
  const correctCount = recent.filter((event) => event.payload.correct).length;
  return correctCount / recent.length;
}

function attemptsForStep(events: LessonEvent[], stepId: string) {
  return events.filter((event) => event.eventType === 'answer_submitted' && event.payload.stepId === stepId).length;
}

export function decideNextStep(input: DecisionInput): DecisionOutput {
  const { currentStepId, events } = input;

  if (!currentStepId) {
    return {
      nextStep: getDefaultFirstStep(),
      adaptiveInfo: { reason: 'first_step' },
    };
  }

  const accuracy = computeAccuracy(events);
  const attempts = attemptsForStep(events, currentStepId);
  let nextStep = getDefaultNextStep(currentStepId) ?? orderedLessonSteps.at(-1)!;
  let adaptiveInfo: AdaptiveInfo = { reason: 'default_progress', accuracy, attempts };

  if (accuracy < 0.5 && attempts >= 3) {
    const remedial = findAlternateStep(currentStepId);
    if (remedial) {
      nextStep = remedial;
      adaptiveInfo = {
        reason: 'remedial_route',
        accuracy,
        attempts,
        switchedRepresentation: remedial.representation,
      };
      return { nextStep, adaptiveInfo };
    }
  }

  if (accuracy < 0.5 && attempts > 1) {
    const alternate = findAlternateStep(currentStepId);
    if (alternate) {
      nextStep = alternate;
      adaptiveInfo = {
        reason: 'representation_switch',
        accuracy,
        attempts,
        switchedRepresentation: alternate.representation,
      };
      return { nextStep, adaptiveInfo };
    }
  }

  if (!nextStep) {
    nextStep = orderedLessonSteps.at(-1)!;
  }

  if (currentStepId === 'checkpoint_q3') {
    nextStep = lessonSteps.find((step) => step.id === 'summary') ?? orderedLessonSteps.at(-1)!;
    adaptiveInfo = { reason: 'checkpoint_complete', accuracy, attempts };
    return { nextStep, adaptiveInfo };
  }

  if (nextStep.id === 'summary') {
    adaptiveInfo = { reason: 'lesson_complete', accuracy, attempts };
  }

  return { nextStep, adaptiveInfo };
}

export function buildSummaryMessage(accuracy: number) {
  if (accuracy > 0.8) {
    return 'You showed strong accuracy with fractions and moved quickly through the checkpoint.';
  }
  if (accuracy > 0.5) {
    return 'You handled common fractions but could review comparisons with unlike denominators.';
  }
  return 'Focus on seeing fractions as distances from zero. Try practicing with shaded regions before number lines.';
}

export function mapEventsToSummary(events: LessonEvent[]) {
  const accuracy = computeAccuracy(events, 10);
  return {
    conceptId,
    accuracy,
    message: buildSummaryMessage(accuracy),
  };
}
