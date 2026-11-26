import { useFormatter, useTranslations } from "next-intl";

/** Shared layout for privacy / terms pages, driven entirely by messages. */
export const LEGAL_UPDATED = new Date("2026-11-26T00:00:00Z");

export function LegalPage({ namespace }: { namespace: "privacy" | "terms" }) {
  const t = useTranslations(namespace);
  const format = useFormatter();
  const sections = t.raw("sections") as { title: string; body: string }[];
  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="font-serif text-4xl font-semibold text-navy">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">
        {t("updated", { date: format.dateTime(LEGAL_UPDATED, { dateStyle: "long", timeZone: "UTC" }) })}
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold text-navy">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-ink/85">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
