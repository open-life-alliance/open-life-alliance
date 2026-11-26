"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/locales";
import { LANG_PREF_KEY } from "@/components/LanguageRedirect";

/** Dropdown that scales to any number of languages. */
export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language")}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium transition-colors sm:px-3 ${
          dark ? "text-white/90 hover:bg-white/10" : "text-navy hover:bg-navy/5"
        }`}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="whitespace-nowrap sm:hidden">{current?.shortName}</span>
        <span className="hidden whitespace-nowrap sm:inline">{current?.nativeName}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-xl"
        >
          {LOCALES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <Link
                href={pathname}
                locale={l.code}
                lang={l.code}
                onClick={() => {
                  try {
                    window.localStorage.setItem(LANG_PREF_KEY, l.code);
                  } catch {
                    /* ignore */
                  }
                  setOpen(false);
                }}
                className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm text-ink hover:bg-paper"
              >
                <span>{l.nativeName}</span>
                {l.code === locale && <Check className="h-4 w-4 text-forest" aria-hidden />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
