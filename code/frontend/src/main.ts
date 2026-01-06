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

// Initialize cookie consent after app is mounted
// Get locale from URL or default to 'en'
const pathLocale = window.location.pathname.split("/")[1];
const supportedLocales = ["en", "de", "bg"] as const;
const locale = supportedLocales.includes(pathLocale as any)
  ? (pathLocale as "en" | "de" | "bg")
  : "en";

initCookieConsent(locale);
