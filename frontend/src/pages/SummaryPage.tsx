import React from 'react';

interface Props {
  message: string;
  accuracy: number;
  onRestart: () => void;
}

export function SummaryPage({ message, accuracy, onRestart }: Props) {
  return (
    <section className="page">
      <h2>Lesson summary</h2>
      <p className="eyebrow">Estimated accuracy: {(accuracy * 100).toFixed(0)}%</p>
      <p>{message}</p>
      <button className="primary" onClick={onRestart}>
        Restart lesson
      </button>
    </section>
  );
}
