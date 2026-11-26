import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CigaretteOff,
  Code,
  Compass,
  HandHeart,
  Languages,
  Megaphone,
  Palette,
  Sprout,
  Unlock,
  Users,
  WineOff,
  Check,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { SampleCard } from "@/components/certificate/SampleCard";
import { SITE } from "@/config/site";
import { GitHubIcon } from "@/components/brand/GitHubIcon";

type Item = { title: string; body: string };

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  const missionIcons = [Compass, Sprout, Users];
  const principleIcons = [CigaretteOff, WineOff, Unlock, HandHeart];
  const communityIcons = [Languages, Code, Palette, Megaphone];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="pointer-events-none absolute -end-24 -top-24 h-[28rem] w-[28rem] opacity-[0.07]">
          <LogoMark variant="white" className="h-full w-full" />
        </div>
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{t("hero.eyebrow")}</p>
            <h1 className="mt-4 text-balance font-serif text-[2.6rem] font-semibold leading-[1.1] sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-lg font-medium text-gold-soft sm:text-xl">{t("hero.subtitle")}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">{t("hero.body")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/join" className="btn btn-gold text-base">
                {t("hero.ctaJoin")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
              <a href="#mission" className="btn btn-outline text-white/90 hover:!bg-white/10">
                {t("hero.ctaExplore")}
              </a>
            </div>
            <p className="mt-4 text-sm text-white/60">{t("hero.note")}</p>
          </div>
          <div className="mx-auto w-full max-w-[19rem] sm:max-w-sm lg:max-w-none lg:ps-8">
            <SampleCard template="badge" format="portrait" className="rotate-[1.5deg] ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container-page">
          <p className="eyebrow">{t("mission.eyebrow")}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("mission.title")}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(t.raw("mission.items") as Item[]).map((item, i) => {
              const Icon = missionIcons[i] ?? Compass;
              return (
                <article key={item.title} className="rounded-2xl border border-line bg-white p-6">
                  <Icon className="h-7 w-7 text-forest" aria-hidden />
                  <h3 className="mt-4 text-lg font-bold text-navy">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-page">
          <p className="eyebrow">{t("principles.eyebrow")}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-navy sm:text-5xl">{t("principles.title")}</h2>
          <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {(t.raw("principles.items") as Item[]).map((item, i) => {
              const Icon = principleIcons[i] ?? Compass;
              return (
                <div key={item.title} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest/10">
                    <Icon className="h-6 w-6 text-forest" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{item.title}</h3>
                    <p className="mt-1 leading-relaxed text-muted">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Become a member */}
      <section className="py-16 sm:py-24">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SampleCard template="classic" format="landscape" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow">{t("membership.eyebrow")}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-navy sm:text-5xl">
              {t("membership.title")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">{t("membership.body")}</p>
            <ul className="mt-6 space-y-3">
              {(t.raw("membership.points") as string[]).map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden />
                  <span className="text-ink">{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/join" className="btn btn-primary mt-8 text-base">
              {t("membership.cta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="bg-forest-deep py-16 text-white sm:py-24">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">{t("community.eyebrow")}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            {t("community.title")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{t("community.body")}</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(t.raw("community.items") as Item[]).map((item, i) => {
              const Icon = communityIcons[i] ?? Compass;
              return (
                <div key={item.title} className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-gold-soft" aria-hidden />
                  <h3 className="mt-3 font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">{item.body}</p>
                </div>
              );
            })}
          </div>
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-10">
            <GitHubIcon className="h-4 w-4" />
            {t("community.cta")}
          </a>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 sm:py-24">
        <div className="container-page max-w-3xl text-center">
          <p className="eyebrow">{t("support.eyebrow")}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-navy sm:text-4xl">{t("support.title")}</h2>
          <p className="mt-4 leading-relaxed text-muted">{t("support.body")}</p>
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline mt-8 text-navy"
          >
            <GitHubIcon className="h-4 w-4" />
            {t("support.cta")}
          </a>
        </div>
      </section>
    </>
  );
}
