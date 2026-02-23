/**
 * main.ts
 *
 * SSG-compatible entry point using vite-ssg
 * Bootstraps Vuetify, i18n, and other plugins
 */

import { ViteSSG } from "vite-ssg";
import { routes } from "vue-router/auto-routes";

// Components
import App from "./App.vue";

// Plugins
import { createVuetifyInstance } from "@/plugins/vuetify";
import {
  createI18nInstance,
  loadLocaleMessages,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type AppI18n,
} from "@/i18n";

// Styles
import "unfonts.css";
import "./assets/tailwind.css";

// https://github.com/antfu-collective/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }
      return { top: 0 };
    },
  },
  async ({ app, router, isClient, initialState }) => {
    // Create fresh instances for SSG (each page render gets new instances)
    const vuetify = createVuetifyInstance();
    const i18n = createI18nInstance();

    // Install plugins
    app.use(vuetify);
    app.use(i18n);

    // Setup router guards for locale handling
    router.beforeEach(async (to, _from, next) => {
      const locale = (to.params as { lang?: string }).lang;

      if (locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        // Load locale messages
        await loadLocaleMessages(i18n, locale as SupportedLocale);

        if (i18n.global.locale.value !== locale) {
          (i18n.global.locale as { value: string }).value = locale;

          // Only access localStorage on client
          if (isClient) {
            localStorage.setItem("user-locale", locale);
          }
        }
      } else if (locale && !SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        // Invalid locale, redirect to default
        const newPath = to.path.replace(`/${locale}`, "/en");
        return next(newPath);
      }

      next();
    });

    // Client-only setup
    if (isClient) {
      // Dynamic import error workaround
      router.onError((err, to) => {
        if (
          err?.message?.includes?.(
            "Failed to fetch dynamically imported module",
          )
        ) {
          if (localStorage.getItem("vuetify:dynamic-reload")) {
            console.error(
              "Dynamic import error, reloading page did not fix it",
              err,
            );
          } else {
            console.warn("Reloading page to fix dynamic import error");
            localStorage.setItem("vuetify:dynamic-reload", "true");
            location.assign(to.fullPath);
          }
        } else {
          console.error(err);
        }
      });

      router.isReady().then(() => {
        localStorage.removeItem("vuetify:dynamic-reload");
      });

      // Initialize cookie consent after app is interactive
      // Defer to avoid affecting LCP
      setTimeout(async () => {
        const { initCookieConsent } = await import("@/plugins/cookieConsent");
        const pathLocale = window.location.pathname.split("/")[1];
        const locale = SUPPORTED_LOCALES.includes(pathLocale as SupportedLocale)
          ? (pathLocale as "en" | "de" | "bg" | "pl" | "es")
          : "en";
        initCookieConsent(locale);
      }, 1000);
    }
  },
);
