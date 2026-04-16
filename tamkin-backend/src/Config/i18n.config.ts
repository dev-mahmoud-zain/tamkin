import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { join } from 'path';
import { SUPPORTED_LANGUAGES } from './languages.config';

export const i18nInit = async () => {
  await i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES,
      preload: SUPPORTED_LANGUAGES,

      ns: ['auth', 'token', 'main', "email"],
      defaultNS: 'common',
      backend: {
        loadPath: join(process.cwd(), 'assets/translations/{{lng}}/{{ns}}.json'),
      },
      detection: {
        order: ['header'],
        lookupHeader: 'accept-language',
        caches: false,
      },
      interpolation: {
        escapeValue: false,
      },
    });
};

export default i18next;