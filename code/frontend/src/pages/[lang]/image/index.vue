<template>
  <ClientOnly>
    <GameContainer mode="image" />
    <template #fallback>
      <div class="game-loading-placeholder">
        <v-container class="py-16 text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-medium-emphasis">{{ $t("common.loading") }}</p>
        </v-container>
      </div>
    </template>
  </ClientOnly>
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
