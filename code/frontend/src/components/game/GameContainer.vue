<template>
  <v-app class="min-h-screen flex flex-col">
    <!-- Header -->
    <v-app-bar
      flat
      :border="true"
      color="background"
      class="backdrop-blur-md sticky top-0 z-50 px-6"
    >
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
        class="d-md-none mr-2"
      ></v-app-bar-nav-icon>

      <div
        class="flex items-center gap-3 cursor-pointer"
        @click="router.push(`/${locale}`)"
      >
        <div
          class="size-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20"
        >
          <img
            src="/logo.png"
            alt="Fakeout Logo"
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
          class="px-4 py-2"
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
            <span class="text-sm font-bold"
              >{{ state.currentRoundIndex + 1 }}/{{ state.totalRounds }}</span
            >
          </div>
        </v-chip>

        <v-chip
          class="px-4 py-2"
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
            <span class="text-sm font-bold">{{ state.score }}</span>
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
            v-for="l in ['en', 'de', 'bg']"
            :key="l"
            :active="locale === l"
            @click="switchLanguage(l)"
            rounded="lg"
          >
            <template v-slot:prepend>
              <span class="text-xl mr-3">{{
                { en: "🇺🇸", de: "🇩🇪", bg: "🇧🇬" }[l]
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
        class="py-12 flex flex-col items-center justify-center max-w-7xl"
      >
        <!-- Question Section -->
        <div class="text-center mb-12 animate-slide-up">
          <h1
            class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            {{ t(`game.question.${mode || "image"}`) }}
          </h1>
          <p class="text-medium-emphasis text-lg">
            {{ t(`game.instructions.${mode || "image"}`) }}
          </p>
        </div>

        <!-- Loading State (Initial Data Fetch) -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-20"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-medium-emphasis">{{ t("game.loadingData") }}</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-20"
        >
          <v-icon icon="mdi-alert-circle" color="error" size="64"></v-icon>
          <p class="mt-4 text-error text-lg">{{ error }}</p>
          <v-btn color="primary" class="mt-4" @click="router.go(0)">{{
            t("common.retry")
          }}</v-btn>
        </div>

        <!-- Result Screen -->
        <ResultScreen
          v-else-if="state.status === GameStatus.GAME_OVER"
          :score="state.score"
          :total-rounds="state.totalRounds"
          @archive="showArchiveDialog = true"
        />

        <!-- Game Round Area -->
        <div v-else-if="currentRound" class="w-full max-w-5xl relative">
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
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import ImageCard from "./ImageCard.vue";
import ResultScreen from "./ResultScreen.vue";
import PastGamesDialog from "./PastGamesDialog.vue";
import GameFAQ from "./GameFAQ.vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

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
  }
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
    await loadGame();
  }
);

const loadedDate = ref<string | null>(null);

const loadGame = async () => {
  isLoading.value = true;
  error.value = null;
  loadedDate.value = null;
  try {
    const { rounds: fetchedRounds, date } = await getR2GameRounds(
      props.date,
      props.mode || "image"
    );
    if (fetchedRounds.length === 0) {
      error.value = props.date
        ? t("errors.noRoundsForDate", { date: props.date })
        : t("errors.noRoundsGeneral");
      return;
    }
    rounds.value = fetchedRounds;
    loadedDate.value = date;
    state.totalRounds = fetchedRounds.length;

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
    recordRoundResult(
      props.mode || "image",
      loadedDate.value,
      isCorrect,
      state.totalRounds,
      currentRound.value.id
    );
  }
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
  if (!currentRound.value) return false;
  const selected = [currentRound.value.imageA, currentRound.value.imageB].find(
    (img) => img.id === imageId
  );
  return selected?.isAiGenerated ?? false;
};

const handleLoad = (side: "A" | "B", duration?: number) => {
  mediaLoaded[side] = true;
  if (typeof duration === "number") {
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
</style>
