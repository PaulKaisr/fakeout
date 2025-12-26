<template>
  <div class="min-h-screen bg-[#0a0a0c] text-white p-6">
    <header
      class="mb-8 flex items-center justify-between max-w-4xl mx-auto w-full"
    >
      <div class="flex items-center gap-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="white"
          @click="router.push('/')"
        ></v-btn>
        <div>
          <h1
            class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
          >
            Past Games
          </h1>
          <p class="text-sm text-gray-400">Play games from previous days</p>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto w-full">
      <div v-if="loading" class="flex justify-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>

      <div
        v-else-if="dates.length === 0"
        class="text-center py-12 text-gray-400"
      >
        <v-icon icon="mdi-calendar-blank" size="48" class="mb-4"></v-icon>
        <p>No past games found in the archive.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <v-hover
          v-for="date in dates"
          :key="date"
          v-slot="{ isHovering, props }"
        >
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="bg-white/5 border border-white/10 transition-all duration-300 cursor-pointer"
            @click="playGame(date)"
          >
            <v-card-text class="flex items-center gap-4 p-6">
              <div
                class="size-10 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <v-icon icon="mdi-calendar" color="primary"></v-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">
                  {{ formatDate(date) }}
                </h3>
                <p class="text-xs text-gray-400">{{ date }}</p>
              </div>
              <v-spacer></v-spacer>
              <v-icon icon="mdi-chevron-right" color="gray"></v-icon>
            </v-card-text>
          </v-card>
        </v-hover>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";

const router = useRouter();
const r2Service = createR2Service(r2Config);
const dates = ref<string[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    dates.value = await r2Service.fetchManifest();
  } catch (e) {
    console.error("Failed to fetch archive", e);
  } finally {
    loading.value = false;
  }
});

const playGame = (date: string) => {
  router.push(`/game/${date}`);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
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
