<template>
  <v-footer
    class="text-center flex flex-col py-6 w-full !bg-[rgba(var(--v-theme-surface),0.8)] backdrop-blur-[10px] border-t border-[rgba(var(--v-border-color),0.1)] mt-auto relative z-10"
  >
    <div class="flex w-full items-center justify-center px-4 mb-4">
      <v-btn
        variant="text"
        class="mx-2 normal-case"
        rounded="xl"
        :to="homeLink"
        prepend-icon="mdi-home-outline"
      >
        {{ $t("footer.home") }}
      </v-btn>
      <v-btn
        variant="text"
        class="mx-2 normal-case"
        rounded="xl"
        :to="blogLink"
        prepend-icon="mdi-post-outline"
      >
        {{ $t("footer.blog") }}
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
</script>
