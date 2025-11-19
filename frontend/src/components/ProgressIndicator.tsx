import React from 'react';
import './ProgressIndicator.css';

interface Props {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: Props) {
  const value = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="progress-indicator">
      <div className="progress-indicator__track">
        <div className="progress-indicator__fill" style={{ width: `${value}%` }} />
      </div>
      <small>
        Step {current} of {total}
      </small>
    </div>
  );
}
