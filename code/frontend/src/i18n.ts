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

// Track which locales have been loaded (per i18n instance for SSG)
const loadedLocales = new Set<SupportedLocale>(["en"]);

/**
 * Get initial locale - SSR-safe
 * During SSG build, defaults to 'en'. On client, checks localStorage/browser.
 */
function getInitialLocale(): SupportedLocale {
  // SSR/SSG: use default locale
  if (typeof window === "undefined") {
    return "en";
  }

  // Client: check saved preference or browser
  const savedLocale = localStorage.getItem("user-locale");
  const browserLocale = navigator.language
    ? navigator.language.split("-")[0]
    : "en";

  if (
    savedLocale &&
    SUPPORTED_LOCALES.includes(savedLocale as SupportedLocale)
  ) {
    return savedLocale as SupportedLocale;
  }

  if (SUPPORTED_LOCALES.includes(browserLocale as SupportedLocale)) {
    return browserLocale as SupportedLocale;
  }

  return "en";
}

/**
 * Create a fresh i18n instance.
 * For SSG, a new instance is created per page render.
 */
export function createI18nInstance(locale?: SupportedLocale) {
  const initialLocale = locale || getInitialLocale();

  return createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale,
    fallbackLocale: "en",
    messages: {
      en,
    },
  });
}

// Type for i18n instance returned by createI18nInstance
export type AppI18n = ReturnType<typeof createI18nInstance>;

/**
 * Lazy-load a locale's messages on demand.
 * This keeps the initial bundle small for better LCP.
 */
export async function loadLocaleMessages(
  i18n: AppI18n,
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
  }
}

/**
 * Switch to a new locale, loading messages if needed.
 * Client-only function.
 */
export async function setLocale(
  i18n: AppI18n,
  locale: SupportedLocale,
): Promise<void> {
  await loadLocaleMessages(i18n, locale);
  (i18n.global.locale as { value: string }).value = locale;

  // Only access localStorage on client
  if (typeof window !== "undefined") {
    localStorage.setItem("user-locale", locale);
    document.documentElement.lang = locale;
  }
}

// Default export for backward compatibility (client-only usage)
const i18n = createI18nInstance();

// Load the initial locale if it's not English (which is already loaded)
// Only on client side
if (typeof window !== "undefined") {
  const initialLocale = getInitialLocale();
  if (initialLocale !== "en") {
    void loadLocaleMessages(i18n, initialLocale);
  }
}

export default i18n;
