"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/language-provider";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocale();

  function toggle() {
    const next = locale === "ru" ? "en" : "ru";
    document.cookie = `lang=${next};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors min-w-[32px]"
    >
      {locale === "ru" ? "EN" : "RU"}
    </button>
  );
}
