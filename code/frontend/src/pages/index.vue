<template>
  <div class="flex h-screen w-full items-center justify-center bg-[#0a0a0c]">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { locale } = useI18n();

onMounted(() => {
  router.replace(`/${locale.value}`);
});
</script>

<route lang="yaml">
meta:
  layout: default
</route>
