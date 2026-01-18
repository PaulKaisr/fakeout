<template>
  <v-app>
    <StructuredData />
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
import AppFooter from "@/components/AppFooter.vue";
import StructuredData from "@/components/StructuredData.vue";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import { inject } from "@vercel/analytics";
import { updateCookieConsentLanguage } from "@/plugins/cookieConsent";

if (import.meta.env.PROD) {
  inject();
}

const { locale } = useI18n();

watch(
  locale,
  (newLocale) => {
    document.documentElement.lang = newLocale;
    // Update cookie consent language when locale changes
    if (["en", "de", "bg"].includes(newLocale)) {
      updateCookieConsentLanguage(newLocale as "en" | "de" | "bg");
    }
  },
  { immediate: true },
);

import { supabaseService } from "@/services/supabaseService";
import { onMounted } from "vue";

onMounted(() => {
  if (import.meta.env.PROD) {
    supabaseService.trackVisitor();
  }
});
</script>
