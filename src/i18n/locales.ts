/**
 * Single source of truth for supported languages.
 *
 * To add a language:
 *   1. Copy messages/en.json to messages/<code>.json and translate it.
 *   2. Add an entry below (code, native name, text direction, card fonts).
 *   3. Run `npm run check:i18n` to verify no keys are missing.
 * Nothing else in the codebase needs to change.
 */

export type Direction = "ltr" | "rtl";

export interface LocaleInfo {
  /** BCP 47 tag, also used as the URL segment, e.g. /en/, /zh-Hans/ */
  code: string;
  /** Name of the language in that language */
  nativeName: string;
  /** Very short label for small screens, e.g. "EN", "中文" */
  shortName: string;
  /** English name, for contributors */
  englishName: string;
  dir: Direction;
  /**
   * Font families (CSS names) to try first on generated cards for this
   * language. They are prepended to the shared fallback stack, so a card in
   * any language can still render names written in any other script.
   */
  cardSans: string[];
  cardSerif: string[];
}

export const LOCALES = [
  {
    code: "en",
    nativeName: "English",
    shortName: "EN",
    englishName: "English",
    dir: "ltr",
    cardSans: ["Inter Variable"],
    cardSerif: ["Playfair Display Variable"],
  },
  {
    code: "zh-Hans",
    nativeName: "简体中文",
    shortName: "中文",
    englishName: "Chinese (Simplified)",
    dir: "ltr",
    cardSans: ["Inter Variable", "Noto Sans SC Variable"],
    cardSerif: ["Playfair Display Variable", "Noto Serif SC Variable"],
  },
] as const satisfies readonly LocaleInfo[];

export type Locale = (typeof LOCALES)[number]["code"];

export const LOCALE_CODES = LOCALES.map((l) => l.code) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALE_CODES as string[]).includes(value);
}

export function getLocaleInfo(code: string): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/** Shared fallbacks so any script in a display name has a chance to render. */
export const CARD_FALLBACK_SANS = [
  "Inter Variable",
  "Noto Sans SC Variable",
  "system-ui",
  "-apple-system",
  "Segoe UI",
  "Roboto",
  "Noto Sans",
  "sans-serif",
];
export const CARD_FALLBACK_SERIF = [
  "Playfair Display Variable",
  "Noto Serif SC Variable",
  "Georgia",
  "Noto Serif",
  "serif",
];

/** Pick the best supported locale for a list of browser languages. */
export function matchLocale(preferred: readonly string[]): Locale {
  for (const raw of preferred) {
    const tag = raw.toLowerCase();
    const exact = LOCALE_CODES.find((c) => c.toLowerCase() === tag);
    if (exact) return exact;
    // zh, zh-CN, zh-SG, zh-Hans-* → Simplified Chinese.
    // (zh-TW / zh-HK would map to a future zh-Hant entry.)
    if (/^zh(-hans|-cn|-sg|-my)?(-|$)/.test(tag) && isLocale("zh-Hans")) return "zh-Hans";
    const base = tag.split("-")[0];
    const byBase = LOCALE_CODES.find((c) => c.toLowerCase().split("-")[0] === base && base !== "zh");
    if (byBase) return byBase;
  }
  return DEFAULT_LOCALE;
}
