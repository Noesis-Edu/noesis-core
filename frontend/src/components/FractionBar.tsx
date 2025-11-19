import React from 'react';
import './FractionShapes.css';

interface Props {
  fraction: number;
  onChange: (value: number) => void;
  segments?: number;
}

export function FractionBar({ fraction, onChange, segments = 8 }: Props) {
  return (
    <div className="fraction-shape">
      <div className="fraction-shape__visual fraction-shape__bar">
        {Array.from({ length: segments }).map((_, index) => {
          const filled = (index + 1) / segments <= fraction;
          return <span key={index} className={filled ? 'filled' : ''} />;
        })}
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={1 / segments}
        value={fraction}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>Shaded: {(fraction * segments).toFixed(0)} / {segments}</small>
    </div>
  );
}
