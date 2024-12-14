import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialization
i18n
  .use(HttpBackend) // Load localizations from the backend
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // React integration
  .init({
    fallbackLng: 'en-US', // Default language
    supportedLngs: ['en', 'en-US', 'es', 'es-ES', 'de', 'de-DE', 'fr', 'fr-FR', 'it', 'it-IT'],
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: './src/locales/{{lng}}.json',
    },
  });

export default i18n;