/**
 * SEO Meta Composable
 *
 * Provides dynamic head management for SEO optimization
 * using @unhead/vue
 */

import { useHead, useSeoMeta as useUnheadSeoMeta } from "@unhead/vue";
import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

export interface SeoMetaOptions {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  ogImage?: MaybeRefOrGetter<string>;
  ogType?: MaybeRefOrGetter<"website" | "article">;
  noIndex?: MaybeRefOrGetter<boolean>;
  canonicalPath?: MaybeRefOrGetter<string>;
  publishedTime?: MaybeRefOrGetter<string | undefined>;
  modifiedTime?: MaybeRefOrGetter<string | undefined>;
  author?: MaybeRefOrGetter<string | undefined>;
  articleSection?: MaybeRefOrGetter<string>;
}

const SITE_NAME = "Fakeout";
const SITE_URL = "https://fakeout.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-512.png`;
const SUPPORTED_LOCALES = ["en", "de", "bg"] as const;

/**
 * Composable for managing SEO meta tags dynamically
 */
export function useSeoMeta(options: SeoMetaOptions) {
  const { locale } = useI18n();
  const route = useRoute();

  const fullTitle = computed(() => {
    const title = toValue(options.title);
    return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  });

  const description = computed(() => toValue(options.description));
  const ogImage = computed(() => toValue(options.ogImage) || DEFAULT_OG_IMAGE);
  const ogType = computed(
    () => toValue(options.ogType) || ("website" as const)
  );
  const noIndex = computed(() => toValue(options.noIndex) || false);

  // Build canonical URL
  const canonicalUrl = computed(() => {
    const path = toValue(options.canonicalPath) || route.path;
    return `${SITE_URL}${path}`;
  });

  // Build hreflang alternates
  const hreflangAlternates = computed(() => {
    const currentPath = route.path;
    const currentLocale = locale.value;

    // Extract the path without the locale prefix
    const pathWithoutLocale = currentPath.replace(
      new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})`),
      ""
    );

    return SUPPORTED_LOCALES.map((loc) => ({
      hreflang: loc,
      href: `${SITE_URL}/${loc}${pathWithoutLocale}`,
    }));
  });

  // Set up head tags
  useHead({
    title: fullTitle,
    link: computed(() => [
      { rel: "canonical", href: canonicalUrl.value },
      ...hreflangAlternates.value.map((alt) => ({
        rel: "alternate",
        hreflang: alt.hreflang,
        href: alt.href,
      })),
      {
        rel: "alternate",
        hreflang: "x-default",
        href: `${SITE_URL}/en${route.path.replace(
          new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})`),
          ""
        )}`,
      },
    ]),
    meta: computed(() =>
      noIndex.value ? [{ name: "robots", content: "noindex, nofollow" }] : []
    ),
  });

  // Set up SEO meta tags
  useUnheadSeoMeta({
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage,
    ogType,
    ogUrl: canonicalUrl,
    ogSiteName: SITE_NAME,
    ogLocale: computed(() => locale.value),
    twitterCard: "summary_large_image",
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: ogImage,
    ...(toValue(options.publishedTime) && {
      articlePublishedTime: computed(() => toValue(options.publishedTime)),
    }),
    ...(toValue(options.modifiedTime) && {
      articleModifiedTime: computed(() => toValue(options.modifiedTime)),
    }),
    ...(toValue(options.author) && {
      articleAuthor: computed(() => {
        const author = toValue(options.author);
        return author ? [author] : undefined;
      }),
    }),
  });
}

/**
 * Helper to get localized SEO translations
 */
export function useSeoTranslations() {
  const { t, locale } = useI18n();

  return {
    // Page titles
    homeTitle: computed(() =>
      locale.value === "en"
        ? "AI Image Detector Game | Can You Spot AI Generated Images?"
        : locale.value === "de"
        ? "KI-Bilderkennungsspiel | Kannst du KI-generierte Bilder erkennen?"
        : "Игра за откриване на ИИ изображения | Можеш ли да разпознаеш ИИ?"
    ),
    homeDescription: computed(() =>
      locale.value === "en"
        ? "Test your skills with Fakeout, the daily AI image detector game. Can you spot which images are AI-generated vs real? Play free daily challenges to train your eye for AI detection."
        : locale.value === "de"
        ? "Teste deine Fähigkeiten mit Fakeout, dem täglichen KI-Bilderkennungsspiel. Kannst du erkennen, welche Bilder KI-generiert sind? Spiele kostenlose tägliche Herausforderungen."
        : "Тествай уменията си с Fakeout, ежедневната игра за откриване на ИИ изображения. Можеш ли да разпознаеш кои изображения са генерирани от ИИ?"
    ),

    // About page
    aboutTitle: computed(() => t("about.title")),
    aboutDescription: computed(() => t("about.mission.text")),

    // FAQ page
    faqTitle: computed(() => t("faq.title")),
    faqDescription: computed(() =>
      locale.value === "en"
        ? "Find answers to common questions about Fakeout, the AI image detector game. Learn how to spot AI-generated images and improve your detection skills."
        : locale.value === "de"
        ? "Finden Sie Antworten auf häufige Fragen zu Fakeout, dem KI-Bilderkennungsspiel. Lernen Sie, KI-generierte Bilder zu erkennen."
        : "Намерете отговори на често задавани въпроси за Fakeout, играта за откриване на ИИ изображения."
    ),

    // Stats page
    statsTitle: computed(() => t("stats.title")),
    statsDescription: computed(() =>
      locale.value === "en"
        ? "Track your performance in Fakeout. View your accuracy, games played, and scores for both image and video AI detection modes."
        : locale.value === "de"
        ? "Verfolge deine Leistung in Fakeout. Sieh dir deine Genauigkeit, gespielte Spiele und Punkte für beide Modi an."
        : "Проследи представянето си във Fakeout. Виж точността, изиграните игри и резултатите си."
    ),

    // Blog page
    blogTitle: computed(() => t("blog.title")),
    blogDescription: computed(() =>
      locale.value === "en"
        ? "Latest articles and insights about AI image detection, deepfakes, and synthetic media. Stay informed about AI technology."
        : locale.value === "de"
        ? "Aktuelle Artikel und Einblicke in KI-Bilderkennung, Deepfakes und synthetische Medien."
        : "Последни статии и прозрения за откриване на ИИ изображения, deepfakes и синтетични медии."
    ),

    // Image mode page
    imageTitle: computed(() =>
      locale.value === "en"
        ? "Image Mode | AI vs Real Photo Challenge"
        : locale.value === "de"
        ? "Bildmodus | KI vs Echtes Foto Herausforderung"
        : "Режим Изображения | ИИ срещу Истинска Снимка"
    ),
    imageDescription: computed(() =>
      locale.value === "en"
        ? "Play the AI image detection challenge. Compare two images and identify which one was generated by artificial intelligence."
        : locale.value === "de"
        ? "Spiele die KI-Bilderkennungs-Herausforderung. Vergleiche zwei Bilder und identifiziere, welches von KI generiert wurde."
        : "Играй предизвикателството за откриване на ИИ изображения. Сравни две изображения и идентифицирай кое е генерирано от ИИ."
    ),

    // Privacy Policy page
    privacyTitle: computed(() =>
      locale.value === "en"
        ? "Privacy Policy"
        : locale.value === "de"
        ? "Datenschutzerklärung"
        : "Политика за поверителност"
    ),
    privacyDescription: computed(() =>
      locale.value === "en"
        ? "Learn how Fakeout collects, uses, and protects your personal information. Read our privacy policy for details on data handling and your rights."
        : locale.value === "de"
        ? "Erfahren Sie, wie Fakeout Ihre persönlichen Daten sammelt, verwendet und schützt. Lesen Sie unsere Datenschutzerklärung."
        : "Научете как Fakeout събира, използва и защитава вашата лична информация. Прочетете нашата политика за поверителност."
    ),

    // Terms of Service page
    termsTitle: computed(() =>
      locale.value === "en"
        ? "Terms of Service"
        : locale.value === "de"
        ? "Nutzungsbedingungen"
        : "Условия за ползване"
    ),
    termsDescription: computed(() =>
      locale.value === "en"
        ? "Read the terms and conditions for using Fakeout. Understand your rights and responsibilities when using our AI detection game."
        : locale.value === "de"
        ? "Lesen Sie die Nutzungsbedingungen für Fakeout. Verstehen Sie Ihre Rechte und Pflichten bei der Nutzung unseres KI-Erkennungsspiels."
        : "Прочетете условията за ползване на Fakeout. Разберете вашите права и отговорности при използване на нашата игра за откриване на ИИ."
    ),

    // Contact page
    contactTitle: computed(() =>
      locale.value === "en"
        ? "Contact Us"
        : locale.value === "de"
        ? "Kontakt"
        : "Контакти"
    ),
    contactDescription: computed(() =>
      locale.value === "en"
        ? "Get in touch with the Fakeout team. Contact us for support, feedback, business inquiries, or privacy concerns."
        : locale.value === "de"
        ? "Kontaktieren Sie das Fakeout-Team. Wenden Sie sich an uns für Support, Feedback, geschäftliche Anfragen oder Datenschutzfragen."
        : "Свържете се с екипа на Fakeout. Пишете ни за поддръжка, обратна връзка, бизнес запитвания или въпроси за поверителност."
    ),
  };
}
