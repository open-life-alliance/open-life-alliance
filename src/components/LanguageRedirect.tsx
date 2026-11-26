"use client";

import { useEffect } from "react";
import { matchLocale } from "@/i18n/locales";

export const LANG_PREF_KEY = "ola.lang";

export function LanguageRedirect() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_PREF_KEY);
    } catch {
      /* storage blocked */
    }
    const locale = matchLocale(saved ? [saved] : navigator.languages?.length ? navigator.languages : [navigator.language]);
    window.location.replace(`/${locale}/${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
