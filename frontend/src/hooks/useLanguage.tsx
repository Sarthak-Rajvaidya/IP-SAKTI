import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language } from '../types';
import { t as translate } from '../lib/i18n';

interface LangContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const value: LangContextValue = { lang, setLang, t: (key: string) => translate(key, lang) };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
