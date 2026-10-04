import * as Localization from 'expo-localization';
import { tr } from './tr';
import { en } from './en';

// Simple dictionary
const dictionaries = {
  tr,
  en,
};

export type LegalTranslationKeys = keyof typeof tr;

let currentLocale = 'tr';

try {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const langCode = locales[0].languageCode;
    if (langCode === 'en' || langCode === 'tr') {
      currentLocale = langCode;
    } else {
      currentLocale = 'en'; // Default to english for non-turkish users
    }
  }
} catch (e) {
  currentLocale = 'tr'; // Fallback
}

export const t = (key: LegalTranslationKeys): string => {
  const dictionary = dictionaries[currentLocale as keyof typeof dictionaries] || dictionaries.tr;
  return dictionary[key] || tr[key] || key;
};
