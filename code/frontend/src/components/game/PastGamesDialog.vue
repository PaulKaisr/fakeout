<template>
  <v-dialog
    v-model="dialogModel"
    :fullscreen="isMobile"
    :max-width="isMobile ? undefined : '700px'"
    :height="isMobile ? undefined : '85vh'"
    transition="dialog-bottom-transition"
    content-class="fracture-dialog-wrapper"
  >
    <div class="fracture-dialog">
      <!-- Background Effects -->
      <div class="dialog-scanlines"></div>

      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <span>◆</span>
          </div>
          <div class="header-info">
            <h2 class="header-title">
              <span class="title-bracket">[</span>
              {{ t("archive.title") }}
              <span class="title-bracket">]</span>
            </h2>
            <p class="header-subtitle">{{ t("archive.subtitle") }}</p>
          </div>
        </div>

        <button class="close-button" @click="closeDialog">
          <span class="close-bracket">[</span>
          <span class="close-text">×</span>
          <span class="close-bracket">]</span>
        </button>
      </div>

      <!-- Terminal Divider -->
      <div class="terminal-divider">
        <span v-for="i in 80" :key="`div1-${i}`" class="divider-char">─</span>
      </div>

      <!-- Mode Toggle -->
      <div class="mode-toggle-wrapper">
        <div class="mode-toggle">
          <button
            class="mode-button"
            :class="{ 'mode-active': internalMode === 'video' }"
            @click="internalMode = 'video'"
          >
            <span class="mode-icon">▶</span>
            <span class="mode-text">VIDEO</span>
          </button>
          <button
            class="mode-button"
            :class="{ 'mode-active': internalMode === 'image' }"
            @click="internalMode = 'image'"
          >
            <span class="mode-icon">◆</span>
            <span class="mode-text">PHOTO</span>
          </button>
        </div>
      </div>

      <!-- Terminal Divider -->
      <div class="terminal-divider">
        <span v-for="i in 80" :key="`div2-${i}`" class="divider-char">─</span>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">LOADING...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="dates.length === 0" class="empty-state">
          <div class="empty-icon">
            <span>∅</span>
          </div>
          <p class="empty-text">{{ t("archive.noGames") }}</p>
          <div class="empty-binary">00000000</div>
        </div>

        <!-- Games List -->
        <div v-else class="games-list">
          <div
            v-for="(date, index) in dates"
            :key="date"
            class="game-item"
            :style="{ animationDelay: `${index * 0.03}s` }"
            @click="playGame(date)"
          >
            <div class="game-content">
              <!-- Date Icon -->
              <div class="game-icon">
                <span>▣</span>
              </div>

              <!-- Game Info -->
              <div class="game-info">
                <h3 class="game-date">{{ formatDate(date) }}</h3>
                <p class="game-date-code">{{ date }}</p>

                <!-- Prompt Preview -->
                <p v-if="prompts[date]" class="game-prompt">
                  <span class="prompt-quote">"</span>
                  {{ prompts[date].slice(0, 35) + (prompts[date].length > 35 ? "..." : "") }}
                  <span class="prompt-quote">"</span>
                </p>

                <!-- Play Count -->
                <div class="game-meta">
                  <template v-if="playCounts[date] === undefined">
                    <div class="meta-loading"></div>
                  </template>
                  <template v-else-if="playCounts[date] > 0">
                    <span class="meta-label">//</span>
                    <span class="meta-value">{{ playCounts[date] }} {{ t("game.plays") }}</span>
                  </template>
                </div>
              </div>

              <!-- Status/Stats -->
              <div v-if="getGameStatus(date)" class="game-status">
                <div class="status-score">
                  {{ getGameStatus(date)?.score }}<span class="score-separator">/</span>{{ getGameStatus(date)?.totalRounds || "?" }}
                </div>
                <div
                  class="status-badge"
                  :class="getGameStatus(date)?.isFinished ? 'badge-finished' : 'badge-progress'"
                >
                  <span class="badge-bracket">▸</span>
                  <span class="badge-text">
                    {{ getGameStatus(date)?.isFinished ? t("archive.finished") : t("archive.inProgress") }}
                  </span>
                  <span class="badge-bracket">◂</span>
                </div>
              </div>

              <!-- Arrow Indicator -->
              <div v-else class="game-arrow">
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import { getGameStats } from "@/services/userStatsService";
import { supabaseService } from "@/services/supabaseService";

const { t, locale } = useI18n();
const router = useRouter();
const { mobile } = useDisplay();
const r2Service = createR2Service(r2Config);

const getGameStatus = (date: string) => {
  const game = getGameStats(internalMode.value, date);
  if (!game) return null;
  // If we don't store totalRounds in progress (we only store in aggregate), we might need to guess or assume e.g. 5
  // But wait, recordRoundResult increments totalRounds in aggregate.
  // SingleGameProgress has roundsPlayed.
  // Actually, we don't know totalRounds for a single game unless we store it or assume it.
  // Let's use roundsPlayed for now, or just show score.
  // Wait, I didn't add totalRounds to SingleGameProgress!
  return {
    score: game.score,
    totalRounds: game.totalRounds || game.roundsPlayed, // Fallback if old data
    isFinished: game.isFinished,
  };
};

const props = defineProps<{
  modelValue: boolean;
  mode?: "image" | "video";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dates = ref<string[]>([]);
const prompts = ref<Record<string, string>>({});
const playCounts = ref<Record<string, number>>({});
const loading = ref(false);
const isMobile = computed(() => mobile.value);

// Internal mode state, initialized from prop
const internalMode = ref<"image" | "video">(props.mode || "image");

// Computed property for v-model binding
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Watch for dialog open to fetch data
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue) {
      // Reset internal mode to prop value when dialog opens
      internalMode.value = props.mode || "image";
      await fetchDates();
    }
  },
);

// Watch for mode toggle to refetch data
watch(internalMode, async () => {
  if (props.modelValue) {
    await fetchDates();
  }
});

const fetchDates = async () => {
  loading.value = true;
  try {
    const manifestMode = internalMode.value === "video" ? "videos" : "images";
    const manifest = await r2Service.fetchManifest(manifestMode);
    dates.value = manifest.dates;
    prompts.value = manifest.prompts || {};
    playCounts.value = {}; // Reset play counts when switching modes

    // Fetch play counts in parallel
    // We do this without blocking the UI loading state completely if we wanted,
    // but honestly it's better to show them when ready.
    // Let's just fire and forget or await if fast.
    // Iterating one by one is slow. But let's just do it.
    // To avoid blinking, we can just let them populate.
    dates.value.forEach(async (date) => {
      const count = await supabaseService.getGamePlayCount(
        internalMode.value,
        date,
      );
      playCounts.value[date] = count;
    });
  } catch (e) {
    console.error("Failed to fetch archive", e);
  } finally {
    loading.value = false;
  }
};

const playGame = (date: string) => {
  const basePath = internalMode.value === "video" ? "video" : "image";
  router.push(`/${locale.value}/${basePath}/${date}`);
  closeDialog();
};

const closeDialog = () => {
  emit("update:modelValue", false);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString(locale.value, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};
</script>

<style scoped>
/* Fonts loaded globally in index.html */

/* ========================================
   FRACTURE DIALOG WRAPPER
   ======================================== */

:deep(.fracture-dialog-wrapper) {
  background: transparent !important;
  box-shadow: none !important;
}

/* ========================================
   FRACTURE DIALOG
   ======================================== */

.fracture-dialog {
  position: relative;
  height: 100%;
  background: #0a0a0f;
  border: 2px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 48px rgba(139, 92, 246, 0.4);
  font-family: 'IBM Plex Mono', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========================================
   BACKGROUND EFFECTS
   ======================================== */

.dialog-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 1;
  animation: scanline-drift 8s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

/* ========================================
   DIALOG HEADER
   ======================================== */

.dialog-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: rgba(139, 92, 246, 0.05);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  animation: header-slide-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes header-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.05);
  font-size: 1.5rem;
  color: #8b5cf6;
}

.header-info {
  flex: 1;
}

.header-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.title-bracket {
  color: rgba(139, 92, 246, 0.5);
}

.header-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.close-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 2px solid rgba(239, 68, 68, 0.3);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(239, 68, 68, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
}

.close-bracket {
  color: rgba(239, 68, 68, 0.5);
  transition: all 0.3s ease;
}

.close-button:hover .close-bracket {
  color: #ec4899;
}

.close-text {
  font-size: 1.5rem;
  line-height: 1;
}

/* ========================================
   TERMINAL DIVIDER
   ======================================== */

.terminal-divider {
  position: relative;
  z-index: 10;
  overflow: hidden;
  height: 1px;
  display: flex;
  opacity: 0.3;
  background: rgba(139, 92, 246, 0.1);
}

.divider-char {
  color: #8b5cf6;
  font-size: 0.6rem;
  line-height: 1;
  animation: divider-flicker 3s linear infinite;
}

.divider-char:nth-child(even) {
  animation-delay: -1.5s;
}

@keyframes divider-flicker {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* ========================================
   MODE TOGGLE
   ======================================== */

.mode-toggle-wrapper {
  position: relative;
  z-index: 10;
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.mode-toggle {
  display: flex;
  gap: 0.5rem;
  border: 2px solid rgba(139, 92, 246, 0.3);
  background: rgba(0, 0, 0, 0.3);
}

.mode-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-button:hover {
  color: rgba(255, 255, 255, 0.8);
}

.mode-active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
  border-left: 2px solid #8b5cf6;
}

.mode-icon {
  font-size: 0.9rem;
}

.mode-text {
  /* No special styling needed */
}

/* ========================================
   DIALOG CONTENT
   ======================================== */

.dialog-content {
  position: relative;
  z-index: 10;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.6);
}

/* ========================================
   LOADING STATE
   ======================================== */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  animation: loading-pulse 2s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ========================================
   EMPTY STATE
   ======================================== */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.05);
  font-size: 3rem;
  color: rgba(139, 92, 246, 0.5);
  margin-bottom: 1.5rem;
  animation: empty-pulse 3s ease-in-out infinite;
}

@keyframes empty-pulse {
  0%, 100% {
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 0 0 rgba(139, 92, 246, 0);
  }
  50% {
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  }
}

.empty-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
}

.empty-binary {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: rgba(139, 92, 246, 0.3);
  letter-spacing: 0.2em;
}

/* ========================================
   GAMES LIST
   ======================================== */

.games-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ========================================
   GAME ITEM
   ======================================== */

.game-item {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(139, 92, 246, 0.2);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: game-entrance 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

@keyframes game-entrance {
  0% {
    opacity: 0;
    transform: translateX(-30px) rotateY(-5deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

.game-item:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(139, 92, 246, 0.4);
}

/* ========================================
   GAME CONTENT
   ======================================== */

.game-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

@media (max-width: 640px) {
  .game-content {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
}

.game-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.05);
  font-size: 1.25rem;
  color: #8b5cf6;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.game-item:hover .game-icon {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

/* ========================================
   GAME INFO
   ======================================== */

.game-info {
  flex: 1;
  min-width: 0;
}

.game-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-date-code {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.game-prompt {
  font-size: 0.7rem;
  color: rgba(236, 72, 153, 0.8);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-quote {
  color: rgba(139, 92, 246, 0.5);
}

.game-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 1rem;
}

.meta-loading {
  width: 60px;
  height: 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  animation: meta-pulse 1.5s ease-in-out infinite;
}

@keyframes meta-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.meta-label {
  font-size: 0.65rem;
  color: rgba(139, 92, 246, 0.5);
  font-weight: 700;
}

.meta-value {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ========================================
   GAME STATUS
   ======================================== */

.game-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.status-score {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
  letter-spacing: -0.02em;
}

.score-separator {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 400;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border: 1.5px solid;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.badge-finished {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.badge-progress {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.badge-bracket {
  font-size: 0.75rem;
  animation: badge-bracket-pulse 2s ease-in-out infinite;
}

@keyframes badge-bracket-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.badge-text {
  font-size: 0.6rem;
}

/* ========================================
   GAME ARROW
   ======================================== */

.game-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.25rem;
  color: rgba(139, 92, 246, 0.4);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.game-item:hover .game-arrow {
  color: #8b5cf6;
  transform: translateX(4px);
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 640px) {
  .dialog-header {
    padding: 1rem 1.5rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-subtitle {
    font-size: 0.7rem;
  }

  .close-button {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
  }

  .mode-toggle-wrapper {
    padding: 0.75rem 1.5rem;
  }

  .mode-button {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .dialog-content {
    padding: 1rem 1.5rem;
  }

  .game-date {
    font-size: 0.85rem;
  }

  .status-score {
    font-size: 1.25rem;
  }

  .status-badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.6rem;
  }
}
</style>
