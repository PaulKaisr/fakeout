<template>
  <section class="reality-fracture-hero relative overflow-hidden min-h-[90vh] flex items-center">
    <!-- Scanline overlay -->
    <div class="scanlines"></div>

    <!-- Noise texture -->
    <div class="noise-overlay"></div>

    <!-- Distorted grid background -->
    <div class="grid-distortion"></div>

    <!-- Split panel backgrounds -->
    <div class="split-panel split-panel-left"></div>
    <div class="split-panel split-panel-right"></div>

    <v-container class="relative z-20 py-20">
      <!-- Glitch badge -->
      <div class="text-center mb-12">
        <div class="glitch-badge">
          <span class="badge-text" data-text="◆ PERCEPTION TEST ◆">◆ PERCEPTION TEST ◆</span>
        </div>
      </div>

      <!-- Main headline with dramatic split -->
      <div class="headline-container mb-16">
        <h1 class="main-headline">
          <span class="headline-line headline-line-1">
            <span class="word-real glitch-text" data-text="REAL">REAL</span>
            <span class="word-or">or</span>
          </span>
          <span class="headline-line headline-line-2">
            <span class="word-ai glitch-text" data-text="ARTIFICIAL">ARTIFICIAL</span>
            <span class="word-question">?</span>
          </span>
        </h1>

        <!-- Divider with glitch effect -->
        <div class="headline-divider">
          <div class="divider-line"></div>
          <div class="divider-glitch"></div>
        </div>
      </div>

      <!-- Mission statement in monospace -->
      <div class="mission-grid">
        <div class="mission-block mission-block-1">
          <div class="block-number">01</div>
          <div class="block-label">{{ t("hero.eyebrow") }}</div>
          <p class="block-text">{{ t("hero.subtitle") }}</p>
        </div>

        <div class="mission-block mission-block-2">
          <div class="block-number">02</div>
          <div class="block-label">{{ t("hero.features.learn") }}</div>
          <p class="block-text">{{ t("hero.mission") }}</p>
        </div>

        <div class="mission-block mission-block-3">
          <div class="block-number">03</div>
          <div class="block-label">{{ t("hero.cta.title") }}</div>
          <p class="block-text">{{ t("hero.cta.description") }}</p>
        </div>
      </div>

      <!-- Pixel distortion bar -->
      <div class="pixel-bar">
        <div class="pixel-segment" v-for="i in 50" :key="i" :style="{ animationDelay: `${i * 0.05}s` }"></div>
      </div>

      <!-- Status indicators -->
      <div class="status-indicators">
        <div class="indicator" v-for="(stat, index) in stats" :key="index">
          <div class="indicator-dot" :style="{ animationDelay: `${index * 0.3}s` }"></div>
          <span class="indicator-label">{{ t(stat.label) }}</span>
        </div>
      </div>
    </v-container>

    <!-- Floating fragments -->
    <div class="fragments">
      <div class="fragment fragment-1">01</div>
      <div class="fragment fragment-2">10</div>
      <div class="fragment fragment-3">11</div>
      <div class="fragment fragment-4">00</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const stats = [
  { label: "hero.stats.think" },
  { label: "hero.stats.challenge" },
  { label: "hero.stats.improve" },
];
</script>

<style scoped>
/* Fonts loaded globally in index.html */

/* ========================================
   REALITY FRACTURE HERO
   A bold exploration of perception vs synthesis
   ======================================== */

.reality-fracture-hero {
  background: #0a0a0f;
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

/* ========================================
   SCANLINES & TEXTURE
   ======================================== */

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.03) 0px,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 15;
  animation: scanline-drift 8s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
  z-index: 5;
  animation: noise-flicker 0.3s steps(2) infinite;
}

@keyframes noise-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.55; }
}

/* ========================================
   DISTORTED GRID
   ======================================== */

.grid-distortion {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  perspective: 1000px;
  transform-style: preserve-3d;
  animation: grid-warp 12s ease-in-out infinite;
  z-index: 3;
}

@keyframes grid-warp {
  0%, 100% {
    transform: rotateX(0deg) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: rotateX(2deg) scale(1.02);
    opacity: 0.4;
  }
  50% {
    transform: rotateX(-1deg) scale(0.98);
    opacity: 0.35;
  }
  75% {
    transform: rotateX(1.5deg) scale(1.01);
    opacity: 0.38;
  }
}

/* ========================================
   SPLIT PANELS
   ======================================== */

.split-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
  z-index: 1;
}

.split-panel-left {
  left: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, transparent 60%);
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
  animation: panel-pulse-left 6s ease-in-out infinite;
}

.split-panel-right {
  right: 0;
  background: linear-gradient(225deg, rgba(236, 72, 153, 0.08) 0%, transparent 60%);
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
  animation: panel-pulse-right 6s ease-in-out infinite;
  animation-delay: 3s;
}

@keyframes panel-pulse-left {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
}

@keyframes panel-pulse-right {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.85; }
}

/* ========================================
   GLITCH BADGE
   ======================================== */

.glitch-badge {
  display: inline-block;
  position: relative;
  animation: badge-entrance 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes badge-entrance {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateX(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
}

.badge-text {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  color: #8b5cf6;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  position: relative;
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border: 2px solid #8b5cf6;
  border-radius: 0;
  background: rgba(139, 92, 246, 0.05);
  animation: badge-glitch 3s infinite;
}

.badge-text::before,
.badge-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0.5rem;
  left: 1.5rem;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.badge-text::before {
  color: #ec4899;
  animation: glitch-1 2.5s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.badge-text::after {
  color: #06b6d4;
  animation: glitch-2 2.5s infinite;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

@keyframes badge-glitch {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-2px, 1px); }
  94% { transform: translate(2px, -1px); }
  96% { transform: translate(-1px, 2px); }
}

@keyframes glitch-1 {
  0%, 90%, 100% { transform: translate(0); }
  91% { transform: translate(-3px, 0); }
  93% { transform: translate(3px, 0); }
  95% { transform: translate(-2px, 0); }
}

@keyframes glitch-2 {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(3px, 0); }
  94% { transform: translate(-3px, 0); }
  96% { transform: translate(2px, 0); }
}

/* ========================================
   MAIN HEADLINE
   ======================================== */

.headline-container {
  text-align: center;
  position: relative;
}

.main-headline {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3.5rem, 12vw, 9rem);
  line-height: 0.9;
  margin: 0;
  padding: 0;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.headline-line {
  display: block;
  position: relative;
}

.headline-line-1 {
  animation: headline-slide-in-1 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s backwards;
}

.headline-line-2 {
  animation: headline-slide-in-2 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s backwards;
}

@keyframes headline-slide-in-1 {
  0% {
    opacity: 0;
    transform: translateX(-100px) rotateY(-45deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

@keyframes headline-slide-in-2 {
  0% {
    opacity: 0;
    transform: translateX(100px) rotateY(45deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

.word-real {
  color: #8b5cf6;
  text-shadow:
    0 0 20px rgba(139, 92, 246, 0.5),
    0 0 40px rgba(139, 92, 246, 0.3),
    4px 4px 0 rgba(139, 92, 246, 0.1);
  position: relative;
  display: inline-block;
  margin-right: 0.3em;
}

.word-ai {
  color: #ec4899;
  text-shadow:
    0 0 20px rgba(236, 72, 153, 0.5),
    0 0 40px rgba(236, 72, 153, 0.3),
    -4px 4px 0 rgba(236, 72, 153, 0.1);
  position: relative;
  display: inline-block;
  margin-right: 0.2em;
}

.word-or {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.35em;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
  vertical-align: middle;
  display: inline-block;
  animation: or-fade 2s ease-in-out infinite;
}

@keyframes or-fade {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

.word-question {
  color: #06b6d4;
  text-shadow:
    0 0 30px rgba(6, 182, 212, 0.6),
    0 0 60px rgba(6, 182, 212, 0.4);
  display: inline-block;
  animation: question-pulse 2s ease-in-out infinite;
}

@keyframes question-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Glitch effect on hover */
.glitch-text {
  position: relative;
  display: inline-block;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.headline-container:hover .glitch-text::before {
  color: #ec4899;
  animation: glitch-text-1 0.5s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.headline-container:hover .glitch-text::after {
  color: #06b6d4;
  animation: glitch-text-2 0.5s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch-text-1 {
  0%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  20%, 80% {
    opacity: 0.8;
    transform: translate(-4px, 2px);
  }
}

@keyframes glitch-text-2 {
  0%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  20%, 80% {
    opacity: 0.8;
    transform: translate(4px, -2px);
  }
}

/* ========================================
   DIVIDER
   ======================================== */

.headline-divider {
  position: relative;
  height: 2px;
  margin: 3rem auto 2rem;
  max-width: 600px;
  overflow: hidden;
}

.divider-line {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    #8b5cf6 20%,
    #ec4899 50%,
    #06b6d4 80%,
    transparent 100%
  );
  animation: divider-shimmer 3s ease-in-out infinite;
}

.divider-glitch {
  position: absolute;
  inset: 0;
  background: #fff;
  width: 20%;
  animation: divider-glitch-move 4s linear infinite;
  opacity: 0;
}

@keyframes divider-shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes divider-glitch-move {
  0%, 90%, 100% {
    left: -20%;
    opacity: 0;
  }
  92%, 94% {
    left: 50%;
    opacity: 0.3;
  }
  93% {
    opacity: 0.8;
  }
}

/* ========================================
   MISSION GRID
   ======================================== */

.mission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 0 auto 4rem;
  max-width: 1200px;
}

.mission-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: block-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

.mission-block-1 {
  animation-delay: 0.6s;
  border-left: 3px solid #8b5cf6;
}

.mission-block-2 {
  animation-delay: 0.8s;
  border-left: 3px solid #ec4899;
}

.mission-block-3 {
  animation-delay: 1s;
  border-left: 3px solid #06b6d4;
}

@keyframes block-entrance {
  0% {
    opacity: 0;
    transform: translateY(40px) rotateX(-15deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

.mission-block:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.mission-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.mission-block:hover::before {
  transform: translateX(100%);
}

.block-number {
  font-family: 'Archivo Black', sans-serif;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.05);
  position: absolute;
  top: 1rem;
  right: 1rem;
  line-height: 1;
  pointer-events: none;
}

.block-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.block-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* ========================================
   PIXEL BAR
   ======================================== */

.pixel-bar {
  display: flex;
  justify-content: space-between;
  gap: 2px;
  margin: 3rem auto;
  max-width: 800px;
  height: 4px;
  overflow: hidden;
}

.pixel-segment {
  flex: 1;
  background: linear-gradient(180deg, #8b5cf6, #ec4899);
  animation: pixel-flicker 2s ease-in-out infinite;
  opacity: 0.3;
}

@keyframes pixel-flicker {
  0%, 100% {
    opacity: 0.2;
    transform: scaleY(0.5);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(1.5);
  }
}

/* ========================================
   STATUS INDICATORS
   ======================================== */

.status-indicators {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
  animation: indicators-entrance 1s ease 1.2s backwards;
}

@keyframes indicators-entrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}

.indicator:nth-child(2) .indicator-dot {
  background: #ec4899;
  box-shadow: 0 0 10px rgba(236, 72, 153, 0.8);
}

.indicator:nth-child(3) .indicator-dot {
  background: #06b6d4;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
}

.indicator-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

/* ========================================
   FLOATING FRAGMENTS
   ======================================== */

.fragments {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.fragment {
  position: absolute;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(139, 92, 246, 0.15);
  animation: fragment-float 20s linear infinite;
}

.fragment-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.fragment-2 {
  top: 60%;
  right: 15%;
  animation-delay: -5s;
  color: rgba(236, 72, 153, 0.15);
}

.fragment-3 {
  top: 80%;
  left: 20%;
  animation-delay: -10s;
  color: rgba(6, 182, 212, 0.15);
}

.fragment-4 {
  top: 30%;
  right: 25%;
  animation-delay: -15s;
}

@keyframes fragment-float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 768px) {
  .main-headline {
    font-size: clamp(2.5rem, 10vw, 5rem);
  }

  .mission-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .mission-block {
    padding: 1.5rem;
  }

  .status-indicators {
    gap: 1.5rem;
  }

  .split-panel {
    display: none;
  }
}
</style>
