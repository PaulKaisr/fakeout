<template>
  <v-container class="about-container py-12">
    <div class="mb-4">
      <v-btn
        variant="text"
        to="/"
        prepend-icon="mdi-arrow-left"
        class="text-none"
      >
        {{ $t("common.backToHome") }}
      </v-btn>
    </div>

    <div class="text-center mb-12">
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("about.title") }}</h1>
    </div>

    <v-card class="mb-8" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("about.mission.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("about.mission.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-8" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("about.story.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("about.story.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <!-- Optional: Tech Stack or Team section could go here -->
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const { locale } = useI18n();
const currentLocale = computed(() => locale.value as string);
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.aboutTitle,
  description: seoTranslations.aboutDescription,
});
</script>

<style scoped>
.about-container {
  max-width: 800px;
}
</style>
