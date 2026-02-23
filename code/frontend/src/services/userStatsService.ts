import { reactive } from "vue";

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  totalRounds: number;
}

export interface GameHistoryItem {
  roundId: number;
  userCorrect: boolean;
  duration: number;
}

export interface SingleGameProgress {
  score: number;
  roundsPlayed: number;
  totalRounds: number;
  isFinished: boolean;
  history: GameHistoryItem[];
}

export interface UserStats {
  image: GameStats;
  video: GameStats;
  // Key format: "mode-date" e.g. "image-2023-11-28"
  games: Record<string, SingleGameProgress>;
}

const STORAGE_KEY = "fakeout-user-stats";

const defaultStats: UserStats = {
  image: { gamesPlayed: 0, totalScore: 0, totalRounds: 0 },
  video: { gamesPlayed: 0, totalScore: 0, totalRounds: 0 },
  games: {},
};

// SSR-safe check for browser environment
const isBrowser = typeof window !== "undefined";

// Deferred localStorage write to avoid blocking main thread during interactions
let pendingSave = false;
function deferredSaveStats() {
  if (!isBrowser || pendingSave) return;
  pendingSave = true;

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
    pendingSave = false;
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if ("requestIdleCallback" in window) {
    requestIdleCallback(save, { timeout: 1000 });
  } else {
    setTimeout(save, 0);
  }
}

function loadStats(): UserStats {
  // SSR-safe: return default stats during build
  if (!isBrowser) {
    return JSON.parse(JSON.stringify(defaultStats));
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure all keys exist
      return { ...defaultStats, ...parsed };
    } catch (e) {
      console.error("Failed to parse user stats:", e);
    }
  }
  return JSON.parse(JSON.stringify(defaultStats));
}

// Reactive state to be used across components if needed
export const userStats = reactive<UserStats>(loadStats());

function getGameKey(mode: "image" | "video", date: string) {
  return `${mode}-${date}`;
}

import { supabaseService } from "./supabaseService";

// ... (existing helper functions)

export function recordRoundResult(
  mode: "image" | "video",
  date: string,
  isCorrect: boolean,
  currentTotalRounds: number,
  roundId: number,
  duration: number,
  pairId?: string,
) {
  // Update specific game stats
  const key = getGameKey(mode, date);
  if (!userStats.games[key]) {
    userStats.games[key] = {
      score: 0,
      roundsPlayed: 0,
      totalRounds: currentTotalRounds,
      isFinished: false,
      history: [],
    };
  }

  const game = userStats.games[key];
  if (game) {
    if (!game.history) game.history = []; // Backward compatibility

    // Check for duplicates
    if (game.history.some((h) => h.roundId === roundId)) {
      return;
    }

    // Update aggregate stats (only if not duplicate)
    userStats[mode].totalRounds++;
    if (isCorrect) {
      userStats[mode].totalScore++;
    }

    game.roundsPlayed++;
    // Update total rounds in case it changed or was initialized wrong (though unlikely for same date)
    game.totalRounds = currentTotalRounds;
    if (isCorrect) {
      game.score++;
    }
    game.history.push({ roundId, userCorrect: isCorrect, duration });

    // Track to Supabase (only in Prod)
    if (import.meta.env.PROD) {
      // 1. Game Start: If this is the first round played, we count it as a start
      if (game.roundsPlayed === 1) {
        supabaseService.trackGameStart(mode, date);
      }
      // 2. Guess: Track the individual guess
      if (pairId) {
        supabaseService.trackGuess(pairId, mode, isCorrect, duration);
      }
    }
  }

  // Persist to localStorage (deferred to avoid blocking UI)
  deferredSaveStats();
}

export function finishGame(mode: "image" | "video", date: string) {
  // Update aggregate
  userStats[mode].gamesPlayed++;

  // Update specific game
  const key = getGameKey(mode, date);
  if (userStats.games[key]) {
    userStats.games[key].isFinished = true;
  }

  // Persist to localStorage (deferred to avoid blocking UI)
  deferredSaveStats();
}

export function getGameStats(
  mode: "image" | "video",
  date: string,
): SingleGameProgress | undefined {
  return userStats.games[getGameKey(mode, date)];
}

export function resetStats() {
  Object.assign(userStats, JSON.parse(JSON.stringify(defaultStats)));
  if (isBrowser) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getAccuracy(mode: "image" | "video"): number {
  const { totalScore, totalRounds } = userStats[mode];
  if (totalRounds === 0) return 0;
  return Math.round((totalScore / totalRounds) * 100);
}
