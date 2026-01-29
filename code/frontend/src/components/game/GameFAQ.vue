<template>
  <section class="fracture-faq-section py-16 md:py-24 relative overflow-hidden">
    <!-- Background effects -->
    <div class="faq-scanlines"></div>
    <div class="faq-grid-bg"></div>

    <v-container class="relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="faq-badge">
          <span class="badge-number">▸</span>
          <span class="badge-text">{{ t("faq.title") }}</span>
          <span class="badge-number">◂</span>
        </div>
      </div>

      <!-- FAQ Grid -->
      <div class="faq-grid max-w-6xl mx-auto">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="faq-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="faq-number">{{ String(index + 1).padStart(2, '0') }}</div>

          <div class="faq-content">
            <button
              class="faq-question"
              @click="toggleFaq(index)"
              :class="{ 'faq-active': expandedIndex === index }"
            >
              <span class="question-text">{{ faq.question }}</span>
              <span class="question-icon">
                <span class="icon-bar icon-bar-1"></span>
                <span class="icon-bar icon-bar-2"></span>
              </span>
            </button>

            <div class="faq-answer-wrapper" :class="{ 'answer-expanded': expandedIndex === index }">
              <div class="faq-answer">
                <div class="answer-glitch-line"></div>
                <p class="answer-text">{{ faq.answer }}</p>
              </div>
            </div>
          </div>

          <div class="faq-border"></div>
        </div>
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const expandedIndex = ref<number | null>(null);

const toggleFaq = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index;
};

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
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

/* ========================================
   FRACTURE FAQ SECTION
   ======================================== */

.fracture-faq-section {
  background: #0a0a0f;
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

/* ========================================
   BACKGROUND EFFECTS
   ======================================== */

.faq-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 1;
}

.faq-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.5;
  z-index: 1;
}

/* ========================================
   SECTION BADGE
   ======================================== */

.faq-badge {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 2rem;
  border: 2px solid #ec4899;
  background: rgba(236, 72, 153, 0.05);
  position: relative;
  animation: badge-slide-in 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes badge-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-30px) rotateX(-90deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

.badge-number {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.25rem;
  color: #ec4899;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.badge-text {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.2em;
  color: #ec4899;
  text-transform: uppercase;
}

/* ========================================
   FAQ GRID
   ======================================== */

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.faq-item {
  background: #0a0a0f;
  position: relative;
  animation: faq-item-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

@keyframes faq-item-entrance {
  0% {
    opacity: 0;
    transform: translateX(-40px) rotateY(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* ========================================
   FAQ NUMBER
   ======================================== */

.faq-number {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-family: 'Archivo Black', sans-serif;
  font-size: 2.5rem;
  color: rgba(139, 92, 246, 0.1);
  line-height: 1;
  pointer-events: none;
  transition: all 0.4s ease;
}

.faq-item:hover .faq-number {
  color: rgba(139, 92, 246, 0.2);
  transform: scale(1.1);
}

/* ========================================
   FAQ CONTENT
   ======================================== */

.faq-content {
  padding: 2rem 2rem 2rem 6rem;
  position: relative;
}

@media (max-width: 768px) {
  .faq-content {
    padding: 1.5rem 1.5rem 1.5rem 4.5rem;
  }

  .faq-number {
    font-size: 2rem;
    top: 1rem;
    left: 1rem;
  }
}

/* ========================================
   FAQ QUESTION
   ======================================== */

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.faq-question:hover {
  transform: translateX(8px);
}

.question-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  transition: color 0.3s ease;
  flex: 1;
}

.faq-question:hover .question-text {
  color: #8b5cf6;
}

.faq-active .question-text {
  color: #ec4899;
}

/* ========================================
   QUESTION ICON (PLUS/MINUS)
   ======================================== */

.question-icon {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 2px solid rgba(139, 92, 246, 0.3);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.faq-question:hover .question-icon {
  border-color: rgba(139, 92, 246, 0.6);
  transform: rotate(90deg);
}

.faq-active .question-icon {
  border-color: rgba(236, 72, 153, 0.8);
  transform: rotate(180deg);
  background: rgba(236, 72, 153, 0.1);
}

.icon-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #8b5cf6;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-bar-1 {
  width: 14px;
  height: 2px;
}

.icon-bar-2 {
  width: 2px;
  height: 14px;
}

.faq-active .icon-bar {
  background: #ec4899;
}

.faq-active .icon-bar-2 {
  transform: translate(-50%, -50%) rotate(90deg);
  opacity: 0;
}

/* ========================================
   FAQ ANSWER
   ======================================== */

.faq-answer-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.answer-expanded {
  max-height: 500px;
}

.faq-answer {
  padding-top: 1.5rem;
  position: relative;
}

.answer-glitch-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4);
  margin-bottom: 1rem;
  animation: glitch-line-expand 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes glitch-line-expand {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 60px;
    opacity: 1;
  }
}

.answer-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  animation: answer-fade-in 0.6s ease 0.2s backwards;
}

@keyframes answer-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   FAQ BORDER
   ======================================== */

.faq-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(139, 92, 246, 0.2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.faq-item:hover .faq-border {
  transform: scaleX(1);
}

.faq-active + .faq-border {
  background: rgba(236, 72, 153, 0.4);
  transform: scaleX(1);
}
</style>
