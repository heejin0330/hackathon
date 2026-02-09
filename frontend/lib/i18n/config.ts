// Basic i18n configuration
// Full implementation will be added in Phase 2

export const languages = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
  ja: '日本語',
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'ko';

// Basic translations (will be expanded)
export const translations: Record<Language, Record<string, string>> = {
  ko: {
    welcome: '너에게 우주를 줄게',
    startJourney: '우주 탐험 시작하기',
    yourUniverse: '당신의 우주',
  },
  en: {
    welcome: 'The Universe is Yours',
    startJourney: 'Start Your Journey',
    yourUniverse: 'Your Universe',
  },
  es: {
    welcome: 'El Universo es Tuyo',
    startJourney: 'Comienza Tu Viaje',
    yourUniverse: 'Tu Universo',
  },
  ja: {
    welcome: 'あなたに宇宙をあげる',
    startJourney: '旅を始める',
    yourUniverse: 'あなたの宇宙',
  },
};

export const getTranslation = (lang: Language, key: string): string => {
  return translations[lang]?.[key] || translations[defaultLanguage][key] || key;
};

