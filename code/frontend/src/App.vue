<template>
  <v-app>
    <StructuredData />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import StructuredData from "@/components/StructuredData.vue";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import { inject } from "@vercel/analytics";

if (import.meta.env.PROD) {
  inject();
}

const { locale } = useI18n();

watch(
  locale,
  (newLocale) => {
    document.documentElement.lang = newLocale;
  },
  { immediate: true }
);
</script>
