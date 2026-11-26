# Brand

## Logo

An **open ring** (a life with room to grow) and a **leaf breaking out through the opening**
(choosing freely). It is defined once, as SVG path data, in `src/lib/brand.ts`. The website
(`<LogoMark />`), the card renderer and `scripts/generate-brand-assets.mjs` all read that single
definition — never redraw the mark by hand.

| File | Use |
|---|---|
| `public/logo/ola-mark-color.svg` / `-512.png` / `-1024.png` | Default, on light backgrounds |
| `public/logo/ola-mark-on-dark.*` | On navy or dark photos (gold ring, white leaf) |
| `public/logo/ola-mark-white.*` | Single-colour white |
| `public/logo/ola-mark-black.*` | Single-colour dark, print |
| `public/logo/ola-avatar-1024.png` | Social media profile picture |
| `public/favicon.svg`, `public/logo/favicon-32.png`, `apple-touch-icon.png` | Browser icons |

Regenerate with `node scripts/generate-brand-assets.mjs` after changing `brand.ts`.

## Colours

| Token | Hex | Use |
|---|---|---|
| navy | `#17364A` | Primary, headings, dark sections |
| forest | `#43856C` | Actions, positive accents |
| gold | `#C5A66A` | Highlights, certificate details |
| paper | `#F7F8F6` | Page background |
| ink | `#202B32` | Body text |
| muted | `#71808A` | Secondary text |

## Type

- UI: **Inter** (+ **Noto Sans SC** for Chinese)
- Display / certificates: **Playfair Display** (+ **Noto Serif SC**)

All fonts are under the SIL Open Font License and self-hosted via Fontsource.

## Tone

Warm, confident, non-judgmental. We celebrate choices; we never shame. Avoid religious imagery,
medical claims, and anything that looks like an official certificate of authority.
