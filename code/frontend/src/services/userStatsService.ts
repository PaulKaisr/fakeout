import { reactive } from "vue";

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  totalRounds: number;
}

export interface UserStats {
  image: GameStats;
  video: GameStats;
}

const STORAGE_KEY = "fakeout-user-stats";

const defaultStats: UserStats = {
  image: { gamesPlayed: 0, totalScore: 0, totalRounds: 0 },
  video: { gamesPlayed: 0, totalScore: 0, totalRounds: 0 },
};

function loadStats(): UserStats {
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

export function recordRoundResult(mode: "image" | "video", isCorrect: boolean) {
  // Update state
  userStats[mode].totalRounds++;
  if (isCorrect) {
    userStats[mode].totalScore++;
  }

  // Persist to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
}

export function finishGame(mode: "image" | "video") {
  userStats[mode].gamesPlayed++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
}

export function resetStats() {
  Object.assign(userStats, JSON.parse(JSON.stringify(defaultStats)));
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccuracy(mode: "image" | "video"): number {
  const { totalScore, totalRounds } = userStats[mode];
  if (totalRounds === 0) return 0;
  return Math.round((totalScore / totalRounds) * 100);
}
