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
    alternateName: "AI or Real Game",
    description:
      "A weekly challenge game where players test their ability to distinguish between real videos/photographs and AI-generated deepfakes",
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
      "AI or real game, AI video detection, spot AI videos, deepfake detector, AI image detector, fake video game, AI generated content detection",
  }),
);
</script>
