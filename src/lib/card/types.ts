import type { FormatId, Member, TemplateId } from "../member";
import type en from "../../../messages/en.json";

/** Strings printed on the card, from the `card` namespace of a locale file. */
export type CardText = (typeof en)["card"];

export const FORMAT_SIZES: Record<FormatId, { w: number; h: number }> = {
  // A4 landscape at 300 dpi: prints sharply.
  certificate: { w: 3508, h: 2480 },
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1200, h: 630 },
  story: { w: 1080, h: 1920 },
};

/** Which sizes each template offers, in display order. */
export const TEMPLATE_FORMATS: Record<TemplateId, FormatId[]> = {
  classic: ["certificate", "landscape", "square"],
  badge: ["square", "portrait", "story", "landscape"],
  commitment: ["square", "portrait", "story"],
};

export interface RenderInput {
  template: TemplateId;
  format: FormatId;
  member: Pick<Member, "id" | "displayName" | "statement">;
  /** Chosen ways of living, already localised (presets) or as typed (custom). */
  practices: string[];
  /** e.g. "30 days · Nov 26 – Dec 25, 2026", already localised. */
  periodLabel?: string;
  /** Badge headline, already picked from card.badge.headlines. */
  headline: string;
  text: CardText;
  /** BCP 47 locale of the card text. */
  locale: string;
  dir: "ltr" | "rtl";
  fonts: { sans: string; serif: string };
  /** Font families (unquoted) to preload before drawing. */
  fontFamilies: string[];
  /** Link encoded in the QR code. */
  url: string;
  /** Short host label printed next to the QR code. */
  urlLabel: string;
  /** Already-localised join date. */
  dateLabel: string;
  /** Already-localised country or region name. */
  countryLabel?: string;
}
