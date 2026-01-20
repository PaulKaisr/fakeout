<template>
  <v-menu location="bottom end" transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="text" class="text-none" :icon="false">
        <span class="font-semibold text-sm">{{
          localeAbbr[currentLocale]
        }}</span>
        <v-icon icon="mdi-chevron-down" size="small" class="ml-1"></v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="locale in SUPPORTED_LOCALES"
        :key="locale"
        :active="locale === currentLocale"
        @click="changeLocale(locale)"
        :value="locale"
        class="min-w-[140px]"
      >
        <template v-slot:prepend>
          <span class="font-semibold text-sm mr-3">{{
            localeAbbr[locale]
          }}</span>
        </template>
        <v-list-item-title class="font-medium text-sm">
          {{ t(`languages.${locale}`) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SUPPORTED_LOCALES } from "@/i18n";

const { locale: currentLocaleRef, t } = useI18n();
const router = useRouter();
const route = useRoute();

const currentLocale = computed(() => currentLocaleRef.value);

const localeAbbr: Record<string, string> = {
  en: "EN",
  de: "DE",
  bg: "BG",
  pl: "PL",
  es: "ES",
};

function changeLocale(newLocale: string) {
  // Locale will be updated by the router guard
  // localStorage.setItem("user-locale", newLocale); // Router guard does this too

  if ((route.params as any).lang) {
    // If we are on a localized route, switch the lang param
    router.push({
      name: route.name as any,
      params: { ...route.params, lang: newLocale },
      query: route.query,
    });
  } else {
    // Fallback: just go to the new locale root
    router.push(`/${newLocale}`);
  }
}
</script>
