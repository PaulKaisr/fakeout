export interface Image {
  id: string;
  url: string;
  isAiGenerated: boolean;
  credit?: string;
  creditUrl?: string;
  sourceUrl?: string;
  mediaType?: "image" | "video";
}

export interface Round {
  id: number;
  imageA: Image;
  imageB: Image;
}

export enum GameStatus {
  INTRO = "INTRO",
  PLAYING = "PLAYING",
  ROUND_RESULT = "ROUND_RESULT",
  GAME_OVER = "GAME_OVER",
}

export interface GameState {
  status: GameStatus;
  currentRoundIndex: number;
  score: number;
  totalRounds: number;
  history: {
    roundId: number;
    userCorrect: boolean;
  }[];
}
