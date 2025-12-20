<template>
  <div class="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
    <!-- Header -->
    <header
      class="p-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <v-icon icon="mdi-sparkles" color="white" size="24"></v-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold leading-none">AI or Real?</h1>
          <p class="text-xs text-gray-400 mt-1">Test your detection skills</p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        >
          <v-icon icon="mdi-target" class="text-gray-400" size="20"></v-icon>
          <div class="flex flex-col items-end">
            <span
              class="text-[10px] text-gray-400 uppercase font-bold tracking-wider"
              >Round</span
            >
            <span class="text-sm font-bold"
              >{{ state.currentRoundIndex + 1 }}/{{ state.totalRounds }}</span
            >
          </div>
        </div>

        <div
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        >
          <v-icon
            icon="mdi-check-circle"
            class="text-success"
            size="20"
          ></v-icon>
          <div class="flex flex-col items-end">
            <span
              class="text-[10px] text-gray-400 uppercase font-bold tracking-wider"
              >Score</span
            >
            <span class="text-sm font-bold">{{ state.score }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main
      class="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center max-w-7xl"
    >
      <!-- Question Section -->
      <div class="text-center mb-12 animate-slide-up">
        <h2
          class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
        >
          Which image is AI-generated?
        </h2>
        <p class="text-gray-400 text-lg">
          Click on the image you think was created by Artificial Intelligence
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-20"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-gray-400">Loading game data...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20"
      >
        <v-icon icon="mdi-alert-circle" color="error" size="64"></v-icon>
        <p class="mt-4 text-error text-lg">{{ error }}</p>
        <v-btn color="primary" class="mt-4" @click="router.go(0)">Retry</v-btn>
      </div>

      <!-- Game Grid -->
      <div
        v-else-if="currentRound"
        class="grid md:grid-cols-2 gap-8 w-full max-w-5xl mb-12"
      >
        <ImageCard
          :image="currentRound.imageA"
          label="A"
          :is-selected="selectedImageId === currentRound.imageA.id"
          :show-result="state.status === GameStatus.ROUND_RESULT"
          :is-correct="isSelectionCorrect(currentRound.imageA)"
          @select="handleSelection(currentRound.imageA.id)"
        />
        <ImageCard
          :image="currentRound.imageB"
          label="B"
          :is-selected="selectedImageId === currentRound.imageB.id"
          :show-result="state.status === GameStatus.ROUND_RESULT"
          :is-correct="isSelectionCorrect(currentRound.imageB)"
          @select="handleSelection(currentRound.imageB.id)"
        />
      </div>

      <!-- Next Buton (only shows after selection) -->
      <div class="h-20 flex items-center justify-center">
        <v-btn
          v-if="state.status === GameStatus.ROUND_RESULT"
          color="primary"
          size="x-large"
          rounded="xl"
          elevation="4"
          class="w-48 text-none font-bold"
          @click="nextRound"
        >
          Next Round
          <template #append>
            <v-icon icon="mdi-arrow-right"></v-icon>
          </template>
        </v-btn>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  GameStatus,
  type GameState,
  type Round,
  type Image,
} from "@/types/game";
import { getR2GameRounds } from "@/services/gameServiceR2";
import ImageCard from "./ImageCard.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const rounds = ref<Round[]>([]);
const selectedImageId = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const state = reactive<GameState>({
  status: GameStatus.INTRO,
  currentRoundIndex: 0,
  score: 0,
  totalRounds: 0,
  history: [],
});

const currentRound = computed(() => rounds.value[state.currentRoundIndex]);

onMounted(async () => {
  try {
    const fetchedRounds = await getR2GameRounds();
    if (fetchedRounds.length === 0) {
      error.value = "No game rounds found for today. Check back later!";
      return;
    }
    rounds.value = fetchedRounds;
    state.totalRounds = fetchedRounds.length;
    state.status = GameStatus.PLAYING;
  } catch (e) {
    console.error(e);
    error.value = "Failed to load game data.";
  } finally {
    isLoading.value = false;
  }
});

const handleSelection = (imageId: string) => {
  if (state.status !== GameStatus.PLAYING) return;

  selectedImageId.value = imageId;
  state.status = GameStatus.ROUND_RESULT;

  const isCorrect = isSelectionCorrectId(imageId);
  if (isCorrect) {
    state.score++;
  }

  state.history.push({
    roundId: currentRound.value.id,
    userCorrect: isCorrect,
  });
};

const isSelectionCorrect = (image: Image) => {
  // If user selected this image, was it AI?
  if (selectedImageId.value === image.id) {
    return image.isAiGenerated;
  }
  // If user didn't select this image, but it WAS the answer (so user was wrong)
  // Or if user selected the other one correctly.
  return image.isAiGenerated;
};

const isSelectionCorrectId = (imageId: string) => {
  const selected = [currentRound.value.imageA, currentRound.value.imageB].find(
    (img) => img.id === imageId
  );
  return selected?.isAiGenerated ?? false;
};

const nextRound = () => {
  if (state.currentRoundIndex < state.totalRounds - 1) {
    state.currentRoundIndex++;
    selectedImageId.value = null;
    state.status = GameStatus.PLAYING;
  } else {
    state.status = GameStatus.GAME_OVER;
    alert(`Game Over! Final Score: ${state.score}/${state.totalRounds}`);
    router.push("/");
  }
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
