/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 * SSR/SSG compatible
 */

// Composables
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  type Router,
} from "vue-router";
import { routes } from "vue-router/auto-routes";

/**
 * Create a router instance.
 * For SSG, uses memory history. For client, uses web history.
 */
export function createAppRouter(): Router {
  const isClient = typeof window !== "undefined";

  const router = createRouter({
    history: isClient
      ? createWebHistory(import.meta.env.BASE_URL)
      : createMemoryHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { top: 0 };
      }
    },
  });

  return router;
}

/**
 * Setup router guards that require i18n.
 * Called after both router and i18n are created.
 */
export function setupRouterGuards(
  router: Router,
  i18n: { global: { locale: { value: string }; setLocaleMessage: Function } },
  loadLocaleMessages: (locale: string) => Promise<void>,
  SUPPORTED_LOCALES: readonly string[],
) {
  router.beforeEach(async (to, _from, next) => {
    const locale = (to.params as { lang?: string }).lang;

    if (locale) {
      if (SUPPORTED_LOCALES.includes(locale)) {
        // Load locale messages if needed (async, will be quick if already loaded)
        await loadLocaleMessages(locale);

        if (i18n.global.locale.value !== locale) {
          i18n.global.locale.value = locale;
          // Only access localStorage on client
          if (typeof window !== "undefined") {
            localStorage.setItem("user-locale", locale);
          }
        }
        return next();
      } else {
        // Invalid locale, redirect to default
        const defaultLocale = "en";
        const newPath = to.path.replace(`/${locale}`, `/${defaultLocale}`);
        return next(newPath);
      }
    }
    next();
  });

  // Client-only: Workaround for dynamic import errors
  if (typeof window !== "undefined") {
    router.onError((err, to) => {
      if (
        err?.message?.includes?.("Failed to fetch dynamically imported module")
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
  }
}

// Default export for backward compatibility
const router = createAppRouter();
export default router;
