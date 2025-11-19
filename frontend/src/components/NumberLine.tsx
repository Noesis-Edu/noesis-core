import './NumberLine.css';
import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function NumberLine({ value, onChange, label }: Props) {
  return (
    <div className="number-line">
      <div className="number-line__label">{label}</div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="number-line__ticks">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="number-line__value">Current: {value.toFixed(2)}</div>
    </div>
  );
}
