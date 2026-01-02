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
                </div>
                <v-icon icon="mdi-chevron-right" color="grey"></v-icon>
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

const { t, locale } = useI18n();
const router = useRouter();
const { mobile } = useDisplay();
const r2Service = createR2Service(r2Config);

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dates = ref<string[]>([]);
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
  }
);

const fetchDates = async () => {
  loading.value = true;
  try {
    dates.value = await r2Service.fetchManifest();
  } catch (e) {
    console.error("Failed to fetch archive", e);
  } finally {
    loading.value = false;
  }
};

const playGame = (date: string) => {
  router.push(`/${locale.value}/game/${date}`);
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
