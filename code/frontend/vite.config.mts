// Plugins
import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import Fonts from "unplugin-fonts/vite";
import VueRouter from "unplugin-vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  esbuild: {
    pure: mode === "production" ? ["console.log", "console.debug"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "vuetify"],
        },
      },
    },
    modulePreload: {
      resolveDependencies: (_url, deps, _context) => {
        return deps.filter(
          (dep) =>
            !dep.includes(".eot") &&
            !dep.includes(".ttf") &&
            !dep.includes(".woff") &&
            !dep.includes("math") &&
            !dep.includes("symbols") &&
            !dep.includes("greek")
        );
      },
    },
  },
  plugins: [
    VueRouter({
      dts: "src/typed-router.d.ts",
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    Components({
      dts: "src/components.d.ts",
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [300, 400, 500, 700],
            styles: ["normal"],
            subset: "latin",
          },
          {
            name: "Roboto",
            weights: [300, 400, 500, 700],
            styles: ["normal"],
            subset: "latin-ext",
          },
          {
            name: "Roboto",
            weights: [300, 400, 500, 700],
            styles: ["normal"],
            subset: "cyrillic",
          },
          {
            name: "Roboto",
            weights: [300, 400, 500, 700],
            styles: ["normal"],
            subset: "cyrillic-ext",
          },
        ],
      },
    }),
    tailwindcss(),
    VueI18nPlugin({
      runtimeOnly: false,
    }),
  ],
  optimizeDeps: {
    exclude: [
      "vuetify",
      "vue-router",
      "unplugin-vue-router/runtime",
      "unplugin-vue-router/data-loaders",
      "unplugin-vue-router/data-loaders/basic",
    ],
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      sass: {
        silenceDeprecations: [
          "legacy-js-api",
          "mixed-decls",
          "color-functions",
          "global-builtin",
          "import",
        ],
      },
      scss: {
        silenceDeprecations: [
          "legacy-js-api",
          "mixed-decls",
          "color-functions",
          "global-builtin",
          "import",
        ],
      },
    },
  },
}));
