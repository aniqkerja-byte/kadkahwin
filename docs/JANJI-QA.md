# JANJI acceptance — 22 October 2026

- `pnpm build`: successful three-page production build.
- Existing 23 burgundy Playwright cases: passed in the complete suite run. No original burgundy HTML, CSS, renderer, music, transition or content file changed from `9012aea`.
- `pnpm test tests/editorial.spec.js --workers=2`: all 12 JANJI/catalog cases passed after the final fixes.
- Responsive checks: 320, 390, 768 and 1440px; assets loaded, no horizontal overflow or heading/button/nav clipping. Catalog screenshot aspect ratios verified.
- Production preview on port 4180: `/`, `/editorial/`, `/editorial/#rsvp` and `/koleksi/` loaded and refreshed without failed responses or page errors.
- Desktop and phone visual review: hero crops, consistent couple identity/wardrobe, gallery, timeline, dress swatches, location, RSVP and catalog previews checked.
- RSVP: empty fields, guest counts 0/100/fractional, valid attendance and non-attendance, inline result/focus and no network writes/browser storage checked.
- Calendar: downloaded ICS verified as the 22 May 2027 event, 03:00–08:30 UTC (11:00–16:30 Malaysia). Countdown boundaries before, during and after checked.
- Audio: browser autoplay allowed/blocked, first-interaction fallback, manual pause across anchors, seek and single audio element checked.
- Lightbox: previous/next, arrow keys, Escape, Tab containment and focus return checked. Explicit Tab wrap added after initial QA found focus could leave the dialog for browser chrome.
- Motion: 2.4s hero animation, usable navigation during opening, no replay on anchors, reduced-motion preference changes and reload checked.
- Images failing to load do not block direct RSVP navigation or submission.
- Catalog screenshots captured from actual finished pages; no audio element in catalog. A preview image sizing issue found during visual QA was corrected before delivery.

Local review screenshots are ignored under `review/janji/`. Committed catalog screenshots are in `public/assets/catalog/`; original generated photos and exact prompts are retained in the repo. No domain or deployment connection was created.
