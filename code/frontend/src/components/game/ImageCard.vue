<template>
  <div
    class="fracture-image-card"
    :class="{
      'card-selected': isSelected && !showResult,
      'card-correct': showResult && isCorrect,
      'card-incorrect': showResult && !isCorrect && isSelected,
      'card-dimmed': showResult && !isCorrect && !isSelected,
    }"
    @click="$emit('select')"
  >
    <!-- Scanline Overlay -->
    <div class="card-scanlines"></div>

    <!-- Corner Indicators -->
    <div class="card-corner card-corner-tl"></div>
    <div class="card-corner card-corner-tr"></div>
    <div class="card-corner card-corner-bl"></div>
    <div class="card-corner card-corner-br"></div>

    <!-- Media Container -->
    <div class="media-container">
      <!-- Image -->
      <v-img
        v-if="image.mediaType !== 'video'"
        :src="image.url"
        class="media-content"
        cover
        eager
        @load="$emit('load')"
        @error="$emit('load')"
      >
        <template #placeholder>
          <div class="media-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </template>
      </v-img>

      <!-- Video -->
      <video
        v-else
        ref="videoRef"
        :src="image.url"
        class="media-content"
        autoplay
        loop
        muted
        playsinline
        @loadedmetadata="onVideoMetadataLoaded"
        @loadeddata="onVideoLoaded"
        @timeupdate="onTimeUpdate"
        @error="$emit('load')"
      ></video>

      <!-- Glitch Effect Layer -->
      <div class="glitch-layer"></div>
    </div>

    <!-- Label Badge -->
    <div class="label-badge">
      <span class="label-bracket">[</span>
      <span class="label-text">{{ label }}</span>
      <span class="label-bracket">]</span>
    </div>

    <!-- Selection Indicator -->
    <div v-if="isSelected && !showResult" class="selection-indicator">
      <div class="selection-pulse"></div>
    </div>

    <!-- Result Overlay -->
    <div v-if="showResult" class="result-overlay">
      <!-- Result Icon -->
      <div class="result-icon-container">
        <div class="result-icon-bg"></div>
        <div class="result-icon" :class="image.isAiGenerated ? 'icon-ai' : 'icon-real'">
          {{ image.isAiGenerated ? '⚡' : '📷' }}
        </div>
      </div>

      <!-- Result Label -->
      <div class="result-label">
        <div class="result-type">
          {{
            image.isAiGenerated
              ? t("game.aiGenerated")
              : t(`game.real.${image.mediaType || "image"}`)
          }}
        </div>
        <div v-if="isSelected" class="result-verdict" :class="isCorrect ? 'verdict-correct' : 'verdict-wrong'">
          <span class="verdict-bracket">▸</span>
          {{ isCorrect ? t("game.correct") : t("game.wrong") }}
          <span class="verdict-bracket">◂</span>
        </div>
      </div>

      <!-- Credits/Prompt Section -->
      <div v-if="!image.isAiGenerated && image.credit" class="result-credits">
        <div class="credits-divider"></div>
        <p class="credits-label">
          {{
            image.mediaType === "video" ? t("game.videoBy") : t("game.photoBy")
          }}
        </p>
        <a
          v-if="image.creditUrl"
          :href="image.creditUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="credits-link"
          @click.stop
        >
          {{ image.credit }}
        </a>
        <span v-else class="credits-text">
          {{ image.credit }}
        </span>

        <div v-if="image.sourceUrl" class="credits-source">
          <a
            :href="image.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="source-link"
            @click.stop
          >
            {{ t("game.viewOnPexels") }} →
          </a>
        </div>
      </div>

      <!-- AI Prompt -->
      <div
        v-if="image.isAiGenerated && image.prompt"
        class="result-prompt"
      >
        <v-menu location="top" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <button
              v-bind="props"
              class="prompt-button"
              @click.stop
            >
              <span class="prompt-bracket">[</span>
              <span class="prompt-text">{{ t("game.viewPrompt") || "View Prompt" }}</span>
              <span class="prompt-bracket">]</span>
              <div class="prompt-button-scan"></div>
            </button>
          </template>

          <v-card class="terminal-prompt-wrapper">
            <div class="terminal-prompt-card">
              <!-- Scanlines -->
              <div class="prompt-scanlines"></div>

              <!-- Corner Brackets -->
              <div class="prompt-corner prompt-corner-tl"></div>
              <div class="prompt-corner prompt-corner-tr"></div>
              <div class="prompt-corner prompt-corner-bl"></div>
              <div class="prompt-corner prompt-corner-br"></div>

              <!-- Header -->
              <div class="prompt-card-header">
                <span class="prompt-header-bracket">▸</span>
                <span class="prompt-header-text">{{ t("game.prompt") || "PROMPT" }}</span>
                <span class="prompt-header-bracket">◂</span>
              </div>

              <!-- Content -->
              <div class="prompt-card-body">
                <div class="markdown-body" v-html="renderedPrompt"></div>
              </div>

              <!-- Footer -->
              <div class="prompt-card-footer">
                <span class="prompt-footer-text">AI_GENERATED</span>
                <span class="prompt-footer-binary">{{ Array(6).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('') }}</span>
              </div>
            </div>
          </v-card>
        </v-menu>
      </div>

      <!-- Binary Pattern -->
      <div class="result-binary">
        {{ image.isAiGenerated ? '01010101' : '11110000' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from "@/types/game";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";

// Lazy-load markdown-it only when needed (reduces initial bundle)
let mdInstance: any = null;
const getMd = async () => {
  if (!mdInstance) {
    const MarkdownIt = (await import("markdown-it")).default;
    mdInstance = new MarkdownIt();
  }
  return mdInstance;
};

const { t } = useI18n();

const props = defineProps<{
  image: Image;
  label: string;
  isSelected?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  maxDuration?: number;
}>();

const emit = defineEmits(["select", "load"]);

const videoRef = ref<HTMLVideoElement | null>(null);
const renderedPrompt = ref<string>("");

// Render markdown only when prompt is shown
const renderPrompt = async () => {
  if (props.image.prompt && !renderedPrompt.value) {
    const md = await getMd();
    renderedPrompt.value = md.render(props.image.prompt);
  }
};

// Watch for when we need to show the prompt and render markdown
watch(
  () => props.showResult && props.image.isAiGenerated && props.image.prompt,
  (shouldShow) => {
    if (shouldShow) {
      renderPrompt();
    }
  },
  { immediate: true },
);

// Track whether we've already emitted the load event to avoid duplicates
let hasEmittedLoad = false;

// Capture duration from loadedmetadata event (when metadata is reliably available)
const onVideoMetadataLoaded = (event: Event) => {
  if (hasEmittedLoad) return;

  const video = event.target as HTMLVideoElement;
  const duration = video.duration;

  // Validate duration is a sensible value (not NaN, Infinity, or too short)
  if (Number.isFinite(duration) && duration > 0.5) {
    hasEmittedLoad = true;
    emit("load", duration);
  }
};

// Fallback: emit load without duration if metadata event didn't provide valid duration
const onVideoLoaded = () => {
  if (hasEmittedLoad) return;
  hasEmittedLoad = true;
  emit("load");
};

// Throttled timeupdate handler to reduce main thread blocking
let lastTimeCheck = 0;
const onTimeUpdate = () => {
  if (!videoRef.value || !props.maxDuration) return;

  // Throttle to max 4 checks per second (every 250ms)
  const now = performance.now();
  if (now - lastTimeCheck < 250) return;
  lastTimeCheck = now;

  if (videoRef.value.currentTime >= props.maxDuration) {
    videoRef.value.currentTime = 0;
    videoRef.value.play();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

/* ========================================
   FRACTURE IMAGE CARD
   ======================================== */

.fracture-image-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(139, 92, 246, 0.2);
  cursor: pointer;
  overflow: hidden;
  font-family: 'IBM Plex Mono', monospace;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fracture-image-card:hover {
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-4px);
  box-shadow:
    0 8px 24px rgba(139, 92, 246, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.3);
}

.card-selected {
  border-color: rgba(139, 92, 246, 0.8);
  box-shadow:
    0 0 0 4px rgba(139, 92, 246, 0.2),
    0 8px 32px rgba(139, 92, 246, 0.4);
}

.card-correct {
  border-color: #10b981;
  box-shadow:
    0 0 0 4px rgba(16, 185, 129, 0.2),
    0 8px 32px rgba(16, 185, 129, 0.4);
}

.card-incorrect {
  border-color: #ef4444;
  box-shadow:
    0 0 0 4px rgba(239, 68, 68, 0.2),
    0 8px 32px rgba(239, 68, 68, 0.4);
}

.card-dimmed {
  opacity: 0.4;
}

/* ========================================
   SCANLINES
   ======================================== */

.card-scanlines {
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
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fracture-image-card:hover .card-scanlines {
  opacity: 1;
}

/* ========================================
   CORNER INDICATORS
   ======================================== */

.card-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 15;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fracture-image-card:hover .card-corner {
  opacity: 1;
}

.card-corner::before,
.card-corner::after {
  content: '';
  position: absolute;
  background: #8b5cf6;
}

.card-corner::before {
  width: 100%;
  height: 2px;
}

.card-corner::after {
  width: 2px;
  height: 100%;
}

.card-corner-tl {
  top: 0;
  left: 0;
}

.card-corner-tl::before {
  top: 0;
  left: 0;
}

.card-corner-tl::after {
  top: 0;
  left: 0;
}

.card-corner-tr {
  top: 0;
  right: 0;
}

.card-corner-tr::before {
  top: 0;
  right: 0;
}

.card-corner-tr::after {
  top: 0;
  right: 0;
}

.card-corner-bl {
  bottom: 0;
  left: 0;
}

.card-corner-bl::before {
  bottom: 0;
  left: 0;
}

.card-corner-bl::after {
  bottom: 0;
  left: 0;
}

.card-corner-br {
  bottom: 0;
  right: 0;
}

.card-corner-br::before {
  bottom: 0;
  right: 0;
}

.card-corner-br::after {
  bottom: 0;
  right: 0;
}

/* ========================================
   MEDIA CONTAINER
   ======================================== */

.media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #000;
  overflow: hidden;
}

.media-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fracture-image-card:hover .media-content {
  transform: scale(1.05);
}

.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

/* Glitch Effect */
.glitch-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.1) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
}

.fracture-image-card:hover .glitch-layer {
  transform: translateX(100%);
}

/* ========================================
   LABEL BADGE
   ======================================== */

.label-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(10, 10, 15, 0.9);
  border: 2px solid rgba(139, 92, 246, 0.5);
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 1.25rem;
  color: #8b5cf6;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}

.fracture-image-card:hover .label-badge {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.6);
}

.label-bracket {
  color: rgba(139, 92, 246, 0.6);
  transition: all 0.3s ease;
}

.fracture-image-card:hover .label-bracket {
  color: #ec4899;
}

/* ========================================
   SELECTION INDICATOR
   ======================================== */

.selection-indicator {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 15;
}

.selection-pulse {
  position: absolute;
  inset: -4px;
  border: 4px solid rgba(139, 92, 246, 0.6);
  animation: selection-pulse-animation 1.5s ease-in-out infinite;
}

@keyframes selection-pulse-animation {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.02);
  }
}

/* ========================================
   RESULT OVERLAY
   ======================================== */

.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 25;
  animation: result-fade-in 0.4s ease backwards;
}

@keyframes result-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Result Icon */
.result-icon-container {
  position: relative;
  margin-bottom: 1.5rem;
  animation: result-icon-entrance 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s backwards;
}

@keyframes result-icon-entrance {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateY(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

.result-icon-bg {
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 70%);
  animation: icon-bg-pulse 2s ease-in-out infinite;
}

@keyframes icon-bg-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.result-icon {
  position: relative;
  font-size: 4rem;
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.8));
}

.icon-ai {
  animation: icon-ai-flicker 0.8s ease-in-out;
}

.icon-real {
  animation: icon-real-pulse 0.8s ease-in-out;
}

@keyframes icon-ai-flicker {
  0%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes icon-real-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Result Labels */
.result-label {
  text-align: center;
  margin-bottom: 1.5rem;
  animation: result-label-slide 0.6s ease 0.3s backwards;
}

@keyframes result-label-slide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-type {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.result-verdict {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.verdict-correct {
  color: #10b981;
}

.verdict-wrong {
  color: #ef4444;
}

.verdict-bracket {
  font-size: 1.25rem;
  animation: verdict-bracket-pulse 1s ease-in-out infinite;
}

@keyframes verdict-bracket-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ========================================
   CREDITS & PROMPT
   ======================================== */

.result-credits {
  text-align: center;
  margin-top: 1rem;
  animation: result-credits-fade 0.6s ease 0.4s backwards;
}

@keyframes result-credits-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.credits-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  margin: 0 auto 1rem;
}

.credits-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.credits-link,
.credits-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s ease;
}

.credits-link:hover {
  color: #06b6d4;
}

.credits-source {
  margin-top: 0.75rem;
}

.source-link {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.3s ease;
}

.source-link:hover {
  color: #06b6d4;
}

.result-prompt {
  margin-top: 1rem;
  animation: result-prompt-fade 0.6s ease 0.5s backwards;
}

@keyframes result-prompt-fade {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.prompt-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 2px solid rgba(139, 92, 246, 0.3);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.prompt-button:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  color: #8b5cf6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.prompt-bracket {
  color: rgba(139, 92, 246, 0.5);
  transition: all 0.3s ease;
}

.prompt-button:hover .prompt-bracket {
  color: #ec4899;
}

.prompt-button-scan {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent);
  animation: prompt-scan 2s linear infinite;
}

@keyframes prompt-scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ========================================
   TERMINAL PROMPT CARD
   ======================================== */

.terminal-prompt-wrapper {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  overflow: visible !important;
}

.terminal-prompt-card {
  position: relative;
  min-width: 320px;
  max-width: 400px;
  max-height: 500px;
  background: #0a0a0f;
  border: 2px solid rgba(139, 92, 246, 0.5);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
}

/* Scanlines */
.prompt-scanlines {
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
  animation: scanline-drift 8s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(3px); }
}

/* Corner Brackets */
.prompt-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 10;
  animation: corner-glow 3s ease-in-out infinite;
}

@keyframes corner-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.prompt-corner::before,
.prompt-corner::after {
  content: '';
  position: absolute;
  background: #8b5cf6;
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.6);
}

.prompt-corner::before {
  width: 100%;
  height: 2px;
}

.prompt-corner::after {
  width: 2px;
  height: 100%;
}

.prompt-corner-tl {
  top: 0;
  left: 0;
}

.prompt-corner-tl::before {
  top: 0;
  left: 0;
}

.prompt-corner-tl::after {
  top: 0;
  left: 0;
}

.prompt-corner-tr {
  top: 0;
  right: 0;
}

.prompt-corner-tr::before {
  top: 0;
  right: 0;
}

.prompt-corner-tr::after {
  top: 0;
  right: 0;
}

.prompt-corner-bl {
  bottom: 0;
  left: 0;
}

.prompt-corner-bl::before {
  bottom: 0;
  left: 0;
}

.prompt-corner-bl::after {
  bottom: 0;
  left: 0;
}

.prompt-corner-br {
  bottom: 0;
  right: 0;
}

.prompt-corner-br::before {
  bottom: 0;
  right: 0;
}

.prompt-corner-br::after {
  bottom: 0;
  right: 0;
}

/* Header */
.prompt-card-header {
  position: relative;
  z-index: 5;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
  border-bottom: 1px solid rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.prompt-header-bracket {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  color: rgba(139, 92, 246, 0.7);
  font-weight: 700;
  animation: header-bracket-pulse 2s ease-in-out infinite;
}

@keyframes header-bracket-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.prompt-header-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
}

/* Body */
.prompt-card-body {
  position: relative;
  z-index: 5;
  padding: 1.5rem;
  max-height: 350px;
  overflow-y: auto;
}

.prompt-card-body .markdown-body {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.prompt-card-body .markdown-body p {
  margin-bottom: 0.75rem;
}

.prompt-card-body .markdown-body strong {
  color: #8b5cf6;
  font-weight: 700;
}

.prompt-card-body .markdown-body em {
  color: #ec4899;
  font-style: italic;
}

.prompt-card-body .markdown-body code {
  padding: 0.125rem 0.375rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #06b6d4;
  font-size: 0.75rem;
}

/* Footer */
.prompt-card-footer {
  position: relative;
  z-index: 5;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt-footer-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(236, 72, 153, 0.7);
  text-transform: uppercase;
}

.prompt-footer-binary {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.5rem;
  color: rgba(139, 92, 246, 0.3);
  letter-spacing: 0.2em;
  animation: footer-binary-flicker 3s linear infinite;
}

@keyframes footer-binary-flicker {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Scrollbar */
.prompt-card-body::-webkit-scrollbar {
  width: 6px;
}

.prompt-card-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.prompt-card-body::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.4);
  border-radius: 0;
}

.prompt-card-body::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.6);
}

/* ========================================
   BINARY PATTERN
   ======================================== */

.result-binary {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: rgba(139, 92, 246, 0.2);
  letter-spacing: 0.2em;
  animation: binary-flicker 2s linear infinite;
}

@keyframes binary-flicker {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
</style>
