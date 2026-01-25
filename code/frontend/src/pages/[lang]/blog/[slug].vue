<template>
  <div class="article-page bg-surface">
    <!-- Navigation Bar -->
    <v-app-bar flat color="surface" density="compact" class="border-b">
      <v-container class="d-flex align-center py-0">
        <v-btn
          variant="text"
          :to="`/${currentLocale}/blog`"
          prepend-icon="mdi-arrow-left"
          class="text-none font-weight-bold"
          color="primary"
        >
          {{ $t("blog.backToBlog") }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" to="/" class="text-none">
          {{ $t("common.backToHome") }}
        </v-btn>
      </v-container>
    </v-app-bar>

    <div v-if="article">
      <!-- Article Hero -->
      <v-sheet
        class="article-hero py-16 bg-surface-variant position-relative overflow-hidden"
      >
        <div
          class="position-absolute top-0 left-0 w-100 h-100 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
        ></div>
        <v-container class="position-relative z-10" style="max-width: 800px">
          <div class="d-flex align-center gap-4 mb-6">
            <v-chip
              color="primary"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              {{ formatDate(article.date) }}
            </v-chip>
            <span class="text-subtitle-2 text-medium-emphasis">
              {{ $t("blog.writtenBy") }} {{ article.author }}
            </span>
          </div>

          <h1
            class="text-h3 md:text-h2 font-weight-bold text-high-emphasis mb-6"
            style="line-height: 1.2"
          >
            {{ articleTitle }}
          </h1>

          <p class="text-h6 text-medium-emphasis">
            {{ articleDescription }}
          </p>
        </v-container>
      </v-sheet>

      <!-- Article Content -->
      <v-container class="py-12" style="max-width: 800px">
        <article class="blog-content">
          <!-- Loading state -->
          <div v-if="loadingContent" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64" />
          </div>

          <!-- Error state -->
          <v-alert
            v-else-if="contentError"
            type="error"
            variant="tonal"
            class="mb-4"
            :title="$t('blog.contentError')"
            :text="contentError"
            icon="mdi-alert-circle"
          />

          <!-- Render Markdown Content -->
          <div v-else class="markdown-body" v-html="renderedContent"></div>
        </article>

        <v-divider class="my-12"></v-divider>

        <!-- Footer Navigation -->
        <div class="d-flex flex-column align-center">
          <h3 class="text-h5 font-weight-bold mb-6">
            {{ $t("blog.continueExploring") }}
          </h3>
          <div class="d-flex gap-4">
            <v-btn
              variant="outlined"
              rounded="xl"
              size="large"
              :to="`/${currentLocale}/blog`"
              prepend-icon="mdi-arrow-left"
            >
              {{ $t("blog.backToBlog") }}
            </v-btn>
            <v-btn
              variant="flat"
              color="primary"
              rounded="xl"
              size="large"
              :to="`/${currentLocale}`"
              append-icon="mdi-gamepad-variant"
            >
              {{ $t("common.playGame") }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Not Found State -->
    <v-container v-else class="fill-height justify-center align-center">
      <v-card class="text-center pa-8" elevation="0" border>
        <v-icon size="64" color="warning" class="mb-4"
          >mdi-file-document-alert</v-icon
        >
        <h2 class="text-h4 font-weight-bold mb-2">Article Not Found</h2>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The article you are looking for does not exist or has been moved.
        </p>
        <v-btn :to="`/${currentLocale}/blog`" color="primary" variant="flat">
          {{ $t("blog.backToBlog") }}
        </v-btn>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import MarkdownIt from "markdown-it";
import { articles } from "@/data/articles";
import { loadArticleContent } from "@/services/markdownLoader";
import { useSeoMeta } from "@/composables/useSeoMeta";
import { useHead } from "@unhead/vue";
import type { SupportedLocale } from "@/i18n";

const route = useRoute();
const { locale } = useI18n();
const currentLocale = computed(() => locale.value as SupportedLocale);
const slug = computed(() => (route.params as any).slug as string);

const article = computed(() => {
  return articles.find((a) => a.slug === slug.value);
});

// Markdown content loading state
const loadingContent = ref(false);
const contentError = ref<string | null>(null);
const markdownContent = ref<string>("");

// Load markdown content when article or locale changes
watchEffect(async () => {
  if (!article.value) {
    markdownContent.value = "";
    return;
  }

  loadingContent.value = true;
  contentError.value = null;

  try {
    markdownContent.value = await loadArticleContent(
      article.value,
      currentLocale.value,
    );
  } catch (error) {
    console.error("Failed to load article content:", error);
    contentError.value =
      error instanceof Error ? error.message : "Failed to load article content";
  } finally {
    loadingContent.value = false;
  }
});

// SEO meta for article
const articleTitle = computed(() => {
  if (!article.value) return "Article Not Found";
  return article.value.title[currentLocale.value] || article.value.title.en;
});

const articleDescription = computed(() => {
  if (!article.value) return "";
  return article.value.summary[currentLocale.value] || article.value.summary.en;
});

useSeoMeta({
  title: articleTitle,
  description: articleDescription,
  ogType: "article",
  publishedTime: computed(() => article.value?.date),
  author: computed(() => article.value?.author),
});

// BlogPosting structured data
const blogPostingSchema = computed(() => {
  if (!article.value) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline:
      article.value.title[currentLocale.value] || article.value.title.en,
    description:
      article.value.summary[currentLocale.value] || article.value.summary.en,
    datePublished: article.value.date,
    dateModified: article.value.date,
    author: {
      "@type": "Person",
      name: article.value.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Fakeout",
      logo: {
        "@type": "ImageObject",
        url: "https://fakeout.dev/logo-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fakeout.dev/${currentLocale.value}/blog/${article.value.slug}`,
    },
    inLanguage: currentLocale.value,
  };
});

useHead({
  script: computed(() =>
    blogPostingSchema.value
      ? [
          {
            type: "application/ld+json",
            innerHTML: JSON.stringify(blogPostingSchema.value),
          },
        ]
      : [],
  ),
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const renderedContent = computed(() => {
  if (!markdownContent.value) return "";
  return md.render(markdownContent.value);
});

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(currentLocale.value, options);
};
</script>

<style>
/* PREMIUM MARKDOWN STYLES */
.markdown-body {
  font-family: "Inter", "Roboto", system-ui, sans-serif;
  line-height: 1.8;
  font-size: 1.125rem; /* 18px */
  color: rgba(var(--v-theme-on-surface), 0.87);
  letter-spacing: -0.01em;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  color: rgba(var(--v-theme-on-surface), 1);
  font-weight: 700;
  margin-top: 2.5em;
  margin-bottom: 0.8em;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.markdown-body h1 {
  font-size: 2.25rem;
}
.markdown-body h2 {
  font-size: 1.75rem;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.15);
  padding-bottom: 0.3em;
}
.markdown-body h3 {
  font-size: 1.5rem;
}

.markdown-body p {
  margin-bottom: 1.5em;
}

.markdown-body ul,
.markdown-body ol {
  margin-bottom: 1.5em;
  padding-left: 1.5em;
}

.markdown-body li {
  margin-bottom: 0.5em;
  padding-left: 0.5em;
}

/* Premium Blockquotes */
.markdown-body blockquote {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 1em 1em 1em 1.5em;
  margin: 2em 0;
  background-color: rgba(
    var(--v-theme-primary),
    0.05
  ); /* Very subtle primary tint */
  border-radius: 0 8px 8px 0;
  font-style: italic;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* Code Blocks */
.markdown-body pre {
  background-color: #1e1e1e; /* Dark background always looks pro for code */
  color: #e0e0e0;
  padding: 1.25em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  font-size: 0.9em;
  line-height: 1.5;
}

.markdown-body code {
  font-family: "Fira Code", "Consolas", monospace;
  background-color: rgba(
    var(--v-theme-on-surface),
    0.08
  ); /* Subtle background for inline code */
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

/* Images */
.markdown-body img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 12px; /* Smooth corners */
  margin: 2.5em auto;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Links */
.markdown-body a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.markdown-body a:hover {
  border-bottom-color: rgb(var(--v-theme-primary));
}
</style>
