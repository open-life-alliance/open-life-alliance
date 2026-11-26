"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import {
  COMMITMENT_IDS,
  MAX_CHOICES,
  MAX_CUSTOM_LENGTH,
  MAX_PERIOD_DAYS,
  PERIOD_PRESETS,
  normalizeCustom,
  todayISO,
  type CommitmentId,
  type Period,
} from "@/lib/member";

const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
    on ? "border-forest bg-forest text-white" : "border-line bg-white text-ink hover:border-forest"
  }`;

export interface LifestyleValue {
  commitments: CommitmentId[];
  custom: string[];
}

/** Preset lifestyle choices plus free-text ones, capped at MAX_CHOICES. */
export function LifestylePicker({
  value,
  onChange,
  idPrefix = "lifestyle",
}: {
  value: LifestyleValue;
  onChange: (next: LifestyleValue) => void;
  idPrefix?: string;
}) {
  const t = useTranslations("lifestyle");
  const tc = useTranslations("commitments");
  const [draft, setDraft] = useState("");
  const count = value.commitments.length + value.custom.length;
  const full = count >= MAX_CHOICES;

  const togglePreset = (id: CommitmentId) => {
    const on = value.commitments.includes(id);
    if (!on && full) return;
    onChange({
      ...value,
      // Keep presets in their canonical order.
      commitments: on
        ? value.commitments.filter((c) => c !== id)
        : COMMITMENT_IDS.filter((c) => c === id || value.commitments.includes(c)),
    });
  };

  const addCustom = () => {
    const label = normalizeCustom(draft);
    if (!label || full || value.custom.includes(label)) return;
    onChange({ ...value, custom: [...value.custom, label] });
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {COMMITMENT_IDS.map((id) => {
          const on = value.commitments.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => togglePreset(id)}
              className={chip(on)}
            >
              {tc(id)}
            </button>
          );
        })}
        {value.custom.map((label) => (
          <span key={label} className={`${chip(true)} inline-flex items-center gap-1.5 !pe-2`}>
            {label}
            <button
              type="button"
              onClick={() => onChange({ ...value, custom: value.custom.filter((c) => c !== label) })}
              aria-label={t("remove", { label })}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          id={`${idPrefix}-custom`}
          className="field !py-2 text-sm"
          value={draft}
          maxLength={MAX_CUSTOM_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={t("customPlaceholder")}
          disabled={full}
          aria-label={t("customPlaceholder")}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={full || !normalizeCustom(draft)}
          className="btn btn-outline shrink-0 !px-4 !py-2 text-sm text-navy disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden /> {t("add")}
        </button>
      </div>
      <p className={`mt-1.5 text-xs ${full ? "font-semibold text-forest" : "text-muted"}`}>
        {t("limit", { max: MAX_CHOICES })}
      </p>
    </div>
  );
}

type PeriodMode = "none" | "ongoing" | number | "custom";

function modeOf(p: Period | undefined): PeriodMode {
  if (!p) return "none";
  if (p.days === null) return "ongoing";
  return (PERIOD_PRESETS as readonly number[]).includes(p.days) ? p.days : "custom";
}

/** Optional self-set time frame: none, ongoing, N days (preset or custom), with a start date. */
export function PeriodPicker({
  value,
  onChange,
  idPrefix = "period",
}: {
  value: Period | undefined;
  onChange: (next: Period | undefined) => void;
  idPrefix?: string;
}) {
  const t = useTranslations("lifestyle");
  const mode = modeOf(value);
  const [customOpen, setCustomOpen] = useState(mode === "custom");
  const start = value?.start ?? todayISO();
  const active: PeriodMode = customOpen && mode !== "none" && mode !== "ongoing" ? "custom" : mode;

  const pick = (m: PeriodMode) => {
    setCustomOpen(m === "custom");
    if (m === "none") onChange(undefined);
    else if (m === "ongoing") onChange({ days: null, start });
    else if (m === "custom") onChange({ days: value?.days ?? 60, start });
    else onChange({ days: m, start });
  };

  const options: { key: PeriodMode; label: string }[] = [
    { key: "none", label: t("periodNone") },
    { key: "ongoing", label: t("periodOngoing") },
    ...PERIOD_PRESETS.map((d) => ({ key: d as PeriodMode, label: d === 365 ? t("periodYear") : t("periodDays", { days: d }) })),
    { key: "custom", label: t("periodCustom") },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.key)}
            type="button"
            aria-pressed={active === o.key}
            onClick={() => pick(o.key)}
            className={chip(active === o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {value && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {active === "custom" && (
            <label className="text-sm">
              <span className="block text-muted">{t("periodCustomDays")}</span>
              <input
                id={`${idPrefix}-days`}
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_PERIOD_DAYS}
                className="field mt-1 !w-28 !py-2"
                value={value.days ?? ""}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value));
                  if (n >= 1 && n <= MAX_PERIOD_DAYS) onChange({ ...value, days: n });
                }}
              />
            </label>
          )}
          <label className="text-sm">
            <span className="block text-muted">{t("periodStart")}</span>
            <input
              id={`${idPrefix}-start`}
              type="date"
              className="field mt-1 !w-auto !py-2"
              value={value.start}
              onChange={(e) => e.target.value && onChange({ ...value, start: e.target.value })}
            />
          </label>
        </div>
      )}
      <p className="mt-1.5 text-xs text-muted">{t("periodHelp")}</p>
    </div>
  );
}
