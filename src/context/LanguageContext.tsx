'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language or detect browser preference on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedLang = localStorage.getItem('ananke_lang') as Language | null;
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
        return;
      }

      // Auto-detect browser language if matches supported languages
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      if (browserLang && ['ru', 'de', 'fr', 'si'].includes(browserLang)) {
        setLanguageState(browserLang as Language);
        document.documentElement.lang = browserLang;
      }
    } catch (err) {
      console.warn('Could not read saved language preference:', err);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananke_lang', lang);
        document.documentElement.lang = lang;
      } catch (err) {
        console.warn('Could not persist language preference:', err);
      }
    }
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = translations[language] || translations.en;
    if (currentDict[key]) return currentDict[key];
    // Fallback to English if translation key missing in selected language
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
