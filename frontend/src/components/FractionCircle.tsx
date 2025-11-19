import React from 'react';
import './FractionShapes.css';

interface Props {
  fraction: number;
  onChange: (value: number) => void;
  segments?: number;
}

export function FractionCircle({ fraction, onChange, segments = 8 }: Props) {
  return (
    <div className="fraction-shape">
      <div className="fraction-shape__visual fraction-shape__circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="4" />
          <path
            d={`M50 50 L50 5 A45 45 0 ${fraction > 0.5 ? 1 : 0} 1 ${
              50 + 45 * Math.sin(2 * Math.PI * fraction)
            } ${50 - 45 * Math.cos(2 * Math.PI * fraction)} Z`}
            fill="#60a5fa"
            opacity={fraction === 0 ? 0 : 0.9}
          />
        </svg>
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
