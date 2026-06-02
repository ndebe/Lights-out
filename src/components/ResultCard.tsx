import { getReactionLabel, isValidReaction } from '../lib/scoring';

type Props = {
  reactionMs: number;
  onNext: () => void;
  attemptNum: number;
  maxAttempts: number;
};

export function ResultCard({ reactionMs, onNext, attemptNum, maxAttempts }: Props) {
  const valid = isValidReaction(reactionMs);
  const label = valid ? getReactionLabel(reactionMs) : 'Invalid — too fast';
  const isLast = attemptNum >= maxAttempts;

  return (
    <div className="result-card">
      <div className="result-time">{reactionMs}ms</div>
      <div className="result-label">{label}</div>
      <button className="btn-primary" onClick={onNext}>
        {isLast ? 'See final score' : 'Next attempt'}
      </button>
    </div>
  );
}
