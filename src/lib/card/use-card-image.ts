"use client";

import { useEffect, useRef, useState } from "react";
import type en from "../../../messages/en.json";
import { CARD_FALLBACK_SANS, CARD_FALLBACK_SERIF, getLocaleInfo } from "@/i18n/locales";
import { regionName } from "@/data/countries";
import { siteLabel, siteUrl } from "@/config/site";
import { createTranslator, type AbstractIntlMessages } from "next-intl";
import { periodEnd, type FormatId, type Member, type Period, type TemplateId } from "../member";
import { fontFamily } from "./draw-utils";
import { canvasToBlob, renderCard } from "./render";
import type { RenderInput } from "./types";

type Messages = typeof en;
export type CardMessages = Pick<Messages, "card" | "share" | "commitments">;

const cache = new Map<string, Promise<CardMessages>>();

/** Card strings for any locale, loaded on demand (one small chunk per language). */
export function loadCardMessages(locale: string): Promise<CardMessages> {
  let p = cache.get(locale);
  if (!p) {
    p = import(`../../../messages/${locale}.json`).then((m: { default: Messages }) => ({
      card: m.default.card,
      share: m.default.share,
      commitments: m.default.commitments,
    }));
    cache.set(locale, p);
  }
  return p;
}

function dedupe(list: string[]): string[] {
  return Array.from(new Set(list));
}

type MemberForCard = Pick<
  Member,
  "id" | "displayName" | "statement" | "country" | "joinedAt" | "commitments" | "customCommitments" | "period" | "headline"
>;

/** Preset choices in the card language (short form), then custom ones as typed. */
export function practiceLabels(member: MemberForCard, messages: CardMessages): string[] {
  return [
    ...member.commitments.map((c) => messages.card.commitmentsShort[c]),
    ...(member.customCommitments ?? []),
  ];
}

function formatDate(iso: string, locale: string, style: "medium" | "long" = "medium"): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: style, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return iso;
  }
}

/** "30 days · Nov 26 – Dec 25, 2026" / "Since Nov 26, 2026", in any locale. */
export function formatPeriod(period: Period | undefined, locale: string, messages: CardMessages): string | undefined {
  if (!period) return undefined;
  const t = createTranslator({
    locale,
    messages: { card: messages.card } as unknown as AbstractIntlMessages,
    namespace: "card.period",
  }) as unknown as (key: string, values?: Record<string, string | number>) => string;
  if (period.days === null) return t("since", { date: formatDate(period.start, locale, "long") });
  const end = periodEnd(period)!;
  let range: string;
  try {
    // formatRange collapses shared parts: "Nov 26 – Dec 25, 2026", "2026年11月26日至12月25日".
    const fmt = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
    range = fmt.formatRange(new Date(`${period.start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
  } catch {
    range = `${formatDate(period.start, locale)} – ${formatDate(end, locale)}`;
  }
  return t("fixed", { days: t("days", { days: period.days }), range });
}

/** Locale-aware list: "A, B, and C" / "A、B和C". */
export function formatList(items: string[], locale: string): string {
  try {
    return new Intl.ListFormat(locale, { type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

export function buildRenderInput(args: {
  member: MemberForCard;
  template: TemplateId;
  format: FormatId;
  cardLocale: string;
  messages: CardMessages;
}): RenderInput {
  const info = getLocaleInfo(args.cardLocale);
  const sans = dedupe([...info.cardSans, ...CARD_FALLBACK_SANS]);
  const serif = dedupe([...info.cardSerif, ...CARD_FALLBACK_SERIF]);
  const base = siteUrl();
  const url = `${base}/${args.cardLocale}/`;
  const { id, displayName, statement } = args.member;
  return {
    template: args.template,
    format: args.format,
    member: { id, displayName, statement },
    practices: practiceLabels(args.member, args.messages),
    periodLabel: formatPeriod(args.member.period, args.cardLocale, args.messages),
    headline: args.messages.card.badge.headlines[args.member.headline ?? 0] ?? args.messages.card.badge.headlines[0],
    text: args.messages.card,
    locale: args.cardLocale,
    dir: info.dir,
    fonts: { sans: fontFamily(sans), serif: fontFamily(serif) },
    fontFamilies: dedupe([...sans, ...serif]),
    url,
    urlLabel: siteLabel(base),
    dateLabel: formatDate(args.member.joinedAt, args.cardLocale, "long"),
    countryLabel: args.member.country ? regionName(args.member.country, args.cardLocale) : undefined,
  };
}
type Result =
  | { key: string; ok: true; url: string; blob: Blob; width: number; height: number }
  | { key: string; ok: false; error: string };

export type CardImageState =
  | { status: "rendering" }
  /** `stale` is true while a newer version is being drawn. */
  | { status: "ready"; url: string; blob: Blob; width: number; height: number; stale: boolean }
  | { status: "error"; error: string };

/**
 * Renders a card to a PNG whenever the input changes (debounced), and keeps
 * an object URL for an <img>. Showing a real <img> matters: it lets people
 * long-press to save in WeChat and other in-app browsers.
 */
export function useCardImage(input: RenderInput | null, delay = 120): CardImageState {
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);
  const key = input ? JSON.stringify(input) : "";

  useEffect(() => {
    if (!input) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const canvas = await renderCard(input);
        const blob = await canvasToBlob(canvas);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setResult({ key, ok: true, url, blob, width: canvas.width, height: canvas.height });
      } catch (e) {
        if (!cancelled) setResult({ key, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, delay]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  if (!result) return { status: "rendering" };
  if (!result.ok) return result.key === key ? { status: "error", error: result.error } : { status: "rendering" };
  return { status: "ready", url: result.url, blob: result.blob, width: result.width, height: result.height, stale: result.key !== key };
}
