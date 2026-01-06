<template>
  <v-container class="legal-container py-12">
    <div class="mb-4">
      <v-btn
        variant="text"
        :to="`/${currentLocale}`"
        prepend-icon="mdi-arrow-left"
        class="text-none"
      >
        {{ $t("common.backToHome") }}
      </v-btn>
    </div>

    <div class="text-center mb-12">
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("terms.title") }}</h1>
      <p class="text-medium-emphasis">
        {{ $t("terms.lastUpdated") }}: January 6, 2026
      </p>
    </div>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.acceptance.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.acceptance.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.description.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.description.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.usage.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-4">{{ $t("terms.sections.usage.text") }}</p>
          <ul class="ml-4">
            <li class="mb-2">{{ $t("terms.sections.usage.items.lawful") }}</li>
            <li class="mb-2">{{ $t("terms.sections.usage.items.noHarm") }}</li>
            <li class="mb-2">
              {{ $t("terms.sections.usage.items.noInterference") }}
            </li>
            <li class="mb-2">
              {{ $t("terms.sections.usage.items.noAutomation") }}
            </li>
          </ul>
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.intellectualProperty.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.intellectualProperty.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.disclaimer.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.disclaimer.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.limitation.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.limitation.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.changes.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.changes.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.governing.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("terms.sections.governing.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("terms.sections.contact.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p>{{ $t("terms.sections.contact.text") }}</p>
          <p class="mt-2">
            <strong>Email:</strong>
            <a href="mailto:onedevshow@gmail.com" class="text-primary"
              >onedevshow@gmail.com</a
            >
          </p>
        </v-card-text>
      </v-card-item>
    </v-card>
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
  title: seoTranslations.termsTitle,
  description: seoTranslations.termsDescription,
});
</script>

<style scoped>
.legal-container {
  max-width: 800px;
}
</style>
