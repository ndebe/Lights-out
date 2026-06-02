import { useCallback, useRef, useState } from 'react';
import {
  type Attempt,
  type GameState,
  computeScore,
  type ScorePayload,
} from '../lib/scoring';
import {
  LIGHT_COUNT,
  LIGHT_INTERVAL_MS,
  MAX_ATTEMPTS,
  getRandomDelay,
} from '../lib/timing';
import { supabase } from '../lib/supabase';

function newId() {
  return Math.random().toString(36).slice(2);
}

export function useReactionGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [playerName, setPlayerName] = useState('');
  const [litCount, setLitCount] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<ScorePayload | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lightsOutTimeRef = useRef<number | null>(null);
  const hasReactedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startSequence = useCallback(() => {
    clearTimers();
    setLitCount(0);
    setGameState('sequence');
    lightsOutTimeRef.current = null;
    hasReactedRef.current = false;

    for (let i = 1; i <= LIGHT_COUNT; i++) {
      const t = setTimeout(() => {
        setLitCount(i);
        if (i === LIGHT_COUNT) {
          setGameState('waiting');
          const delay = getRandomDelay();
          const t2 = setTimeout(() => {
            lightsOutTimeRef.current = performance.now();
            setLitCount(0);
            setGameState('lightsOut');
          }, delay);
          timersRef.current.push(t2);
        }
      }, i * LIGHT_INTERVAL_MS);
      timersRef.current.push(t);
    }
  }, [clearTimers]);

  const handleInput = useCallback(() => {
    if (gameState === 'sequence' || gameState === 'waiting') {
      clearTimers();
      setLitCount(0);
      hasReactedRef.current = true;
      const attempt: Attempt = {
        id: newId(),
        reactionTimeMs: null,
        falseStart: true,
        createdAt: Date.now(),
      };
      setAttempts((prev) => [...prev, attempt]);
      setGameState('falseStart');
      return;
    }

    if (gameState === 'lightsOut' && !hasReactedRef.current) {
      hasReactedRef.current = true;
      const inputTime = performance.now();
      const reactionTimeMs = Math.round(inputTime - lightsOutTimeRef.current!);
      const attempt: Attempt = {
        id: newId(),
        reactionTimeMs,
        falseStart: false,
        createdAt: Date.now(),
      };
      setAttempts((prev) => [...prev, attempt]);
      setLastReactionMs(reactionTimeMs);
      setGameState('result');
    }
  }, [gameState, clearTimers]);

  const nextAttempt = useCallback(
    (attemptsSnapshot: Attempt[]) => {
      const next = attemptsSnapshot.length + 1;
      if (next > MAX_ATTEMPTS) {
        const score = computeScore(attemptsSnapshot);
        setFinalScore(score);
        setGameState('complete');
      } else {
        setCurrentAttempt(next);
        startSequence();
      }
    },
    [startSequence]
  );

  const advanceFromResult = useCallback(() => {
    setAttempts((prev) => {
      nextAttempt(prev);
      return prev;
    });
  }, [nextAttempt]);

  const startGame = useCallback(
    (name: string) => {
      setPlayerName(name);
      setAttempts([]);
      setCurrentAttempt(1);
      setLastReactionMs(null);
      setFinalScore(null);
      setSubmitted(false);
      setGameState('ready');
      startSequence();
    },
    [startSequence]
  );

  const submitScore = useCallback(
    async (score: ScorePayload) => {
      setSubmitting(true);
      await supabase.from('scores').insert({
        ...score,
        player_name: playerName,
      });
      setSubmitting(false);
      setSubmitted(true);
    },
    [playerName]
  );

  const reset = useCallback(() => {
    clearTimers();
    setGameState('idle');
    setAttempts([]);
    setLitCount(0);
    setCurrentAttempt(1);
    setLastReactionMs(null);
    setFinalScore(null);
    setSubmitted(false);
  }, [clearTimers]);

  return {
    gameState,
    playerName,
    litCount,
    attempts,
    currentAttempt,
    lastReactionMs,
    finalScore,
    submitting,
    submitted,
    startGame,
    handleInput,
    advanceFromResult,
    submitScore,
    reset,
  };
}
