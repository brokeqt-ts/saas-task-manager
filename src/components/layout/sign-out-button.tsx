"use client";

import { signOut } from "next-auth/react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useLocale } from "@/components/providers/language-provider";

export function SignOutButton() {
  const { t } = useLocale();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title={t("signout")}
    >
      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
    </button>
  );
}
