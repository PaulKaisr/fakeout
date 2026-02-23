<template>
  <!-- Game Section - Main Focus (Client-only for SSG) -->
  <div id="game-section">
    <ClientOnly>
      <GameContainer mode="video" />
      <template #fallback>
        <div class="game-loading-placeholder">
          <v-container class="py-16 text-center">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="mt-4 text-medium-emphasis">{{ t("common.loading") }}</p>
          </v-container>
        </div>
      </template>
    </ClientOnly>
  </div>

  <!-- Mission Hero Section -->
  <MissionHero />

  <!-- Recent Articles Section -->
  <section class="fracture-articles-section py-16 md:py-24 relative overflow-hidden">
    <!-- Background effects -->
    <div class="articles-scanlines"></div>
    <div class="articles-noise"></div>

    <v-container class="relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="articles-badge">
          <span class="badge-glitch" data-text="◆ {{ t('blog.subtitle') }} ◆">
            ◆ {{ t("blog.subtitle") }} ◆
          </span>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-if="recentArticles.length > 0" class="fracture-articles-grid mb-12">
        <a
          v-for="(article, index) in recentArticles"
          :key="article.id"
          :href="getArticleLink(article)"
          class="fracture-article-card"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <!-- Article Number -->
          <div class="article-number">{{ String(index + 1).padStart(2, '0') }}</div>

          <!-- Article Image -->
          <div class="article-image-container">
            <img
              v-if="article.image"
              :src="article.image"
              :alt="getArticleTitle(article)"
              class="article-image-fracture"
            />
            <div v-else class="article-image-fallback">
              <span class="fallback-icon">▨</span>
            </div>

            <!-- Date Badge -->
            <div class="article-date-badge">
              {{ formatDate(article.date) }}
            </div>

            <!-- Scan Effect -->
            <div class="article-scan-effect"></div>
          </div>

          <!-- Article Content -->
          <div class="article-content-fracture">
            <div class="article-meta">
              <span class="meta-author">{{ article.author }}</span>
              <span class="meta-separator">|</span>
              <span class="meta-category">{{ t("blog.subtitle") }}</span>
            </div>

            <h3 class="article-title-fracture">
              {{ getArticleTitle(article) }}
            </h3>

            <p class="article-summary-fracture">
              {{ getArticleSummary(article) }}
            </p>

            <div class="article-read-more">
              <span class="read-more-text">{{ t("blog.readMore") }}</span>
              <span class="read-more-arrow">→</span>
            </div>
          </div>

          <!-- Border Effects -->
          <div class="article-border-top"></div>
          <div class="article-border-bottom"></div>
        </a>
      </div>

      <!-- View All Button -->
      <div class="text-center">
        <a :href="`/${locale}/blog`" class="view-all-button">
          <span class="button-brackets">[</span>
          <span class="button-text">{{ t("blog.continueExploring") }}</span>
          <span class="button-brackets">]</span>
          <div class="button-underline"></div>
        </a>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import MissionHero from "@/components/MissionHero.vue";

// Lazy-load GameContainer: it's inside <ClientOnly> and never SSG-rendered,
// so there's no reason to parse it in the critical-path bundle.
const GameContainer = defineAsyncComponent(
  () => import("@/components/game/GameContainer.vue"),
);
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";
import { articles, type Article } from "@/data/articles";

const { t, locale } = useI18n();
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.homeTitle,
  description: seoTranslations.homeDescription,
});

// FAQ Items from i18n
const faqItems = computed(() => [
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

// Get 3 most recent articles
const recentArticles = computed(() => {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
});

const getArticleLink = (article: Article) => {
  return `/${locale.value}/blog/${article.slug}`;
};

const getArticleTitle = (article: Article) => {
  return article.title[locale.value] || article.title.en;
};

const getArticleSummary = (article: Article) => {
  return article.summary[locale.value] || article.summary.en;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(locale.value, options);
};

// Ensure the page starts at the top (game section, not hero section)
onMounted(() => {
  // Small delay to ensure DOM is fully rendered
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, 0);
});
</script>

<style scoped>
/* Fonts loaded globally in index.html */

/* ========================================
   FRACTURE ARTICLES SECTION
   ======================================== */

.fracture-articles-section {
  background: #0a0a0f;
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

/* ========================================
   BACKGROUND EFFECTS
   ======================================== */

.articles-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.015) 0px,
    rgba(0, 0, 0, 0.02) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 1;
}

.articles-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
}

/* ========================================
   SECTION BADGE
   ======================================== */

.articles-badge {
  display: inline-block;
  position: relative;
  padding: 0.75rem 2rem;
  border: 2px solid #06b6d4;
  background: rgba(6, 182, 212, 0.05);
  animation: articles-badge-entrance 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes articles-badge-entrance {
  0% {
    opacity: 0;
    transform: scale(0.8) rotateZ(-10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateZ(0deg);
  }
}

.badge-glitch {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.2em;
  color: #06b6d4;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

.badge-glitch::before,
.badge-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.articles-badge:hover .badge-glitch::before {
  color: #8b5cf6;
  animation: badge-glitch-1 0.3s infinite;
}

.articles-badge:hover .badge-glitch::after {
  color: #ec4899;
  animation: badge-glitch-2 0.3s infinite;
}

@keyframes badge-glitch-1 {
  0%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  50% {
    opacity: 0.7;
    transform: translate(-2px, 1px);
  }
}

@keyframes badge-glitch-2 {
  0%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  50% {
    opacity: 0.7;
    transform: translate(2px, -1px);
  }
}

/* ========================================
   ARTICLES GRID
   ======================================== */

.fracture-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1px;
  background: rgba(139, 92, 246, 0.1);
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .fracture-articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .fracture-articles-grid {
    grid-template-columns: 1fr;
  }
}

/* ========================================
   ARTICLE CARD
   ======================================== */

.fracture-article-card {
  background: #0a0a0f;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  animation: article-card-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes article-card-entrance {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fracture-article-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.02);
}

/* ========================================
   ARTICLE NUMBER
   ======================================== */

.article-number {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-family: 'Archivo Black', sans-serif;
  font-size: 3rem;
  color: rgba(139, 92, 246, 0.08);
  z-index: 5;
  line-height: 1;
  transition: all 0.4s ease;
}

.fracture-article-card:hover .article-number {
  color: rgba(139, 92, 246, 0.15);
  transform: scale(1.1) rotate(5deg);
}

/* ========================================
   ARTICLE IMAGE
   ======================================== */

.article-image-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: rgba(139, 92, 246, 0.05);
}

.article-image-fracture {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: grayscale(0.3) contrast(1.1);
}

.fracture-article-card:hover .article-image-fracture {
  transform: scale(1.08);
  filter: grayscale(0) contrast(1.2);
}

.article-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
}

.fallback-icon {
  font-size: 4rem;
  color: rgba(139, 92, 246, 0.3);
}

/* Date Badge */
.article-date-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.375rem 0.875rem;
  background: rgba(6, 182, 212, 0.9);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  z-index: 5;
  transition: all 0.3s ease;
}

.fracture-article-card:hover .article-date-badge {
  background: rgba(236, 72, 153, 0.95);
  transform: translateX(4px);
}

/* Scan Effect */
.article-scan-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(139, 92, 246, 0.2) 50%,
    transparent
  );
  transition: left 0.6s ease;
}

.fracture-article-card:hover .article-scan-effect {
  left: 100%;
}

/* ========================================
   ARTICLE CONTENT
   ======================================== */

.article-content-fracture {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.meta-separator {
  color: rgba(139, 92, 246, 0.5);
}

.meta-category {
  color: rgba(236, 72, 153, 0.6);
}

.article-title-fracture {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.375rem;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fracture-article-card:hover .article-title-fracture {
  color: #8b5cf6;
}

.article-summary-fracture {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-read-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: #06b6d4;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: auto;
}

.read-more-arrow {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fracture-article-card:hover .read-more-arrow {
  transform: translateX(6px);
}

/* ========================================
   BORDER EFFECTS
   ======================================== */

.article-border-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fracture-article-card:hover .article-border-top {
  transform: scaleX(1);
}

.article-border-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #06b6d4, #ec4899, #8b5cf6);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fracture-article-card:hover .article-border-bottom {
  transform: scaleX(1);
}

/* ========================================
   VIEW ALL BUTTON
   ======================================== */

.view-all-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-decoration: none;
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: button-entrance 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.5s backwards;
}

@keyframes button-entrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.button-brackets {
  font-size: 1.5rem;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.view-all-button:hover .button-brackets:first-child {
  transform: translateX(-8px);
  color: #ec4899;
}

.view-all-button:hover .button-brackets:last-child {
  transform: translateX(8px);
  color: #06b6d4;
}

.button-text {
  transition: color 0.3s ease;
}

.view-all-button:hover .button-text {
  color: #ec4899;
}

.button-underline {
  position: absolute;
  bottom: 0.5rem;
  left: 2.5rem;
  right: 2.5rem;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4);
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.view-all-button:hover .button-underline {
  transform: scaleX(1);
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
