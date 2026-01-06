<template>
  <GameContainer mode="video" />
</template>

<script setup lang="ts">
import GameContainer from "@/components/game/GameContainer.vue";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.homeTitle,
  description: seoTranslations.homeDescription,
});
</script>

<route lang="yaml">
meta:
  layout: default
</route>
