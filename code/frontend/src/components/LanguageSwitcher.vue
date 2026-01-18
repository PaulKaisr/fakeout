<template>
  <v-menu location="bottom end" transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="text" class="text-none" :icon="false">
        <span class="text-2xl mr-2">{{ localeFlags[currentLocale] }}</span>
        <v-icon icon="mdi-chevron-down" size="small"></v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="locale in availableLocales"
        :key="locale"
        :active="locale === currentLocale"
        @click="changeLocale(locale)"
        :value="locale"
        class="min-w-[140px]"
      >
        <template v-slot:prepend>
          <span class="text-xl mr-3">{{ localeFlags[locale] }}</span>
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

const { locale: currentLocaleRef, availableLocales, t } = useI18n();
const router = useRouter();
const route = useRoute();

const currentLocale = computed(() => currentLocaleRef.value);

const localeFlags: Record<string, string> = {
  en: "🇺🇸",
  de: "🇩🇪",
  bg: "🇧🇬",
  pl: "🇵🇱",
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
