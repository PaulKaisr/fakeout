<template>
  <v-menu location="bottom end" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="terminal-lang-button">
        <span class="lang-bracket">[</span>
        <span class="lang-code">{{ localeAbbr[currentLocale] }}</span>
        <span class="lang-chevron">▼</span>
        <span class="lang-bracket">]</span>
        <div class="button-scanline"></div>
      </button>
    </template>

    <v-card class="terminal-dropdown-wrapper">
      <div class="terminal-dropdown">
        <!-- Scanlines -->
        <div class="dropdown-scanlines"></div>

        <!-- Corner Brackets -->
        <div class="dropdown-corner dropdown-corner-tl"></div>
        <div class="dropdown-corner dropdown-corner-tr"></div>
        <div class="dropdown-corner dropdown-corner-bl"></div>
        <div class="dropdown-corner dropdown-corner-br"></div>

        <!-- Header -->
        <div class="dropdown-header">
          <span class="header-bracket">▸</span>
          <span class="header-text">LANG_SELECT</span>
          <span class="header-bracket">◂</span>
        </div>

        <!-- Language List -->
        <div class="dropdown-list">
          <button
            v-for="locale in SUPPORTED_LOCALES"
            :key="locale"
            :class="['lang-item', { active: locale === currentLocale }]"
            @click="changeLocale(locale)"
          >
            <div class="lang-item-indicator"></div>
            <span class="lang-item-code">{{ localeAbbr[locale] }}</span>
            <span class="lang-item-name">{{ t(`languages.${locale}`) }}</span>
            <span v-if="locale === currentLocale" class="lang-item-active">●</span>
            <div class="lang-item-scan"></div>
          </button>
        </div>

        <!-- Terminal Footer -->
        <div class="dropdown-footer">
          <span class="footer-binary">{{ Array(8).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('') }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SUPPORTED_LOCALES } from "@/i18n";

const { locale: currentLocaleRef, t } = useI18n();
const router = useRouter();
const route = useRoute();

const currentLocale = computed(() => currentLocaleRef.value);

const localeAbbr: Record<string, string> = {
  en: "EN",
  de: "DE",
  bg: "BG",
  pl: "PL",
  es: "ES",
  fr: "FR",
};

function changeLocale(newLocale: string) {
  // Locale will be updated by the router guard
  // localStorage.setItem("user-locale", newLocale); // Router guard does this too

  if ((route.params as any).lang) {
    // If we are on a localized route, switch the lang param
    router.push({
      name: route.name as any,
      params: { ...route.params, lang: newLocale },
      query: route.query,
    });
  } else {
    // Fallback: just go to the new locale root
    router.push(`/${newLocale}`);
  }
}
</script>

<style scoped>
/* Fonts loaded globally in index.html */

/* ========================================
   TERMINAL LANGUAGE BUTTON
   ======================================== */

.terminal-lang-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.terminal-lang-button::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.terminal-lang-button:hover {
  color: #8b5cf6;
  transform: translateY(-2px);
}

.terminal-lang-button:hover::after {
  transform: scaleX(1);
}

.lang-bracket {
  color: rgba(139, 92, 246, 0.5);
  transition: all 0.3s ease;
}

.terminal-lang-button:hover .lang-bracket {
  color: #ec4899;
}

.lang-code {
  font-weight: 600;
  text-transform: uppercase;
}

.lang-chevron {
  font-size: 0.625rem;
  color: rgba(139, 92, 246, 0.6);
  transition: all 0.3s ease;
}

.terminal-lang-button:hover .lang-chevron {
  color: #8b5cf6;
}

/* ========================================
   TERMINAL DROPDOWN
   ======================================== */

.terminal-dropdown-wrapper {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  overflow: visible !important;
}

.terminal-dropdown {
  position: relative;
  min-width: 180px;
  background: #0a0a0f;
  border: 2px solid rgba(139, 92, 246, 0.4);
  overflow: hidden;
  overflow-x: hidden;
  padding: 0;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
}

/* Scanlines */
.dropdown-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 2px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 1;
}

/* Corner Brackets */
.dropdown-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  z-index: 10;
}

.dropdown-corner::before,
.dropdown-corner::after {
  content: '';
  position: absolute;
  background: #8b5cf6;
}

.dropdown-corner::before {
  width: 100%;
  height: 2px;
}

.dropdown-corner::after {
  width: 2px;
  height: 100%;
}

.dropdown-corner-tl {
  top: 0;
  left: 0;
}

.dropdown-corner-tl::before {
  top: 0;
  left: 0;
}

.dropdown-corner-tl::after {
  top: 0;
  left: 0;
}

.dropdown-corner-tr {
  top: 0;
  right: 0;
}

.dropdown-corner-tr::before {
  top: 0;
  right: 0;
}

.dropdown-corner-tr::after {
  top: 0;
  right: 0;
}

.dropdown-corner-bl {
  bottom: 0;
  left: 0;
}

.dropdown-corner-bl::before {
  bottom: 0;
  left: 0;
}

.dropdown-corner-bl::after {
  bottom: 0;
  left: 0;
}

.dropdown-corner-br {
  bottom: 0;
  right: 0;
}

.dropdown-corner-br::before {
  bottom: 0;
  right: 0;
}

.dropdown-corner-br::after {
  bottom: 0;
  right: 0;
}

/* Header */
.dropdown-header {
  position: relative;
  z-index: 5;
  padding: 0.75rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.header-bracket {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem;
  color: rgba(139, 92, 246, 0.6);
  font-weight: 700;
}

.header-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

/* Language List */
.dropdown-list {
  position: relative;
  z-index: 5;
  padding: 0.5rem 0;
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
}

.lang-item {
  position: relative;
  width: calc(100% - 4px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  font-family: 'IBM Plex Mono', monospace;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.lang-item:hover {
  background: rgba(139, 92, 246, 0.1);
  border-left-color: rgba(139, 92, 246, 0.5);
  color: rgba(255, 255, 255, 0.9);
  transform: translateX(4px);
}

.lang-item.active {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), transparent);
  border-left-color: #8b5cf6;
  color: #8b5cf6;
}

.lang-item-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.5);
  transition: all 0.3s ease;
}

.lang-item:hover .lang-item-indicator,
.lang-item.active .lang-item-indicator {
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
}

.lang-item-code {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  min-width: 2rem;
}

.lang-item-name {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: left;
}

.lang-item-active {
  font-size: 0.5rem;
  color: #8b5cf6;
  animation: active-pulse 2s ease-in-out infinite;
}

@keyframes active-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

.lang-item-scan {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.lang-item:hover .lang-item-scan {
  transform: translateX(100%);
}

/* Footer */
.dropdown-footer {
  position: relative;
  z-index: 5;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(139, 92, 246, 0.2);
  text-align: center;
}

.footer-binary {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.5rem;
  color: rgba(139, 92, 246, 0.2);
  letter-spacing: 0.2em;
  animation: binary-flicker 3s linear infinite;
}

@keyframes binary-flicker {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

/* Scrollbar */
.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 0;
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
</style>
