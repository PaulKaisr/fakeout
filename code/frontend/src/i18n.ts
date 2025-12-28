import { createI18n } from "vue-i18n";

// Import i18n messages directly
import en from "./locales/en.json";
import de from "./locales/de.json";

const savedLocale = localStorage.getItem("user-locale");
const browserLocale = (
  navigator.language ? navigator.language.split("-")[0] : "en"
) as string;
const locale: string =
  savedLocale || (["en", "de"].includes(browserLocale) ? browserLocale : "en");

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale,
  fallbackLocale: "en",
  messages: {
    en,
    de,
  },
});
