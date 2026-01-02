<template>
  <section class="mt-16 max-w-4xl mx-auto px-4">
    <h2 class="text-3xl font-bold mb-8 text-center">
      {{ t("faq.title") }}
    </h2>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="(faq, index) in faqs"
        :key="index"
        class="mb-2 rounded-lg"
      >
        <v-expansion-panel-title class="text-lg font-medium">
          {{ faq.question }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          {{ faq.answer }}
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- FAQ Schema -->
    <component
      :is="'script'"
      type="application/ld+json"
      v-html="faqSchema"
    ></component>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const faqs = computed(() => [
  {
    question: t("faq.q1.question"),
    answer: t("faq.q1.answer"),
  },
  {
    question: t("faq.q2.question"),
    answer: t("faq.q2.answer"),
  },
  {
    question: t("faq.q3.question"),
    answer: t("faq.q3.answer"),
  },
  {
    question: t("faq.q4.question"),
    answer: t("faq.q4.answer"),
  },
  {
    question: t("faq.q5.question"),
    answer: t("faq.q5.answer"),
  },
]);

const faqSchema = computed(() =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.value.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  })
);
</script>
