import React, { useEffect, useMemo, useState } from 'react';
import { StepDefinition } from '../types/lesson';
import { NumberLine } from '../components/NumberLine';
import { FractionBar } from '../components/FractionBar';
import { FractionCircle } from '../components/FractionCircle';
import { HintBubble } from '../components/HintBubble';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { EventPayload, getNextStep, requestHint, sendEvents } from '../services/apiClient';

interface Props {
  sessionId: string;
  currentStep: StepDefinition;
  onAdvance: (step: StepDefinition) => void;
  onComplete: () => Promise<void> | void;
}

export function LessonPage({ sessionId, currentStep, onAdvance, onComplete }: Props) {
  const [numericResponse, setNumericResponse] = useState(0.5);
  const [choiceResponse, setChoiceResponse] = useState('');
  const [hint, setHint] = useState('');
  const [stepStart, setStepStart] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isHintLoading, setHintLoading] = useState(false);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    setNumericResponse(0.5);
    setChoiceResponse('');
    setHint('');
    setAttempts(0);
    setStepStart(Date.now());
    setProgress((prev) => prev + 1);
    sendEvents(sessionId, [{ eventType: 'step_start', payload: { stepId: currentStep.id } }]);
  }, [currentStep.id, sessionId]);

  const showNumericControl = currentStep.answerType === 'placement' || currentStep.answerType === 'shading';
  const isChoice = currentStep.answerType === 'choice';
  const totalStepsEstimate = 10;

  const numericLabel = useMemo(() => {
    if (currentStep.representation === 'number_line') return 'Move the marker to your answer';
    if (currentStep.representation === 'bar') return 'Shade the fraction of the bar';
    if (currentStep.representation === 'circle') return 'Shade the fraction of the circle';
    return 'Adjust';
  }, [currentStep.representation]);

  const currentAnswerValue = showNumericControl ? numericResponse : choiceResponse;

  const isInfoStep = currentStep.answerType === 'none';

  const evaluateAnswer = () => {
    if (isInfoStep) return true;
    if (isChoice) {
      return choiceResponse.length > 0 && choiceResponse === (currentStep.correctAnswer as any)?.option;
    }
    const target = Number((currentStep.correctAnswer as any)?.value ?? (currentStep.correctAnswer as any)?.shaded ?? 0);
    return Math.abs(numericResponse - target) <= 0.05;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const latencyMs = Date.now() - stepStart;
    const correct = evaluateAnswer();
    const events: EventPayload[] = [];
    if (!isInfoStep) {
      events.push({
        eventType: 'answer_submitted',
        payload: {
          stepId: currentStep.id,
          correct,
          representation: currentStep.representation,
          value: currentAnswerValue,
        },
      });
    }
    events.push({ eventType: 'step_end', payload: { stepId: currentStep.id, latencyMs } });
    await sendEvents(sessionId, events);
    setAttempts((prev) => prev + 1);
    const { nextStep } = await getNextStep(sessionId, currentStep.id);
    setSubmitting(false);
    if (nextStep.id === 'summary') {
      await onComplete();
    } else {
      onAdvance(nextStep);
    }
  };

  const handleHint = async () => {
    setHintLoading(true);
    await sendEvents(sessionId, [{ eventType: 'hint_requested', payload: { stepId: currentStep.id } }]);
    try {
      const response = await requestHint({
        sessionId,
        stepId: currentStep.id,
        representation: currentStep.representation,
        lastAnswer: String(currentAnswerValue ?? ''),
        attempts: attempts + 1,
      });
      setHint(response.hint);
      await sendEvents(sessionId, [{ eventType: 'hint_shown', payload: { stepId: currentStep.id } }]);
    } catch (error) {
      console.error(error);
      setHint('Something went wrong fetching a hint. Think about the number of equal parts.');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <section className="page">
      <ProgressIndicator current={progress} total={totalStepsEstimate} />
      <article className="card">
        <p className="eyebrow">Current step</p>
        <h2>{currentStep.prompt}</h2>
        {showNumericControl && currentStep.representation === 'number_line' && (
          <NumberLine label={numericLabel} value={numericResponse} onChange={setNumericResponse} />
        )}
        {showNumericControl && currentStep.representation === 'bar' && (
          <FractionBar fraction={numericResponse} onChange={setNumericResponse} />
        )}
        {showNumericControl && currentStep.representation === 'circle' && (
          <FractionCircle fraction={numericResponse} onChange={setNumericResponse} />
        )}
        {isChoice && (
          <div className="choices">
            {['1/3', '1/4', '2/3', '3/5', '1/2'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="lesson-choice"
                  value={option}
                  checked={choiceResponse === option}
                  onChange={() => setChoiceResponse(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
        <div className="actions">
          {!isInfoStep && (
            <button className="ghost" type="button" onClick={handleHint} disabled={isHintLoading}>
              {isHintLoading ? 'Fetching hint…' : "I'm stuck"}
            </button>
          )}
          <button className="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isInfoStep ? 'Continue' : 'Submit'}
          </button>
        </div>
        {hint && <HintBubble text={hint} onClose={() => setHint('')} />}
      </article>
    </section>
  );
}
