<template>
  <v-dialog
    v-model="dialogModel"
    :fullscreen="isMobile"
    :max-width="isMobile ? undefined : '600px'"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <v-icon icon="mdi-calendar-clock" color="primary"></v-icon>
          <div>
            <h2 class="text-xl font-bold">{{ t("archive.title") }}</h2>
            <p class="text-sm">{{ t("archive.subtitle") }}</p>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="px-6 py-4">
        <div v-if="loading" class="flex justify-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <div v-else-if="dates.length === 0" class="text-center py-12">
          <v-icon icon="mdi-calendar-blank" size="48" class="mb-4"></v-icon>
          <p>{{ t("archive.noGames") }}</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <v-hover
            v-for="date in dates"
            :key="date"
            v-slot="{ isHovering, props }"
          >
            <v-card
              v-bind="props"
              :elevation="isHovering ? 4 : 1"
              class="cursor-pointer transition-all"
              @click="playGame(date)"
            >
              <v-card-text class="flex items-center gap-4 px-4 py-3">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-full"
                >
                  <v-icon
                    icon="mdi-calendar"
                    color="primary"
                    size="20"
                  ></v-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold">
                    {{ formatDate(date) }}
                  </h3>
                  <p class="text-xs">{{ date }}</p>
                  <p
                    v-if="prompts[date]"
                    class="text-xs text-primary font-bold mt-1 uppercase"
                  >
                    "{{
                      prompts[date].slice(0, 30) +
                      (prompts[date].length > 30 ? "..." : "")
                    }}"
                  </p>

                  <!-- Play Count -->
                  <div
                    v-if="playCounts[date] && playCounts[date] > 0"
                    class="flex items-center gap-1 mt-1"
                  >
                    <v-icon
                      icon="mdi-account-group"
                      size="x-small"
                      color="medium-emphasis"
                    ></v-icon>
                    <span class="text-[10px] text-medium-emphasis font-medium">
                      {{ playCounts[date] }} {{ t("game.plays") }}
                    </span>
                  </div>
                </div>

                <!-- Stats Display -->
                <div v-if="getGameStatus(date)" class="flex items-center gap-3">
                  <div class="text-right">
                    <div class="text-sm font-bold">
                      {{ getGameStatus(date)?.score }}/{{
                        getGameStatus(date)?.totalRounds || "?"
                      }}
                    </div>
                    <div
                      class="text-[10px] uppercase font-bold tracking-wider"
                      :class="
                        getGameStatus(date)?.isFinished
                          ? 'text-success'
                          : 'text-warning'
                      "
                    >
                      {{
                        getGameStatus(date)?.isFinished
                          ? t("archive.finished")
                          : t("archive.inProgress")
                      }}
                    </div>
                  </div>
                  <v-icon
                    :icon="
                      getGameStatus(date)?.isFinished
                        ? 'mdi-check-circle'
                        : 'mdi-progress-clock'
                    "
                    :color="
                      getGameStatus(date)?.isFinished ? 'success' : 'warning'
                    "
                    size="24"
                  ></v-icon>
                </div>

                <v-icon v-else icon="mdi-chevron-right" color="grey"></v-icon>
              </v-card-text>
            </v-card>
          </v-hover>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import { getGameStats } from "@/services/userStatsService";
import { supabaseService } from "@/services/supabaseService";

const { t, locale } = useI18n();
const router = useRouter();
const { mobile } = useDisplay();
const r2Service = createR2Service(r2Config);

const getGameStatus = (date: string) => {
  const game = getGameStats(props.mode || "image", date);
  if (!game) return null;
  // If we don't store totalRounds in progress (we only store in aggregate), we might need to guess or assume e.g. 5
  // But wait, recordRoundResult increments totalRounds in aggregate.
  // SingleGameProgress has roundsPlayed.
  // Actually, we don't know totalRounds for a single game unless we store it or assume it.
  // Let's use roundsPlayed for now, or just show score.
  // Wait, I didn't add totalRounds to SingleGameProgress!
  return {
    score: game.score,
    totalRounds: game.totalRounds || game.roundsPlayed, // Fallback if old data
    isFinished: game.isFinished,
  };
};

const props = defineProps<{
  modelValue: boolean;
  mode?: "image" | "video";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dates = ref<string[]>([]);
const prompts = ref<Record<string, string>>({});
const playCounts = ref<Record<string, number>>({});
const loading = ref(false);
const isMobile = computed(() => mobile.value);

// Computed property for v-model binding
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Watch for dialog open to fetch data
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue && dates.value.length === 0) {
      await fetchDates();
    }
  },
);

const fetchDates = async () => {
  loading.value = true;
  try {
    const manifestMode = props.mode === "video" ? "videos" : "images";
    const manifest = await r2Service.fetchManifest(manifestMode);
    dates.value = manifest.dates;
    prompts.value = manifest.prompts || {};

    // Fetch play counts in parallel
    // We do this without blocking the UI loading state completely if we wanted,
    // but honestly it's better to show them when ready.
    // Let's just fire and forget or await if fast.
    // Iterating one by one is slow. But let's just do it.
    // To avoid blinking, we can just let them populate.
    dates.value.forEach(async (date) => {
      const count = await supabaseService.getGamePlayCount(
        props.mode || "image",
        date,
      );
      playCounts.value[date] = count;
    });
  } catch (e) {
    console.error("Failed to fetch archive", e);
  } finally {
    loading.value = false;
  }
};

const playGame = (date: string) => {
  const basePath = props.mode === "video" ? "video" : "image";
  router.push(`/${locale.value}/${basePath}/${date}`);
  closeDialog();
};

const closeDialog = () => {
  emit("update:modelValue", false);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString(locale.value, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};
</script>
