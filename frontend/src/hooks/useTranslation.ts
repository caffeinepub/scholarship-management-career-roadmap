import { useState, useCallback } from 'react';
import { translations, type Language } from '../i18n/translations';

const LANGUAGE_KEY = 'appLanguage';

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'en' || stored === 'hi') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] ?? translations['en'][key] ?? key;
    },
    [language]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: Language = prev === 'en' ? 'hi' : 'en';
      try {
        localStorage.setItem(LANGUAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { t, language, toggleLanguage };
}
