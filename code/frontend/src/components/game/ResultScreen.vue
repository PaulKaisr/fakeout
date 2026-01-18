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
        {{ t("results.title") }}
      </h2>
    </div>

    <div
      class="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10 w-full max-w-sm"
    >
      <p class="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">
        {{ t("results.finalScore") }}
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
      <div v-if="isLatestGame" class="text-center mb-2">
        <p
          class="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1"
        >
          {{ t("results.nextGameIn") }}
        </p>
        <div class="text-2xl font-mono font-bold">
          {{ formattedTime }}
        </div>
        <div class="text-center">
          <v-btn
            variant="plain"
            color="primary"
            class="text-none animate-pulse-gentle"
            prepend-icon="mdi-email-outline"
            @click="showNewsletterDialog = true"
          >
            {{ $t("newsletter.stayUpdated") }}
          </v-btn>
        </div>
      </div>

      <!-- Cross promotion -->
      <v-btn
        variant="tonal"
        color="secondary"
        size="x-large"
        rounded="xl"
        :prepend-icon="otherMode === 'image' ? 'mdi-image' : 'mdi-video'"
        class="text-none font-bold"
        @click="tryOtherMode"
      >
        {{
          t("results.tryOtherMode", {
            mode: otherMode === "image" ? "Photo" : "Video",
          })
        }}
      </v-btn>

      <v-btn
        variant="text"
        color="medium-emphasis"
        size="large"
        rounded="xl"
        prepend-icon="mdi-calendar-clock"
        class="text-none font-bold"
        @click="$emit('archive')"
      >
        {{ t("results.playMore") }}
      </v-btn>

      <v-btn
        color="primary"
        size="x-large"
        rounded="xl"
        prepend-icon="mdi-share-variant"
        class="text-none font-bold"
        @click="shareResult"
      >
        {{ copied ? t("results.copiedToClipboard") : t("results.shareResult") }}
      </v-btn>

      <v-dialog v-model="showNewsletterDialog" max-width="450">
        <NewsletterSignup />
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import NewsletterSignup from "@/components/NewsletterSignup.vue";

const { t, locale } = useI18n();
const router = useRouter();

const props = defineProps<{
  score: number;
  totalRounds: number;
  mode: "image" | "video";
  isLatestGame: boolean;
  gameDate: string | null;
}>();

defineEmits<{
  (e: "archive"): void;
}>();

const copied = ref(false);
const showNewsletterDialog = ref(false);
const timeRemaining = ref(0);
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null);

const percentage = computed(() => (props.score / props.totalRounds) * 100);

const feedbackMessage = computed(() => {
  if (percentage.value === 100) return t("results.feedback.perfect");
  if (percentage.value >= 80) return t("results.feedback.great");
  if (percentage.value >= 50) return t("results.feedback.good");
  return t("results.feedback.poor");
});

const shareUrl = computed(() => {
  if (props.gameDate) {
    return `${window.location.origin}/${locale.value}/${props.mode}/${props.gameDate}`;
  }
  return window.location.href;
});

const shareText = computed(() =>
  t("results.shareText", {
    score: props.score,
    total: props.totalRounds,
    mode: t(props.mode === "image" ? "stats.imageMode" : "stats.videoMode"),
    url: shareUrl.value,
  }),
);

const otherMode = computed(() => (props.mode === "image" ? "video" : "image"));

const formattedTime = computed(() => {
  const ms = timeRemaining.value;
  if (ms <= 0) return "00:00:00";

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
});

const updateCountdown = () => {
  const now = new Date();
  const nextGame = new Date();

  // Target: Next Monday 00:00 UTC
  const daysUntilMonday = (1 + 7 - now.getUTCDay()) % 7;
  nextGame.setDate(now.getDate() + daysUntilMonday);
  nextGame.setUTCHours(0, 0, 0, 0);

  // If we are past this Monday 00:00 UTC, aim for next week
  // But wait, if today IS Monday, daysUntilMonday is 0.
  // If now is Monday 10:00, nextGame is Monday 00:00 (past).
  // So we need to add 7 days.
  if (nextGame <= now) {
    nextGame.setDate(nextGame.getDate() + 7);
  }

  timeRemaining.value = Math.max(0, nextGame.getTime() - now.getTime());
};

const shareResult = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const tryOtherMode = () => {
  if (otherMode.value === "image") {
    router.push(`/${locale.value}/image`);
  } else {
    router.push(`/${locale.value}`);
  }
};

onMounted(() => {
  if (props.isLatestGame) {
    updateCountdown();
    countdownInterval.value = setInterval(updateCountdown, 1000);
  }
});

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});
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

.animate-pulse-gentle {
  animation: pulse-gentle 2s infinite;
}

@keyframes pulse-gentle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}
</style>
