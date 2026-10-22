# JANJI — Botani Elegan (v2)

JANJI is a narrow, vertical digital wedding card inspired by the flow of the user's TrulyInvite reference. It replaces the former editorial website layout. Version 1 remains recoverable at tag `template/janji-editorial-v1`. The burgundy Klasik Elegan card is independent.

## Guest flow

1. A sage envelope with HD monogram and champagne wax seal invites the guest to open.
2. Clicking the seal reveals the centered floral title card and starts the existing TULUS excerpt. Reduced motion opens immediately. Ordinary anchor navigation does not replay the envelope.
3. The card flows through family invitation, date/countdown, venue, program/dresscode, prayer, photo memories and RSVP/wishes.
4. A bottom guest dock exposes contact information, location, gift information and RSVP. Contact/gift dialogs explain the demo content without invented phone numbers, payment accounts or QR codes.
5. The footer contains the inline music controls and return link to the catalog. The music player itself scrolls with content.

The same card width is used on desktop (maximum 500px) and phone, with a soft botanical backdrop on wide screens. There is no website navigation header or split hero layout.

## Files and assets

- Entry: `editorial/index.html`; CSS and interaction: `src/editorial/`.
- Palette: ivory paper, olive text, sage envelope and champagne gold details.
- Self-hosted Cormorant Garamond, Great Vibes and Manrope.
- Botanical original: `references/editorial/botanical-v2.png`; web derivative: `public/assets/editorial/botanical-v2.webp`. [Built-in imagegen prompt](janji-botanical-v2-prompt.md).
- Original fictional couple photos remain in `references/editorial/` and are used in the secondary memory gallery. [Photo prompts](janji-image-prompts.md).
- `node scripts/export-botanical.mjs` resizes the botanical PNG with its alpha preserved.
- `node scripts/capture-catalog.mjs` captures actual desktop and phone screenshots, opening the envelope first with reduced motion.

## Data and functions

The couple remains Hana Sofea & Danish Hakimi. Event start/end in `src/editorial/event.js` are 22 May 2027, 11:00–16:30 Malaysia. ICS stores the same instants in UTC (03:00–08:30Z). Countdown switches to ongoing/ended messages.

RSVP reuses `src/rsvp.js`. Name, attendance, pax and optional wishes are kept only in the current form. There is no server, API write, cookie or browser storage; reload clears the form. Confirmation appears inline. The gallery has native modal semantics, Tab containment, arrow keys, Escape and focus return.

Direct valid anchors such as `/editorial/#rsvp` bypass the envelope and align after fonts load. This supports shared links and refresh. Music autoplay on direct entry remains subject to browser policy; first interaction retries, and manual pause is respected.

## Validation

`pnpm test --workers=2` covers the existing burgundy suite and new card flow at 320, 390, 768 and 1440px, envelope/opening, keyboard and reduced motion, guest dialogs/dock, RSVP/wishes, calendar, gallery, audio and failed images. `pnpm build` builds all three independent HTML entries.

No domain or deployment connection was created. Changes are delivered to the existing demo repository.
