/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

import i18n, {
  loadLocaleMessages,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n";

router.beforeEach(async (to, _from, next) => {
  const locale = (to.params as any).lang as string;

  if (locale) {
    if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
      // Load locale messages if needed (async, will be quick if already loaded)
      await loadLocaleMessages(locale as SupportedLocale);

      if (i18n.global.locale.value !== locale) {
        (i18n.global.locale as { value: string }).value = locale;
        localStorage.setItem("user-locale", locale);
      }
      return next();
    } else {
      // Invalid locale, redirect to default
      // Attempt to replace the first segment if it looks like a locale
      const defaultLocale = "en";
      // This is a bit naive if the user visits /invalid/game/date
      // But [lang] captures the first segment.
      // So we redirect /invalid -> /en
      // /invalid/game/.. -> /en/game/..
      const newPath = to.path.replace(`/${locale}`, `/${defaultLocale}`);
      return next(newPath);
    }
  }
  next();
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (localStorage.getItem("vuetify:dynamic-reload")) {
      console.error("Dynamic import error, reloading page did not fix it", err);
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

export default router;
