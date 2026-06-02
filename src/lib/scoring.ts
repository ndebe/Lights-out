import { MIN_VALID_REACTION_MS, MAX_VALID_REACTION_MS } from './timing';

export type Attempt = {
  id: string;
  reactionTimeMs: number | null;
  falseStart: boolean;
  createdAt: number;
};

export type ScorePayload = {
  player_name: string;
  best_time_ms: number;
  average_time_ms?: number;
  attempts: number;
  false_starts: number;
};

export type LeaderboardEntry = {
  id: string;
  player_name: string;
  best_time_ms: number;
  average_time_ms: number | null;
  attempts: number;
  false_starts: number;
  created_at: string;
};

export type GameState =
  | 'idle'
  | 'ready'
  | 'sequence'
  | 'waiting'
  | 'lightsOut'
  | 'result'
  | 'falseStart'
  | 'complete';

export function getReactionLabel(ms: number): string {
  if (ms < MIN_VALID_REACTION_MS) return 'Suspicious';
  if (ms < 150) return 'Extremely fast';
  if (ms < 250) return 'Very fast';
  if (ms < 350) return 'Good';
  if (ms < 500) return 'Average';
  return 'Slow';
}

export function isValidReaction(ms: number): boolean {
  return ms >= MIN_VALID_REACTION_MS && ms <= MAX_VALID_REACTION_MS;
}

export function computeScore(attempts: Attempt[]): ScorePayload | null {
  const valid = attempts
    .filter((a) => !a.falseStart && a.reactionTimeMs !== null && isValidReaction(a.reactionTimeMs!))
    .map((a) => a.reactionTimeMs!);

  if (valid.length === 0) return null;

  const best = Math.min(...valid);
  const average = Math.round(valid.reduce((s, v) => s + v, 0) / valid.length);
  const falseStarts = attempts.filter((a) => a.falseStart).length;

  return {
    player_name: '',
    best_time_ms: best,
    average_time_ms: average,
    attempts: attempts.length,
    false_starts: falseStarts,
  };
}
