<template>
  <GameContainer :date="date" mode="video" />
</template>

<script setup lang="ts">
import GameContainer from "@/components/game/GameContainer.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const date = computed(() => (route.params as any).date as string);
</script>

<route lang="yaml">
meta:
  layout: default
</route>
