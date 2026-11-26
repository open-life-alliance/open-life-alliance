"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Lock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { MAX_NAME_LENGTH, createMember, normalizeName, type Period } from "@/lib/member";
import { LifestylePicker, PeriodPicker, type LifestyleValue } from "./LifestylePicker";
import { setStoredMember, useClientValue } from "@/lib/member-store";
import { sortedRegions, type Region } from "@/data/countries";

const NO_REGIONS: Region[] = [];

export function JoinForm() {
  const t = useTranslations("join");
  const tl = useTranslations("lifestyle");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [lifestyle, setLifestyle] = useState<LifestyleValue>({ commitments: [], custom: [] });
  const [period, setPeriod] = useState<Period | undefined>(undefined);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const regions = useClientValue(() => sortedRegions(locale), NO_REGIONS);
  const clean = normalizeName(name);
  const nameError = !clean
    ? t("nameRequired")
    : Array.from(clean).length > MAX_NAME_LENGTH
      ? t("nameTooLong", { max: MAX_NAME_LENGTH })
      : null;
  const consentError = consent ? null : t("consentRequired");


  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || consentError) return;
    setBusy(true);
    const member = createMember({
      displayName: clean,
      country,
      commitments: lifestyle.commitments,
      customCommitments: lifestyle.custom,
      period,
    });
    member.prefs = { cardLocale: locale };
    setStoredMember(member);
    router.push({ pathname: "/card", query: { welcome: "1" } });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <div>
        <label htmlFor="name" className="block font-semibold text-navy">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          className="field mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          autoComplete="nickname"
          maxLength={MAX_NAME_LENGTH * 2}
          aria-invalid={submitted && !!nameError}
          aria-describedby="name-help"
          autoFocus
        />
        <p id="name-help" className={`mt-1.5 text-sm ${submitted && nameError ? "text-red-700" : "text-muted"}`}>
          {submitted && nameError ? nameError : t("nameHelp")}
        </p>
      </div>

      <div>
        <label htmlFor="country" className="block font-semibold text-navy">
          {t("countryLabel")} <span className="text-sm font-normal text-muted">({t("optional")})</span>
        </label>
        <select id="country" className="field mt-2" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">{t("countryNone")}</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="font-semibold text-navy">
          {tl("label")} <span className="text-sm font-normal text-muted">({t("optional")})</span>
        </legend>
        <p className="mt-1 mb-3 text-sm text-muted">{tl("help")}</p>
        <LifestylePicker value={lifestyle} onChange={setLifestyle} idPrefix="join-lifestyle" />
        {lifestyle.commitments.length + lifestyle.custom.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-navy">{tl("periodLabel")}</p>
            <PeriodPicker value={period} onChange={setPeriod} idPrefix="join-period" />
          </div>
        )}
      </fieldset>

      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy">{t("declarationTitle")}</p>
        <blockquote className="mt-2 font-serif text-lg italic leading-relaxed text-navy">
          “{t("declaration")}”
        </blockquote>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-forest"
            aria-invalid={submitted && !!consentError}
          />
          <span className="text-ink">{t("consent")}</span>
        </label>
        {submitted && consentError && <p className="mt-2 text-sm text-red-700">{consentError}</p>}
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary w-full !py-4 text-base">
        {t("submit")}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </button>

      <p className="flex items-start gap-2 text-sm text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          {t("privacyNote")}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-navy">
            {t("privacyLink")}
          </Link>
        </span>
      </p>
    </form>
  );
}
