<template>
  <section class="faq-section py-4 md:py-6 relative overflow-hidden">
    <v-container class="relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-12 animate-fade-in-up">
        <div
          class="inline-block px-4 py-2 bg-secondary/10 border-2 border-secondary/30 rounded-full mb-4"
        >
          <span
            class="text-secondary font-bold text-sm uppercase tracking-wider"
          >
            {{ t("faq.title") }}
          </span>
        </div>
      </div>

      <!-- FAQ Panels -->
      <div class="max-w-4xl mx-auto">
        <v-expansion-panels variant="accordion" class="faq-panels">
          <v-expansion-panel
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-panel mb-4 animate-fade-in-up"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <v-expansion-panel-title class="text-lg font-bold pa-6">
              <template v-slot:default="{ expanded }">
                <div class="flex items-center gap-4 w-full">
                  <div
                    class="faq-icon-wrapper shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                    :class="{ 'faq-icon-expanded': expanded }"
                  >
                    <v-icon size="20" color="primary" class="faq-icon">
                      mdi-help-circle
                    </v-icon>
                  </div>
                  <span class="flex-1">{{ faq.question }}</span>
                </div>
              </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pa-6 pt-0">
              <div class="faq-answer text-medium-emphasis pl-14">
                {{ faq.answer }}
              </div>
            </v-expansion-panel-text>

            <!-- Accent Bar -->
            <div
              class="faq-accent h-1 bg-linear-to-r from-primary to-secondary"
            ></div>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-container>

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
  {
    question: t("faq.q6.question"),
    answer: t("faq.q6.answer"),
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
  }),
);
</script>

<style scoped>
/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

/* FAQ Panels */
.faq-panels :deep(.v-expansion-panel) {
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.faq-panels :deep(.v-expansion-panel:hover) {
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-2px);
}

.faq-panels :deep(.v-expansion-panel--active) {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-surface), 0.8);
}

.faq-panels :deep(.v-expansion-panel-title) {
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-panels :deep(.v-expansion-panel--active .v-expansion-panel-title) {
  color: rgb(var(--v-theme-primary));
}

/* Icon Wrapper */
.faq-icon-wrapper {
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.faq-icon-expanded {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.3),
    rgba(var(--v-theme-secondary), 0.3)
  ) !important;
  transform: rotate(360deg) scale(1.1);
}

.faq-icon {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.faq-icon-expanded .faq-icon {
  animation: icon-pulse 0.6s ease-out;
}

.faq-panels :deep(.v-expansion-panel--active) .faq-accent {
  height: 4px;
}

/* FAQ Accent Bar */
.faq-accent {
  transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* FAQ Answer */
.faq-answer {
  line-height: 1.7;
  animation: fade-in-content 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fade-in-content {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
