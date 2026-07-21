import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode, TranslationDictionary } from '../locales/translations';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'cfs_language_preference';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && saved in translations) {
        return saved as LanguageCode;
      }
    } catch (e) {}
    return 'en';
  });

  function setLanguage(lang: LanguageCode) {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {}
  }

  // Update document body font family class or attribute based on language
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  function t(key: keyof TranslationDictionary): string {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
