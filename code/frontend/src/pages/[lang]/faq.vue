<template>
  <v-container class="faq-container py-12">
    <div class="mb-4">
      <v-btn
        variant="text"
        :to="`/${currentLocale}`"
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
        v-for="i in 5"
        :key="i"
        :title="$t(`faq.q${i}.question`)"
        :text="$t(`faq.q${i}.answer`)"
      ></v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const currentLocale = computed(() => locale.value as string);
</script>

<style scoped>
.faq-container {
  max-width: 800px;
}
</style>
