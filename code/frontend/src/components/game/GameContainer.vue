<template>
  <v-app class="detection-system">
    <!-- Terminal Scanlines Background -->
    <div class="terminal-scanlines"></div>
    <div class="terminal-grid"></div>

    <!-- Cyber Header -->
    <header class="cyber-header">
      <!-- Corner Brackets -->
      <div class="header-bracket header-bracket-tl"></div>
      <div class="header-bracket header-bracket-tr"></div>

      <div class="header-container">
        <!-- Mobile Menu Toggle -->
        <button
          @click="drawer = !drawer"
          class="mobile-menu-btn"
          aria-label="Open navigation menu"
        >
          <span class="terminal-bracket">[</span>
          <span class="terminal-text">MENU</span>
          <span class="terminal-bracket">]</span>
        </button>

        <!-- Logo & Title -->
        <div class="header-brand" @click="router.push(`/${locale}`)">
          <div class="brand-icon">
            <img
              src="/favicon-32x32.png"
              alt="Fakeout Logo"
              width="32"
              height="32"
            />
            <div class="icon-glow"></div>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">
              <span class="terminal-bracket">▸</span>
              FAKEOUT
              <span class="terminal-bracket">◂</span>
            </h1>
          </div>
        </div>

        <!-- Mode Switcher (Centered) -->
        <div class="mode-selector">
          <button
            :class="['mode-button', { active: mode === 'video' }]"
            @click="switchMode('video')"
          >
            <span class="mode-icon">▶</span>
            <span class="mode-text">VIDEO</span>
          </button>
          <button
            :class="['mode-button', { active: mode === 'image' }]"
            @click="switchMode('image')"
          >
            <span class="mode-icon">◉</span>
            <span class="mode-text">PHOTO</span>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <!-- Language Switcher -->
          <div class="lang-selector">
            <LanguageSwitcher />
          </div>

          <!-- Nav Links -->
          <button class="nav-link" @click="router.push(`/${locale}/stats`)">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ t("stats.title") }}</span>
            <span class="nav-bracket">]</span>
          </button>

          <button class="nav-link" @click="showArchiveDialog = true">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ t("header.pastGames") }}</span>
            <span class="nav-bracket">]</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Terminal Navigation Drawer -->
    <div
      :class="['terminal-drawer', { open: drawer }]"
      @click.self="drawer = false"
    >
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="drawer-title">
            <span class="terminal-bracket">▸</span>
            COMMAND_MENU
            <span class="terminal-bracket">◂</span>
          </div>
          <button class="drawer-close" @click="drawer = false">
            <span class="terminal-bracket">[</span>
            <span>X</span>
            <span class="terminal-bracket">]</span>
          </button>
        </div>

        <!-- System Status -->
        <div class="drawer-section">
          <div class="section-label">// SYSTEM_MODE</div>
          <button
            :class="['drawer-button', { active: mode === 'video' }]"
            @click="switchMode('video')"
          >
            <span class="button-icon">▶</span>
            <span class="button-text">VIDEO_MODE</span>
            <span v-if="mode === 'video'" class="button-indicator"></span>
          </button>
          <button
            :class="['drawer-button', { active: mode === 'image' }]"
            @click="switchMode('image')"
          >
            <span class="button-icon">◉</span>
            <span class="button-text">PHOTO_MODE</span>
            <span v-if="mode === 'image'" class="button-indicator"></span>
          </button>
        </div>

        <div class="drawer-divider"></div>

        <!-- Navigation -->
        <div class="drawer-section">
          <div class="section-label">// NAVIGATION</div>
          <button
            class="drawer-button"
            @click="router.push(`/${locale}/stats`)"
          >
            <span class="button-icon">▣</span>
            <span class="button-text">{{ t("stats.title") }}</span>
          </button>
          <button class="drawer-button" @click="showArchiveDialog = true">
            <span class="button-icon">▤</span>
            <span class="button-text">{{ t("header.pastGames") }}</span>
          </button>
        </div>

        <div class="drawer-divider"></div>

        <!-- Language Selection -->
        <div class="drawer-section">
          <div class="section-label">// LANGUAGE_SELECT</div>
          <button
            v-for="l in SUPPORTED_LOCALES"
            :key="l"
            :class="['drawer-button', { active: locale === l }]"
            @click="switchLanguage(l)"
          >
            <span class="button-icon">{{ localeAbbr[l] }}</span>
            <span class="button-text">{{ t(`languages.${l}`) }}</span>
            <span v-if="locale === l" class="button-indicator"></span>
          </button>
        </div>

        <!-- Terminal Pattern -->
        <div class="drawer-pattern">
          <span v-for="i in 100" :key="i">{{
            Math.random() > 0.5 ? "1" : "0"
          }}</span>
        </div>
      </div>
    </div>

    <!-- Main Detection Zone -->
    <main class="detection-zone">
      <div class="detection-container">
        <!-- Mission Brief - fixed height reserves space to prevent CLS -->
        <section
          v-if="state.status !== GameStatus.GAME_OVER"
          class="mission-brief"
        >
          <div class="brief-header">
            <div class="brief-corner brief-corner-tl"></div>
            <div class="brief-corner brief-corner-tr"></div>
            <div class="brief-corner brief-corner-bl"></div>
            <div class="brief-corner brief-corner-br"></div>

            <h1 class="brief-title">
              {{ t(`game.question.${mode || "image"}`) }}
            </h1>

            <!-- Theme line -->
            <div class="brief-theme" :class="{ invisible: !gamePrompt }">
              <span class="theme-label">{{ t("game.theme") }}:</span>
              <span class="theme-value">"{{ gamePrompt || "..." }}"</span>
            </div>

            <!-- Play count -->
            <div class="brief-stats" :class="{ invisible: gamePlayCount <= 0 }">
              <span class="stats-icon">▣</span>
              <span class="stats-text" data-testid="game-play-count">
                {{ gamePlayCount || 0 }} {{ t("game.plays") }}
              </span>
            </div>

            <p class="brief-instructions">
              {{ t(`game.instructions.${mode || "image"}`) }}
            </p>
          </div>
        </section>

        <!-- Loading State -->
        <div v-if="isLoading" class="system-state game-grid-container">
          <div class="state-content">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-core"></div>
            </div>
            <p class="state-message">{{ t("game.loadingData") }}</p>
            <div class="state-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="system-state game-grid-container">
          <div class="state-content state-error">
            <div class="error-icon">⚠</div>
            <p class="state-message">{{ error }}</p>
            <button class="terminal-button" @click="router.go(0)">
              <span class="terminal-bracket">[</span>
              <span class="terminal-text">{{ t("common.retry") }}</span>
              <span class="terminal-bracket">]</span>
            </button>
          </div>
        </div>

        <!-- Result Screen -->
        <div
          v-else-if="state.status === GameStatus.GAME_OVER"
          class="game-grid-container flex items-center justify-center"
        >
          <ResultScreen
            :score="state.score"
            :total-rounds="state.totalRounds"
            :total-duration="totalGameDuration"
            :mode="mode || 'image'"
            :is-latest-game="!props.date"
            :game-date="loadedDate"
            @archive="showArchiveDialog = true"
          />
        </div>

        <!-- Detection Grid -->
        <div
          v-else-if="currentRound"
          ref="detectionGridWrapper"
          class="detection-grid-wrapper game-grid-container"
        >
          <!-- Scanning Overlay -->
          <div v-if="!areBothImagesLoaded" class="scanning-overlay">
            <div class="scan-animation">
              <div class="scan-line"></div>
              <div class="scan-grid"></div>
            </div>
            <p class="scan-status">ANALYZING_MEDIA...</p>
          </div>

          <!-- Detection Grid -->
          <div
            :class="{ invisible: !areBothImagesLoaded }"
            class="detection-grid"
          >
            <!-- Frame A -->
            <div class="detection-frame">
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
            </div>

            <!-- Frame B -->
            <div class="detection-frame">
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

          <!-- Game Stats Panel -->
          <div class="game-stats-panel">
            <div class="stats-panel-inner">
              <!-- Scanlines -->
              <div class="stats-scanlines"></div>

              <!-- Corner Brackets -->
              <div class="stats-corner stats-corner-tl"></div>
              <div class="stats-corner stats-corner-tr"></div>
              <div class="stats-corner stats-corner-bl"></div>
              <div class="stats-corner stats-corner-br"></div>

              <!-- Stats Grid -->
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-box-header">
                    <span class="stat-box-bracket">[</span>
                    <span class="stat-box-label">ROUND</span>
                    <span class="stat-box-bracket">]</span>
                  </div>
                  <div class="stat-box-value">
                    {{ state.currentRoundIndex + 1 }}/{{ state.totalRounds }}
                  </div>
                  <div class="stat-box-indicator stat-indicator-primary"></div>
                </div>

                <div class="stat-box">
                  <div class="stat-box-header">
                    <span class="stat-box-bracket">[</span>
                    <span class="stat-box-label">SCORE</span>
                    <span class="stat-box-bracket">]</span>
                  </div>
                  <div class="stat-box-value">{{ state.score }}</div>
                  <div class="stat-box-indicator stat-indicator-success"></div>
                </div>

                <div class="stat-box">
                  <div class="stat-box-header">
                    <span class="stat-box-bracket">[</span>
                    <span class="stat-box-label">TIME</span>
                    <span class="stat-box-bracket">]</span>
                  </div>
                  <div class="stat-box-value">{{ formattedRoundTime }}</div>
                  <div class="stat-box-indicator stat-indicator-cyan"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Stats Display -->
        <div class="stats-display">
          <div
            v-if="
              state.status === GameStatus.ROUND_RESULT &&
              currentGlobalStats !== null
            "
            class="global-stat"
          >
            <span class="stat-bracket">[</span>
            <span class="stat-value">{{ formattedGlobalStats }}%</span>
            <span class="stat-label">{{ t("game.guessedCorrectly") }}</span>
            <span class="stat-bracket">]</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-zone">
          <button
            v-if="state.status === GameStatus.ROUND_RESULT"
            class="action-button"
            @click="nextRound"
          >
            <div class="button-glow"></div>
            <span class="button-icon">▶</span>
            <span class="button-text">
              {{
                state.currentRoundIndex < state.totalRounds - 1
                  ? t("game.nextRound")
                  : t("game.finish")
              }}
            </span>
            <div class="button-trail"></div>
          </button>
        </div>

        <!-- Integrated FAQ -->
        <section class="intel-section">
          <div class="intel-header">
            <div class="intel-label">
              <span class="terminal-bracket">▸</span>
              {{ t("faq.title") }}
              <span class="terminal-bracket">◂</span>
            </div>
          </div>

          <div class="intel-panels">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              :class="['intel-panel', { expanded: expandedFaq === index }]"
              @click="toggleFaq(index)"
            >
              <div class="panel-header">
                <div class="panel-icon">
                  <span>{{ expandedFaq === index ? "▼" : "▶" }}</span>
                </div>
                <div class="panel-title">{{ faq.question }}</div>
              </div>
              <div class="panel-content">
                <div class="panel-answer">
                  {{ faq.answer }}
                </div>
              </div>
              <div class="panel-accent"></div>
            </div>
          </div>
        </section>
      </div>
    </main>

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
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { SUPPORTED_LOCALES } from "@/i18n";

const { t, locale } = useI18n();

const expandedFaq = ref<number | null>(null);

const faqs = computed(() => [
  {
    question: t("faq.q1.question"),
    answer: t("faq.q1.answer"),
  },
  {
    question: t("faq.q2.question"),
    answer: t("faq.q2.answer"),
  },
  {
    question: t("faq.q3.question"),
    answer: t("faq.q3.answer"),
  },
  {
    question: t("faq.q4.question"),
    answer: t("faq.q4.answer"),
  },
  {
    question: t("faq.q5.question"),
    answer: t("faq.q5.answer"),
  },
  {
    question: t("faq.q6.question"),
    answer: t("faq.q6.answer"),
  },
]);

const toggleFaq = (index: number) => {
  expandedFaq.value = expandedFaq.value === index ? null : index;
};

const localeAbbr: Record<string, string> = {
  en: "EN",
  de: "DE",
  bg: "BG",
  pl: "PL",
  es: "ES",
  fr: "FR",
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
const detectionGridWrapper = ref<HTMLDivElement | null>(null);

const mediaLoaded = reactive({ A: false, B: false });
const durations = reactive({ A: 0, B: 0 });

const state = reactive<GameState>({
  status: GameStatus.INTRO,
  currentRoundIndex: 0,
  score: 0,
  totalRounds: 0,
  history: [],
});

const currentRound = computed(() => rounds.value[state.currentRoundIndex]);

const timerStart = ref<number | null>(null);
const currentRoundDuration = ref(0);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

const formattedRoundTime = computed(() => {
  const seconds = Math.floor(currentRoundDuration.value / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
});

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerStart.value = Date.now();
  currentRoundDuration.value = 0;
  timerInterval.value = setInterval(() => {
    if (timerStart.value) {
      currentRoundDuration.value = Date.now() - timerStart.value;
    }
  }, 100);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const areBothImagesLoaded = computed(() => {
  // If we're not waiting for images, we consider them loaded
  if (!currentRound.value) return true;
  return mediaLoaded.A && mediaLoaded.B;
});

watch(areBothImagesLoaded, (loaded) => {
  if (loaded && state.status === GameStatus.PLAYING) {
    startTimer();
  }
});

const commonDuration = computed(() => {
  if (durations.A > 0 && durations.B > 0) {
    return Math.min(durations.A, durations.B);
  }
  return undefined;
});

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

    // Scroll to detection grid if game is in PLAYING state
    if (state.status === GameStatus.PLAYING) {
      await nextTick();
      scrollToDetectionGrid();
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

  stopTimer();
  // Calculate final duration. If timer wasn't running (shouldn't happen if loaded), default to 0.
  const finalDuration = timerStart.value ? Date.now() - timerStart.value : 0;

  selectedImageId.value = imageId;
  state.status = GameStatus.ROUND_RESULT;

  const isCorrect = isSelectionCorrectId(imageId);
  if (isCorrect) {
    state.score++;
  }

  state.history.push({
    roundId: currentRound.value.id,
    userCorrect: isCorrect,
    duration: finalDuration,
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
      finalDuration,
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

const totalGameDuration = computed(() => {
  return state.history.reduce((acc, curr) => acc + (curr.duration || 0), 0);
});

const scrollToDetectionGrid = () => {
  if (detectionGridWrapper.value) {
    detectionGridWrapper.value.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

const nextRound = async () => {
  if (state.currentRoundIndex < state.totalRounds - 1) {
    // Reset loading state immediately to hide grid before new content loads
    mediaLoaded.A = false;
    mediaLoaded.B = false;
    durations.A = 0;
    durations.B = 0;
    currentRoundDuration.value = 0;
    timerStart.value = null;
    currentGlobalStats.value = null;

    await nextTick();

    state.currentRoundIndex++;
    selectedImageId.value = null;
    state.status = GameStatus.PLAYING;

    // Scroll to the detection grid after state update
    await nextTick();
    scrollToDetectionGrid();
  } else {
    state.status = GameStatus.GAME_OVER;
    if (loadedDate.value) {
      finishGame(props.mode || "image", loadedDate.value);
    }
  }
};

const switchMode = (newMode: "image" | "video") => {
  if (props.mode === newMode) return;

  // Switch to the other mode's weekly game
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
/* ========================================
   DETECTION SYSTEM BASE
   ======================================== */

.detection-system {
  background: #0a0a0f;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Terminal Background Effects */
.terminal-scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.01) 0px,
    rgba(0, 0, 0, 0.02) 1px,
    transparent 2px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 1;
}

.terminal-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

/* ========================================
   CYBER HEADER
   ======================================== */

.cyber-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(139, 92, 246, 0.3);
}

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  position: relative;
}

@media (max-width: 767px) {
  .header-container {
    display: flex;
  }
}

/* Header Brackets */
.header-bracket {
  position: absolute;
  width: 16px;
  height: 16px;
}

.header-bracket::before,
.header-bracket::after {
  content: "";
  position: absolute;
  background: #8b5cf6;
}

.header-bracket::before {
  width: 100%;
  height: 2px;
}

.header-bracket::after {
  width: 2px;
  height: 100%;
}

.header-bracket-tl {
  top: 0;
  left: 1rem;
}

.header-bracket-tl::before {
  top: 0;
  left: 0;
}

.header-bracket-tl::after {
  top: 0;
  left: 0;
}

.header-bracket-tr {
  top: 0;
  right: 1rem;
}

.header-bracket-tr::before {
  top: 0;
  right: 0;
}

.header-bracket-tr::after {
  top: 0;
  right: 0;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mobile-menu-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.mobile-menu-btn .terminal-text {
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .mobile-menu-btn {
    display: flex;
  }
}

/* Brand */
.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-brand:hover {
  transform: translateX(4px);
}

.brand-icon {
  position: relative;
  width: 32px;
  height: 32px;
}

.brand-icon img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.icon-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%);
  filter: blur(8px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

@media (max-width: 640px) {
  .brand-text {
    display: none;
  }
}

.brand-title {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-subtitle {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(236, 72, 153, 0.7);
}

.terminal-bracket {
  color: rgba(139, 92, 246, 0.6);
  font-weight: bold;
}

/* Mode Selector (centered in grid) */
.mode-selector {
  display: none;
  gap: 0.5rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.5rem;
  justify-self: center;
}

@media (min-width: 768px) {
  .mode-selector {
    display: flex;
  }
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 1.5rem;
  justify-self: end;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.mode-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mode-button:hover {
  background: rgba(139, 92, 246, 0.1);
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.mode-button.active {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.2),
    rgba(236, 72, 153, 0.2)
  );
  color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

.mode-icon {
  font-size: 0.875rem;
}

/* Nav Links */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-link:hover {
  color: #8b5cf6;
  transform: translateY(-2px);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link:hover .nav-bracket {
  color: #ec4899;
}

.nav-text {
  text-transform: uppercase;
}

/* System Stats */
.system-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  width: 5rem;
  flex-shrink: 0;
  overflow: hidden;
}

.stat-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.5),
    transparent
  );
  animation: stat-scan 3s linear infinite;
}

@keyframes stat-scan {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.stat-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4);
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: "IBM Plex Mono", monospace;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
  text-align: right;
  width: 100%;
}

.stat-indicator {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: stat-pulse 2s ease-in-out infinite;
}

@keyframes stat-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

.stat-indicator-primary {
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
}

.stat-indicator-success {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
}

.stat-indicator-cyan {
  background: #06b6d4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
}

/* ========================================
   TERMINAL DRAWER
   ======================================== */

.terminal-drawer {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.terminal-drawer.open {
  opacity: 1;
  pointer-events: all;
}

.drawer-content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(320px, 80vw);
  background: #0a0a0f;
  border-right: 2px solid rgba(139, 92, 246, 0.3);
  padding: 1.5rem;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow-y: auto;
}

.terminal-drawer.open .drawer-content {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.drawer-title {
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.95);
}

.drawer-close {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drawer-close:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.drawer-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(236, 72, 153, 0.7);
  margin-bottom: 0.75rem;
}

.drawer-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 0.5rem;
  position: relative;
}

.drawer-button:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateX(4px);
}

.drawer-button.active {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(236, 72, 153, 0.15)
  );
  border-color: rgba(139, 92, 246, 0.5);
  color: #8b5cf6;
}

.button-icon {
  font-size: 0.875rem;
  color: rgba(139, 92, 246, 0.7);
}

.button-text {
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.button-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.drawer-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.3),
    transparent
  );
  margin: 1.5rem 0;
}

.drawer-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  font-size: 0.5rem;
  color: rgba(139, 92, 246, 0.1);
  word-wrap: break-word;
  overflow: hidden;
  pointer-events: none;
}

/* ========================================
   DETECTION ZONE (MAIN CONTENT)
   ======================================== */

.detection-zone {
  position: relative;
  z-index: 10;
  min-height: calc(100vh - 120px);
}

.detection-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem;
}

/* ========================================
   MISSION BRIEF
   ======================================== */

.mission-brief {
  margin-bottom: 2rem;
}

.brief-header {
  position: relative;
  text-align: center;
  padding: 1.5rem 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.05),
    rgba(236, 72, 153, 0.05)
  );
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  min-height: 8rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.brief-corner {
  position: absolute;
  width: 20px;
  height: 20px;
}

.brief-corner::before,
.brief-corner::after {
  content: "";
  position: absolute;
  background: #8b5cf6;
}

.brief-corner::before {
  width: 100%;
  height: 2px;
}

.brief-corner::after {
  width: 2px;
  height: 100%;
}

.brief-corner-tl {
  top: 1rem;
  left: 1rem;
}

.brief-corner-tl::before {
  top: 0;
  left: 0;
}

.brief-corner-tl::after {
  top: 0;
  left: 0;
}

.brief-corner-tr {
  top: 1rem;
  right: 1rem;
}

.brief-corner-tr::before {
  top: 0;
  right: 0;
}

.brief-corner-tr::after {
  top: 0;
  right: 0;
}

.brief-corner-bl {
  bottom: 1rem;
  left: 1rem;
}

.brief-corner-bl::before {
  bottom: 0;
  left: 0;
}

.brief-corner-bl::after {
  bottom: 0;
  left: 0;
}

.brief-corner-br {
  bottom: 1rem;
  right: 1rem;
}

.brief-corner-br::before {
  bottom: 0;
  right: 0;
}

.brief-corner-br::after {
  bottom: 0;
  right: 0;
}

.brief-title {
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #ffffff, rgba(139, 92, 246, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: brief-glow 3s ease-in-out infinite;
}

@keyframes brief-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
  }
}

.brief-theme {
  min-height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.theme-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.05em;
}

.theme-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #8b5cf6;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.brief-stats {
  min-height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.stats-icon {
  color: rgba(139, 92, 246, 0.6);
}

.brief-instructions {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.025em;
}

/* ========================================
   SYSTEM STATES (LOADING, ERROR)
   ======================================== */

.system-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.state-content {
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: #8b5cf6;
  border-right-color: #ec4899;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-core {
  position: absolute;
  inset: 10px;
  border: 2px solid transparent;
  border-left-color: #06b6d4;
  border-bottom-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-message {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.state-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.state-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.state-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.state-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.state-error {
  color: #f87171;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: error-pulse 2s ease-in-out infinite;
}

@keyframes error-pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.terminal-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.terminal-button:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.terminal-text {
  text-transform: uppercase;
}

/* ========================================
   DETECTION GRID
   ======================================== */

.detection-grid-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.scanning-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan-animation {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
  animation: scan-sweep 2s linear infinite;
}

@keyframes scan-sweep {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(200px);
  }
}

.scan-grid {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
}

.scan-grid::before,
.scan-grid::after {
  content: "";
  position: absolute;
  background: rgba(139, 92, 246, 0.2);
}

.scan-grid::before {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
}

.scan-grid::after {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.scan-status {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(139, 92, 246, 0.9);
  animation: scan-blink 1s steps(2) infinite;
}

@keyframes scan-blink {
  50% {
    opacity: 0.5;
  }
}

.detection-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .detection-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

.detection-frame {
  position: relative;
}

/* ========================================
   GAME STATS PANEL
   ======================================== */

.game-stats-panel {
  margin-top: 1.5rem;
}

.stats-panel-inner {
  position: relative;
  background: rgba(10, 10, 15, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  padding: 1rem;
  overflow: hidden;
}

.stats-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 2px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 1;
}

.stats-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  z-index: 10;
}

.stats-corner::before,
.stats-corner::after {
  content: "";
  position: absolute;
  background: #8b5cf6;
}

.stats-corner::before {
  width: 100%;
  height: 2px;
}

.stats-corner::after {
  width: 2px;
  height: 100%;
}

.stats-corner-tl {
  top: 0;
  left: 0;
}

.stats-corner-tl::before {
  top: 0;
  left: 0;
}

.stats-corner-tl::after {
  top: 0;
  left: 0;
}

.stats-corner-tr {
  top: 0;
  right: 0;
}

.stats-corner-tr::before {
  top: 0;
  right: 0;
}

.stats-corner-tr::after {
  top: 0;
  right: 0;
}

.stats-corner-bl {
  bottom: 0;
  left: 0;
}

.stats-corner-bl::before {
  bottom: 0;
  left: 0;
}

.stats-corner-bl::after {
  bottom: 0;
  left: 0;
}

.stats-corner-br {
  bottom: 0;
  right: 0;
}

.stats-corner-br::before {
  bottom: 0;
  right: 0;
}

.stats-corner-br::after {
  bottom: 0;
  right: 0;
}

.stats-grid {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

.stat-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.stat-box:hover {
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.05);
}

.stat-box-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: "IBM Plex Mono", monospace;
}

.stat-box-bracket {
  color: rgba(139, 92, 246, 0.6);
  font-size: 0.625rem;
  font-weight: 700;
}

.stat-box-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.stat-box-value {
  font-family: "IBM Plex Mono", monospace;
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
  min-width: 3rem;
  text-align: center;
}

.stat-box-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  animation: stat-pulse 2s ease-in-out infinite;
}

/* ========================================
   STATS DISPLAY
   ======================================== */

.stats-display {
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.global-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1),
    rgba(236, 72, 153, 0.1)
  );
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.75rem;
  animation: stat-slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes stat-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-bracket {
  font-size: 1.125rem;
  color: rgba(139, 92, 246, 0.5);
  font-weight: bold;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: #8b5cf6;
  letter-spacing: 0.05em;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

/* ========================================
   ACTION BUTTON
   ======================================== */

.action-zone {
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 3rem;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
}

.action-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.6);
}

.action-button:active {
  transform: translateY(-2px) scale(1.02);
}

.button-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.5),
    rgba(236, 72, 153, 0.5)
  );
  filter: blur(16px);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.action-button:hover .button-glow {
  opacity: 1;
}

.button-icon {
  font-size: 1.5rem;
  animation: icon-bounce 2s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}

.button-trail {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  transform: translateY(-50%) translateX(-100%);
  animation: trail-sweep 2s linear infinite;
}

@keyframes trail-sweep {
  to {
    transform: translateY(-50%) translateX(100%);
  }
}

/* ========================================
   INTEL SECTION (FAQ)
   ======================================== */

.intel-section {
  margin-top: 3rem;
  padding: 2rem 0;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

.intel-header {
  text-align: center;
  margin-bottom: 2rem;
}

.intel-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1),
    rgba(236, 72, 153, 0.1)
  );
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.95);
}

.intel-panels {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.intel-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.intel-panel:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
}

.intel-panel.expanded {
  border-color: rgba(139, 92, 246, 0.6);
  background: rgba(139, 92, 246, 0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  transition: color 0.3s ease;
}

.intel-panel.expanded .panel-header {
  color: #8b5cf6;
}

.panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.2),
    rgba(236, 72, 153, 0.2)
  );
  border-radius: 50%;
  font-size: 0.75rem;
  color: #8b5cf6;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.intel-panel.expanded .panel-icon {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.3),
    rgba(236, 72, 153, 0.3)
  );
  transform: rotate(90deg);
}

.panel-title {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  color: rgba(255, 255, 255, 0.9);
}

.panel-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.intel-panel.expanded .panel-content {
  max-height: 1000px;
}

.panel-answer {
  padding: 0 1rem 1rem 3.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  animation: fade-in-content 0.6s ease-out forwards;
}

@keyframes fade-in-content {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-accent {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #8b5cf6,
    #ec4899,
    transparent
  );
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.intel-panel.expanded .panel-accent {
  transform: scaleX(1);
}

/* ========================================
   CLS PREVENTION
   ======================================== */

.game-grid-container {
  min-height: max(400px, calc((100vw - 3rem) * 0.75 * 2 + 2rem));
  contain: layout style;
}

@media (min-width: 768px) {
  .game-grid-container {
    min-height: max(350px, calc((50vw - 4.5rem) * 0.75 + 3rem));
  }
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
   ======================================== */

@media (max-width: 640px) {
  .system-stats {
    display: none;
  }

  .detection-container {
    padding: 1rem 1rem;
  }

  .brief-header {
    padding: 1.25rem 1rem;
    min-height: 7rem;
  }

  .brief-title {
    font-size: 1.25rem;
  }

  .theme-value {
    font-size: 0.875rem;
  }

  .action-button {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .panel-answer {
    padding-left: 2.5rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }

  .stat-item {
    min-width: 3.5rem;
    padding: 0.375rem 0.5rem;
  }

  .stat-value {
    font-size: 0.75rem;
  }

  .stat-label {
    font-size: 0.5625rem;
  }
}
</style>
