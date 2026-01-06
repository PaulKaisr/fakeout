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
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("privacy.title") }}</h1>
      <p class="text-medium-emphasis">
        {{ $t("privacy.lastUpdated") }}: January 6, 2026
      </p>
    </div>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.intro.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("privacy.sections.intro.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.dataCollection.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-4">{{ $t("privacy.sections.dataCollection.text") }}</p>
          <ul class="ml-4">
            <li class="mb-2">
              {{ $t("privacy.sections.dataCollection.items.localStorage") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.dataCollection.items.analytics") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.dataCollection.items.cookies") }}
            </li>
          </ul>
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.cookies.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-4">{{ $t("privacy.sections.cookies.text") }}</p>
          <p class="mb-4">{{ $t("privacy.sections.cookies.thirdParty") }}</p>
          <v-alert type="info" variant="tonal" class="mb-4">
            <p class="mb-2">{{ $t("privacy.sections.cookies.googleInfo") }}</p>
            <a
              href="https://www.google.com/policies/privacy/partners/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              {{ $t("privacy.sections.cookies.googleLink") }}
            </a>
          </v-alert>
          <p>{{ $t("privacy.sections.cookies.optOut") }}</p>
          <ul class="ml-4 mt-2">
            <li>
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary"
              >
                Google Ads Settings
              </a>
            </li>
            <li>
              <a
                href="http://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary"
              >
                aboutads.info
              </a>
            </li>
          </ul>
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.thirdParty.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-4">{{ $t("privacy.sections.thirdParty.text") }}</p>
          <ul class="ml-4">
            <li class="mb-2">
              <strong>Google Analytics</strong> -
              {{ $t("privacy.sections.thirdParty.googleAnalytics") }}
            </li>
            <li class="mb-2">
              <strong>Google AdSense</strong> -
              {{ $t("privacy.sections.thirdParty.googleAdsense") }}
            </li>
            <li class="mb-2">
              <strong>Vercel Analytics</strong> -
              {{ $t("privacy.sections.thirdParty.vercel") }}
            </li>
          </ul>
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.rights.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-4">{{ $t("privacy.sections.rights.text") }}</p>
          <ul class="ml-4">
            <li class="mb-2">
              {{ $t("privacy.sections.rights.items.access") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.rights.items.rectification") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.rights.items.erasure") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.rights.items.portability") }}
            </li>
            <li class="mb-2">
              {{ $t("privacy.sections.rights.items.withdraw") }}
            </li>
          </ul>
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.children.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("privacy.sections.children.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card class="mb-6" elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.changes.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t("privacy.sections.changes.text") }}
        </v-card-text>
      </v-card-item>
    </v-card>

    <v-card elevation="0" border>
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold mb-2">
          {{ $t("privacy.sections.contact.title") }}
        </v-card-title>
        <v-card-text class="text-body-1">
          <p>{{ $t("privacy.sections.contact.text") }}</p>
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
  title: seoTranslations.privacyTitle,
  description: seoTranslations.privacyDescription,
});
</script>

<style scoped>
.legal-container {
  max-width: 800px;
}
</style>
