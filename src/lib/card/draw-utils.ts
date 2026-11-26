/**
 * Low-level Canvas 2D helpers for the card renderer: fonts, text wrapping,
 * a tiny vertical "stack" layout engine, the logo and QR codes.
 *
 * Why Canvas instead of HTML-to-image? See docs/DECISIONS.md — in short,
 * mobile Safari and in-app browsers drop web fonts when rasterising HTML/SVG,
 * while Canvas draws reliably with any font that is loaded on the page.
 */
import QRCode from "qrcode";
import { LOGO } from "../brand";

export type Ctx = CanvasRenderingContext2D;

const GENERIC = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "-apple-system",
  "cursive",
  "fantasy",
]);

export function fontFamily(families: readonly string[]): string {
  return families.map((f) => (GENERIC.has(f) ? f : `"${f}"`)).join(", ");
}

export function setFont(
  ctx: Ctx,
  size: number,
  family: string,
  weight: number | string = 400,
  style: "normal" | "italic" = "normal",
): void {
  ctx.font = `${style} ${weight} ${Math.max(1, Math.round(size * 10) / 10)}px ${family}`;
}

/** Letter spacing in em. Falls back to none on browsers without support. */
export function setTracking(ctx: Ctx, em: number, size: number): void {
  const c = ctx as Ctx & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${(em * size).toFixed(2)}px`;
}

// ---------------------------------------------------------------------------
// Text wrapping (works for space-separated scripts and for CJK)
// ---------------------------------------------------------------------------

const NO_LINE_START = /^[\s。，、；：！？）」』】》〉,.;:!?)\]}%…]/;

function segmentText(text: string, locale: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Seg) {
    return Array.from(new Seg(locale, { granularity: "word" }).segment(text), (s) => s.segment);
  }
  // Fallback: split on spaces, and treat each CJK character as its own word.
  return text.split(/(\s+|[　-鿿가-힯＀-￯])/).filter(Boolean);
}

export function wrapLines(ctx: Ctx, text: string, maxWidth: number, locale: string): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const seg of segmentText(paragraph, locale)) {
      const candidate = line + seg;
      if (ctx.measureText(candidate).width <= maxWidth || NO_LINE_START.test(seg)) {
        line = candidate;
        continue;
      }
      if (line.trim()) out.push(line.trimEnd());
      line = seg.trimStart();
      // A single segment wider than the line: break it by characters.
      while (ctx.measureText(line).width > maxWidth && Array.from(line).length > 1) {
        const chars = Array.from(line);
        let i = chars.length - 1;
        while (i > 1 && ctx.measureText(chars.slice(0, i).join("")).width > maxWidth) i--;
        out.push(chars.slice(0, i).join(""));
        line = chars.slice(i).join("");
      }
    }
    if (line.trim()) out.push(line.trimEnd());
  }
  return out;
}

/** Wrap, then narrow the width as far as possible without adding lines. */
export function wrapBalanced(ctx: Ctx, text: string, maxWidth: number, locale: string): string[] {
  const base = wrapLines(ctx, text, maxWidth, locale);
  if (base.length < 2) return base;
  let lo = maxWidth * 0.5;
  let hi = maxWidth;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (wrapLines(ctx, text, mid, locale).length <= base.length) hi = mid;
    else lo = mid;
  }
  return wrapLines(ctx, text, hi, locale);
}

// ---------------------------------------------------------------------------
// Stack layout: blocks are measured at a unit size `u`; if they do not fit
// the box, `u` shrinks and everything is re-measured.
// ---------------------------------------------------------------------------

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Block {
  measure(u: number): number;
  draw(cx: number, top: number, u: number): void;
  /** Space after this block, in units of u. */
  gap?: number;
}

export function layoutStack(
  blocks: (Block | null | undefined)[],
  box: Box,
  u0: number,
  opts: { spread?: number } = {},
): number {
  const items = blocks.filter((b): b is Block => !!b);
  let u = u0;
  let total = 0;
  const sumGaps = (uu: number) =>
    items.reduce((s, b, i) => s + (i < items.length - 1 ? (b.gap ?? 0) * uu : 0), 0);
  for (let i = 0; i < 6; i++) {
    total = items.reduce((s, b) => s + b.measure(u), 0) + sumGaps(u);
    if (total <= box.h) break;
    u *= (box.h / total) * 0.985;
  }
  // Optionally use part of the leftover space to open up the gaps.
  const leftover = Math.max(0, box.h - total);
  const gapTotal = sumGaps(u);
  const extra = gapTotal > 0 ? (leftover * (opts.spread ?? 0)) / gapTotal : 0;
  const used = total + leftover * (gapTotal > 0 ? opts.spread ?? 0 : 0);
  let y = box.y + (box.h - used) / 2;
  const cx = box.x + box.w / 2;
  items.forEach((b, i) => {
    const h = b.measure(u);
    b.draw(cx, y, u);
    if (i < items.length - 1) y += h + (b.gap ?? 0) * u * (1 + extra);
  });
  return u;
}

export interface TextOpts {
  text: string;
  family: string;
  /** Font size in units of u. */
  size: number;
  weight?: number | string;
  style?: "normal" | "italic";
  color: string;
  tracking?: number;
  lineHeight?: number;
  /** Maximum line width in px. */
  maxWidth: number;
  /** Shrink a single line to fit instead of wrapping. */
  fit?: boolean;
  balance?: boolean;
  maxLines?: number;
  locale: string;
  gap?: number;
  alpha?: number;
}

/** CJK (and similar) scripts have no true italics; synthetic slanting looks broken. */
const NO_ITALIC_SCRIPT = /[⺀-鿿가-힯豈-﫿＀-￯]/;

export function textBlock(ctx: Ctx, opts: TextOpts): Block {
  const o: TextOpts =
    opts.style === "italic" && NO_ITALIC_SCRIPT.test(opts.text) ? { ...opts, style: "normal" } : opts;
  const lh = o.lineHeight ?? 1.25;
  const prepare = (u: number) => {
    let size = o.size * u;
    setFont(ctx, size, o.family, o.weight, o.style);
    setTracking(ctx, o.tracking ?? 0, size);
    if (o.fit) {
      const w = ctx.measureText(o.text).width;
      if (w > o.maxWidth) {
        size = Math.max(size * 0.35, (size * o.maxWidth) / w);
        setFont(ctx, size, o.family, o.weight, o.style);
        setTracking(ctx, o.tracking ?? 0, size);
      }
      return { size, lines: [o.text] };
    }
    let lines = o.balance
      ? wrapBalanced(ctx, o.text, o.maxWidth, o.locale)
      : wrapLines(ctx, o.text, o.maxWidth, o.locale);
    if (o.maxLines && lines.length > o.maxLines) {
      lines = lines.slice(0, o.maxLines);
      lines[lines.length - 1] = lines[lines.length - 1].replace(/.$/u, "…");
    }
    return { size, lines };
  };
  return {
    gap: o.gap,
    measure(u) {
      if (!o.text) return 0;
      const { size, lines } = prepare(u);
      return lines.length * size * lh;
    },
    draw(cx, top, u) {
      if (!o.text) return;
      const { size, lines } = prepare(u);
      ctx.save();
      ctx.globalAlpha = o.alpha ?? 1;
      ctx.fillStyle = o.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      lines.forEach((line, i) => {
        // Compensate the trailing letter-spacing so text stays centred.
        const shift = ((o.tracking ?? 0) * size) / 2;
        ctx.fillText(line, cx + shift, top + size * lh * (i + 0.5));
      });
      ctx.restore();
    },
  };
}

export function spacer(height: number): Block {
  return { measure: (u) => height * u, draw: () => {} };
}

export function dividerBlock(
  ctx: Ctx,
  o: { width: number; thickness: number; color: string; gap?: number; dot?: boolean },
): Block {
  return {
    gap: o.gap,
    measure: (u) => Math.max(o.thickness * u, o.dot ? u * 0.9 : 0),
    draw(cx, top, u) {
      const t = o.thickness * u;
      const w = o.width * u;
      const mid = top + Math.max(t, o.dot ? u * 0.9 : 0) / 2;
      ctx.save();
      ctx.fillStyle = o.color;
      if (o.dot) {
        const r = u * 0.45;
        ctx.fillRect(cx - w / 2, mid - t / 2, w / 2 - r * 2.2, t);
        ctx.fillRect(cx + r * 2.2, mid - t / 2, w / 2 - r * 2.2, t);
        ctx.beginPath();
        ctx.moveTo(cx, mid - r);
        ctx.lineTo(cx + r, mid);
        ctx.lineTo(cx, mid + r);
        ctx.lineTo(cx - r, mid);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(cx - w / 2, mid - t / 2, w, t);
      }
      ctx.restore();
    },
  };
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

let paths: { ring: Path2D; leaf: Path2D; vein: Path2D } | null = null;
function logoPaths() {
  if (!paths) paths = { ring: new Path2D(LOGO.ring), leaf: new Path2D(LOGO.leaf), vein: new Path2D(LOGO.vein) };
  return paths;
}

export function drawLogo(
  ctx: Ctx,
  x: number,
  y: number,
  size: number,
  colors: { ring: string; leaf: string; vein: string },
): void {
  const p = logoPaths();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / LOGO.viewBox, size / LOGO.viewBox);
  ctx.lineCap = "round";
  ctx.strokeStyle = colors.ring;
  ctx.lineWidth = LOGO.ringWidth;
  ctx.stroke(p.ring);
  ctx.fillStyle = colors.leaf;
  ctx.fill(p.leaf);
  if (colors.vein !== "transparent") {
    ctx.strokeStyle = colors.vein;
    ctx.lineWidth = LOGO.veinWidth;
    ctx.stroke(p.vein);
  }
  ctx.restore();
}

export function logoBlock(
  ctx: Ctx,
  o: { size: number; colors: { ring: string; leaf: string; vein: string }; gap?: number },
): Block {
  return {
    gap: o.gap,
    measure: (u) => o.size * u,
    draw: (cx, top, u) => drawLogo(ctx, cx - (o.size * u) / 2, top, o.size * u, o.colors),
  };
}

// ---------------------------------------------------------------------------
// QR code
// ---------------------------------------------------------------------------

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawQR(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  colors: { fg: string; bg: string },
): void {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const margin = 2;
  const cell = size / (n + margin * 2);
  ctx.save();
  ctx.fillStyle = colors.bg;
  roundRect(ctx, x, y, size, size, cell * 1.5);
  ctx.fill();
  ctx.fillStyle = colors.fg;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c)) continue;
      const x0 = Math.round(x + (c + margin) * cell);
      const y0 = Math.round(y + (r + margin) * cell);
      const x1 = Math.round(x + (c + margin + 1) * cell);
      const y1 = Math.round(y + (r + margin + 1) * cell);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  ctx.restore();
}

/** QR code with a caption underneath, as a stack block. */
export function qrBlock(
  ctx: Ctx,
  o: {
    url: string;
    size: number;
    fg: string;
    bg: string;
    caption: string;
    captionColor: string;
    family: string;
    captionSize: number;
    locale: string;
    gap?: number;
  },
): Block {
  const cap = textBlock(ctx, {
    text: o.caption,
    family: o.family,
    size: o.captionSize,
    weight: 600,
    color: o.captionColor,
    tracking: 0.06,
    maxWidth: 1e6,
    locale: o.locale,
  });
  return {
    gap: o.gap,
    measure: (u) => o.size * u + 0.8 * u + cap.measure(u),
    draw(cx, top, u) {
      const s = o.size * u;
      drawQR(ctx, o.url, cx - s / 2, top, s, { fg: o.fg, bg: o.bg });
      cap.draw(cx, top + s + 0.8 * u, u);
    },
  };
}

/** Rounded "pill" labels, wrapped and centred. */
export function chipsBlock(
  ctx: Ctx,
  o: {
    labels: string[];
    family: string;
    size: number;
    color: string;
    border: string;
    fill?: string;
    maxWidth: number;
    gap?: number;
  },
): Block {
  const layout = (u: number) => {
    const fs = o.size * u;
    setFont(ctx, fs, o.family, 700);
    setTracking(ctx, 0.08, fs);
    const padX = fs * 0.9;
    const h = fs * 2.1;
    const space = fs * 0.6;
    const rows: { w: number; items: { label: string; w: number }[] }[] = [];
    let row = { w: 0, items: [] as { label: string; w: number }[] };
    for (const label of o.labels) {
      const w = ctx.measureText(label).width + padX * 2;
      const next = row.items.length ? row.w + space + w : w;
      if (next > o.maxWidth && row.items.length) {
        rows.push(row);
        row = { w, items: [{ label, w }] };
      } else {
        row.w = next;
        row.items.push({ label, w });
      }
    }
    if (row.items.length) rows.push(row);
    return { fs, h, space, rows, padX };
  };
  return {
    gap: o.gap,
    measure(u) {
      if (!o.labels.length) return 0;
      const { h, space, rows } = layout(u);
      return rows.length * h + (rows.length - 1) * space;
    },
    draw(cx, top, u) {
      if (!o.labels.length) return;
      const { fs, h, space, rows } = layout(u);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      rows.forEach((row, ri) => {
        let x = cx - row.w / 2;
        const y = top + ri * (h + space);
        for (const item of row.items) {
          roundRect(ctx, x, y, item.w, h, h / 2);
          if (o.fill) {
            ctx.fillStyle = o.fill;
            ctx.fill();
          }
          ctx.lineWidth = Math.max(1, fs * 0.09);
          ctx.strokeStyle = o.border;
          ctx.stroke();
          ctx.fillStyle = o.color;
          ctx.fillText(item.label, x + item.w / 2 + (0.08 * fs) / 2, y + h / 2);
          x += item.w + space;
        }
      });
      ctx.restore();
    },
  };
}
