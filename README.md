<p align="center">
  <img src="public/logo/ola-mark-color.svg" width="96" alt="Open Life Alliance logo" />
</p>

<h1 align="center">Open Life Alliance</h1>

<p align="center"><b>Your life. Your choice.</b><br/><i>Live free. Live well.</i></p>

<p align="center">
  English · <a href="#中文简介">中文</a>
</p>

---

Open Life Alliance is an open, voluntary, community-built initiative for healthier, freer living.
We stand for everyone's right to say no to smoking, drinking and unhealthy habits — at work, at
the dinner table, anywhere — and for respect toward everyone, whatever they choose.

This repository is the alliance's website. Anyone can join for free in under a minute and
get a beautiful, personal membership card to share on social media.

> Open Life Alliance is an independent, community-driven initiative. Membership represents
> voluntary support for its principles and does not constitute government, medical,
> religious, or legal certification.

## Why

In many workplaces and social circles, drinking and smoking are treated as obligations. Many
people quietly wish it were different. A shared, visible sign — "I choose differently, and I'm
not alone" — makes saying *no, thank you* easier for everyone.

## What V1 does

- **Website** — mission, principles, community and legal pages, in English and Simplified Chinese.
- **Free membership** — a nickname is enough. No account, no real name, no email.
- **Member ID** — `OLA-2026-7K3M9QX2`, random (never sequential), generated on the device.
- **Your own way of living** — pick from ten presets (smoke-free, alcohol-free, early to bed,
  running, …) or write your own, and optionally set a time frame (e.g. 30 days) shown on the card.
- **Card generator** — three styles (Classic certificate, Social badge, Personal commitment),
  five sizes (A4 print, 1:1, 4:5, 1.91:1, 9:16), drawn on a `<canvas>` and exported as PNG.
  Each card carries a QR code back to the site.
- **Sharing** — download, native share sheet (Web Share API), copy share text, and a
  long-press-to-save path for WeChat and other in-app browsers.
- **Privacy by design** — no database, no trackers. Everything stays in the visitor's browser.

## Tech stack

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript, **static export** | Familiar to contributors; outputs plain files any host can serve |
| Styling | Tailwind CSS v4 | No component library needed for this scope |
| i18n | next-intl, one JSON file per language | Adding a language = one file + one config line |
| Cards | Canvas 2D + `qrcode` | Reliable fonts on mobile Safari / in-app browsers (see [docs/DECISIONS.md](docs/DECISIONS.md)) |
| Fonts | Inter, Playfair Display, Noto Sans SC, Noto Serif SC via Fontsource (OFL) | Self-hosted, unicode-range subsets |
| Icons | Lucide | |
| Tests | Vitest + `scripts/check-i18n.mjs` | |

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

```bash
npm run build        # static site in ./out
npm start            # serve ./out locally
npm test             # unit tests
npm run check:i18n   # verify all language files are complete
npm run lint && npm run typecheck
node scripts/generate-brand-assets.mjs   # regenerate logo PNGs, favicon, OG image
```

Configuration (optional) — copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL used in share text and card QR codes (defaults to the current origin) |
| `NEXT_PUBLIC_REPO_URL` | GitHub link in the footer |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public project contact address |

## Deploy

`npm run build` produces a fully static site in `out/`. Deploy that folder to any static host:

- **Cloudflare Pages** — build command `npm run build`, output directory `out`.
- **Vercel** — import the repo; it detects Next.js static export automatically.
- **GitHub Pages / Netlify / any web server** — upload `out/`.

For visitors in mainland China, use a custom domain; default `*.vercel.app` / `*.pages.dev`
domains are often unreachable there.

## Project structure

```text
messages/            one JSON file per language (all user-visible text)
public/logo/         generated logo files (SVG + PNG); see docs/BRAND.md
scripts/             i18n checker, brand asset generator
src/app/[locale]/    pages: home, about, join, card, privacy, terms
src/components/      layout, brand, membership form, card studio
src/i18n/            locale list (single source of truth) and next-intl setup
src/lib/member.ts    local member record and ID generation
src/lib/card/        canvas card renderer: templates, layout engine, fonts, QR
docs/                product, design, decisions, roadmap
```

## Contributing

Translations, code, designs and ideas are all welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
Every change goes through a pull request and is published only after a maintainer approves it —
see [GOVERNANCE.md](GOVERNANCE.md). Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and
[Charter](CHARTER.md).

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md). In short: **V1** website and cards → **V2** optional
accounts and personal habit tracking → **V3** open community → **V4** open governance and,
possibly, a legal entity.

## License

- Code: [MIT](LICENSE)
- Written content (mission, principles, translations): [CC BY 4.0](LICENSE-CONTENT.md)
- Name and logo: see [TRADEMARK.md](TRADEMARK.md) — free to use for talking about the
  alliance, not for implying you speak for it.

---

## 中文简介

**健康自主倡议（Open Life Alliance）** 是一个开放、自愿、由社区共建的健康自由生活倡议。我们主张每个人都有权在职场、饭桌和任何场合拒绝烟酒与不健康的习惯，同时尊重每一个人的选择。

本仓库是倡议的官方网站：任何人都可以免费加入，一分钟内获得一张精美的个人支持者卡片，并分享到朋友圈或其他社交媒体。

- 无需账号、无需真名、无需邮箱，所有信息只保存在你自己的浏览器中；
- 自选生活方式：无烟、无酒、早睡、跑步等十个选项，也可以自己写，并可设定期限（如 30 天）；
- 三种卡片风格、五种尺寸，均带有回到官网的二维码；
- 支持下载、系统分享、复制分享文案，以及在微信内“长按保存图片”；
- 目前支持英文与简体中文，新增一种语言只需要翻译一个 JSON 文件。

本地运行：安装 Node.js 20+ 后执行 `npm install`，再执行 `npm run dev`。欢迎参与翻译、开发与设计，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。
