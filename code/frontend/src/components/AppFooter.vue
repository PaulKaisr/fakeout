<template>
  <v-footer
    class="text-center flex flex-col py-6 w-full !bg-[rgba(var(--v-theme-surface),0.8)] backdrop-blur-[10px] border-t border-[rgba(var(--v-border-color),0.1)] mt-auto relative z-10"
  >
    <!-- Main Navigation -->
    <div
      class="flex w-full items-center justify-center px-4 mb-4 flex-wrap gap-1"
    >
      <v-btn
        variant="text"
        size="small"
        color="secondary"
        class="normal-case px-2"
        rounded="xl"
        :to="homeLink"
        prepend-icon="mdi-home-outline"
      >
        {{ $t("footer.home") }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="secondary"
        class="normal-case px-2"
        rounded="xl"
        :to="blogLink"
        prepend-icon="mdi-post-outline"
      >
        {{ $t("footer.blog") }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="secondary"
        class="normal-case px-2"
        rounded="xl"
        :to="aboutLink"
        prepend-icon="mdi-information-outline"
      >
        {{ $t("footer.about") }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="secondary"
        class="normal-case px-2"
        rounded="xl"
        :to="faqLink"
        prepend-icon="mdi-help-circle-outline"
      >
        {{ $t("footer.faq") }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="secondary"
        class="normal-case px-2"
        rounded="xl"
        :to="contactLink"
        prepend-icon="mdi-email-outline"
      >
        {{ $t("footer.contact") }}
      </v-btn>
    </div>

    <!-- Legal Links -->
    <div
      class="flex w-full items-center justify-center px-4 mb-4 flex-wrap gap-1"
    >
      <v-btn
        variant="text"
        size="x-small"
        color="medium-emphasis"
        class="normal-case px-2"
        rounded="xl"
        :to="privacyLink"
      >
        {{ $t("footer.privacy") }}
      </v-btn>
      <span class="text-medium-emphasis">·</span>
      <v-btn
        variant="text"
        size="x-small"
        color="medium-emphasis"
        class="normal-case px-2"
        rounded="xl"
        :to="termsLink"
      >
        {{ $t("footer.terms") }}
      </v-btn>
    </div>

    <v-divider class="w-1/2 mb-4 self-center"></v-divider>

    <div class="text-medium-emphasis text-caption">
      <strong>Fakeout</strong> —
      {{ $t("footer.copyright", { year: new Date().getFullYear() }) }}
    </div>
  </v-footer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const homeLink = computed(() => `/${locale.value}`);
const blogLink = computed(() => `/${locale.value}/blog`);
const aboutLink = computed(() => `/${locale.value}/about`);
const faqLink = computed(() => `/${locale.value}/faq`);
const contactLink = computed(() => `/${locale.value}/contact`);
const privacyLink = computed(() => `/${locale.value}/privacy`);
const termsLink = computed(() => `/${locale.value}/terms`);
</script>
