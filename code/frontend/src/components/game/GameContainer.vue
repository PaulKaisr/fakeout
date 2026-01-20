<template>
  <v-app class="min-h-screen flex flex-col">
    <!-- Header - explicit height prevents CLS -->
    <v-app-bar
      flat
      :border="true"
      color="background"
      height="64"
      class="backdrop-blur-md sticky top-0 z-50 px-6"
    >
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
        class="d-md-none mr-2"
        aria-label="Open navigation menu"
      ></v-app-bar-nav-icon>

      <div
        class="flex items-center gap-3 cursor-pointer"
        @click="router.push(`/${locale}`)"
      >
        <div
          class="size-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20"
        >
          <img
            src="/favicon-32x32.png"
            alt="Fakeout Logo"
            width="40"
            height="40"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="hidden sm:block">
          <h1 class="text-lg font-bold leading-none">
            {{ t("header.title") }}
          </h1>
          <p class="text-xs text-medium-emphasis mt-1">
            {{ t("header.subtitle") }}
          </p>
        </div>
      </div>

      <v-spacer></v-spacer>

      <div class="flex items-center gap-6">
        <!-- Mode Switcher -->
        <v-btn-toggle
          :model-value="mode || 'image'"
          mandatory
          density="compact"
          color="primary"
          rounded="lg"
          variant="outlined"
          class="border d-none d-md-flex"
          @update:model-value="switchMode"
        >
          <v-btn value="video" size="small" prepend-icon="mdi-video">
            Video
          </v-btn>
          <v-btn value="image" size="small" prepend-icon="mdi-image">
            Photo
          </v-btn>
        </v-btn-toggle>

        <div class="d-none d-md-block">
          <LanguageSwitcher />
        </div>

        <v-btn
          variant="text"
          color="medium-emphasis"
          prepend-icon="mdi-chart-bar"
          class="text-none d-none d-md-flex"
          @click="router.push(`/${locale}/stats`)"
        >
          {{ t("stats.title") }}
        </v-btn>

        <v-btn
          variant="text"
          color="medium-emphasis"
          prepend-icon="mdi-calendar-clock"
          class="text-none d-none d-md-flex"
          @click="showArchiveDialog = true"
        >
          {{ t("header.pastGames") }}
        </v-btn>

        <v-chip
          class="px-4 py-2 min-w-20"
          variant="outlined"
          color="white"
          style="border-color: rgba(255, 255, 255, 0.1)"
        >
          <template v-slot:prepend>
            <v-icon
              icon="mdi-target"
              class="text-medium-emphasis mr-2"
              size="20"
            ></v-icon>
          </template>
          <div class="flex flex-col items-end">
            <span
              class="text-[10px] text-medium-emphasis uppercase font-bold tracking-wider"
              >{{ t("header.roundLabel") }}</span
            >
            <span class="text-sm font-bold tabular-nums"
              >{{ state.currentRoundIndex + 1 }}/{{ state.totalRounds }}</span
            >
          </div>
        </v-chip>

        <v-chip
          class="px-4 py-2 min-w-20"
          variant="outlined"
          color="white"
          style="border-color: rgba(255, 255, 255, 0.1)"
        >
          <template v-slot:prepend>
            <v-icon
              icon="mdi-check-circle"
              class="text-success mr-2"
              size="20"
            ></v-icon>
          </template>
          <div class="flex flex-col items-end">
            <span
              class="text-[10px] text-medium-emphasis uppercase font-bold tracking-wider"
              >{{ t("header.scoreLabel") }}</span
            >
            <span class="text-sm font-bold tabular-nums">{{
              state.score
            }}</span>
          </div>
        </v-chip>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="left">
      <div class="p-4">
        <div class="flex flex-col gap-2">
          <p class="text-xs font-bold text-medium-emphasis uppercase ml-2 mb-1">
            {{ t("game.mode") }}
          </p>
          <v-list-item
            rounded="lg"
            :active="mode === 'video' || (!mode && false)"
            @click="switchMode('video')"
            prepend-icon="mdi-video"
            title="Video Mode"
          >
          </v-list-item>
          <v-list-item
            rounded="lg"
            :active="mode === 'image'"
            @click="switchMode('image')"
            prepend-icon="mdi-image"
            title="Image Mode"
          >
          </v-list-item>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="flex flex-col gap-2">
          <v-list-item
            rounded="lg"
            prepend-icon="mdi-chart-bar"
            :title="t('stats.title')"
            @click="router.push(`/${locale}/stats`)"
          ></v-list-item>

          <v-list-item
            rounded="lg"
            prepend-icon="mdi-calendar-clock"
            :title="t('header.pastGames')"
            @click="showArchiveDialog = true"
          ></v-list-item>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="flex flex-col gap-2">
          <p class="text-xs font-bold text-medium-emphasis uppercase ml-2 mb-1">
            Language
          </p>
          <v-list-item
            v-for="l in availableLocales"
            :key="l"
            :active="locale === l"
            @click="switchLanguage(l)"
            rounded="lg"
          >
            <template v-slot:prepend>
              <span class="font-semibold text-sm mr-3">{{
                localeAbbr[l]
              }}</span>
            </template>
            <v-list-item-title>{{ t(`languages.${l}`) }}</v-list-item-title>
          </v-list-item>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container
        fluid
        class="py-12 flex flex-col items-center justify-center max-w-[1800px] mx-auto"
      >
        <!-- Question Section - fixed height reserves space to prevent CLS -->
        <div
          v-if="state.status !== GameStatus.GAME_OVER"
          class="text-center mb-12 h-44 md:h-48 flex flex-col justify-center"
        >
          <h1
            class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400"
          >
            {{ t(`game.question.${mode || "image"}`) }}
          </h1>
          <!-- Theme line - always reserve space with min-height -->
          <p
            class="text-xl text-primary font-bold mb-2 uppercase tracking-widest min-h-7"
            :class="{ invisible: !gamePrompt }"
          >
            <span class="mr-2 text-white">{{ t("game.theme") }}:</span>
            "{{ gamePrompt || "..." }}"
          </p>
          <!-- Play count - always reserve space with min-height -->
          <div
            class="flex items-center justify-center gap-2 mb-2 min-h-5"
            :class="{ invisible: gamePlayCount <= 0 }"
          >
            <v-icon
              icon="mdi-account-group"
              size="small"
              color="medium-emphasis"
            ></v-icon>
            <span
              class="text-sm font-medium text-medium-emphasis"
              data-testid="game-play-count"
            >
              {{ gamePlayCount || 0 }} {{ t("game.plays") }}
            </span>
          </div>
          <p class="text-medium-emphasis text-lg">
            {{ t(`game.instructions.${mode || "image"}`) }}
          </p>
        </div>

        <!-- Loading State (Initial Data Fetch) - same min-height as game grid -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-20 game-grid-container"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-medium-emphasis">{{ t("game.loadingData") }}</p>
        </div>

        <!-- Error State - same min-height as game grid -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-20 game-grid-container"
        >
          <v-icon icon="mdi-alert-circle" color="error" size="64"></v-icon>
          <p class="mt-4 text-error text-lg">{{ error }}</p>
          <v-btn color="primary" class="mt-4" @click="router.go(0)">{{
            t("common.retry")
          }}</v-btn>
        </div>

        <!-- Result Screen - wrapped in game-grid-container for consistent height -->
        <div
          v-else-if="state.status === GameStatus.GAME_OVER"
          class="w-full game-grid-container flex items-center justify-center"
        >
          <ResultScreen
            :score="state.score"
            :total-rounds="state.totalRounds"
            :mode="mode || 'image'"
            :is-latest-game="!props.date"
            :game-date="loadedDate"
            @archive="showArchiveDialog = true"
          />
        </div>

        <!-- Game Round Area - fixed aspect ratio container prevents CLS -->
        <div
          v-else-if="currentRound"
          class="w-full relative game-grid-container"
        >
          <!-- Image Loading Spinner (Overlay) -->
          <div
            v-if="!areBothImagesLoaded"
            class="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-medium-emphasis">{{ t("game.loadingData") }}</p>
          </div>

          <!-- Game Grid (Always rendered to allow loading) -->
          <div
            :class="{ invisible: !areBothImagesLoaded }"
            class="grid md:grid-cols-2 gap-8 w-full mb-12"
          >
            <ImageCard
              :key="currentRound.imageA.id"
              :image="currentRound.imageA"
              label="A"
              :is-selected="selectedImageId === currentRound.imageA.id"
              :show-result="state.status === GameStatus.ROUND_RESULT"
              :is-correct="isSelectionCorrect(currentRound.imageA)"
              :max-duration="commonDuration"
              @select="handleSelection(currentRound.imageA.id)"
              @load="handleLoad('A', $event)"
            />
            <ImageCard
              :key="currentRound.imageB.id"
              :image="currentRound.imageB"
              label="B"
              :is-selected="selectedImageId === currentRound.imageB.id"
              :show-result="state.status === GameStatus.ROUND_RESULT"
              :is-correct="isSelectionCorrect(currentRound.imageB)"
              :max-duration="commonDuration"
              @select="handleSelection(currentRound.imageB.id)"
              @load="handleLoad('B', $event)"
            />
          </div>
        </div>

        <!-- Global Stats - fixed height container to prevent CLS -->
        <div class="h-12 flex items-center justify-center mb-6">
          <span
            v-if="
              state.status === GameStatus.ROUND_RESULT &&
              currentGlobalStats !== null
            "
            class="text-h5 font-weight-bold text-white animate-slide-up"
          >
            {{ formattedGlobalStats }}%
            {{ t("game.guessedCorrectly") }}
          </span>
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
            {{
              state.currentRoundIndex < state.totalRounds - 1
                ? t("game.nextRound")
                : t("game.finish")
            }}
            <template #append>
              <v-icon
                :icon="
                  state.currentRoundIndex < state.totalRounds - 1
                    ? 'mdi-arrow-right'
                    : 'mdi-flag-checkered'
                "
              ></v-icon>
            </template>
          </v-btn>
        </div>

        <!-- FAQ Section -->
        <GameFAQ />
      </v-container>
    </v-main>

    <!-- Past Games Dialog -->
    <PastGamesDialog v-model="showArchiveDialog" :mode="mode" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import {
  GameStatus,
  type GameState,
  type Round,
  type Image,
} from "@/types/game";
import { getR2GameRounds } from "@/services/gameServiceR2";
import {
  recordRoundResult,
  finishGame,
  getGameStats,
} from "@/services/userStatsService";
import { supabaseService } from "@/services/supabaseService";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import ImageCard from "./ImageCard.vue";
import ResultScreen from "./ResultScreen.vue";
import PastGamesDialog from "./PastGamesDialog.vue";
import GameFAQ from "./GameFAQ.vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale, availableLocales } = useI18n();

const localeAbbr: Record<string, string> = {
  en: "EN",
  de: "DE",
  bg: "BG",
  pl: "PL",
};

const props = defineProps<{
  date?: string;
  mode?: "image" | "video";
}>();

const router = useRouter();
const rounds = ref<Round[]>([]);
const selectedImageId = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showArchiveDialog = ref(false);
const drawer = ref(false);
const route = useRoute();
const gamePrompt = ref<string | null>(null);
const gamePlayCount = ref(0);

const mediaLoaded = reactive({ A: false, B: false });
const durations = reactive({ A: 0, B: 0 });

const areBothImagesLoaded = computed(() => {
  // If we're not waiting for images, we consider them loaded
  if (!currentRound.value) return true;
  return mediaLoaded.A && mediaLoaded.B;
});

const commonDuration = computed(() => {
  if (durations.A > 0 && durations.B > 0) {
    return Math.min(durations.A, durations.B);
  }
  return undefined;
});

const state = reactive<GameState>({
  status: GameStatus.INTRO,
  currentRoundIndex: 0,
  score: 0,
  totalRounds: 0,
  history: [],
});

const currentRound = computed(() => rounds.value[state.currentRoundIndex]);

onMounted(async () => {
  await loadGame();
});

// Watch round index to reset loading state
watch(
  () => state.currentRoundIndex,
  () => {
    mediaLoaded.A = false;
    mediaLoaded.B = false;
    durations.A = 0;
    durations.B = 0;
  },
);

watch(
  () => [props.date, props.mode],
  async () => {
    // Reset state before loading new game
    state.status = GameStatus.INTRO;
    state.currentRoundIndex = 0;
    state.score = 0;
    state.history = [];
    selectedImageId.value = null;
    mediaLoaded.A = false;
    mediaLoaded.B = false;
    durations.A = 0;
    durations.B = 0;
    gamePlayCount.value = 0;
    await loadGame();
  },
);

const loadedDate = ref<string | null>(null);

const loadGame = async () => {
  isLoading.value = true;
  error.value = null;
  loadedDate.value = null;
  gamePlayCount.value = 0;
  try {
    const {
      rounds: fetchedRounds,
      date,
      prompt,
    } = await getR2GameRounds(props.date, props.mode || "image");
    if (fetchedRounds.length === 0) {
      error.value = props.date
        ? t("errors.noRoundsForDate", { date: props.date })
        : t("errors.noRoundsGeneral");
      return;
    }
    rounds.value = fetchedRounds;
    loadedDate.value = date;
    gamePrompt.value = prompt || null;

    state.totalRounds = fetchedRounds.length;

    // Fetch play count
    if (date) {
      gamePlayCount.value = await supabaseService.getGamePlayCount(
        props.mode || "image",
        date,
      );
    }

    // Restore progress
    const savedProgress = getGameStats(props.mode || "image", date);
    if (savedProgress) {
      state.score = savedProgress.score;
      state.history = savedProgress.history || [];

      if (savedProgress.isFinished) {
        state.status = GameStatus.GAME_OVER;
        state.totalRounds = savedProgress.totalRounds; // Trust saved total rounds for finished games
      } else if (savedProgress.roundsPlayed >= state.totalRounds) {
        // Edge case: Played all rounds but didn't finish properly?
        // Or maybe totalRounds changed.
        // If we have history for all rounds, mark as game over.
        state.status = GameStatus.GAME_OVER;
        if (loadedDate.value) {
          finishGame(props.mode || "image", loadedDate.value);
        }
      } else {
        state.currentRoundIndex = savedProgress.roundsPlayed;
        state.status = GameStatus.PLAYING;
      }
    } else {
      state.status = GameStatus.PLAYING;
    }
  } catch (e) {
    console.error(e);
    error.value = t("errors.failedToLoad");
  } finally {
    isLoading.value = false;
  }
};

const handleSelection = (imageId: string) => {
  if (state.status !== GameStatus.PLAYING || !currentRound.value) return;

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

  // Save stats immediately
  if (loadedDate.value) {
    // Extract pair ID from image IDs (format: "real-{id}" or "ai-{id}")
    const pairId = currentRound.value.imageA.id.split("-")[1] || "";
    recordRoundResult(
      props.mode || "image",
      loadedDate.value,
      isCorrect,
      state.totalRounds,
      currentRound.value.id,
      pairId,
    );

    // Fetch global stats
    fetchGlobalStats(pairId);
  }
};

const currentGlobalStats = ref<number | null>(null);

const fetchGlobalStats = async (pairId: string) => {
  currentGlobalStats.value = null;
  const percentage = await supabaseService.getGuessPercentage(pairId);
  currentGlobalStats.value = percentage;
};

const formattedGlobalStats = computed(() => {
  if (currentGlobalStats.value === null) return null;
  return currentGlobalStats.value.toLocaleString(locale.value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

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
  if (!currentRound.value) return false;
  const selected = [currentRound.value.imageA, currentRound.value.imageB].find(
    (img) => img.id === imageId,
  );
  return selected?.isAiGenerated ?? false;
};

const handleLoad = (side: "A" | "B", duration?: number) => {
  mediaLoaded[side] = true;
  // Only accept valid durations (finite, positive, and at least 0.5 seconds)
  if (
    typeof duration === "number" &&
    Number.isFinite(duration) &&
    duration > 0.5
  ) {
    durations[side] = duration;
  }
};

const nextRound = async () => {
  if (state.currentRoundIndex < state.totalRounds - 1) {
    // Reset loading state immediately to hide grid before new content loads
    mediaLoaded.A = false;
    mediaLoaded.B = false;
    durations.A = 0;
    durations.B = 0;
    currentGlobalStats.value = null;

    await nextTick();

    state.currentRoundIndex++;
    selectedImageId.value = null;
    state.status = GameStatus.PLAYING;
  } else {
    state.status = GameStatus.GAME_OVER;
    if (loadedDate.value) {
      finishGame(props.mode || "image", loadedDate.value);
    }
  }
};

const switchMode = (newMode: "image" | "video") => {
  if (props.mode === newMode) return;

  // Switch to the other mode's daily game
  // logic: /en/ (video) <-> /en/game (image)
  if (newMode === "image") {
    router.push(`/${locale.value}/image`);
  } else {
    // Video is now the default at root
    router.push(`/${locale.value}`);
  }
};

const switchLanguage = (newLocale: string) => {
  if (locale.value === newLocale) return;
  if ((route.params as any).lang) {
    router.push({
      name: route.name as any,
      params: { ...route.params, lang: newLocale },
      query: route.query,
    });
  } else {
    router.push(`/${newLocale}`);
  }
  drawer.value = false;
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

/* Reserve space for game grid to prevent CLS during loading */
.game-grid-container {
  /* On mobile: single column, each card has 4:3 aspect ratio (2 cards stacked + gap)
     Use max() to ensure a minimum height even on very small screens */
  min-height: max(500px, calc((100vw - 2rem) * 0.75 * 2 + 2rem));
  contain: layout style;
}

@media (min-width: 768px) {
  .game-grid-container {
    /* On desktop: two columns, cards share width minus gap
       Use max() for robust minimum height regardless of viewport */
    min-height: max(400px, calc((50vw - 3rem) * 0.75 + 3rem));
  }
}
</style>
