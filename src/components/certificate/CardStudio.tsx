"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Download, Loader2, PartyPopper, Share2, Smartphone, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { LOCALES, isLocale } from "@/i18n/locales";
import {
  MAX_NAME_LENGTH,
  MAX_STATEMENT_LENGTH,
  TEMPLATE_IDS,
  choiceCount,
  normalizeName,
  type CardPrefs,
  type Member,
  type TemplateId,
} from "@/lib/member";
import { LifestylePicker, PeriodPicker } from "@/components/membership/LifestylePicker";
import { forgetMember, updateMember, useClientValue, useMember } from "@/lib/member-store";
import { FORMAT_SIZES, TEMPLATE_FORMATS } from "@/lib/card/types";
import {
  buildRenderInput,
  formatList,
  formatPeriod,
  loadCardMessages,
  useCardImage,
  type CardMessages,
} from "@/lib/card/use-card-image";
import { copyText, downloadBlob, fillTemplate, isRestrictedInAppBrowser, shareImage } from "@/lib/share";
import { siteUrl } from "@/config/site";

type ShareVariant = keyof CardMessages["share"]["variants"];

function defaultVariant(template: TemplateId, member: Member): ShareVariant {
  if (template === "classic") return "joined";
  return choiceCount(member) > 0 ? "myChoices" : "choice";
}

function variantAvailable(v: ShareVariant, member: Member): boolean {
  if (v === "myChoices") return choiceCount(member) > 0;
  if (v === "smokeAlcoholFree") return member.commitments.includes("smokeFree") && member.commitments.includes("alcoholFree");
  return true;
}

export function CardStudio() {
  const t = useTranslations("studio");
  const tl = useTranslations("lifestyle");
  const uiLocale = useLocale();
  const router = useRouter();

  const member = useMember();
  const welcome = useClientValue(() => new URLSearchParams(window.location.search).get("welcome") === "1", false);
  const restricted = useClientValue(isRestrictedInAppBrowser, false);
  const canShare = useClientValue(() => typeof navigator.share === "function", false);

  const [loadedMessages, setLoadedMessages] = useState<Record<string, CardMessages>>({});
  const [variant, setVariant] = useState<ShareVariant | null>(null);
  const [editedShareText, setEditedShareText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Preferences live on the stored member, so they survive reloads.
  const prefs = member?.prefs ?? {};
  const template: TemplateId = prefs.template && TEMPLATE_IDS.includes(prefs.template) ? prefs.template : "badge";
  const format =
    prefs.format && TEMPLATE_FORMATS[template].includes(prefs.format) ? prefs.format : TEMPLATE_FORMATS[template][0];
  const cardLocale = prefs.cardLocale && isLocale(prefs.cardLocale) ? prefs.cardLocale : uiLocale;
  const messages = loadedMessages[cardLocale] ?? null;

  // Card strings in the card language (may differ from the page language).
  useEffect(() => {
    let alive = true;
    loadCardMessages(cardLocale).then((m) => {
      if (alive) setLoadedMessages((s) => ({ ...s, [cardLocale]: m }));
    });
    return () => {
      alive = false;
    };
  }, [cardLocale]);

  const effectiveVariant: ShareVariant =
    member && variant && variantAvailable(variant, member) ? variant : member ? defaultVariant(template, member) : "joined";
  let shareText = editedShareText ?? "";
  if (editedShareText === null && messages && member) {
    const list = formatList(
      [...member.commitments.map((c) => messages.commitments[c]), ...(member.customCommitments ?? [])],
      cardLocale,
    );
    const periodLabel = formatPeriod(member.period, cardLocale, messages);
    shareText = fillTemplate(messages.share.variants[effectiveVariant], {
      url: `${siteUrl()}/${cardLocale}/`,
      list,
      period: periodLabel ? `\n${periodLabel}` : "",
    });
  }

  const input = useMemo(() => {
    if (!member || !messages) return null;
    const displayName = normalizeName(member.displayName) || "—";
    return buildRenderInput({
      member: { ...member, displayName },
      template,
      format,
      cardLocale,
      messages,
    });
  }, [member, messages, template, format, cardLocale]);

  const image = useCardImage(input, 250);

  if (member === undefined) {
    return <div className="container-page py-24 text-center text-muted">…</div>;
  }

  if (!member) {
    return (
      <div className="container-page max-w-lg py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">{t("noMemberTitle")}</h1>
        <p className="mt-3 text-muted">{t("noMemberBody")}</p>
        <Link href="/join" className="btn btn-primary mt-8">
          {t("noMemberCta")}
        </Link>
      </div>
    );
  }

  const update = (patch: Partial<Member>) => updateMember(patch);
  const setPrefs = (p: Partial<CardPrefs>) => updateMember((m) => ({ prefs: { ...m.prefs, ...p } }));
  const setTemplate = (id: TemplateId) => setPrefs({ template: id });
  const setFormat = setPrefs;
  const setCardLocale = (code: string) => {
    setEditedShareText(null);
    setPrefs({ cardLocale: code });
  };
  const setShareText = setEditedShareText;
  const setChoices = (next: { commitments: Member["commitments"]; custom: string[] }) => {
    setEditedShareText(null);
    update({ commitments: next.commitments, customCommitments: next.custom.length ? next.custom : undefined });
  };
  const filename = `open-life-alliance-${template}-${format}.png`;
  const ready = image.status === "ready" && !image.stale;
  const variants = Object.keys(messages?.share.variants ?? {}) as ShareVariant[];
  const availableVariants = variants.filter((v) => variantAvailable(v, member));

  const onDownload = () => {
    if (image.status === "ready") downloadBlob(image.blob, filename);
  };
  const onShare = async () => {
    if (image.status !== "ready") return;
    const file = new File([image.blob], filename, { type: "image/png" });
    const res = await shareImage(file, shareText, messages?.share.title ?? "");
    if (res === "unsupported") setNotice(t("shareFailed"));
  };
  const onCopy = async () => {
    if (await copyText(shareText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const onForget = () => {
    if (!window.confirm(t("forgetConfirm"))) return;
    forgetMember();
    router.push("/");
  };

  const { w, h } = FORMAT_SIZES[format];

  return (
    <div className="container-page py-8 sm:py-12">
      {welcome ? (
        <div className="mb-8 overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
          <PartyPopper className="h-8 w-8 text-gold" aria-hidden />
          <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">{t("welcomeTitle")}</h1>
          <p className="mt-1 text-lg text-gold-soft">{t("welcomeSubtitle")}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:max-w-md">
            <div>
              <dt className="text-white/60">{t("memberId")}</dt>
              <dd className="mt-0.5 font-mono font-semibold tracking-wide">{member.id}</dd>
            </div>
            <div>
              <dt className="text-white/60">{t("memberSince")}</dt>
              <dd className="mt-0.5 font-semibold">
                {new Intl.DateTimeFormat(uiLocale, { dateStyle: "long", timeZone: "UTC" }).format(
                  new Date(`${member.joinedAt}T00:00:00Z`),
                )}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-navy sm:text-4xl">{t("title")}</h1>
          <p className="mt-1 text-muted">{t("subtitle")}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* Preview + actions */}
        <div className="lg:sticky lg:top-24">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-xl bg-white shadow-xl shadow-navy/15 ring-1 ring-line"
            style={{ aspectRatio: `${w} / ${h}`, maxWidth: h > w ? `min(100%, ${(62 * w) / h}vh)` : undefined }}
          >
            {image.status === "ready" && (
              // A real <img> so people can long-press to save on phones.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={t("previewAlt")} className="h-full w-full" />
            )}
            {image.status !== "ready" && image.status !== "error" && (
              <div className="flex h-full w-full items-center justify-center gap-2 bg-paper text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t("rendering")}
              </div>
            )}
            {image.status === "error" && (
              <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-red-700">
                {t("renderError")}
              </div>
            )}
          </div>

          {restricted ? (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-gold/15 p-4 text-sm font-medium text-navy">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {t("wechatHint")}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={onDownload} disabled={!ready} className="btn btn-primary disabled:opacity-50">
                <Download className="h-4 w-4" aria-hidden /> {t("download")}
              </button>
              {canShare ? (
                <button type="button" onClick={onShare} disabled={!ready} className="btn btn-outline text-navy disabled:opacity-50">
                  <Share2 className="h-4 w-4" aria-hidden /> {t("share")}
                </button>
              ) : (
                <button type="button" onClick={onCopy} className="btn btn-outline text-navy">
                  <Copy className="h-4 w-4" aria-hidden /> {copied ? t("copied") : t("copyText")}
                </button>
              )}
            </div>
          )}
          {notice && <p className="mt-3 text-sm text-muted">{notice}</p>}
          {!restricted && <p className="mt-3 text-center text-xs text-muted lg:hidden">{t("longPressHint")}</p>}
        </div>

        {/* Controls */}
        <div className="space-y-7">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-navy">{t("styleLabel")}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TEMPLATE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={template === id}
                  onClick={() => {
                    setTemplate(id);
                    setVariant(null);
                    setEditedShareText(null);
                  }}
                  className={`rounded-xl border p-3 text-start transition-colors ${
                    template === id ? "border-forest bg-forest/10 ring-1 ring-forest" : "border-line bg-white hover:border-forest/60"
                  }`}
                >
                  <span className="block text-sm font-bold text-navy">{t(`templates.${id}.name`)}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{t(`templates.${id}.desc`)}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-navy">{t("formatLabel")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEMPLATE_FORMATS[template].map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={format === id}
                  onClick={() => setFormat({ format: id })}
                  title={t(`formatHints.${id}`)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    format === id ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy/50"
                  }`}
                >
                  {t(`formats.${id}`)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              {t(`formatHints.${format}`)} · {w}×{h}px
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-navy">{t("customize")}</h2>
            {template === "badge" && messages && (
              <fieldset>
                <legend className="text-sm font-semibold text-ink">{t("headlineLabel")}</legend>
                <div className="mt-1.5 grid gap-2">
                  {messages.card.badge.headlines.map((h, i) => {
                    const on = (member.headline ?? 0) === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={on}
                        onClick={() => update({ headline: i })}
                        className={`rounded-xl border px-4 py-2.5 text-start text-sm font-semibold transition-colors ${
                          on ? "border-forest bg-forest/10 text-navy ring-1 ring-forest" : "border-line bg-white text-ink hover:border-forest/60"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <div>
              <label htmlFor="displayName" className="text-sm font-semibold text-ink">
                {t("displayName")}
              </label>
              <input
                id="displayName"
                className="field mt-1.5"
                value={member.displayName}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => update({ displayName: e.target.value })}
                autoComplete="nickname"
              />
            </div>
            <div>
              <label htmlFor="cardLocale" className="text-sm font-semibold text-ink">
                {t("cardLanguage")}
              </label>
              <select
                id="cardLocale"
                className="field mt-1.5"
                value={cardLocale}
                onChange={(e) => setCardLocale(e.target.value)}
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">{tl("label")}</span>
              <div className="mt-1.5">
                <LifestylePicker
                  value={{ commitments: member.commitments, custom: member.customCommitments ?? [] }}
                  onChange={setChoices}
                  idPrefix="studio-lifestyle"
                />
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">{tl("periodLabel")}</span>
              <div className="mt-1.5">
                <PeriodPicker
                  value={member.period}
                  onChange={(period) => {
                    setEditedShareText(null);
                    update({ period });
                  }}
                  idPrefix="studio-period"
                />
              </div>
            </div>
            {template === "commitment" && (
              <div>
                <label htmlFor="statement" className="text-sm font-semibold text-ink">
                  {t("statementLabel")}
                </label>
                <textarea
                  id="statement"
                  className="field mt-1.5 min-h-24 resize-y"
                  value={member.statement ?? ""}
                  maxLength={MAX_STATEMENT_LENGTH}
                  placeholder={messages?.card.commitment.defaultStatement}
                  onChange={(e) => update({ statement: e.target.value })}
                />
                <p className="mt-1 text-xs text-muted">{t("statementHelp")}</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-navy">{t("shareTextLabel")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableVariants.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={effectiveVariant === v}
                  onClick={() => {
                    setVariant(v);
                    setEditedShareText(null);
                  }}
                  className={`h-8 w-8 rounded-full border text-sm font-semibold ${
                    effectiveVariant === v ? "border-navy bg-navy text-white" : "border-line bg-white text-ink"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <textarea
              className="field mt-3 min-h-36 resize-y text-sm leading-relaxed"
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              aria-label={t("shareTextLabel")}
            />
            <button type="button" onClick={onCopy} className="btn btn-outline mt-3 w-full text-navy">
              <Copy className="h-4 w-4" aria-hidden /> {copied ? t("copied") : t("copyText")}
            </button>
          </section>

          <section className="space-y-3 border-t border-line pt-6 text-sm text-muted">
            <p>
              {t("memberId")}: <span className="font-mono font-semibold text-ink">{member.id}</span>
            </p>
            <p>{t("selfDeclared")}</p>
            <button type="button" onClick={onForget} className="inline-flex items-center gap-1.5 text-red-700 hover:underline">
              <Trash2 className="h-4 w-4" aria-hidden /> {t("forget")}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
