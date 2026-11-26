import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import "@fontsource-variable/inter";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/noto-serif-sc";
import "../globals.css";

import { routing } from "@/i18n/routing";
import { LOCALES, getLocaleInfo } from "@/i18n/locales";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#17364A",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: SITE.configuredUrl ? new URL(SITE.configuredUrl) : undefined,
    title: { default: t("title"), template: `%s · ${t("orgName")}` },
    description: t("description"),
    icons: { icon: "/favicon.svg", apple: "/logo/apple-touch-icon.png" },
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l.code, `/${l.code}/`])),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: ["/images/og.png"],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const info = getLocaleInfo(locale);

  return (
    <html lang={locale} dir={info.dir}>
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
          >
            {t("skip")}
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
