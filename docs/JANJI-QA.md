# JANJI acceptance — 22 October 2026

## v2 — Botani Elegan

- User reference inspected in browser: TrulyInvite Naz & Shah. New flow uses a sealed envelope, narrow vertical invitation and bottom guest dock with independent original botanical artwork.
- Full-suite run passed all 24 existing burgundy cases. Final targeted JANJI run passed all 13 cases after fixing direct-anchor alignment when assets fail; 37 current cases covered across these runs.
- `pnpm build` passed. Production preview verified at 1440 and 390px: opening, fonts/images, gallery photos, direct RSVP load/refresh and catalog; no page errors or failed responses.
- Responsive cases cover 320/390/768/1440px, no horizontal overflow and card maximum width 500px.
- Envelope tested with motion on/off and a mid-session reduced-motion change. No audio plays before opening; opening starts the single player, with direct-entry autoplay fallback and manual pause preserved.
- Contact/gift sheets, Tab containment, Escape/focus return, bottom navigation and RSVP/wishes in-memory behavior passed.
- Screenshot catalog updated to the actual new card, after opening the seal. Visual review includes final desktop title card and full mobile invitation with photos decoded.
- Floral source and exact built-in imagegen prompt retained. Former editorial implementation archived at `template/janji-editorial-v1`.
- Existing Klasik Elegan files were not changed by this redesign. No new domain/deployment configured.

## v1 — historical editorial implementation

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
