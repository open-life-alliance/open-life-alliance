# Contributing to Open Life Alliance

Thank you for helping! Everyone is welcome — you do not need to be a developer.

## Ways to help

| You are good at… | You can… |
|---|---|
| A language | Translate the website and cards ([below](#add-or-improve-a-language)) |
| Code | Fix bugs, improve accessibility and performance, build roadmap features |
| Design | Propose card templates, illustrations, layouts (open an issue with images) |
| Writing | Improve the mission text, FAQs and docs |
| Spreading the word | Share your card, tell us what would make it more shareable |

## Add or improve a language

All user-visible text lives in `messages/<language>.json`. To add a language:

1. Copy `messages/en.json` to `messages/<code>.json`, using a BCP 47 code
   (`es`, `fr`, `ja`, `pt-BR`, `zh-Hant`, `ar`, …).
2. Translate the **values** only — never the keys. Keep `{placeholders}` such as `{url}` and `{max}`.
3. Add an entry to `LOCALES` in `src/i18n/locales.ts`: native name, text direction
   (`"rtl"` for Arabic, Hebrew, Persian, Urdu) and card fonts.
4. If the script needs a font we do not ship yet (e.g. Arabic, Devanagari, Thai), add the
   matching `@fontsource-variable/noto-sans-*` package, import it in `src/app/[locale]/layout.tsx`
   and list it in `cardSans` for your language.
5. Run `npm run check:i18n` — it reports missing or extra keys and mismatched placeholders.
6. Open a pull request. A second native speaker review is very welcome.

Translation tips: keep the tone warm, non-judgmental and short. "Member" may be translated with
a word closer to "supporter" or "participant" if that reads more naturally — or is wiser legally —
in your language/region.

## Code contributions

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run check:i18n && npm run lint && npm run typecheck && npm test && npm run build
```

Guidelines:

- **No hard-coded user-visible text** in components. Add a key to every `messages/*.json` file.
- **Use logical CSS** (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`) instead of
  left/right so right-to-left languages work.
- **Mobile first.** Test at 375px width. The core promise is: a stranger on a phone joins and
  gets a card they want to share in under one minute.
- **Test exported images**, not just the on-screen preview: download the PNG and open it.
- **Privacy:** do not add trackers, third-party scripts or data collection without a discussion
  in an issue first.
- **Keep dependencies few.** Explain any new dependency in the pull request.
- Record notable technical decisions in `docs/DECISIONS.md`.

## Adding a card template

Templates live in `src/lib/card/templates.ts`. Each template is a function that draws on a
canvas of any size using the small stack-layout helpers in `draw-utils.ts`. To add one:

1. Add its id to `TEMPLATE_IDS` in `src/lib/member.ts` and its sizes to `TEMPLATE_FORMATS` in
   `src/lib/card/types.ts`.
2. Implement the drawing function and add it to `drawCard`.
3. Add its name/description under `studio.templates` and any card text under `card` in every
   language file.
4. Every template must show the official name and logo unmodified, and must not imply any
   official, medical, religious or legal certification.

## How your contribution is reviewed

1. Fork the repository and open a pull request to `main` (use the template).
2. Automatic checks run: translations, lint, types, tests and a full build. The first time you
   contribute, a maintainer has to approve running them.
3. A maintainer reviews it. They may approve, ask for changes, or explain why it does not fit.
4. Once approved and merged, it is published with the next deployment of the website.

Nobody — maintainers included — can push straight to `main`. See [GOVERNANCE.md](GOVERNANCE.md).

## Reporting problems

Open a GitHub issue with steps to reproduce, your device and browser (e.g. "iPhone 13, WeChat
in-app browser"), and a screenshot if possible.

By contributing you agree that your code is released under the MIT License and your written
content under CC BY 4.0, and you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
