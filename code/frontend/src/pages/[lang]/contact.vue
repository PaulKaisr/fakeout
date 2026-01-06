<template>
  <v-container class="contact-container py-12">
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
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("contact.title") }}</h1>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t("contact.subtitle") }}
      </p>
    </div>

    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="mb-6" elevation="0" border>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-email-outline"
                color="primary"
                size="32"
              ></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              {{ $t("contact.email.title") }}
            </v-card-title>
            <v-card-text class="text-body-1">
              <p class="mb-2">{{ $t("contact.email.description") }}</p>
              <a href="mailto:hello@fakeout.dev" class="text-primary text-h6">
                hello@fakeout.dev
              </a>
            </v-card-text>
          </v-card-item>
        </v-card>

        <v-card class="mb-6" elevation="0" border>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-bug-outline" color="warning" size="32"></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              {{ $t("contact.support.title") }}
            </v-card-title>
            <v-card-text class="text-body-1">
              <p class="mb-2">{{ $t("contact.support.description") }}</p>
              <a href="mailto:support@fakeout.dev" class="text-primary text-h6">
                support@fakeout.dev
              </a>
            </v-card-text>
          </v-card-item>
        </v-card>

        <v-card class="mb-6" elevation="0" border>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-briefcase-outline"
                color="success"
                size="32"
              ></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              {{ $t("contact.business.title") }}
            </v-card-title>
            <v-card-text class="text-body-1">
              <p class="mb-2">{{ $t("contact.business.description") }}</p>
              <a
                href="mailto:business@fakeout.dev"
                class="text-primary text-h6"
              >
                business@fakeout.dev
              </a>
            </v-card-text>
          </v-card-item>
        </v-card>

        <v-card elevation="0" border>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-shield-lock-outline"
                color="error"
                size="32"
              ></v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              {{ $t("contact.privacy.title") }}
            </v-card-title>
            <v-card-text class="text-body-1">
              <p class="mb-2">{{ $t("contact.privacy.description") }}</p>
              <a href="mailto:privacy@fakeout.dev" class="text-primary text-h6">
                privacy@fakeout.dev
              </a>
            </v-card-text>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="0" border class="h-100">
          <v-card-item>
            <v-card-title class="text-h5 font-weight-bold mb-4">
              {{ $t("contact.social.title") }}
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-6">
                {{ $t("contact.social.description") }}
              </p>

              <div class="d-flex flex-column gap-3">
                <v-btn
                  href="https://twitter.com/fakeoutgame"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-twitter"
                  class="justify-start text-none"
                  block
                >
                  Twitter / X
                </v-btn>

                <v-btn
                  href="https://github.com/fakeout"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-github"
                  class="justify-start text-none"
                  block
                >
                  GitHub
                </v-btn>
              </div>

              <v-divider class="my-6"></v-divider>

              <div class="text-center">
                <v-icon
                  icon="mdi-clock-outline"
                  class="mr-2"
                  color="medium-emphasis"
                ></v-icon>
                <span class="text-medium-emphasis">{{
                  $t("contact.responseTime")
                }}</span>
              </div>
            </v-card-text>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
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
  title: seoTranslations.contactTitle,
  description: seoTranslations.contactDescription,
});
</script>

<style scoped>
.contact-container {
  max-width: 900px;
}
</style>
