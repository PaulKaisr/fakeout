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

const { locale: currentLocaleRef, availableLocales, t } = useI18n();

const currentLocale = computed(() => currentLocaleRef.value);

const localeFlags: Record<string, string> = {
  en: "🇺🇸",
  de: "🇩🇪",
  bg: "🇧🇬",
};

function changeLocale(newLocale: string) {
  currentLocaleRef.value = newLocale;
  localStorage.setItem("user-locale", newLocale);
}
</script>
