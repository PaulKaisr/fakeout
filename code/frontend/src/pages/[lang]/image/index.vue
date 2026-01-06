<template>
  <GameContainer mode="image" />
</template>

<script setup lang="ts">
import GameContainer from "@/components/game/GameContainer.vue";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.imageTitle,
  description: seoTranslations.imageDescription,
});
</script>

<route lang="yaml">
meta:
  layout: default
</route>
