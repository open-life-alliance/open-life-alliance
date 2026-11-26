# Technical and product decisions

Short records of choices that are not obvious from the code. Newest first.

## D8 · Members choose their own way of living, with an optional time frame

Smoke-free and alcohol-free are two options among many. Members pick any of ten presets
(smoke-free, alcohol-free, early to bed, running, exercise, healthy eating, less sugar, less
screen time, reading, meditation) and can write their own (max 24 characters). A card shows at
most five choices so it stays readable.

An optional, self-set time frame — ongoing, 7/21/30/100/365 days or a custom number, with a
start date — is printed on badge and commitment cards (e.g. "30 days · Nov 26 – Dec 25, 2026").
It is a personal goal only; nothing tracks or checks it (tracking is a V2 idea). Dates and
plurals are formatted with `Intl` and ICU messages so every language gets correct output.

## D7 · Chinese name: 健康自主倡议

- Not 联盟 ("alliance") / 会员: in mainland China, an unregistered group that calls itself
  联盟/协会 and recruits 会员 may be treated as an unregistered social organization. Members are
  called 支持者 (supporters).
- Not 开放生活 (a literal "open life"): in Chinese it can suggest open relationships.
- Not 健康生活倡议: too close to many official public-health campaigns, hard to distinguish.
- Not 自在生活: 自在 carries a Buddhist association (观自在).

健康自主 = health + self-determination, which matches the motto "Your life. Your choice."
The English brand stays "Open Life Alliance". Other languages may choose their own local name
the same way (see CONTRIBUTING.md); it lives in `card.orgLocalName` and `meta.orgName`.

## D9 · Tone: positive and about yourself, never against others

Copy talks about what a member chooses ("a little better every day", "at my own pace"), not
what they refuse or who they oppose. Lines such as "No is a full sentence" or "Healthy doesn't
need to fit in" were tried and dropped: they set healthy living against other people. Badge
headlines are a fixed, reviewed list (`card.badge.headlines`) — members pick one, they do not
write their own, so every card stays warm and on-brand.

## D6 · Default badge text does not claim abstinence

The social badge says "I choose a better life" and always ends with "AT MY OWN PACE".
"SMOKE-FREE" / "ALCOHOL-FREE" appear only when the member selects those intentions. This keeps
the promise that joining never requires having quit, or promising to quit.

## D5 · Real `<img>` previews, not a live canvas

The studio renders the card to a PNG and shows it as an `<img>`. WeChat and many in-app
browsers block downloads; long-pressing an image to save it is the only reliable path there.
In those browsers we hide the download button and show a long-press hint instead.

## D4 · A QR code on every card

A shared image without a way back to the site breaks the growth loop
(visit → join → share → new visitor). Each card carries a QR code to `/<card language>/`
and the site's host name.

## D3 · Canvas 2D instead of HTML-to-image

Libraries such as html-to-image rasterise HTML through an SVG `<foreignObject>`. On iOS Safari
and in-app webviews this frequently drops web fonts (CJK in particular) or produces blank
images. Canvas 2D draws with any font the page has loaded and behaves the same everywhere.
To make sure the right glyphs are present, `ensureFonts()` calls `document.fonts.load()` with
the exact text of the card before drawing, which downloads only the needed unicode-range
subsets of the CJK fonts.

Layout is handled by a ~100-line "stack" engine (`draw-utils.ts`): blocks are measured at a
unit size; if they overflow, the unit shrinks. This lets one template serve every aspect ratio.

## D2 · Template × size matrix is curated, not complete

Three templates × five sizes would be fifteen layouts to keep beautiful. Instead:
Classic → A4, 1.91:1, 1:1; Badge → 1:1, 4:5, 9:16, 1.91:1 (split layout); Commitment → 1:1,
4:5, 9:16.

## D1 · Static site, no backend, member data in the browser

V1 is `output: "export"`: plain files, deployable anywhere, nothing to secure or pay for, and
no personal data held by the project. Member IDs (`OLA-YYYY-XXXXXXXX`, 40 random bits in
Crockford Base32) are generated with `crypto.getRandomValues`. They are not guaranteed unique
across devices and cannot be verified — this is stated in the UI and the terms. Server-side
IDs and verification are planned for V2.

Also: no shadcn/ui (Tailwind alone is enough at this scope), next-intl for i18n because it
supports static export, ICU messages and is widely known.
