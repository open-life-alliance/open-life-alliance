import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { JoinForm } from "@/components/membership/JoinForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "join" });
  return { title: t("title") };
}

export default function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("join");
  return (
    <div className="container-page max-w-xl py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold text-navy sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <JoinForm />
      </div>
    </div>
  );
}
