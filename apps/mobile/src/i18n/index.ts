import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import it from "./locales/it";
import de from "./locales/de";
import fr from "./locales/fr";
import es from "./locales/es";

const resources = {
  it: { translation: it },
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es }
};

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: "it",
  fallbackLng: "it",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
