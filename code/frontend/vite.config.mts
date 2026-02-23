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

// Blog article data (keep in sync with src/data/articles.ts)
const ARTICLES = [
  { slug: "first-rounds-insights", date: "2026-01-25" },
  { slug: "how-fakeout-works", date: "2026-01-05" },
  { slug: "ai-generation-concerns", date: "2026-01-06" },
  { slug: "spotting-ai-hands-guide", date: "2026-01-07" },
  { slug: "ai-video-detection-tips", date: "2026-01-08" },
  { slug: "spotting-ai-tips", date: "2026-01-09" },
  { slug: "ai-image-video-generation-models-2026", date: "2026-01-10" },
  { slug: "free-hosting-for-solo-developers", date: "2026-01-11" },
  { slug: "training-your-digital-eye", date: "2026-01-12" },
  { slug: "synthetic-horizon-2026", date: "2026-01-13" },
  { slug: "game-based-ai-literacy-k12", date: "2026-01-14" },
  { slug: "spotting-ai-comprehensive-report", date: "2026-01-15" },
] as const;

// Extract just slugs for route generation
const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

// Generate routes for SSG pre-rendering
function generateSSGRoutes(): string[] {
  const routes: string[] = ["/"];

  // Static pages per locale
  const staticPages = [
    "",
    "/image",
    "/blog",
    "/stats",
    "/about",
    "/faq",
    "/privacy",
    "/terms",
    "/contact",
  ];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      routes.push(`/${locale}${page}`);
    }

    // Blog article pages
    for (const article of ARTICLES) {
      routes.push(`/${locale}/blog/${article.slug}`);
    }
  }

  return routes;
}

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

// Generate per-route lastmod dates for sitemap
function generateLastmodMap(): Record<string, Date> {
  const lastmodMap: Record<string, Date> = {};

  // Default date for static pages (site launch / last major update)
  const staticPageDate = new Date("2026-01-01");

  // Static pages get a consistent date
  const staticPages = ["", "/image", "/blog", "/stats", "/about", "/faq"];
  for (const locale of LOCALES) {
    for (const page of staticPages) {
      lastmodMap[`/${locale}${page}`] = staticPageDate;
    }
  }

  // Blog articles get their publish date
  for (const locale of LOCALES) {
    for (const article of ARTICLES) {
      lastmodMap[`/${locale}/blog/${article.slug}`] = new Date(article.date);
    }
  }

  return lastmodMap;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // vite-ssg options
  ssgOptions: {
    dirStyle: "nested",
    formatting: "minify",
    script: "async",
    crittersOptions: {
      preload: "swap",
    },
    includedRoutes: () => generateSSGRoutes(),
  },
  // SSR configuration to bundle Vuetify properly
  ssr: {
    noExternal: ["vuetify", "@mdi/font"],
  },
  esbuild: {
    pure: mode === "production" ? ["console.log", "console.debug"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        // Use function form to avoid issues with SSG external modules
        manualChunks(id) {
          // Only split chunks for client build, not during SSG
          if (id.includes("node_modules")) {
            if (id.includes("vuetify")) {
              return "vuetify";
            }
            if (id.includes("vue-router") || id.includes("vue")) {
              return "vue-vendor";
            }
          }
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
      // runtimeOnly: true ships only the message runtime, not the compiler.
      // Translations are pre-compiled by this plugin at build time, so the
      // compiler (~40KB gzipped) is not needed at runtime.
      runtimeOnly: true,
    }),
    Sitemap({
      hostname: "https://fakeout.dev",
      dynamicRoutes: generateSitemapRoutes(),
      exclude: ["/"],
      generateRobotsTxt: false, // We already have a robots.txt
      changefreq: "weekly",
      priority: 0.8,
      lastmod: generateLastmodMap(), // Per-route lastmod based on article dates
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
