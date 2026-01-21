import { createI18n } from "vue-i18n";

// Import only the default/fallback locale synchronously
// Other locales will be lazy-loaded when needed
import en from "./locales/en.json";

export type SupportedLocale = "en" | "de" | "bg" | "pl" | "es" | "fr";
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  "en",
  "de",
  "bg",
  "pl",
  "es",
  "fr",
];

// Determine initial locale from saved preference or browser
const savedLocale = localStorage.getItem("user-locale");
const browserLocale = (
  navigator.language ? navigator.language.split("-")[0] : "en"
) as string;
const initialLocale: SupportedLocale =
  savedLocale && SUPPORTED_LOCALES.includes(savedLocale as SupportedLocale)
    ? (savedLocale as SupportedLocale)
    : SUPPORTED_LOCALES.includes(browserLocale as SupportedLocale)
      ? (browserLocale as SupportedLocale)
      : "en";

// Create i18n instance with only the default locale loaded initially
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: "en",
  messages: {
    en,
  },
});

// Track which locales have been loaded
const loadedLocales = new Set<SupportedLocale>(["en"]);

/**
 * Lazy-load a locale's messages on demand.
 * This keeps the initial bundle small for better LCP.
 */
export async function loadLocaleMessages(
  locale: SupportedLocale,
): Promise<void> {
  // Skip if already loaded
  if (loadedLocales.has(locale)) {
    return;
  }

  try {
    // Dynamic import - Vite will code-split these into separate chunks
    const messages = await import(`./locales/${locale}.json`);
    i18n.global.setLocaleMessage(locale, messages.default);
    loadedLocales.add(locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
    // Fall back to English if locale fails to load
    i18n.global.locale.value = "en";
  }
}

/**
 * Switch to a new locale, loading messages if needed.
 */
export async function setLocale(locale: SupportedLocale): Promise<void> {
  await loadLocaleMessages(locale);
  (i18n.global.locale as { value: string }).value = locale;
  localStorage.setItem("user-locale", locale);
  document.documentElement.lang = locale;
}

// Load the initial locale if it's not English (which is already loaded)
if (initialLocale !== "en") {
  // Use void to explicitly ignore the promise
  // The app will show English briefly while the locale loads
  void loadLocaleMessages(initialLocale);
}

export default i18n;
