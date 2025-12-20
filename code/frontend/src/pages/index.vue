<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Image Section -->
        <div v-if="imageUrl" class="relative aspect-square">
          <img
            :src="imageUrl"
            :alt="metadata?.alt || 'Test image from R2'"
            class="w-full h-full object-cover"
            @load="imageLoaded = true"
          />
          <!-- Loading Placeholder -->
          <div
            v-if="!imageLoaded"
            class="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            ></div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-6">
          <!-- Title -->
          <h1 v-if="metadata" class="text-2xl font-bold text-gray-900 mb-4">
            {{ metadata.photographer }}
          </h1>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            ></div>
            <p class="mt-4 text-gray-600">Loading image...</p>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
            role="alert"
          >
            <p class="font-medium">Error</p>
            <p class="text-sm">{{ error }}</p>
          </div>

          <!-- Metadata Display -->
          <div v-else-if="metadata" class="space-y-4">
            <p
              v-if="metadata.ai_description"
              class="text-gray-700 text-base leading-relaxed"
            >
              {{ metadata.ai_description }}
            </p>
            <p class="text-sm text-gray-500">
              {{ metadata.width }} x {{ metadata.height }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { r2Config } from "@/config/r2.config";
import { R2Service } from "@/services/r2.service";
import type { R2ImageMetadata } from "@/types/r2.types";

const imageUrl = ref<string | null>(null);
const metadata = ref<R2ImageMetadata | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const imageLoaded = ref(false);

onMounted(async () => {
  const service = new R2Service(r2Config);
  const datePrefix = "2025-12-07";
  const imageKey = `${datePrefix}/pexel_images_raw/001`;
  const metaKey = `${datePrefix}/pexel_images_raw/001_meta.json`;

  try {
    imageUrl.value = service.buildUrl(imageKey);
    metadata.value = (await service.fetchMetadata(metaKey)) as R2ImageMetadata;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load image";
  } finally {
    loading.value = false;
  }
});
</script>
