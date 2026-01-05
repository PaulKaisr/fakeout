<template>
  <div
    class="relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 bg-surface-light"
    :class="{
      'ring-4 ring-offset-2 ring-offset-background': isSelected,
      'ring-primary': isSelected && !showResult,
      'ring-success': showResult && isCorrect,
      'ring-error': showResult && !isCorrect && isSelected,
      'opacity-50': showResult && !isCorrect && !isSelected,
    }"
    @click="$emit('select')"
  >
    <!-- Image -->
    <v-img
      v-if="image.mediaType !== 'video'"
      :src="image.url"
      class="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
      cover
    >
      <template #placeholder>
        <div
          class="d-flex align-center justify-center fill-height bg-grey-darken-4"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
      </template>
    </v-img>

    <!-- Video -->
    <video
      v-else
      :src="image.url"
      class="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
      autoplay
      loop
      muted
      playsinline
    ></video>

    <!-- Label (A or B) -->
    <div
      class="absolute top-4 left-4 size-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-lg border border-white/10 shadow-lg"
    >
      {{ label }}
    </div>

    <!-- Selection Overlay -->
    <div
      class="absolute inset-0 bg-primary/20 opacity-0 transition-opacity duration-300 pointer-events-none"
      :class="{ 'opacity-100': isSelected && !showResult }"
    ></div>

    <!-- Result Overlay -->
    <div
      v-if="showResult"
      class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fade-in"
    >
      <v-icon
        :icon="image.isAiGenerated ? 'mdi-robot' : 'mdi-camera'"
        size="64"
        class="mb-2"
        :color="image.isAiGenerated ? 'purple-accent-2' : 'cyan-accent-2'"
      ></v-icon>
      <span class="text-h5 font-bold text-white mb-1">
        {{ image.isAiGenerated ? t("game.aiGenerated") : t("game.realPhoto") }}
      </span>
      <span
        v-if="isSelected"
        class="text-subtitle-1 font-weight-bold"
        :class="isCorrect ? 'text-success' : 'text-error'"
      >
        {{ isCorrect ? t("game.correct") : t("game.wrong") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from "@/types/game";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  image: Image;
  label: string;
  isSelected?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
}>();

defineEmits(["select"]);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
