// Plugins
import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import Fonts from "unplugin-fonts/vite";
import VueRouter from "unplugin-vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import Sitemap from "vite-plugin-sitemap";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

// Supported locales
const LOCALES = ["en", "de", "bg", "pl", "es", "fr"] as const;

// Blog article slugs (keep in sync with src/data/articles.ts)
const ARTICLE_SLUGS = [
  "how-fakeout-works",
  "ai-generation-concerns",
  "spotting-ai-hands-guide",
  "ai-video-detection-tips",
  "spotting-ai-tips",
  "ai-image-video-generation-models-2026",
  "free-hosting-for-solo-developers",
  "training-your-digital-eye",
  "synthetic-horizon-2026",
  "game-based-ai-literacy-k12",
  "spotting-ai-comprehensive-report",
];

// Generate dynamic routes for sitemap
function generateSitemapRoutes(): string[] {
  const routes: string[] = [];

  // Static pages per locale
  const staticPages = ["", "/image", "/blog", "/stats", "/about", "/faq"];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      routes.push(`/${locale}${page}`);
    }

    // Blog article pages
    for (const slug of ARTICLE_SLUGS) {
      routes.push(`/${locale}/blog/${slug}`);
    }
  }

  return routes;
}

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
        // Filter out fonts and non-critical resources from preload
        return deps.filter(
          (dep) =>
            !dep.includes(".eot") &&
            !dep.includes(".ttf") &&
            !dep.includes(".woff") &&
            !dep.includes("math") &&
            !dep.includes("symbols") &&
            !dep.includes("greek") &&
            !dep.includes("materialdesignicons") &&
            !dep.includes("cyrillic") &&
            !dep.includes("latin-ext"),
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
      // Disable font preloading to improve LCP - fonts load async with font-display: swap
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [400, 700],
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
    Sitemap({
      hostname: "https://fakeout.dev",
      dynamicRoutes: generateSitemapRoutes(),
      exclude: ["/"],
      generateRobotsTxt: false, // We already have a robots.txt
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
      readable: true,
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
    proxy: {
      "/files": {
        target: "https://pub-285780421745452cbbfeee3b552758f0.r2.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/files/, ""),
      },
    },
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
