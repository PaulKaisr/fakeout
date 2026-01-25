<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <v-sheet
      color="surface"
      class="py-16 mb-8 text-center position-relative overflow-hidden"
    >
      <div
        class="position-absolute top-0 left-0 w-100 h-100 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"
      ></div>
      <v-container class="position-relative z-10">
        <v-btn
          variant="text"
          :to="`/${currentLocale}`"
          prepend-icon="mdi-arrow-left"
          class="mb-8"
          color="primary"
        >
          {{ $t("common.backToHome") }}
        </v-btn>

        <h1 class="text-h2 font-weight-bold mb-4 text-high-emphasis">
          {{ $t("blog.title") }}
        </h1>
        <p class="text-h6 text-medium-emphasis max-w-2xl mx-auto">
          {{ $t("blog.subtitle") }}
        </p>
      </v-container>
    </v-sheet>

    <!-- Content Section -->
    <v-container>
      <v-row>
        <v-col
          v-for="article in sortedArticles"
          :key="article.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :to="getArticleLink(article)"
            class="h-100 d-flex flex-column transition-transform duration-300 rounded-lg elevation-4 border-opacity-50"
            :elevation="2"
          >
            <!-- Image / Placeholder Area with Aspect Ratio for CLS -->
            <div
              class="aspect-video w-100 bg-surface-variant position-relative overflow-hidden"
            >
              <v-img
                v-if="article.image"
                :src="article.image"
                cover
                class="w-100 h-100"
                :alt="getArticleTitle(article)"
              />
              <div
                v-else
                class="w-100 h-100 d-flex align-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
              >
                <v-icon size="64" color="primary" class="opacity-50"
                  >mdi-text-box-outline</v-icon
                >
              </div>
            </div>

            <v-card-item class="flex-grow-1 pt-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip
                  size="small"
                  color="primary"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ formatDate(article.date) }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">{{
                  article.author
                }}</span>
              </div>

              <v-card-title
                class="text-h5 font-weight-bold mb-2 pt-1 line-clamp-2 text-pre-wrap"
                style="line-height: 1.3"
              >
                {{ getArticleTitle(article) }}
              </v-card-title>

              <v-card-text
                class="text-body-1 text-medium-emphasis line-clamp-3"
              >
                {{ getArticleSummary(article) }}
              </v-card-text>
            </v-card-item>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
              <span
                class="text-primary font-weight-bold text-body-2 group-hover:underline"
              >
                {{ $t("blog.readMore") }}
              </span>
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-arrow-right"
                variant="text"
                color="primary"
                density="comfortable"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { articles, type Article } from "@/data/articles";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const { locale } = useI18n();
const currentLocale = computed(() => locale.value as string);
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.blogTitle,
  description: seoTranslations.blogDescription,
});

const sortedArticles = computed(() => {
  return [...articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

const getArticleLink = (article: Article) => {
  return `/${currentLocale.value}/blog/${article.slug}`;
};

const getArticleTitle = (article: Article) => {
  return article.title[currentLocale.value] || article.title.en;
};

const getArticleSummary = (article: Article) => {
  return article.summary[currentLocale.value] || article.summary.en;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(currentLocale.value, options);
};
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

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
</style>
