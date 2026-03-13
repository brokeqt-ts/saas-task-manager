"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { LanguageProvider } from "@/components/providers/language-provider";
import type { Locale } from "@/lib/i18n";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SWRConfig value={{ fetcher, revalidateOnFocus: false, dedupingInterval: 5000 }}>
        <LanguageProvider locale={locale}>{children}</LanguageProvider>
      </SWRConfig>
    </SessionProvider>
  );
}
