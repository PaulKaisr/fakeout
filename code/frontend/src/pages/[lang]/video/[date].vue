<template>
  <ClientOnly>
    <GameContainer :date="date" mode="video" />
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
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useSeoMeta } from "@/composables/useSeoMeta";
import { useI18n } from "vue-i18n";

const route = useRoute();
const { locale } = useI18n();
const date = computed(() => (route.params as any).date as string);

// Date-specific game pages should not be indexed
const pageTitle = computed(() =>
  locale.value === "en"
    ? `Video Game - ${date.value}`
    : locale.value === "de"
      ? `Videospiel - ${date.value}`
      : `Видео игра - ${date.value}`,
);

const pageDescription = computed(() =>
  locale.value === "en"
    ? `Play the Fakeout AI video detection challenge from ${date.value}.`
    : locale.value === "de"
      ? `Spiele die Fakeout KI-Videoerkennungs-Herausforderung vom ${date.value}.`
      : `Играй предизвикателството за ИИ видео от ${date.value}.`,
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  noIndex: true, // Exclude from search indexing
});
</script>

<route lang="yaml">
meta:
  layout: default
</route>
