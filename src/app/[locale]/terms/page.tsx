import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("title") };
}

export default function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LegalPage namespace="terms" />;
}
