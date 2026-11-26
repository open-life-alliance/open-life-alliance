import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALE_CODES } from "./locales";

export const routing = defineRouting({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  // Static export: every page lives under its locale prefix (/en/, /zh-Hans/).
  localePrefix: "always",
});
