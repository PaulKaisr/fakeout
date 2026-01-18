<template>
  <component
    :is="'script'"
    type="application/ld+json"
    v-html="structuredData"
  ></component>
</template>

<script setup lang="ts">
import { computed } from "vue";

const structuredData = computed(() =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Fakeout",
    description:
      "A daily challenge game where players test their ability to distinguish between real photographs and AI-generated images",
    genre: ["Puzzle", "Educational", "Quiz"],
    gamePlatform: "Web Browser",
    applicationCategory: "Game",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    keywords:
      "AI image detector, AI or real, spot AI images, AI detection game, deepfake detector",
  }),
);
</script>
