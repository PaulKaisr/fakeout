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
const SUPPORTED_LOCALES = ["en", "de", "bg", "pl"] as const;

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
    () => toValue(options.ogType) || ("website" as const),
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

    // Extract the path without the locale prefix
    const pathWithoutLocale = currentPath.replace(
      new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})`),
      "",
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
          "",
        )}`,
      },
    ]),
    meta: computed(() =>
      noIndex.value ? [{ name: "robots", content: "noindex, nofollow" }] : [],
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

  // Helper to select translation with explicit bg + pl support and EN fallback
  const pick = (en: string, de: string, bg: string, pl: string) =>
    computed(() =>
      locale.value === "en"
        ? en
        : locale.value === "de"
          ? de
          : locale.value === "bg"
            ? bg
            : locale.value === "pl"
              ? pl
              : en,
    );

  return {
    // Page titles
    homeTitle: pick(
      "AI or Real Game | Spot AI Generated Videos & Images",
      "KI oder Echt Spiel | Erkenne KI-generierte Videos & Bilder",
      "ИИ или Истинско | Разпознай ИИ видеа и изображения",
      "AI czy Prawdziwe | Rozpoznaj wygenerowane przez AI filmy i obrazy",
    ),

    homeDescription: pick(
      "Test your skills with Fakeout, the daily AI detection game. Can you spot AI-generated videos and images vs real ones? Play free daily challenges to train your eye for deepfakes.",
      "Teste deine Fähigkeiten mit Fakeout, dem täglichen KI-Erkennungsspiel. Kannst du KI-generierte Videos und Bilder erkennen? Spiele kostenlose tägliche Herausforderungen.",
      "Тествай уменията си с Fakeout, ежедневната игра за откриване на ИИ. Можеш ли да разпознаеш ИИ видеа и изображения от истински?",
      "Przetestuj swoje umiejętności z Fakeout, codzienną grą wykrywającą AI. Czy potrafisz rozpoznać filmy i obrazy wygenerowane przez AI od prawdziwych?",
    ),

    // About page
    aboutTitle: computed(() => t("about.title")),
    aboutDescription: computed(() => t("about.mission.text")),

    // FAQ page
    faqTitle: computed(() => t("faq.title")),
    faqDescription: pick(
      "Find answers to common questions about Fakeout, the AI detection game. Learn how to spot AI-generated videos and images, identify deepfakes, and improve your detection skills.",
      "Finden Sie Antworten auf häufige Fragen zu Fakeout, dem KI-Erkennungsspiel. Lernen Sie, KI-generierte Videos und Bilder zu erkennen.",
      "Намерете отговори на често задавани въпроси за Fakeout, играта за откриване на ИИ. Научете как да разпознавате ИИ видеа и изображения.",
      "Znajdź odpowiedzi na często zadawane pytania dotyczące Fakeout, gry wykrywającej AI. Dowiedz się, jak rozpoznawać filmy i obrazy wygenerowane przez AI.",
    ),

    // Stats page
    statsTitle: computed(() => t("stats.title")),
    statsDescription: pick(
      "Track your performance in Fakeout. View your accuracy, games played, and scores for both image and video AI detection modes.",
      "Verfolge deine Leistung in Fakeout. Sieh dir deine Genauigkeit, gespielte Spiele und Punkte für beide Modi an.",
      "Проследи представянето си във Fakeout. Виж точността, изиграните игри и резултатите си.",
      "Śledź swoje wyniki w Fakeout. Zobacz swoją dokładność, liczbę rozegranych gier i wyniki dla trybu obrazów i wideo.",
    ),

    // Blog page
    blogTitle: computed(() => t("blog.title")),
    blogDescription: pick(
      "Latest articles and insights about AI video and image detection, deepfakes, and synthetic media. Stay informed about AI-generated content.",
      "Aktuelle Artikel und Einblicke in KI-Video- und Bilderkennung, Deepfakes und synthetische Medien.",
      "Последни статии и прозрения за откриване на ИИ видеа и изображения, deepfakes и синтетични медии.",
      "Najnowsze artykuły i przemyślenia na temat wykrywania filmów i obrazów AI, deepfake'ów i mediów syntetycznych.",
    ),

    // Image mode page
    imageTitle: pick(
      "Image Mode | AI vs Real Photo Challenge",
      "Bildmodus | KI vs Echtes Foto Herausforderung",
      "Режим Изображения | ИИ срещу Истинска Снимка",
      "Tryb obrazów | Wyzwanie AI vs Prawdziwe zdjęcie",
    ),
    imageDescription: pick(
      "Play the AI image detection challenge. Compare two images and identify which one was generated by artificial intelligence.",
      "Spiele die KI-Bilderkennungs-Herausforderung. Vergleiche zwei Bilder und identifiziere, welches von KI generiert wurde.",
      "Играй предизвикателството за откриване на ИИ изображения. Сравни две изображения и идентифицирай кое е генерирано от ИИ.",
      "Zagraj w wyzwanie wykrywania obrazów AI. Porównaj dwa obrazy i rozpoznaj, który został wygenerowany przez sztuczną inteligencję.",
    ),

    // Privacy Policy page
    privacyTitle: pick(
      "Privacy Policy",
      "Datenschutzerklärung",
      "Политика за поверителност",
      "Polityka prywatności",
    ),
    privacyDescription: pick(
      "Learn how Fakeout collects, uses, and protects your personal information. Read our privacy policy for details on data handling and your rights.",
      "Erfahren Sie, wie Fakeout Ihre persönlichen Daten sammelt, verwendet und schützt. Lesen Sie unsere Datenschutzerklärung.",
      "Научете как Fakeout събира, използва и защитава вашата лична информация. Прочетете нашата политика за поверителност.",
      "Dowiedz się, jak Fakeout zbiera, wykorzystuje i chroni Twoje dane osobowe. Przeczytaj naszą politykę prywatności, aby poznać szczegóły przetwarzania danych i Twoich praw.",
    ),

    // Terms of Service page
    termsTitle: pick(
      "Terms of Service",
      "Nutzungsbedingungen",
      "Условия за ползване",
      "Warunki korzystania",
    ),
    termsDescription: pick(
      "Read the terms and conditions for using Fakeout. Understand your rights and responsibilities when using our AI detection game.",
      "Lesen Sie die Nutzungsbedingungen für Fakeout. Verstehen Sie Ihre Rechte und Pflichten bei der Nutzung unseres KI-Erkennungsspiels.",
      "Прочетете условията за ползване на Fakeout. Разберете вашите права и отговорности при използване на нашата игра за откриване на ИИ.",
      "Przeczytaj regulamin korzystania z Fakeout. Poznaj swoje prawa i obowiązki podczas korzystania z naszej gry do wykrywania AI.",
    ),

    // Contact page
    contactTitle: pick("Contact Us", "Kontakt", "Контакти", "Kontakt"),
    contactDescription: pick(
      "Get in touch with the Fakeout team. Contact us for support, feedback, business inquiries, or privacy concerns.",
      "Kontaktieren Sie das Fakeout-Team. Wenden Sie sich an uns für Support, Feedback, geschäftliche Anfragen oder Datenschutzfragen.",
      "Свържете се с екипа на Fakeout. Пишете ни за поддръжка, обратна връзка, бизнес запитвания или въпроси за поверителност.",
      "Skontaktuj się z zespołem Fakeout. Napisz do nas w sprawie wsparcia, opinii, zapytań biznesowych lub kwestii prywatności.",
    ),
  };
}
