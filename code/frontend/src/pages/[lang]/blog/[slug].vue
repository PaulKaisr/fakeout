<template>
  <v-container class="article-container py-12">
    <div v-if="article">
      <v-btn
        variant="text"
        class="mb-6"
        :to="`/${currentLocale}/blog`"
        prepend-icon="mdi-arrow-left"
      >
        {{ $t("blog.backToBlog") }}
      </v-btn>

      <article class="blog-content">
        <div class="mb-6">
          <!-- Title is part of markdown usually, but let's render it if needed, or rely on MD.
                However, looking at articles.ts, titles are separate. I should render title here. -->
          <!-- Actually the content has # Header which is the title usually.
                Let's check articles.ts content.
                Yes, they have # Header.
                So I might not need to render article.title explicitly if it's in MD.
                But usually metadata title is good for SEO and consistency.
                Let's render a clean header. -->
          <div class="text-caption text-medium-emphasis mb-2">
            {{ $t("blog.publishedOn", { date: article.date }) }} •
            {{ article.author }}
          </div>
        </div>

        <!-- Render Markdown Content -->
        <div class="markdown-body" v-html="renderedContent"></div>
      </article>

      <v-divider class="my-8"></v-divider>

      <div class="text-center">
        <v-btn variant="outlined" rounded="xl" :to="`/${currentLocale}/blog`">
          {{ $t("blog.backToBlog") }}
        </v-btn>
      </div>
    </div>

    <v-alert
      v-else
      type="warning"
      title="Article Not Found"
      text="The requested article could not be found."
      class="mt-12"
    >
      <template v-slot:append>
        <v-btn :to="`/${currentLocale}/blog`" variant="text">
          {{ $t("blog.backToBlog") }}
        </v-btn>
      </template>
    </v-alert>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import MarkdownIt from "markdown-it";
import { articles } from "@/data/articles";

const route = useRoute();
const { locale } = useI18n();
const currentLocale = computed(() => locale.value as string);
const slug = computed(() => route.params.slug as string);

const article = computed(() => {
  return articles.find((a) => a.slug === slug.value);
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const renderedContent = computed(() => {
  if (!article.value) return "";
  const content =
    article.value.content[currentLocale.value] || article.value.content.en;
  return md.render(content);
});
</script>

<style>
/* Basic Markdown Styles for Vuetify context */
.article-container {
  max-width: 800px;
}

.markdown-body {
  font-family: "Roboto", sans-serif;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-body h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 2rem;
  line-height: 1.2;
}

.markdown-body h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  padding-bottom: 0.5rem;
}

.markdown-body h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
}

.markdown-body p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.markdown-body ul,
.markdown-body ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-body li {
  margin-bottom: 0.5rem;
}

.markdown-body strong {
  font-weight: 700;
}

.markdown-body blockquote {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.5);
  padding-left: 1rem;
  font-style: italic;
  margin-left: 0;
  margin-right: 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
