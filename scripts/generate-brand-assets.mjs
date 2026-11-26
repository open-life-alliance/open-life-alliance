/**
 * Generates every logo file in public/ from the single logo definition in
 * src/lib/brand.ts. Run: node scripts/generate-brand-assets.mjs
 *
 * Outputs SVG (color, white, black, on-dark), PNG sizes, favicon and the
 * default Open Graph image. Requires `sharp` (installed with Next.js).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandSrc = await readFile(join(root, "src/lib/brand.ts"), "utf8");
const pick = (key) => brandSrc.match(new RegExp(`${key}: "([^"]+)"`))[1];
const pickNum = (key) => Number(brandSrc.match(new RegExp(`${key}: ([\\d.]+)`))[1]);

const LOGO = {
  ring: pick("ring"),
  leaf: pick("leaf"),
  vein: pick("vein"),
  ringWidth: pickNum("ringWidth"),
  veinWidth: pickNum("veinWidth"),
};

const C = { navy: "#17364A", navyDeep: "#0E2433", forest: "#43856C", gold: "#C5A66A", goldSoft: "#E3D2AC", paper: "#F7F8F6", ink: "#202B32" };

const variants = {
  color: { ring: C.navy, leaf: C.forest, vein: C.paper },
  white: { ring: "#FFFFFF", leaf: "#FFFFFF", vein: null },
  black: { ring: C.ink, leaf: C.ink, vein: null },
  "on-dark": { ring: C.gold, leaf: "#FFFFFF", vein: C.navy },
};

function mark(v, { size = 100, x = 0, y = 0 } = {}) {
  const s = size / 100;
  return `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="${LOGO.ring}" fill="none" stroke="${v.ring}" stroke-width="${LOGO.ringWidth}" stroke-linecap="round"/>
  <path d="${LOGO.leaf}" fill="${v.leaf}"/>${v.vein ? `\n  <path d="${LOGO.vein}" fill="none" stroke="${v.vein}" stroke-width="${LOGO.veinWidth}" stroke-linecap="round"/>` : ""}
</g>`;
}

const svg = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}\n${body}\n</svg>\n`;

const out = (p) => join(root, "public", p);
await mkdir(out("logo"), { recursive: true });
await mkdir(out("images"), { recursive: true });

for (const [name, v] of Object.entries(variants)) {
  const file = svg(100, 100, mark(v));
  await writeFile(out(`logo/ola-mark-${name}.svg`), file);
  for (const px of [512, 1024]) {
    await sharp(Buffer.from(file), { density: 72 * (px / 100) }).resize(px, px).png().toFile(out(`logo/ola-mark-${name}-${px}.png`));
  }
}

// Favicon: slightly thicker strokes read better at 16–32px.
const fav = svg(100, 100, mark(variants.color).replace(`stroke-width="${LOGO.ringWidth}"`, 'stroke-width="10"'));
await writeFile(out("favicon.svg"), fav);
await sharp(Buffer.from(fav), { density: 300 }).resize(32, 32).png().toFile(out("logo/favicon-32.png"));

// Apple touch icon / social avatar: mark on a navy rounded square.
const avatar = svg(180, 180, mark(variants["on-dark"], { size: 130, x: 25, y: 25 }), C.navy);
await sharp(Buffer.from(avatar)).png().toFile(out("logo/apple-touch-icon.png"));
const avatarBig = svg(1024, 1024, mark(variants["on-dark"], { size: 720, x: 152, y: 152 }), C.navy);
await sharp(Buffer.from(avatarBig)).png().toFile(out("logo/ola-avatar-1024.png"));

// Default Open Graph image (1200×630) for link previews.
const og = svg(
  1200,
  630,
  `<rect width="1200" height="630" fill="${C.navy}"/>
  <g opacity="0.07">${mark({ ring: "#FFFFFF", leaf: "#FFFFFF", vein: null }, { size: 760, x: 640, y: -60 })}</g>
  ${mark(variants["on-dark"], { size: 120, x: 90, y: 90 })}
  <text x="90" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="84" font-weight="700" fill="#FFFFFF">Your life.</text>
  <text x="90" y="395" font-family="Georgia, 'Times New Roman', serif" font-size="84" font-weight="700" fill="${C.gold}">Your choice.</text>
  <text x="92" y="470" font-family="'Segoe UI', Arial, sans-serif" font-size="30" fill="${C.goldSoft}">A global community for healthier, freer living.</text>
  <text x="92" y="550" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="#FFFFFF">OPEN LIFE ALLIANCE · JOIN FREE</text>`,
);
await sharp(Buffer.from(og)).png().toFile(out("images/og.png"));

console.log("Brand assets written to public/");
