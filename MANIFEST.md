# Home page - reference design (hero + six cards) - manifest

NEW: src/screens/home/HomeHub.jsx
CHANGED: src/screens/home/EquityHomeMobile.jsx, EquityHomeTablet.jsx, EquityHomeLaptop.jsx, EquityHomeDesktop.jsx
 src/App.jsx (ONE line: "breakoutscan" added to KNOWN_TABS)
 src/i18n/lang/en.js te.js hi.js kn.js ta.js (2 keys each: home.tagline, home.hub_alerts)
 tests: home-next-move, next-move-ui, theme, home-ui-fixes (updated to the new Home spec, see below)

## Setup
Upload each file to the SAME path in GitHub. No new dependencies or env vars. Not deployed.
Files from my previous Home ZIP are NOT needed any more: HomeCard.jsx, HomeRange.jsx, HomeBreakouts.jsx, HomeSmartAlerts.jsx, HomeMore.jsx (if you already uploaded them you may delete them; unused files do no harm) and the 6 extra i18n keys from that ZIP are replaced by these lang files.

## What the Home page is now
- Existing header/logo/top navigation and the slim ticker (rendered by App.jsx on desktop, in the layout on mobile/tablet) are untouched, so ticker freshness handling is unchanged.
- Centred "Breakout Pro" heading + tagline on a light sky-blue gradient with a soft wave (dark navy variant in dark theme).
- Six cards, 3 columns on tablet/desktop, 2 on mobile, white translucent, rounded, soft shadow, blue line icons + chevron:
  Next Move Intelligence -> marketmood, Range Intelligence -> rangeintel, Live Breakouts -> breakoutscan,
  Smart Market Alerts -> alerts, Scan Breakouts -> scanner (Scanner hub), Learn Patterns -> learn.
- Home shows no market value, signal, panel or commentary of its own. NextMoveHomeCard.jsx is now unused by Home (file kept, not deleted); engines, APIs and the Next Move / Range / Breakouts pages are untouched. The full Next Move analysis and its delayed-data warnings are on the Next Move page (first card).
- Small footer line kept: educational / not investment advice.
- Desktop/Laptop layouts no longer start their own data hooks (less polling); Mobile/Tablet keep useHomeData only for the ticker.

## Fix found on the way
"breakoutscan" was missing from KNOWN_TABS in App.jsx, so opening Live Breakouts also rendered the More screen. Added it (one word).

## Tests changed on purpose
Four old tests asserted that every Home layout contains the Next Move panel / the old cards. That is exactly what you asked to remove, so they now assert: every layout renders HomeHub, the hub has the six cards with the right destination, each destination is a real screen and a KNOWN_TAB. No test was loosened otherwise.

## Results (actual)
- node --test tests/*.test.mjs : 649/649 pass. esbuild bundle of src/main.jsx OK.
- `npm run build` / vite build NOT run (npm install fails offline). Run it on a Vercel preview first.
- Browser check (Playwright, real Home router, fixtures): widths 390, 820, 1366x768, 1440x900 x light/dark x en/te/hi/kn/ta = 40 combos: 6 cards, correct 2/3 columns, no page overflow, no clipped card, no errors. Clicking each of the 6 cards at all 4 widths calls setTab with the right destination.
- NOT verified: the full App shell (header/ticker on desktop) was not mounted in the browser check, so the real screen switch after a click is covered by the source test, not by a live click-through; real phone; real provider data.
## Limitations
- Desktop Home is intentionally sparse (6 cards); the lower part of the screen is just background.
- Tablet keeps the same 3-column grid at 768px.
