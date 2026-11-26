/**
 * The three card templates. Each draws onto a canvas of any supported size;
 * the layout adapts to the aspect ratio through the stack engine.
 */
import { COLORS, logoColors } from "../brand";
import {
  type Block,
  type Box,
  type Ctx,
  chipsBlock,
  dividerBlock,
  drawLogo,
  layoutStack,
  logoBlock,
  qrBlock,
  roundRect,
  textBlock,
} from "./draw-utils";
import type { RenderInput } from "./types";

export function drawCard(ctx: Ctx, w: number, h: number, input: RenderInput): void {
  ctx.direction = input.dir;
  switch (input.template) {
    case "classic":
      return drawClassic(ctx, w, h, input);
    case "badge":
      return drawBadge(ctx, w, h, input);
    case "commitment":
      return drawCommitment(ctx, w, h, input);
  }
}

const isWide = (w: number, h: number) => w / h > 1.6;
/** Tall formats (stories) get slightly larger type; the stack shrinks it back if needed. */
const unit = (w: number, h: number) => (Math.min(w, h) / 100) * (h / w > 1.5 ? 1.15 : 1);

function qrCaption(input: RenderInput) {
  return `${input.text.scan} · ${input.urlLabel}`;
}

// ---------------------------------------------------------------------------
// Classic — formal certificate: deep navy, gold frame, serif title
// ---------------------------------------------------------------------------

function drawClassic(ctx: Ctx, w: number, h: number, input: RenderInput): void {
  const { text, fonts, locale, member } = input;
  const m = Math.min(w, h);
  const wide = isWide(w, h);

  const bg = ctx.createRadialGradient(w / 2, h * 0.38, 0, w / 2, h * 0.45, Math.max(w, h) * 0.8);
  bg.addColorStop(0, "#1F4A66");
  bg.addColorStop(1, COLORS.navyDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Watermark: the logo, very faint.
  ctx.save();
  ctx.globalAlpha = 0.045;
  const wm = m * 0.95;
  drawLogo(ctx, w / 2 - wm / 2, h / 2 - wm / 2, wm, { ring: COLORS.gold, leaf: COLORS.gold, vein: "transparent" });
  ctx.restore();

  // Double gold frame with corner diamonds.
  const p1 = m * 0.035;
  const p2 = p1 + m * 0.012;
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = m * 0.0032;
  ctx.strokeRect(p1, p1, w - 2 * p1, h - 2 * p1);
  ctx.lineWidth = m * 0.0012;
  ctx.globalAlpha = 0.7;
  ctx.strokeRect(p2, p2, w - 2 * p2, h - 2 * p2);
  ctx.globalAlpha = 1;
  const d = m * 0.011;
  ctx.fillStyle = COLORS.gold;
  for (const [cx, cy] of [
    [p1, p1],
    [w - p1, p1],
    [p1, h - p1],
    [w - p1, h - p1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();
    ctx.fill();
  }

  const inset = p2 + m * (wide ? 0.04 : 0.05);
  const box: Box = { x: inset, y: inset, w: w - 2 * inset, h: h - 2 * inset };
  const soft = "#C9D3DA";
  const orgLocal = text.orgLocalName;

  // Bottom row: member ID — QR — date.
  const infoRow: Block = {
    gap: 2.4,
    measure: (u) => 11 * u,
    draw(cx, top, u) {
      const colOffset = Math.min(box.w * 0.32, 38 * u);
      const label = (s: string, x: number, y: number) =>
        textBlock(ctx, {
          text: s,
          family: fonts.sans,
          size: 1.45,
          weight: 600,
          color: COLORS.gold,
          tracking: 0.22,
          maxWidth: colOffset * 1.2,
          fit: true,
          locale,
        }).draw(x, y, u);
      const value = (s: string, x: number, y: number) =>
        textBlock(ctx, {
          text: s,
          family: fonts.sans,
          size: 2.3,
          weight: 600,
          color: COLORS.white,
          tracking: 0.04,
          maxWidth: colOffset * 1.2,
          fit: true,
          locale,
        }).draw(x, y, u);
      const ly = top + 3.2 * u;
      label(text.classic.memberId, cx - colOffset, ly);
      value(member.id, cx - colOffset, ly + 2.4 * u);
      label(text.classic.since, cx + colOffset, ly);
      value(input.dateLabel, cx + colOffset, ly + 2.4 * u);
      qrBlock(ctx, {
        url: input.url,
        size: 8.4,
        fg: COLORS.navy,
        bg: COLORS.white,
        caption: qrCaption(input),
        captionColor: soft,
        family: fonts.sans,
        captionSize: 1.2,
        locale,
      }).draw(cx, top, u);
    },
  };

  const blocks: Block[] = [
    logoBlock(ctx, { size: wide ? 7.5 : 9, colors: logoColors("onDark"), gap: 2 }),
    textBlock(ctx, {
      text: text.orgName,
      family: fonts.sans,
      size: 1.8,
      weight: 700,
      color: COLORS.gold,
      tracking: 0.34,
      maxWidth: box.w,
      locale,
      gap: orgLocal ? 0.6 : 2.8,
    }),
    orgLocal
      ? textBlock(ctx, {
          text: orgLocal,
          family: fonts.sans,
          size: 1.7,
          weight: 500,
          color: COLORS.goldSoft,
          tracking: 0.3,
          maxWidth: box.w,
          locale,
          gap: 2.8,
        })
      : null,
    textBlock(ctx, {
      text: text.classic.title,
      family: fonts.serif,
      size: 5,
      weight: 600,
      color: COLORS.white,
      tracking: 0.07,
      maxWidth: box.w,
      fit: true,
      locale,
      gap: 1.8,
    }),
    dividerBlock(ctx, { width: 22, thickness: 0.16, color: COLORS.gold, dot: true, gap: 2.4 }),
    textBlock(ctx, {
      text: text.classic.recognizes,
      family: fonts.sans,
      size: 2.1,
      color: soft,
      maxWidth: box.w,
      locale,
      gap: 1.4,
    }),
    textBlock(ctx, {
      text: member.displayName,
      family: fonts.serif,
      size: 7.6,
      weight: 600,
      style: "italic",
      color: COLORS.gold,
      maxWidth: box.w * 0.86,
      fit: true,
      lineHeight: 1.3,
      locale,
      gap: 0.6,
    }),
    dividerBlock(ctx, { width: Math.min(52, (box.w * 0.55) / (m / 100)), thickness: 0.1, color: "rgba(197,166,106,0.55)", gap: input.countryLabel ? 1.2 : 2.2 }),
    input.countryLabel
      ? textBlock(ctx, {
          text: input.countryLabel,
          family: fonts.sans,
          size: 1.7,
          weight: 500,
          color: soft,
          tracking: 0.12,
          maxWidth: box.w,
          locale,
          gap: 2,
        })
      : null,
    textBlock(ctx, {
      text: text.classic.joined,
      family: fonts.sans,
      size: 2.1,
      color: soft,
      maxWidth: box.w,
      locale,
      gap: 0.9,
    }),
    textBlock(ctx, {
      text: orgLocal || text.orgName,
      family: fonts.sans,
      size: 2.8,
      weight: 700,
      color: COLORS.white,
      tracking: orgLocal ? 0.2 : 0.16,
      maxWidth: box.w,
      fit: true,
      locale,
      gap: 0.9,
    }),
    textBlock(ctx, {
      text: text.classic.supports,
      family: fonts.sans,
      size: 2,
      color: soft,
      maxWidth: Math.min(box.w * 0.78, (m / 100) * 74),
      balance: true,
      lineHeight: 1.45,
      locale,
      gap: 3,
    }),
    infoRow,
    textBlock(ctx, {
      text: text.disclaimer,
      family: fonts.sans,
      size: 1.25,
      style: "italic",
      color: "rgba(201,211,218,0.62)",
      maxWidth: box.w * 0.9,
      locale,
    }),
  ].filter(Boolean) as Block[];

  layoutStack(blocks, box, m / 100, { spread: 0.35 });
}

// ---------------------------------------------------------------------------
// Badge — bright social image with a big headline
// ---------------------------------------------------------------------------

function commitmentLine(input: RenderInput): string {
  const short = input.practices.map((p) => p.toLocaleUpperCase(input.locale));
  return [...short, input.text.badge.pressureFree].join("  ·  ");
}

function badgeBackground(ctx: Ctx, w: number, h: number) {
  const m = Math.min(w, h);
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, w, h);
  // Large ring arc, top-right.
  ctx.save();
  ctx.strokeStyle = COLORS.forest;
  ctx.globalAlpha = 0.09;
  ctx.lineWidth = m * 0.07;
  ctx.beginPath();
  ctx.arc(w * 0.98, h * 0.02, m * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(w * 0.04, h * 0.98, m * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Thin navy band at the bottom.
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(0, h - m * 0.018, w, m * 0.018);
  ctx.fillStyle = COLORS.forest;
  ctx.fillRect(0, h - m * 0.018, w * 0.33, m * 0.018);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(w * 0.33, h - m * 0.018, w * 0.1, m * 0.018);
}

function drawBadge(ctx: Ctx, w: number, h: number, input: RenderInput): void {
  const { text, fonts, locale, member } = input;
  const m = Math.min(w, h);
  badgeBackground(ctx, w, h);

  const headline = (maxWidth: number, size: number, gap: number) =>
    textBlock(ctx, {
      text: input.headline,
      family: fonts.sans,
      size,
      weight: 800,
      color: COLORS.navy,
      maxWidth,
      balance: true,
      lineHeight: 1.08,
      tracking: -0.01,
      locale,
      gap,
    });
  const line = (maxWidth: number) =>
    textBlock(ctx, {
      text: commitmentLine(input),
      family: fonts.sans,
      size: 2.3,
      weight: 700,
      color: COLORS.forest,
      tracking: 0.14,
      maxWidth,
      balance: true,
      lineHeight: 1.5,
      locale,
      gap: input.periodLabel ? 1.2 : 3.6,
    });
  // Self-set time frame, e.g. "30 days · Nov 26 – Dec 25, 2026".
  const period = (maxWidth: number) =>
    input.periodLabel
      ? textBlock(ctx, {
          text: input.periodLabel,
          family: fonts.sans,
          size: 1.8,
          weight: 600,
          color: COLORS.muted,
          tracking: 0.04,
          maxWidth,
          fit: true,
          locale,
          gap: 3.6,
        })
      : null;
  const name = (maxWidth: number) =>
    textBlock(ctx, {
      text: member.displayName,
      family: fonts.sans,
      size: 4.4,
      weight: 700,
      color: COLORS.ink,
      maxWidth,
      fit: true,
      locale,
      gap: 1,
    });
  const memberLine = (maxWidth: number, gap: number) =>
    textBlock(ctx, {
      text: `${text.badge.member}  ·  ${member.id}`,
      family: fonts.sans,
      size: 1.7,
      weight: 600,
      color: COLORS.muted,
      tracking: 0.1,
      maxWidth,
      fit: true,
      locale,
      gap,
    });
  const qr = (size: number) =>
    qrBlock(ctx, {
      url: input.url,
      size,
      fg: COLORS.navy,
      bg: COLORS.white,
      caption: qrCaption(input),
      captionColor: COLORS.muted,
      family: fonts.sans,
      captionSize: 1.5,
      locale,
    });
  const org = (gap: number) =>
    textBlock(ctx, {
      text: text.orgLocalName ? `${text.orgLocalName}  ·  ${text.orgName}` : text.orgName,
      family: fonts.sans,
      size: 1.9,
      weight: 700,
      color: COLORS.navy,
      tracking: 0.28,
      maxWidth: 1e6,
      locale,
      gap,
    });

  if (isWide(w, h)) {
    // Split layout: brand column on the left, message on the right.
    const pad = m * 0.09;
    const leftW = w * 0.34;
    const left: Box = { x: pad * 0.6, y: pad, w: leftW, h: h - pad * 2 };
    const right: Box = { x: leftW + pad * 0.4, y: pad, w: w - leftW - pad * 1.2, h: h - pad * 2 };
    const u0 = m / 100;
    layoutStack([logoBlock(ctx, { size: 30, colors: logoColors("color"), gap: 4 }), qr(15)], left, u0);
    ctx.save();
    ctx.fillStyle = COLORS.goldSoft;
    ctx.fillRect(leftW + pad * 0.05, pad * 1.2, Math.max(1, m * 0.003), h - pad * 2.4);
    ctx.restore();
    layoutStack(
      [
        org(3),
        headline(right.w, 11, 3),
        line(right.w),
        period(right.w),
        dividerBlock(ctx, { width: 10, thickness: 0.35, color: COLORS.gold, gap: 3 }),
        name(right.w),
        memberLine(right.w, 0),
      ],
      right,
      u0,
      { spread: 0.3 },
    );
    return;
  }

  const pad = m * 0.085;
  const box: Box = { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2 - m * 0.02 };
  layoutStack(
    [
      logoBlock(ctx, { size: 15, colors: logoColors("color"), gap: 2.4 }),
      org(5),
      headline(box.w, 10.5, 3.4),
      line(box.w),
      period(box.w),
      dividerBlock(ctx, { width: 9, thickness: 0.35, color: COLORS.gold, gap: 3.6 }),
      name(box.w),
      memberLine(box.w, 5),
      qr(10.5),
    ],
    box,
    unit(w, h),
    { spread: 0.55 },
  );
}

// ---------------------------------------------------------------------------
// Commitment — forest green, personal statement in serif
// ---------------------------------------------------------------------------

function drawCommitment(ctx: Ctx, w: number, h: number, input: RenderInput): void {
  const { text, fonts, locale, member } = input;
  const m = Math.min(w, h);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#4C9378");
  bg.addColorStop(1, COLORS.forestDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Big leaf watermark bleeding off the right edge.
  ctx.save();
  ctx.globalAlpha = 0.08;
  const lw = m * 1.1;
  drawLogo(ctx, w - lw * 0.62, h - lw * 0.78, lw, { ring: COLORS.white, leaf: COLORS.white, vein: "transparent" });
  ctx.restore();

  // Inner rounded frame.
  const p = m * 0.04;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = m * 0.002;
  roundRect(ctx, p, p, w - 2 * p, h - 2 * p, m * 0.03);
  ctx.stroke();
  ctx.restore();

  const statement = (member.statement || "").trim() || text.commitment.defaultStatement;
  const pad = m * 0.1;
  const box: Box = { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2 };
  const chips = input.practices;

  layoutStack(
    [
      logoBlock(ctx, { size: 8.5, colors: logoColors("white"), gap: 2 }),
      textBlock(ctx, {
        text: text.commitment.title,
        family: fonts.sans,
        size: 2.1,
        weight: 700,
        color: COLORS.goldSoft,
        tracking: 0.32,
        maxWidth: box.w,
        locale,
        gap: 3,
      }),
      textBlock(ctx, {
        text: "“",
        family: fonts.serif,
        size: 12,
        weight: 600,
        color: COLORS.goldSoft,
        alpha: 0.8,
        lineHeight: 0.8,
        maxWidth: box.w,
        locale,
        gap: 0.5,
      }),
      textBlock(ctx, {
        text: statement,
        family: fonts.serif,
        size: 5,
        weight: 500,
        style: "italic",
        color: COLORS.white,
        maxWidth: box.w * 0.94,
        balance: true,
        lineHeight: 1.32,
        maxLines: 7,
        locale,
        gap: 4,
      }),
      chips.length
        ? chipsBlock(ctx, {
            labels: chips,
            family: fonts.sans,
            size: 1.7,
            color: COLORS.white,
            border: "rgba(255,255,255,0.7)",
            fill: "rgba(255,255,255,0.08)",
            maxWidth: box.w,
            gap: input.periodLabel ? 1.8 : 4,
          })
        : null,
      input.periodLabel
        ? textBlock(ctx, {
            text: input.periodLabel,
            family: fonts.sans,
            size: 1.8,
            weight: 600,
            color: COLORS.goldSoft,
            tracking: 0.04,
            maxWidth: box.w,
            fit: true,
            locale,
            gap: 4,
          })
        : null,
      dividerBlock(ctx, { width: 9, thickness: 0.3, color: COLORS.gold, gap: 3 }),
      textBlock(ctx, {
        text: member.displayName,
        family: fonts.sans,
        size: 3.8,
        weight: 700,
        color: COLORS.white,
        maxWidth: box.w,
        fit: true,
        locale,
        gap: 0.9,
      }),
      textBlock(ctx, {
        text: text.commitment.supported,
        family: fonts.sans,
        size: 1.8,
        weight: 500,
        color: COLORS.goldSoft,
        tracking: 0.06,
        maxWidth: box.w,
        locale,
        gap: 4.5,
      }),
      qrBlock(ctx, {
        url: input.url,
        size: 9.5,
        fg: COLORS.forestDeep,
        bg: COLORS.white,
        caption: qrCaption(input),
        captionColor: "rgba(255,255,255,0.85)",
        family: fonts.sans,
        captionSize: 1.4,
        locale,
        gap: 2.4,
      }),
      textBlock(ctx, {
        text: text.commitment.note,
        family: fonts.sans,
        size: 1.3,
        style: "italic",
        color: "rgba(255,255,255,0.65)",
        maxWidth: box.w,
        locale,
      }),
    ].filter(Boolean) as Block[],
    box,
    unit(w, h),
    { spread: 0.5 },
  );
}
