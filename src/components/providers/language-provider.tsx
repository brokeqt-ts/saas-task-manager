"use client";

import { createContext, useContext } from "react";
import { t as translate, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ru",
  t: (key) => key,
});

export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
  return (
    <LanguageContext.Provider value={{ locale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  return useContext(LanguageContext);
}
