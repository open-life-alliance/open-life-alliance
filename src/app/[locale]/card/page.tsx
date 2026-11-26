import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardStudio } from "@/components/certificate/CardStudio";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  // Personal page: nothing here is useful to search engines.
  return { title: t("title"), robots: { index: false } };
}

export default function CardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <CardStudio />;
}
