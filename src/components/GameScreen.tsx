import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LightGrid } from './LightGrid';
import { ResultCard } from './ResultCard';
import type { GameState, ScorePayload } from '../lib/scoring';
import { MAX_ATTEMPTS } from '../lib/timing';
import clsx from 'clsx';

type Props = {
  gameState: GameState;
  litCount: number;
  currentAttempt: number;
  lastReactionMs: number | null;
  finalScore: ScorePayload | null;
  submitting: boolean;
  submitted: boolean;
  playerName: string;
  sessionId?: string | null;
  onInput: () => void;
  onAdvance: () => void;
  onSubmitScore: (score: ScorePayload, sessionId?: string | null) => void;
  onReset: () => void;
};

export function GameScreen({
  gameState,
  litCount,
  currentAttempt,
  lastReactionMs,
  finalScore,
  submitting,
  submitted,
  playerName,
  sessionId,
  onInput,
  onAdvance,
  onSubmitScore,
  onReset,
}: Props) {
  // Keyboard support (spacebar)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onInput();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onInput]);

  const tapActive = gameState === 'sequence' || gameState === 'waiting' || gameState === 'lightsOut';

  return (
    <div
      className={clsx('game-screen', { 'game-screen--tappable': tapActive })}
      onPointerDown={tapActive ? onInput : undefined}
    >
      <div className="attempt-counter">
        Attempt {currentAttempt} of {MAX_ATTEMPTS}
      </div>

      <LightGrid litCount={litCount} />

      <AnimatePresence mode="wait">
        {gameState === 'sequence' && (
          <motion.p key="seq" className="instruction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Wait for lights out…
          </motion.p>
        )}
        {gameState === 'waiting' && (
          <motion.p key="wait" className="instruction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Get ready…
          </motion.p>
        )}
        {gameState === 'lightsOut' && (
          <motion.p key="go" className="instruction instruction--go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            GO!
          </motion.p>
        )}
        {gameState === 'falseStart' && (
          <motion.div key="false" className="false-start" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="false-start__title">FALSE START</div>
            <p>You reacted before lights out.</p>
            <button className="btn-primary" onClick={onAdvance}>
              {currentAttempt >= MAX_ATTEMPTS ? 'See final score' : 'Next attempt'}
            </button>
          </motion.div>
        )}
        {gameState === 'result' && lastReactionMs !== null && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultCard
              reactionMs={lastReactionMs}
              onNext={onAdvance}
              attemptNum={currentAttempt}
              maxAttempts={MAX_ATTEMPTS}
            />
          </motion.div>
        )}
        {gameState === 'complete' && (
          <motion.div key="complete" className="complete-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="complete-screen__name">{playerName}</div>
            {finalScore ? (
              <>
                <div className="result-time">{finalScore.best_time_ms}ms</div>
                <div className="result-label">Best time</div>
                <p className="complete-screen__meta">
                  False starts: {finalScore.false_starts} &nbsp;|&nbsp; Attempts: {finalScore.attempts}
                </p>
                {!submitted && (
                  <button className="btn-primary" disabled={submitting} onClick={() => onSubmitScore(finalScore, sessionId)}>
                    {submitting ? 'Submitting…' : 'Submit score'}
                  </button>
                )}
                {submitted && <p className="complete-screen__submitted">Score submitted!</p>}
              </>
            ) : (
              <p>No valid attempts. Try again!</p>
            )}
            <button className="btn-secondary" onClick={onReset}>
              Play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(gameState === 'sequence' || gameState === 'waiting' || gameState === 'lightsOut') && (
        <p className="tap-hint">Tap screen (or Space) when lights go out</p>
      )}
    </div>
  );
}
