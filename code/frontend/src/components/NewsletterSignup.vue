<template>
  <div
    class="newsletter-signup bg-surface-variant rounded-xl p-6 mt-8 w-full max-w-md mx-auto relative overflow-hidden"
  >
    <!-- Gradient blob for visual flair -->
    <div
      class="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"
    ></div>

    <div class="relative z-10 flex flex-col gap-4">
      <div class="text-center">
        <h3 class="text-h6 font-weight-bold mb-1">
          {{ $t("newsletter.title") }}
        </h3>
        <p class="text-body-2 text-medium-emphasis">
          {{ $t("newsletter.description") }}
        </p>
      </div>

      <v-form @submit.prevent="subscribe" class="flex flex-col gap-3">
        <v-text-field
          v-model="email"
          :placeholder="$t('newsletter.emailPlaceholder')"
          variant="solo"
          density="comfortable"
          hide-details
          rounded="lg"
          prepend-inner-icon="mdi-email-outline"
          :loading="loading"
          :disabled="subscribed"
        ></v-text-field>

        <v-btn
          type="submit"
          color="primary"
          block
          rounded="lg"
          size="large"
          :loading="loading"
          :disabled="!isValidEmail || subscribed"
          class="normal-case font-weight-bold"
        >
          {{
            subscribed
              ? $t("newsletter.subscribed")
              : $t("newsletter.subscribe")
          }}
          <template v-if="subscribed" #append>
            <v-icon icon="mdi-check" color="white"></v-icon>
          </template>
        </v-btn>
      </v-form>

      <div
        v-if="message"
        :class="[
          'text-caption text-center',
          error ? 'text-error' : 'text-success',
        ]"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const email = ref("");
const loading = ref(false);
const subscribed = ref(false);
const message = ref("");
const error = ref(false);

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

async function subscribe() {
  if (!isValidEmail.value || subscribed.value) return;

  loading.value = true;
  message.value = "";
  error.value = false;

  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error("VITE_API_URL is not defined");
      throw new Error("Configuration error");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value }),
    });

    if (response.ok) {
      subscribed.value = true;
      message.value = t("newsletter.success");
      // Clear email after success
      setTimeout(() => {
        if (!error.value) email.value = "";
      }, 2000);
    } else {
      const data = await response.json().catch(() => ({}));
      if (data.message === "Already subscribed") {
        message.value = t("newsletter.errors.alreadySubscribed");
        subscribed.value = true;
      } else {
        throw new Error("Failed to subscribe");
      }
    }
  } catch (e) {
    message.value = t("newsletter.errors.general");
    error.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.newsletter-signup {
  border: 1px solid rgba(var(--v-border-color), 0.1);
}
</style>
