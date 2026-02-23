/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 * SSR/SSG compatible
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

/**
 * Create a fresh Vuetify instance.
 * For SSG, a new instance is created per page render.
 */
export function createVuetifyInstance() {
  return createVuetify({
    ssr: true, // Enable SSR mode
    theme: {
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            primary: "#5081e7",
            secondary: "#c631ee",
          },
        },
      },
    },
  });
}

// Default export for backward compatibility
export default createVuetifyInstance();
