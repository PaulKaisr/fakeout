<template>
  <div
    class="flex flex-col items-center justify-center p-8 text-center animate-fade-in"
  >
    <div class="mb-8">
      <v-icon
        icon="mdi-trophy-outline"
        color="amber"
        size="80"
        class="mb-4"
      ></v-icon>
      <h2
        class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500"
      >
        {{ t('results.title') }}
      </h2>
    </div>

    <div
      class="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10 w-full max-w-sm"
    >
      <p class="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">
        {{ t('results.finalScore') }}
      </p>
      <div class="text-6xl font-black text-white mb-2">
        {{ score
        }}<span class="text-2xl text-gray-500">/{{ totalRounds }}</span>
      </div>
      <p
        class="text-lg"
        :class="percentage >= 80 ? 'text-success' : 'text-gray-300'"
      >
        {{ feedbackMessage }}
      </p>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-sm">
      <v-btn
        color="primary"
        size="x-large"
        rounded="xl"
        prepend-icon="mdi-share-variant"
        class="text-none font-bold"
        @click="shareResult"
      >
        {{ copied ? t('results.copiedToClipboard') : t('results.shareResult') }}
      </v-btn>

      <v-btn
        variant="tonal"
        color="white"
        size="x-large"
        rounded="xl"
        prepend-icon="mdi-refresh"
        class="text-none font-bold"
        @click="$emit('retry')"
      >
        {{ t('results.playAgain') }}
      </v-btn>

      <v-btn
        variant="text"
        color="gray"
        size="large"
        class="text-none"
        @click="$emit('home')"
      >
        {{ t('common.backToHome') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  score: number;
  totalRounds: number;
}>();

defineEmits<{
  (e: "retry"): void;
  (e: "home"): void;
}>();

const copied = ref(false);

const percentage = computed(() => (props.score / props.totalRounds) * 100);

const feedbackMessage = computed(() => {
  if (percentage.value === 100) return t('results.feedback.perfect');
  if (percentage.value >= 80) return t('results.feedback.great');
  if (percentage.value >= 50) return t('results.feedback.good');
  return t('results.feedback.poor');
});

const shareText = computed(() =>
  t('results.shareText', {
    score: props.score,
    total: props.totalRounds
  })
);

const shareResult = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
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
