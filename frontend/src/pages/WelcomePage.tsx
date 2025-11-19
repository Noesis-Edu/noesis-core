import React from 'react';

interface Props {
  onStart: () => void;
  isStarting: boolean;
}

export function WelcomePage({ onStart, isStarting }: Props) {
  return (
    <section className="page">
      <header>
        <h1>Noesis Foundations</h1>
        <p>Master fractions as magnitudes through visuals, practice, and adaptive hints.</p>
      </header>
      <button className="primary" onClick={onStart} disabled={isStarting}>
        {isStarting ? 'Preparing lesson…' : 'Start lesson'}
      </button>
    </section>
  );
}
