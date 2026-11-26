"use client";

import { useMemo } from "react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import type { TemplateId, FormatId } from "@/lib/member";
import { buildRenderInput, useCardImage, type CardMessages } from "@/lib/card/use-card-image";
import { FORMAT_SIZES } from "@/lib/card/types";

/** A real, rendered example card for the homepage. */
export function SampleCard({
  template = "badge",
  format = "portrait",
  className = "",
}: {
  template?: TemplateId;
  format?: FormatId;
  className?: string;
}) {
  const locale = useLocale();
  const messages = useMessages() as unknown as CardMessages;
  const t = useTranslations("membership");
  const studio = useTranslations("studio");

  const input = useMemo(
    () =>
      buildRenderInput({
        member: {
          id: `OLA-${new Date().getUTCFullYear()}-7K3M9QX2`,
          displayName: t("sampleName"),
          joinedAt: new Date().toISOString().slice(0, 10),
          commitments: ["smokeFree", "alcoholFree", "earlySleep", "running"],
          period: { days: 30, start: new Date().toISOString().slice(0, 10) },
        },
        template,
        format,
        cardLocale: locale,
        messages,
      }),
    [locale, messages, t, template, format],
  );
  const state = useCardImage(input);
  const { w, h } = FORMAT_SIZES[format];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-navy/20 ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      {state.status === "ready" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.url} alt={studio("previewAlt")} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full animate-pulse bg-gradient-to-br from-paper to-line" />
      )}
    </div>
  );
}
