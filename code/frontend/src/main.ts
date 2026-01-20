/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";

// Cookie Consent
import { initCookieConsent } from "@/plugins/cookieConsent";

// Styles
import "unfonts.css";
import "./assets/tailwind.css";

const app = createApp(App);
const head = createHead();

app.use(head);
registerPlugins(app);

app.mount("#app");

// Initialize cookie consent after app is interactive to avoid affecting LCP
// Use requestIdleCallback or setTimeout to defer until browser is idle
const initConsent = () => {
  const pathLocale = window.location.pathname.split("/")[1];
  const supportedLocales = ["en", "de", "bg", "pl", "es"] as const;
  const locale = supportedLocales.includes(pathLocale as any)
    ? (pathLocale as "en" | "de" | "bg" | "pl" | "es")
    : "en";
  initCookieConsent(locale);
};

// Defer cookie consent to after LCP measurement window
// LCP can be measured up to page load completion, so wait longer
setTimeout(initConsent, 3000);
