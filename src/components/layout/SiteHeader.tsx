"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useMember } from "@/lib/member-store";

export function SiteHeader() {
  const t = useTranslations("nav");
  const card = useTranslations("card");
  const hasMember = !!useMember();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="min-w-0" aria-label={t("home")}>
          <Wordmark localName={card("orgLocalName") || undefined} />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5 sm:block"
          >
            {t("about")}
          </Link>
          <LanguageSwitcher />
          {hasMember ? (
            <Link href="/card" className="btn btn-primary whitespace-nowrap !px-4 !py-2 text-sm">
              {t("myCard")}
            </Link>
          ) : (
            <Link href="/join" className="btn btn-primary whitespace-nowrap !px-4 !py-2 text-sm">
              {t("join")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
