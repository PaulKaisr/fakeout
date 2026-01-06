<template>
  <v-main class="bg-background min-h-screen">
    <v-container class="py-12 max-w-5xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-12 animate-slide-up">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="medium-emphasis"
          @click="router.back()"
        ></v-btn>
        <h1
          class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
        >
          {{ t("stats.title") }}
        </h1>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Video Mode Stats -->
        <v-card
          class="rounded-3xl border animate-slide-up"
          color="surface"
          elevation="0"
          style="border-color: rgba(255, 255, 255, 0.1); animation-delay: 0.2s"
        >
          <v-card-text class="p-8">
            <div class="flex items-center gap-4 mb-6">
              <v-avatar color="secondary" variant="tonal" rounded="lg">
                <v-icon icon="mdi-video" size="24"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-xl font-bold">{{ t("stats.videoMode") }}</h2>
                <p class="text-sm text-medium-emphasis">
                  {{ t("stats.videoModeDesc") }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-8">
              <div>
                <div class="text-3xl font-bold">
                  {{ userStats.video.gamesPlayed }}
                </div>
                <div
                  class="text-xs text-medium-emphasis uppercase tracking-wider font-bold"
                >
                  {{ t("stats.gamesPlayed") }}
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold">
                  {{ userStats.video.totalScore }}/{{
                    userStats.video.totalRounds
                  }}
                </div>
                <div
                  class="text-xs text-medium-emphasis uppercase tracking-wider font-bold"
                >
                  {{ t("stats.totalScore") }}
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-sm font-medium text-medium-emphasis">{{
                  t("stats.accuracy")
                }}</span>
                <span class="text-2xl font-bold text-secondary"
                  >{{ getAccuracy("video") }}%</span
                >
              </div>
              <v-progress-linear
                :model-value="getAccuracy('video')"
                color="secondary"
                height="8"
                rounded
                bg-color="surface-light"
              ></v-progress-linear>
            </div>
          </v-card-text>
        </v-card>

        <!-- Image Mode Stats -->
        <v-card
          class="rounded-3xl border animate-slide-up"
          color="surface"
          elevation="0"
          style="border-color: rgba(255, 255, 255, 0.1); animation-delay: 0.1s"
        >
          <v-card-text class="p-8">
            <div class="flex items-center gap-4 mb-6">
              <v-avatar color="primary" variant="tonal" rounded="lg">
                <v-icon icon="mdi-image" size="24"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-xl font-bold">{{ t("stats.imageMode") }}</h2>
                <p class="text-sm text-medium-emphasis">
                  {{ t("stats.imageModeDesc") }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-8">
              <div>
                <div class="text-3xl font-bold">
                  {{ userStats.image.gamesPlayed }}
                </div>
                <div
                  class="text-xs text-medium-emphasis uppercase tracking-wider font-bold"
                >
                  {{ t("stats.gamesPlayed") }}
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold">
                  {{ userStats.image.totalScore }}/{{
                    userStats.image.totalRounds
                  }}
                </div>
                <div
                  class="text-xs text-medium-emphasis uppercase tracking-wider font-bold"
                >
                  {{ t("stats.totalScore") }}
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-sm font-medium text-medium-emphasis">{{
                  t("stats.accuracy")
                }}</span>
                <span class="text-2xl font-bold text-primary"
                  >{{ getAccuracy("image") }}%</span
                >
              </div>
              <v-progress-linear
                :model-value="getAccuracy('image')"
                color="primary"
                height="8"
                rounded
                bg-color="surface-light"
              ></v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Reset Button -->
      <div
        class="mt-12 flex justify-center animate-slide-up"
        style="animation-delay: 0.3s"
      >
        <v-btn
          variant="text"
          color="error"
          prepend-icon="mdi-delete"
          @click="confirmReset"
        >
          {{ t("stats.resetStats") }}
        </v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import {
  userStats,
  getAccuracy,
  resetStats,
} from "@/services/userStatsService";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const router = useRouter();
const { t } = useI18n();
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.statsTitle,
  description: seoTranslations.statsDescription,
});

const confirmReset = () => {
  if (confirm(t("stats.resetConfirm"))) {
    resetStats();
  }
};
</script>

<style scoped>
.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
