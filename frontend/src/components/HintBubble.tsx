import React from 'react';
import './HintBubble.css';

interface Props {
  text: string;
  onClose?: () => void;
}

export function HintBubble({ text, onClose }: Props) {
  if (!text) return null;
  return (
    <div className="hint-bubble">
      <div>
        <strong>Hint</strong>
        <p>{text}</p>
      </div>
      {onClose && (
        <button className="hint-bubble__close" onClick={onClose} aria-label="Close hint">
          ×
        </button>
      )}
    </div>
  );
}
