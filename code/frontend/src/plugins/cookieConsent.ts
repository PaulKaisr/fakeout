/**
 * Cookie Consent Configuration
 *
 * Uses vanilla-cookieconsent for GDPR-compliant cookie management
 * Documentation: https://cookieconsent.orestbida.com/
 */

import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

type SupportedLanguage = "en" | "de" | "bg" | "pl" | "es";

const translations: Record<SupportedLanguage, CookieConsent.Translation> = {
  en: {
    consentModal: {
      title: "We use cookies 🍪",
      description:
        "We use cookies and similar technologies to provide you with the best experience. Some cookies are necessary for the site to function, while others help us improve your experience and show personalized content and ads.",
      acceptAllBtn: "Accept All",
      acceptNecessaryBtn: "Necessary Only",
      showPreferencesBtn: "Manage Preferences",
      footer: `<a href="/en/privacy">Privacy Policy</a>`,
    },
    preferencesModal: {
      title: "Cookie Preferences",
      acceptAllBtn: "Accept All",
      acceptNecessaryBtn: "Necessary Only",
      savePreferencesBtn: "Save Preferences",
      closeIconLabel: "Close",
      sections: [
        {
          title: "Cookie Usage",
          description:
            "We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose to opt-in or opt-out of each category whenever you want.",
        },
        {
          title: "Necessary Cookies",
          description:
            "These cookies are essential for the website to function properly. They enable basic features like page navigation and access to secure areas. The website cannot function properly without these cookies.",
          linkedCategory: "necessary",
        },
        {
          title: "Analytics Cookies",
          description:
            "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics to analyze traffic and improve our service.",
          linkedCategory: "analytics",
        },
        {
          title: "Advertising Cookies",
          description:
            "These cookies are used to deliver relevant ads and track ad campaign performance across websites. They may be set by us or by third-party providers (like Google AdSense) whose services we have added to our pages.",
          linkedCategory: "advertising",
        },
        {
          title: "More Information",
          description: `For any questions regarding our cookie policy, please <a href="/en/contact">contact us</a>. You can also read our full <a href="/en/privacy">Privacy Policy</a>.`,
        },
      ],
    },
  },
  de: {
    consentModal: {
      title: "Wir verwenden Cookies 🍪",
      description:
        "Wir verwenden Cookies und ähnliche Technologien, um Ihnen das beste Erlebnis zu bieten. Einige Cookies sind für die Funktion der Website erforderlich, während andere uns helfen, Ihr Erlebnis zu verbessern und personalisierte Inhalte und Anzeigen anzuzeigen.",
      acceptAllBtn: "Alle akzeptieren",
      acceptNecessaryBtn: "Nur notwendige",
      showPreferencesBtn: "Einstellungen verwalten",
      footer: `<a href="/de/privacy">Datenschutzerklärung</a>`,
    },
    preferencesModal: {
      title: "Cookie-Einstellungen",
      acceptAllBtn: "Alle akzeptieren",
      acceptNecessaryBtn: "Nur notwendige",
      savePreferencesBtn: "Einstellungen speichern",
      closeIconLabel: "Schließen",
      sections: [
        {
          title: "Cookie-Nutzung",
          description:
            "Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen und Ihr Online-Erlebnis zu verbessern. Sie können jederzeit für jede Kategorie ein- oder aussteigen.",
        },
        {
          title: "Notwendige Cookies",
          description:
            "Diese Cookies sind für das ordnungsgemäße Funktionieren der Website unerlässlich. Sie ermöglichen grundlegende Funktionen wie Seitennavigation und Zugang zu sicheren Bereichen. Die Website kann ohne diese Cookies nicht richtig funktionieren.",
          linkedCategory: "necessary",
        },
        {
          title: "Analyse-Cookies",
          description:
            "Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden. Wir verwenden Google Analytics, um den Verkehr zu analysieren und unseren Service zu verbessern.",
          linkedCategory: "analytics",
        },
        {
          title: "Werbe-Cookies",
          description:
            "Diese Cookies werden verwendet, um relevante Anzeigen zu liefern und die Leistung von Werbekampagnen über Websites hinweg zu verfolgen. Sie können von uns oder von Drittanbietern (wie Google AdSense) gesetzt werden, deren Dienste wir unseren Seiten hinzugefügt haben.",
          linkedCategory: "advertising",
        },
        {
          title: "Weitere Informationen",
          description: `Bei Fragen zu unserer Cookie-Richtlinie <a href="/de/contact">kontaktieren Sie uns</a> bitte. Sie können auch unsere vollständige <a href="/de/privacy">Datenschutzerklärung</a> lesen.`,
        },
      ],
    },
  },
  bg: {
    consentModal: {
      title: "Използваме бисквитки 🍪",
      description:
        "Ние използваме бисквитки и подобни технологии, за да ви предоставим най-доброто изживяване. Някои бисквитки са необходими за функционирането на сайта, докато други ни помагат да подобрим вашето изживяване и да показваме персонализирано съдържание и реклами.",
      acceptAllBtn: "Приеми всички",
      acceptNecessaryBtn: "Само необходимите",
      showPreferencesBtn: "Управление на предпочитанията",
      footer: `<a href="/bg/privacy">Политика за поверителност</a>`,
    },
    preferencesModal: {
      title: "Предпочитания за бисквитки",
      acceptAllBtn: "Приеми всички",
      acceptNecessaryBtn: "Само необходимите",
      savePreferencesBtn: "Запази предпочитанията",
      closeIconLabel: "Затвори",
      sections: [
        {
          title: "Използване на бисквитки",
          description:
            "Ние използваме бисквитки, за да осигурим основните функции на уебсайта и да подобрим вашето онлайн изживяване. Можете да изберете да се включите или изключите от всяка категория по всяко време.",
        },
        {
          title: "Необходими бисквитки",
          description:
            "Тези бисквитки са от съществено значение за правилното функциониране на уебсайта. Те позволяват основни функции като навигация по страници и достъп до защитени области. Уебсайтът не може да функционира правилно без тези бисквитки.",
          linkedCategory: "necessary",
        },
        {
          title: "Аналитични бисквитки",
          description:
            "Тези бисквитки ни помагат да разберем как посетителите взаимодействат с нашия уебсайт, като събират и докладват информация анонимно. Използваме Google Analytics за анализ на трафика и подобряване на нашата услуга.",
          linkedCategory: "analytics",
        },
        {
          title: "Рекламни бисквитки",
          description:
            "Тези бисквитки се използват за доставяне на подходящи реклами и проследяване на ефективността на рекламните кампании в различни уебсайтове. Те могат да бъдат зададени от нас или от доставчици от трети страни (като Google AdSense), чиито услуги сме добавили към нашите страници.",
          linkedCategory: "advertising",
        },
        {
          title: "Повече информация",
          description: `При въпроси относно нашата политика за бисквитки, моля <a href="/bg/contact">свържете се с нас</a>. Можете също да прочетете пълната ни <a href="/bg/privacy">Политика за поверителност</a>.`,
        },
      ],
    },
  },
  pl: {
    consentModal: {
      title: "Używamy plików cookie 🍪",
      description:
        "Używamy plików cookie i podobnych technologii, aby zapewnić najlepsze wrażenia. Niektóre pliki cookie są niezbędne do działania strony, podczas gdy inne pomagają nam ulepszać Twoje doświadczenie i wyświetlać spersonalizowane treści i reklamy.",
      acceptAllBtn: "Akceptuj wszystkie",
      acceptNecessaryBtn: "Tylko niezbędne",
      showPreferencesBtn: "Zarządzaj preferencjami",
      footer: `<a href="/pl/privacy">Polityka prywatności</a>`,
    },
    preferencesModal: {
      title: "Preferencje plików cookie",
      acceptAllBtn: "Akceptuj wszystkie",
      acceptNecessaryBtn: "Tylko niezbędne",
      savePreferencesBtn: "Zapisz preferencje",
      closeIconLabel: "Zamknij",
      sections: [
        {
          title: "Wykorzystanie plików cookie",
          description:
            "Używamy plików cookie, aby zapewnić podstawowe funkcje witryny i poprawić Twoje wrażenia online. Możesz w każdej chwili włączyć lub wyłączyć dowolną kategorię.",
        },
        {
          title: "Niezbędne pliki cookie",
          description:
            "Te pliki cookie są niezbędne do prawidłowego działania witryny. Umożliwiają podstawowe funkcje, takie jak nawigacja po stronach i dostęp do zabezpieczonych obszarów. Witryna nie może działać poprawnie bez tych plików cookie.",
          linkedCategory: "necessary",
        },
        {
          title: "Pliki cookie analityczne",
          description:
            "Te pliki cookie pomagają nam zrozumieć, jak użytkownicy wchodzą w interakcję z naszą witryną, zbierając i raportując informacje anonimowo. Używamy Google Analytics do analizy ruchu i poprawy naszego serwisu.",
          linkedCategory: "analytics",
        },
        {
          title: "Pliki cookie reklamowe",
          description:
            "Te pliki cookie służą do dostarczania odpowiednich reklam i śledzenia wydajności kampanii reklamowych w różnych witrynach. Mogą być ustawione przez nas lub przez dostawców zewnętrznych (np. Google AdSense), których usługi dodaliśmy do naszych stron.",
          linkedCategory: "advertising",
        },
        {
          title: "Więcej informacji",
          description: `W przypadku pytań dotyczących naszej polityki plików cookie, prosimy <a href="/pl/contact">skontaktować się z nami</a>. Możesz także przeczytać naszą pełną <a href="/pl/privacy">Politykę prywatności</a>.`,
        },
      ],
    },
  },
  es: {
    consentModal: {
      title: "Usamos cookies 🍪",
      description:
        "Usamos cookies y tecnologías similares para brindarte la mejor experiencia. Algunas cookies son necesarias para que el sitio funcione, mientras que otras nos ayudan a mejorar tu experiencia y mostrar contenido y anuncios personalizados.",
      acceptAllBtn: "Aceptar todo",
      acceptNecessaryBtn: "Solo necesarias",
      showPreferencesBtn: "Gestionar preferencias",
      footer: `<a href="/es/privacy">Política de privacidad</a>`,
    },
    preferencesModal: {
      title: "Preferencias de cookies",
      acceptAllBtn: "Aceptar todo",
      acceptNecessaryBtn: "Solo necesarias",
      savePreferencesBtn: "Guardar preferencias",
      closeIconLabel: "Cerrar",
      sections: [
        {
          title: "Uso de cookies",
          description:
            "Usamos cookies para garantizar las funciones básicas del sitio web y mejorar tu experiencia en línea. Puedes optar por incluir o excluir cada categoría cuando quieras.",
        },
        {
          title: "Cookies necesarias",
          description:
            "Estas cookies son esenciales para el correcto funcionamiento del sitio web. Habilitan funciones básicas como la navegación de páginas y el acceso a áreas seguras. El sitio web no puede funcionar correctamente sin estas cookies.",
          linkedCategory: "necessary",
        },
        {
          title: "Cookies de análisis",
          description:
            "Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando y reportando información de forma anónima. Usamos Google Analytics para analizar el tráfico y mejorar nuestro servicio.",
          linkedCategory: "analytics",
        },
        {
          title: "Cookies publicitarias",
          description:
            "Estas cookies se utilizan para ofrecer anuncios relevantes y rastrear el rendimiento de las campañas publicitarias en diferentes sitios web. Pueden ser configuradas por nosotros o por proveedores externos (como Google AdSense) cuyos servicios hemos añadido a nuestras páginas.",
          linkedCategory: "advertising",
        },
        {
          title: "Más información",
          description: `Si tienes preguntas sobre nuestra política de cookies, por favor <a href="/es/contact">contáctanos</a>. También puedes leer nuestra <a href="/es/privacy">Política de privacidad</a> completa.`,
        },
      ],
    },
  },
};

export function initCookieConsent(locale: SupportedLanguage = "en") {
  CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: "box wide",
        position: "bottom center",
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: "box",
        position: "right",
        equalWeightButtons: true,
        flipButtons: false,
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        enabled: false,
        autoClear: {
          cookies: [
            {
              name: /^_ga/,
            },
            {
              name: "_gid",
            },
          ],
        },
      },
      advertising: {
        enabled: false,
        autoClear: {
          cookies: [
            {
              name: /^__gads/,
            },
            {
              name: /^__gpi/,
            },
          ],
        },
      },
    },

    language: {
      default: locale,
      autoDetect: "document",
      translations,
    },

    onFirstConsent: ({ cookie }) => {
      console.log("First consent given:", cookie);
    },

    onConsent: ({ cookie }) => {
      console.log("Consent updated:", cookie);

      // Handle analytics consent
      if (CookieConsent.acceptedCategory("analytics")) {
        enableGoogleAnalytics();
      } else {
        disableGoogleAnalytics();
      }

      // Handle advertising consent
      if (CookieConsent.acceptedCategory("advertising")) {
        enableGoogleAdsense();
      } else {
        disableGoogleAdsense();
      }
    },

    onChange: ({ cookie, changedCategories }) => {
      console.log("Consent changed:", cookie, changedCategories);

      if (changedCategories.includes("analytics")) {
        if (CookieConsent.acceptedCategory("analytics")) {
          enableGoogleAnalytics();
        } else {
          disableGoogleAnalytics();
        }
      }

      if (changedCategories.includes("advertising")) {
        if (CookieConsent.acceptedCategory("advertising")) {
          enableGoogleAdsense();
        } else {
          disableGoogleAdsense();
        }
      }
    },
  });
}

function enableGoogleAnalytics() {
  // Enable Google Analytics tracking
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }
}

function disableGoogleAnalytics() {
  // Disable Google Analytics tracking
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }
}

function enableGoogleAdsense() {
  // Enable Google AdSense
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  }
}

function disableGoogleAdsense() {
  // Disable Google AdSense
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function updateCookieConsentLanguage(locale: SupportedLanguage) {
  CookieConsent.setLanguage(locale);
}

export function showCookiePreferences() {
  CookieConsent.showPreferences();
}

export function resetCookieConsent() {
  CookieConsent.reset(true);
}

export { CookieConsent };
