import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './resources/zh-CN';
import enUS from './resources/en-US';

const resources = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    ns: ['common', 'components', 'pages', 'errors'],
    debug: import.meta.env.DEV,
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;