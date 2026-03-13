import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/get-locale";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "SaaS task management platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
