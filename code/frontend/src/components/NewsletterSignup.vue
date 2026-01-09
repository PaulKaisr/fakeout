<template>
  <v-card class="newsletter-signup mx-auto" max-width="450" color="surface">
    <div class="position-relative overflow-hidden">
      <!-- Gradient blob for visual flair -->
      <div class="blob-gradient"></div>

      <v-card-item class="text-center pt-6 pb-2 position-relative z-10">
        <div class="text-h5 font-weight-bold mb-2">
          {{ $t("newsletter.title") }}
        </div>
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("newsletter.description") }}
        </div>
      </v-card-item>

      <v-card-text class="position-relative z-10 pb-6">
        <v-form @submit.prevent="subscribe" class="d-flex flex-column gap-3">
          <v-text-field
            v-model="email"
            :placeholder="$t('newsletter.emailPlaceholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="xl"
            bg-color="surface-variant"
            prepend-inner-icon="mdi-email-outline"
            :loading="loading"
            :disabled="subscribed"
            color="primary"
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            block
            rounded="xl"
            size="large"
            :loading="loading"
            :disabled="!isValidEmail || subscribed"
            class="text-none font-weight-bold"
            elevation="2"
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
            'text-caption text-center mt-3',
            error ? 'text-error' : 'text-success',
          ]"
        >
          {{ message }}
        </div>
      </v-card-text>
    </div>
  </v-card>
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

.blob-gradient { position: absolute; top: -40px; right: -40px; width: 150px;
height: 150px; background: rgba(var(--v-theme-primary), 0.15); filter:
blur(50px); border-radius: 50%; pointer-events: none; } .gap-3 { gap: 12px; }
