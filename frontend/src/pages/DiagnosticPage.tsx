import React, { useState } from 'react';
import { sendEvents } from '../services/apiClient';
import { NumberLine } from '../components/NumberLine';
import { FractionBar } from '../components/FractionBar';

interface Props {
  sessionId: string;
  onComplete: () => Promise<void> | void;
}

const questions = [
  {
    id: 'diag_numberline_half',
    prompt: 'Place 1/2 on the number line.',
    type: 'placement',
    representation: 'number_line',
    correct: 0.5,
  },
  {
    id: 'diag_bar_three_fourths',
    prompt: 'Shade 3/4 of the bar.',
    type: 'shading',
    representation: 'bar',
    correct: 0.75,
  },
  {
    id: 'diag_compare',
    prompt: 'Which is larger?',
    type: 'choice',
    representation: 'symbolic',
    options: ['1/3', '1/4'],
    correctOption: '1/3',
  },
];

export function DiagnosticPage({ sessionId, onComplete }: Props) {
  const [numericAnswers, setNumericAnswers] = useState<Record<string, number>>({
    diag_numberline_half: 0.5,
    diag_bar_three_fourths: 0.75,
  });
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const events = questions.map((question) => {
      let correct = false;
      let answer: number | string = '';
      if (question.type === 'choice') {
        answer = choiceAnswers[question.id];
        correct = answer === question.correctOption;
      } else {
        answer = numericAnswers[question.id];
        correct = Math.abs((answer as number) - (question.correct as number)) <= 0.1;
      }
      return {
        eventType: 'answer_submitted' as const,
        payload: {
          stepId: question.id,
          representation: question.representation,
          value: answer,
          correct,
        },
      };
    });
    await sendEvents(sessionId, events);
    await onComplete();
    setSubmitting(false);
  };

  return (
    <section className="page">
      <h2>Quick diagnostic</h2>
      <div className="card-grid">
        {questions.map((question) => (
          <article key={question.id} className="card">
            <h3>{question.prompt}</h3>
            {question.type === 'placement' && (
              <NumberLine
                label="Drag the marker"
                value={numericAnswers[question.id] ?? 0}
                onChange={(value) => setNumericAnswers((prev) => ({ ...prev, [question.id]: value }))}
              />
            )}
            {question.type === 'shading' && (
              <FractionBar
                fraction={numericAnswers[question.id] ?? 0}
                onChange={(value) => setNumericAnswers((prev) => ({ ...prev, [question.id]: value }))}
              />
            )}
            {question.type === 'choice' && (
              <div className="choices">
                {question.options?.map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={choiceAnswers[question.id] === option}
                      onChange={() => setChoiceAnswers((prev) => ({ ...prev, [question.id]: option }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <button className="primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Continue to lesson'}
      </button>
    </section>
  );
}
