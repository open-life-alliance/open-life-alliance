import { drawCard } from "./templates";
import { FORMAT_SIZES, type RenderInput } from "./types";

/** Every string that may appear on the card, so the right glyphs get loaded. */
function collectText(input: RenderInput): string {
  const parts: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") parts.push(v);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(input.text);
  parts.push(
    input.member.displayName,
    input.member.id,
    input.member.statement ?? "",
    input.dateLabel,
    input.countryLabel ?? "",
    input.urlLabel,
    "“·…",
  );
  return Array.from(new Set(Array.from(parts.join("")))).join("");
}

const GENERIC = /^(serif|sans-serif|system-ui|-apple-system|monospace)$/;

/**
 * Web fonts are split into unicode-range subsets (essential for CJK), and
 * browsers only download a subset when text needs it. Canvas does not trigger
 * that download by itself, so we request exactly the glyphs we will draw.
 */
export async function ensureFonts(input: RenderInput, timeoutMs = 6000): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const sample = collectText(input);
  const loads: Promise<unknown>[] = [];
  for (const family of input.fontFamilies) {
    if (GENERIC.test(family)) continue;
    for (const spec of ["400", "600", "700", "800", "italic 500", "italic 600", "italic 400"]) {
      loads.push(document.fonts.load(`${spec} 32px "${family}"`, sample).catch(() => []));
    }
  }
  await Promise.race([
    Promise.all(loads).then(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

export async function renderCard(input: RenderInput): Promise<HTMLCanvasElement> {
  await ensureFonts(input);
  const { w, h } = FORMAT_SIZES[input.format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.imageSmoothingQuality = "high";
  drawCard(ctx, w, h, input);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
