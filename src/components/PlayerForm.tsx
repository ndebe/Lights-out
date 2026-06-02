import { useState } from 'react';

type Props = {
  onStart: (name: string) => void;
};

export function PlayerForm({ onStart }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="player-form">
      <h1 className="title">Lights Out</h1>
      <p className="subtitle">Test your race-start reaction time.</p>
      <input
        className="name-input"
        type="text"
        placeholder="Enter your driver name"
        maxLength={30}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onStart(name.trim())}
      />
      <button
        className="btn-primary"
        disabled={!name.trim()}
        onClick={() => onStart(name.trim())}
      >
        Start
      </button>
    </div>
  );
}
