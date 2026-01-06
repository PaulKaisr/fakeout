<template>
  <v-container class="blog-container">
    <div class="mb-4">
      <v-btn
        variant="text"
        :to="`/${currentLocale}`"
        prepend-icon="mdi-arrow-left"
        class="text-none"
      >
        {{ $t("common.backToHome") }}
      </v-btn>
    </div>

    <div class="text-center my-8">
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("blog.title") }}</h1>
      <p class="text-subtitle-1">{{ $t("blog.subtitle") }}</p>
    </div>

    <v-row>
      <v-col
        v-for="article in sortedArticles"
        :key="article.id"
        cols="12"
        md="8"
        offset-md="2"
      >
        <v-card :to="getArticleLink(article)" hover class="mb-6 blog-card">
          <v-card-item>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-chip size="small" color="primary" variant="tonal">
                {{ article.date }}
              </v-chip>
            </div>
            <v-card-title class="text-h5 font-weight-bold mb-2 break-word">
              {{ article.title[currentLocale] || article.title.en }}
            </v-card-title>
            <v-card-text class="text-body-1">
              {{ article.summary[currentLocale] || article.summary.en }}
            </v-card-text>
          </v-card-item>
          <v-card-actions>
            <v-btn variant="text" color="primary">
              {{ $t("blog.readMore") }}
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { articles, type Article } from "@/data/articles";

const { locale } = useI18n();
const currentLocale = computed(() => locale.value as string);

const sortedArticles = computed(() => {
  return [...articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

const getArticleLink = (article: Article) => {
  return `/${currentLocale.value}/blog/${article.slug}`;
};
</script>

<style scoped>
.blog-container {
  max-width: 900px;
}
.blog-card {
  transition: transform 0.2s;
}
.blog-card:hover {
  transform: translateY(-2px);
}
.break-word {
  white-space: normal;
  word-break: break-word; /* Ensure long words break */
  overflow-wrap: break-word; /* Standard property */
}
</style>
