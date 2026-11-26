import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/brand/Logo";

type Item = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <LogoMark className="h-14 w-14" />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-navy sm:text-5xl">{t("about.title")}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink">{t("about.lead")}</p>

      <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">{t("about.whyTitle")}</h2>
      <p className="mt-3 leading-relaxed text-muted">{t("about.why")}</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-bold text-navy">{t("about.isTitle")}</h2>
          <ul className="mt-4 space-y-3">
            {(t.raw("about.is") as string[]).map((s) => (
              <li key={s} className="flex gap-3 text-sm leading-relaxed">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-bold text-navy">{t("about.isNotTitle")}</h2>
          <ul className="mt-4 space-y-3">
            {(t.raw("about.isNot") as string[]).map((s) => (
              <li key={s} className="flex gap-3 text-sm leading-relaxed">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">{t("principles.title")}</h2>
      <dl className="mt-4 space-y-4">
        {(t.raw("principles.items") as Item[]).map((p) => (
          <div key={p.title}>
            <dt className="font-semibold text-ink">{p.title}</dt>
            <dd className="text-muted">{p.body}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">{t("about.statusTitle")}</h2>
      <p className="mt-3 leading-relaxed text-muted">{t("about.status")}</p>
      <p className="mt-3 leading-relaxed text-muted">{t("about.joinFreely")}</p>
      <p className="mt-6 rounded-xl bg-navy/5 p-4 text-sm leading-relaxed text-navy">{t("disclaimer")}</p>

      <Link href="/join" className="btn btn-primary mt-10">
        {t("hero.ctaJoin")}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Link>
    </article>
  );
}
