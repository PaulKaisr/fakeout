<template>
  <v-container>
    <v-card>
      <v-card-title>R2 Images Test</v-card-title>

      <v-card-text>
        <!-- Configuration Section -->
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="datePrefix"
              label="Date (YYYY-MM-DD)"
              type="date"
              hint="Select date to load images from"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="imageType"
              :items="imageTypes"
              label="Image Type"
              hint="Type of images to load"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="limit"
              label="Limit"
              type="number"
              min="1"
              max="100"
              hint="Maximum images to load"
              persistent-hint
            />
          </v-col>
        </v-row>

        <!-- Actions -->
        <v-row class="mt-2">
          <v-col>
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!datePrefix"
              @click="loadImagesForDate"
            >
              Load Images
            </v-btn>

            <v-btn
              v-if="images.length > 0"
              color="secondary"
              class="ml-2"
              @click="clear"
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- Error Display -->
        <v-alert v-if="error" type="error" class="mt-4">
          {{ error.message }}
        </v-alert>

        <!-- Results Summary -->
        <v-row v-if="images.length > 0" class="mt-4">
          <v-col>
            <v-chip color="primary" class="mr-2">
              Total: {{ images.length }}
            </v-chip>
            <v-chip color="info" class="mr-2">
              Real: {{ pexelsImages.length }}
            </v-chip>
            <v-chip color="success">
              Generated: {{ generatedImages.length }}
            </v-chip>
          </v-col>
        </v-row>

        <!-- Images Grid -->
        <v-row v-if="images.length > 0" class="mt-4">
          <v-col
            v-for="image in images"
            :key="image.key"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card>
              <v-img
                :src="image.url"
                aspect-ratio="1"
                cover
                :alt="getImageAlt(image)"
              >
                <template #placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary" />
                  </v-row>
                </template>
              </v-img>

              <v-card-text>
                <!-- Type Badge -->
                <v-chip
                  :color="image.type === 'pexels_raw' ? 'primary' : 'secondary'"
                  size="small"
                  class="mb-2"
                >
                  {{ image.type === 'pexels_raw' ? 'Real' : 'AI Generated' }}
                </v-chip>

                <!-- Metadata Display -->
                <div v-if="image.metadata" class="text-caption">
                  <div v-if="isPexelsMetadata(image.metadata)">
                    <strong>ID:</strong> {{ image.metadata.id }}<br />
                    <strong>Photographer:</strong> {{ image.metadata.photographer }}<br />
                    <strong>Size:</strong> {{ image.metadata.width }}x{{ image.metadata.height }}
                    <div v-if="image.metadata.ai_description" class="mt-2">
                      <strong>AI Description:</strong><br />
                      {{ image.metadata.ai_description }}
                    </div>
                  </div>

                  <div v-else-if="isGeneratedMetadata(image.metadata)">
                    <strong>Original ID:</strong> {{ image.metadata.original_image_id }}<br />
                    <strong>Model:</strong> {{ image.metadata.model }}<br />
                    <div class="mt-2">
                      <strong>Prompt:</strong><br />
                      {{ image.metadata.generation_prompt }}
                    </div>
                  </div>
                </div>

                <!-- Key Display -->
                <v-divider class="my-2" />
                <div class="text-caption text-grey">
                  {{ image.key }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-row v-if="!loading && images.length === 0 && !error" class="mt-4">
          <v-col>
            <v-alert type="info">
              Select a date and click "Load Images" to test R2 integration.
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useR2Images } from '@/composables/useR2Images'
import type { R2Image, R2ImageMetadata, R2GeneratedImageMetadata } from '@/types/r2.types'

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

// State
const datePrefix = ref(today)
const imageType = ref<'pexels_raw' | 'openai_generated' | 'both'>('both')
const limit = ref(20)

// Image type options
const imageTypes = [
  { title: 'Both', value: 'both' },
  { title: 'Real (Pexels)', value: 'pexels_raw' },
  { title: 'AI Generated', value: 'openai_generated' },
]

// R2 composable
const { images, pexelsImages, generatedImages, loading, error, loadImages, clear } = useR2Images()

/**
 * Load images for the selected date
 */
async function loadImagesForDate() {
  await loadImages({
    datePrefix: datePrefix.value,
    type: imageType.value,
    limit: limit.value,
    includeMetadata: true,
  })
}

/**
 * Get alt text for image
 */
function getImageAlt(image: R2Image): string {
  if (image.metadata && 'alt' in image.metadata) {
    return image.metadata.alt || 'Image'
  }
  return 'AI Generated Image'
}

/**
 * Type guard for Pexels metadata
 */
function isPexelsMetadata(
  metadata: R2ImageMetadata | R2GeneratedImageMetadata
): metadata is R2ImageMetadata {
  return 'photographer' in metadata
}

/**
 * Type guard for generated image metadata
 */
function isGeneratedMetadata(
  metadata: R2ImageMetadata | R2GeneratedImageMetadata
): metadata is R2GeneratedImageMetadata {
  return 'original_image_id' in metadata && 'generation_prompt' in metadata
}
</script>
