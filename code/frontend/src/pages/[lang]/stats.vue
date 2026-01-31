<template>
  <v-main class="fracture-stats-page min-h-screen">
    <!-- Background Effects -->
    <div class="stats-scanlines"></div>
    <div class="stats-grid-bg"></div>
    <div class="stats-noise"></div>

    <!-- Corner Brackets -->
    <div class="corner-bracket corner-tl"></div>
    <div class="corner-bracket corner-tr"></div>
    <div class="corner-bracket corner-bl"></div>
    <div class="corner-bracket corner-br"></div>

    <v-container class="relative z-10 py-12 max-w-5xl">
      <!-- Header -->
      <div class="stats-header mb-16">
        <button class="back-button" @click="router.back()">
          <span class="back-bracket">[</span>
          <span class="back-text">←</span>
          <span class="back-bracket">]</span>
        </button>

        <div class="header-title-wrapper">
          <h1 class="header-title">
            <span class="title-glitch" data-text="YOUR STATS">YOUR STATS</span>
          </h1>
          <div class="header-divider">
            <div class="divider-line"></div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Video Mode Stats -->
        <div class="stat-block stat-block-1" style="animation-delay: 0.1s">
          <!-- Block Number -->
          <div class="block-number">01</div>

          <!-- Corner Indicators -->
          <div class="block-corner block-corner-tl"></div>
          <div class="block-corner block-corner-tr"></div>
          <div class="block-corner block-corner-bl"></div>
          <div class="block-corner block-corner-br"></div>

          <!-- Scan Effect -->
          <div class="block-scan"></div>

          <div class="block-content">
            <!-- Header -->
            <div class="block-header">
              <div class="header-icon video-icon">
                <span>▶</span>
              </div>
              <div class="header-info">
                <h2 class="block-title">
                  <span class="title-bracket">[</span>
                  {{ t("stats.videoMode") }}
                  <span class="title-bracket">]</span>
                </h2>
                <p class="block-subtitle">{{ t("stats.videoModeDesc") }}</p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-data">
              <div class="data-item">
                <div class="data-value">{{ userStats.video.gamesPlayed }}</div>
                <div class="data-label">
                  <span class="label-slash">//</span>
                  {{ t("stats.gamesPlayed") }}
                </div>
              </div>
              <div class="data-item">
                <div class="data-value">
                  {{ userStats.video.totalScore
                  }}<span class="value-separator">/</span
                  >{{ userStats.video.totalRounds }}
                </div>
                <div class="data-label">
                  <span class="label-slash">//</span>
                  {{ t("stats.totalScore") }}
                </div>
              </div>
            </div>

            <!-- Accuracy -->
            <div class="accuracy-section">
              <div class="accuracy-header">
                <span class="accuracy-label">
                  <span class="label-bracket">▸</span>
                  {{ t("stats.accuracy") }}
                  <span class="label-bracket">◂</span>
                </span>
                <span class="accuracy-value video-color"
                  >{{ getAccuracy("video") }}%</span
                >
              </div>

              <!-- Terminal Progress Bar -->
              <div class="terminal-progress">
                <div class="progress-track">
                  <div
                    class="progress-fill video-fill"
                    :style="{ width: `${getAccuracy('video')}%` }"
                  >
                    <div class="progress-glitch"></div>
                  </div>
                </div>
                <div class="progress-segments">
                  <span
                    v-for="i in 20"
                    :key="i"
                    class="segment"
                    :class="{
                      'segment-active':
                        i <= Math.floor(getAccuracy('video') / 5),
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Mode Stats -->
        <div class="stat-block stat-block-2" style="animation-delay: 0.2s">
          <!-- Block Number -->
          <div class="block-number">02</div>

          <!-- Corner Indicators -->
          <div class="block-corner block-corner-tl"></div>
          <div class="block-corner block-corner-tr"></div>
          <div class="block-corner block-corner-bl"></div>
          <div class="block-corner block-corner-br"></div>

          <!-- Scan Effect -->
          <div class="block-scan"></div>

          <div class="block-content">
            <!-- Header -->
            <div class="block-header">
              <div class="header-icon image-icon">
                <span>◆</span>
              </div>
              <div class="header-info">
                <h2 class="block-title">
                  <span class="title-bracket">[</span>
                  {{ t("stats.imageMode") }}
                  <span class="title-bracket">]</span>
                </h2>
                <p class="block-subtitle">{{ t("stats.imageModeDesc") }}</p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-data">
              <div class="data-item">
                <div class="data-value">{{ userStats.image.gamesPlayed }}</div>
                <div class="data-label">
                  <span class="label-slash">//</span>
                  {{ t("stats.gamesPlayed") }}
                </div>
              </div>
              <div class="data-item">
                <div class="data-value">
                  {{ userStats.image.totalScore
                  }}<span class="value-separator">/</span
                  >{{ userStats.image.totalRounds }}
                </div>
                <div class="data-label">
                  <span class="label-slash">//</span>
                  {{ t("stats.totalScore") }}
                </div>
              </div>
            </div>

            <!-- Accuracy -->
            <div class="accuracy-section">
              <div class="accuracy-header">
                <span class="accuracy-label">
                  <span class="label-bracket">▸</span>
                  {{ t("stats.accuracy") }}
                  <span class="label-bracket">◂</span>
                </span>
                <span class="accuracy-value image-color"
                  >{{ getAccuracy("image") }}%</span
                >
              </div>

              <!-- Terminal Progress Bar -->
              <div class="terminal-progress">
                <div class="progress-track">
                  <div
                    class="progress-fill image-fill"
                    :style="{ width: `${getAccuracy('image')}%` }"
                  >
                    <div class="progress-glitch"></div>
                  </div>
                </div>
                <div class="progress-segments">
                  <span
                    v-for="i in 20"
                    :key="i"
                    class="segment"
                    :class="{
                      'segment-active':
                        i <= Math.floor(getAccuracy('image') / 5),
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Section -->
      <div class="reset-section" style="animation-delay: 0.3s">
        <div class="reset-divider">
          <span v-for="i in 60" :key="i" class="divider-char">─</span>
        </div>

        <button class="reset-button" @click="confirmReset">
          <span class="reset-icon">⌫</span>
          <span class="reset-text">{{ t("stats.resetStats") }}</span>
          <div class="reset-scan"></div>
        </button>
      </div>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import {
  userStats,
  getAccuracy,
  resetStats,
} from "@/services/userStatsService";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const router = useRouter();
const { t } = useI18n();
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.statsTitle,
  description: seoTranslations.statsDescription,
});

const confirmReset = () => {
  if (confirm(t("stats.resetConfirm"))) {
    resetStats();
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap");

/* ========================================
   FRACTURE STATS PAGE
   ======================================== */

.fracture-stats-page {
  background: #0a0a0f;
  position: relative;
  font-family: "IBM Plex Mono", monospace;
}

/* ========================================
   BACKGROUND EFFECTS
   ======================================== */

.stats-scanlines {
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
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(4px);
  }
}

.stats-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.5;
  z-index: 1;
}

.stats-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.4;
  pointer-events: none;
  z-index: 1;
}

/* ========================================
   CORNER BRACKETS
   ======================================== */

.corner-bracket {
  position: fixed;
  width: 24px;
  height: 24px;
  z-index: 5;
}

.corner-bracket::before,
.corner-bracket::after {
  content: "";
  position: absolute;
  background: #8b5cf6;
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.6);
}

.corner-bracket::before {
  width: 100%;
  height: 2px;
}

.corner-bracket::after {
  width: 2px;
  height: 100%;
}

.corner-tl {
  top: 1rem;
  left: 1rem;
}

.corner-tl::before {
  top: 0;
  left: 0;
}

.corner-tl::after {
  top: 0;
  left: 0;
}

.corner-tr {
  top: 1rem;
  right: 1rem;
}

.corner-tr::before {
  top: 0;
  right: 0;
}

.corner-tr::after {
  top: 0;
  right: 0;
}

.corner-bl {
  bottom: 1rem;
  left: 1rem;
}

.corner-bl::before {
  bottom: 0;
  left: 0;
}

.corner-bl::after {
  bottom: 0;
  left: 0;
}

.corner-br {
  bottom: 1rem;
  right: 1rem;
}

.corner-br::before {
  bottom: 0;
  right: 0;
}

.corner-br::after {
  bottom: 0;
  right: 0;
}

/* ========================================
   HEADER
   ======================================== */

.stats-header {
  position: relative;
  animation: header-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes header-entrance {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.05);
  border: 2px solid rgba(139, 92, 246, 0.3);
  font-family: "IBM Plex Mono", monospace;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-bottom: 2rem;
}

.back-button:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
  color: #8b5cf6;
  transform: translateX(-4px);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
}

.back-bracket {
  color: rgba(139, 92, 246, 0.5);
  transition: all 0.3s ease;
}

.back-button:hover .back-bracket {
  color: #ec4899;
}

.back-text {
  font-size: 1.25rem;
}

.header-title-wrapper {
  text-align: center;
}

.header-title {
  font-family: "Archivo Black", sans-serif;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}

.title-glitch {
  position: relative;
  display: inline-block;
}

.title-glitch::before,
.title-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.header-title:hover .title-glitch::before {
  color: #ec4899;
  animation: glitch-text-1 0.5s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.header-title:hover .title-glitch::after {
  color: #06b6d4;
  animation: glitch-text-2 0.5s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch-text-1 {
  0%,
  100% {
    opacity: 0;
    transform: translate(0);
  }
  20%,
  80% {
    opacity: 0.8;
    transform: translate(-4px, 2px);
  }
}

@keyframes glitch-text-2 {
  0%,
  100% {
    opacity: 0;
    transform: translate(0);
  }
  20%,
  80% {
    opacity: 0.8;
    transform: translate(4px, -2px);
  }
}

.header-divider {
  position: relative;
  height: 2px;
  margin: 0 auto;
  max-width: 400px;
  overflow: hidden;
}

.divider-line {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #8b5cf6 20%,
    #ec4899 50%,
    #06b6d4 80%,
    transparent 100%
  );
  animation: divider-shimmer 3s ease-in-out infinite;
}

@keyframes divider-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* ========================================
   STATS GRID
   ======================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* ========================================
   STAT BLOCK
   ======================================== */

.stat-block {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(139, 92, 246, 0.2);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: block-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)
    backwards;
}

@keyframes block-entrance {
  0% {
    opacity: 0;
    transform: translateX(-40px) rotateY(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

.stat-block:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

.stat-block-1 {
  border-left: 4px solid #ec4899;
}

.stat-block-2 {
  border-left: 4px solid #8b5cf6;
}

/* Block Number */
.block-number {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-family: "Archivo Black", sans-serif;
  font-size: 3.5rem;
  color: rgba(139, 92, 246, 0.08);
  line-height: 1;
  pointer-events: none;
  transition: all 0.4s ease;
  z-index: 1;
}

.stat-block:hover .block-number {
  color: rgba(139, 92, 246, 0.15);
  transform: scale(1.1);
}

/* Block Corner Brackets */
.block-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-block:hover .block-corner {
  opacity: 1;
}

.block-corner::before,
.block-corner::after {
  content: "";
  position: absolute;
  background: #8b5cf6;
}

.block-corner::before {
  width: 100%;
  height: 2px;
}

.block-corner::after {
  width: 2px;
  height: 100%;
}

.block-corner-tl {
  top: 0;
  left: 0;
}

.block-corner-tl::before {
  top: 0;
  left: 0;
}

.block-corner-tl::after {
  top: 0;
  left: 0;
}

.block-corner-tr {
  top: 0;
  right: 0;
}

.block-corner-tr::before {
  top: 0;
  right: 0;
}

.block-corner-tr::after {
  top: 0;
  right: 0;
}

.block-corner-bl {
  bottom: 0;
  left: 0;
}

.block-corner-bl::before {
  bottom: 0;
  left: 0;
}

.block-corner-bl::after {
  bottom: 0;
  left: 0;
}

.block-corner-br {
  bottom: 0;
  right: 0;
}

.block-corner-br::before {
  bottom: 0;
  right: 0;
}

.block-corner-br::after {
  bottom: 0;
  right: 0;
}

/* Block Scan Effect */
.block-scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.2) 50%,
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
  pointer-events: none;
  z-index: 2;
}

.stat-block:hover .block-scan {
  transform: translateX(100%);
}

/* ========================================
   BLOCK CONTENT
   ======================================== */

.block-content {
  position: relative;
  z-index: 3;
  padding: 2rem;
}

@media (max-width: 768px) {
  .block-content {
    padding: 1.5rem;
  }
}

/* Block Header */
.block-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.05);
  font-size: 1.5rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.stat-block:hover .header-icon {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
}

.video-icon {
  color: #ec4899;
  border-color: rgba(236, 72, 153, 0.4);
  background: rgba(236, 72, 153, 0.05);
}

.stat-block-1:hover .video-icon {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.15);
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.4);
}

.image-icon {
  color: #8b5cf6;
}

.header-info {
  flex: 1;
}

.block-title {
  font-family: "IBM Plex Mono", monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.title-bracket {
  color: rgba(139, 92, 246, 0.5);
  transition: all 0.3s ease;
}

.stat-block:hover .title-bracket {
  color: #ec4899;
}

.block-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  margin: 0;
}

/* ========================================
   STATS DATA
   ======================================== */

.stats-data {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 480px) {
  .stats-data {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.data-item {
  position: relative;
}

.data-value {
  font-family: "Archivo Black", sans-serif;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.value-separator {
  color: rgba(139, 92, 246, 0.4);
  font-size: 2rem;
}

.data-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.label-slash {
  color: rgba(139, 92, 246, 0.4);
  margin-right: 0.25rem;
}

/* ========================================
   ACCURACY SECTION
   ======================================== */

.accuracy-section {
  position: relative;
}

.accuracy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.accuracy-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-bracket {
  color: rgba(139, 92, 246, 0.5);
  font-size: 0.9rem;
  animation: bracket-pulse 2s ease-in-out infinite;
}

@keyframes bracket-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.accuracy-value {
  font-family: "Archivo Black", sans-serif;
  font-size: 2.5rem;
  letter-spacing: -0.02em;
}

.video-color {
  color: #ec4899;
  text-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
}

.image-color {
  color: #8b5cf6;
  text-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
}

/* ========================================
   TERMINAL PROGRESS BAR
   ======================================== */

.terminal-progress {
  position: relative;
}

.progress-track {
  position: relative;
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.2);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
}

.video-fill {
  background: linear-gradient(90deg, #ec4899, #06b6d4);
  box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
}

.image-fill {
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
}

.progress-glitch {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  background: #fff;
  opacity: 0.6;
  animation: progress-glitch-move 1s linear infinite;
}

@keyframes progress-glitch-move {
  0%,
  90%,
  100% {
    opacity: 0;
  }
  92%,
  96% {
    opacity: 0.6;
  }
}

.progress-segments {
  display: flex;
  gap: 2px;
  height: 4px;
}

.segment {
  flex: 1;
  background: rgba(139, 92, 246, 0.1);
  transition: background 0.3s ease;
}

.segment-active {
  background: rgba(139, 92, 246, 0.4);
  animation: segment-flicker 2s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * 0.1s);
}

@keyframes segment-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ========================================
   RESET SECTION
   ======================================== */

.reset-section {
  text-align: center;
  animation: reset-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)
    backwards;
}

@keyframes reset-entrance {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-divider {
  overflow: hidden;
  margin-bottom: 2rem;
  height: 1px;
  display: flex;
  justify-content: center;
  opacity: 0.3;
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
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.reset-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  background: rgba(239, 68, 68, 0.05);
  border: 2px solid rgba(239, 68, 68, 0.3);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(239, 68, 68, 0.8);
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
}

.reset-button:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
}

.reset-icon {
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.reset-button:hover .reset-icon {
  transform: scale(1.2) rotate(-10deg);
}

.reset-text {
  position: relative;
  z-index: 2;
}

.reset-scan {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(239, 68, 68, 0.2) 50%,
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
}

.reset-button:hover .reset-scan {
  transform: translateX(100%);
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 768px) {
  .corner-bracket {
    display: none;
  }

  .header-title {
    font-size: clamp(2rem, 10vw, 3rem);
  }

  .block-number {
    font-size: 2.5rem;
    top: 1rem;
    right: 1rem;
  }

  .data-value {
    font-size: 2rem;
  }

  .accuracy-value {
    font-size: 2rem;
  }
}
</style>
