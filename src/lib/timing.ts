export const getRandomDelay = (min = 800, max = 3000): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const LIGHT_INTERVAL_MS = 800;
export const LIGHT_COUNT = 5;
export const MAX_ATTEMPTS = 3;
export const MIN_VALID_REACTION_MS = 100;
export const MAX_VALID_REACTION_MS = 2000;
