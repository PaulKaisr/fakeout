import { type Round } from "@/types/game";

const MOCK_ROUNDS: Round[] = [
  {
    id: 1,
    imageA: {
      id: "r1-a",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
      isAiGenerated: false,
      credit: "Unsplash user",
    },
    imageB: {
      id: "r1-b",
      url: "https://images.unsplash.com/photo-1628155930542-4131433ea36b?q=80&w=600&auto=format&fit=crop", // Placeholder for AI lookalike
      isAiGenerated: true,
      credit: "AI Gen",
    },
  },
  {
    id: 2,
    imageA: {
      id: "r2-a",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
      isAiGenerated: false,
      credit: "Unsplash user",
    },
    imageB: {
      id: "r2-b",
      url: "https://images.unsplash.com/photo-1534067783741-512969b441a4?q=80&w=600&auto=format&fit=crop",
      isAiGenerated: true,
      credit: "AI Gen",
    },
  },
  // Add more rounds as needed
];

export const getGameRounds = (count: number = 10): Round[] => {
  // In a real app, we might shuffle or fetch from API
  // For now, just repeat the mock rounds to fill the count
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const template = MOCK_ROUNDS[i % MOCK_ROUNDS.length];
    rounds.push({
      ...template,
      id: i + 1, // distinct IDs for iteration
    });
  }
  return rounds;
};
