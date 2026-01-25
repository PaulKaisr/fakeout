<template>
  <v-container class="faq-container py-12">
    <div class="mb-4">
      <v-btn
        variant="text"
        to="/"
        prepend-icon="mdi-arrow-left"
        class="text-none"
      >
        {{ $t("common.backToHome") }}
      </v-btn>
    </div>

    <div class="text-center mb-12">
      <h1 class="text-h3 font-weight-bold mb-4">{{ $t("faq.title") }}</h1>
    </div>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="i in 6"
        :key="i"
        :title="$t(`faq.q${i}.question`)"
        :text="$t(`faq.q${i}.answer`)"
      ></v-expansion-panel>
    </v-expansion-panels>

    <!-- FAQ Structured Data -->
    <component
      :is="'script'"
      type="application/ld+json"
      v-html="faqStructuredData"
    ></component>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSeoMeta, useSeoTranslations } from "@/composables/useSeoMeta";

const { locale, t } = useI18n();
const currentLocale = computed(() => locale.value as string);
const seoTranslations = useSeoTranslations();

useSeoMeta({
  title: seoTranslations.faqTitle,
  description: seoTranslations.faqDescription,
});

// FAQ structured data for rich results
const faqStructuredData = computed(() => {
  const faqItems = [];
  for (let i = 1; i <= 6; i++) {
    faqItems.push({
      "@type": "Question",
      name: t(`faq.q${i}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.q${i}.answer`),
      },
    });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  });
});
</script>

<style scoped>
.faq-container {
  max-width: 800px;
}
</style>
