<template>
  <!-- Game Section - Main Focus -->
  <GameContainer mode="video" />

  <!-- Recent Articles Section -->
  <section class="articles-section py-4 md:py-6 relative overflow-hidden">
    <v-container class="relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-12 animate-fade-in-up">
        <div
          class="inline-block px-4 py-2 bg-secondary/10 border-2 border-secondary/30 rounded-full mb-4"
        >
          <span
            class="text-secondary font-bold text-sm uppercase tracking-wider"
          >
            {{ t("blog.subtitle") }}
          </span>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-if="recentArticles.length > 0" class="articles-grid mb-8">
        <v-card
          v-for="(article, index) in recentArticles"
          :key="article.id"
          :to="getArticleLink(article)"
          class="article-card h-full hover-lift-strong animate-fade-in-up"
          :style="{ animationDelay: `${index * 0.1}s` }"
          elevation="0"
        >
          <!-- Article Image -->
          <div class="article-image-wrapper relative overflow-hidden">
            <v-img
              v-if="article.image"
              :src="article.image"
              :alt="getArticleTitle(article)"
              cover
              class="article-image"
              height="240"
            >
              <div
                class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
              ></div>
            </v-img>
            <div
              v-else
              class="article-image-placeholder h-60 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
            >
              <v-icon
                size="80"
                :color="index % 2 === 0 ? 'primary' : 'secondary'"
              >
                mdi-text-box-outline
              </v-icon>
            </div>

            <!-- Floating Badge -->
            <div
              class="absolute top-4 left-4 px-3 py-1 bg-primary rounded-full shadow-lg"
            >
              <span class="text-xs font-bold text-white">
                {{ formatDate(article.date) }}
              </span>
            </div>
          </div>

          <!-- Article Content -->
          <v-card-text class="pa-6">
            <h3
              class="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors"
            >
              {{ getArticleTitle(article) }}
            </h3>

            <p class="text-medium-emphasis mb-4 line-clamp-3">
              {{ getArticleSummary(article) }}
            </p>

            <div class="flex items-center justify-between mt-4">
              <span class="text-sm text-medium-emphasis">
                {{ article.author }}
              </span>

              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="font-bold"
              >
                {{ t("blog.readMore") }}
                <v-icon end size="small">mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card-text>

          <!-- Accent Bar -->
          <div
            class="article-accent h-1 bg-linear-to-r from-primary to-secondary"
          ></div>
        </v-card>
      </div>

      <!-- View All Button -->
      <div class="text-center animate-fade-in-up" style="animation-delay: 0.5s">
        <v-btn
          :to="`/${locale}/blog`"
          size="large"
          variant="outlined"
          color="secondary"
          class="px-8 font-bold hover-lift"
        >
          {{ t("blog.continueExploring") }}
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import GameContainer from "@/components/game/GameContainer.vue";
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
</script>

<style scoped>
/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

/* Hover Effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-lift-strong {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift-strong:hover {
  transform: translateY(-8px);
}

.hover-lift-strong:hover .article-accent {
  height: 4px;
}

/* Text Gradient */
.text-gradient {
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Line Clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* FAQ Panels */
.faq-panels :deep(.v-expansion-panel) {
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-panels :deep(.v-expansion-panel:hover) {
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-2px);
}

.faq-panels :deep(.v-expansion-panel--active) {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.faq-panels :deep(.v-expansion-panel-title) {
  transition: color 0.3s ease;
}

.faq-panels :deep(.v-expansion-panel--active .v-expansion-panel-title) {
  color: rgb(var(--v-theme-primary));
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

@media (min-width: 768px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Article Card */
.article-card {
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
}

.article-image-wrapper {
  position: relative;
}

.article-image {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .article-image {
  transform: scale(1.1);
}

.article-accent {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive Typography */
@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
