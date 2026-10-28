# Home page clarity redesign - manifest

NEW (src/screens/home/): HomeCard.jsx, HomeRange.jsx, HomeBreakouts.jsx, HomeSmartAlerts.jsx, HomeMore.jsx
CHANGED: EquityHomeMobile.jsx, EquityHomeTablet.jsx, EquityHomeLaptop.jsx, EquityHomeDesktop.jsx,
 src/screens/NextMoveHomeCard.jsx (compact card from the previous ZIP, included so one upload is enough),
 src/i18n/lang/en.js te.js hi.js kn.js ta.js (6 new home.* keys each),
 tests/theme.test.mjs (one test updated: Range/Breakouts/Alerts now live in shared components; it now checks every layout renders them)

## Setup
Upload every file to the SAME path in GitHub (new files are added, others replaced). No new dependencies or env vars. Do not delete anything. Not deployed.

## What changed
- Order on every layout: Next Move Intelligence, Range Intelligence, Live Breakouts, Smart Market Alerts entry (opens the existing Smart Alerts screen), then quick actions.
- One shared card shell (HomeCard): same radius 12, padding, border, heading size, blue "View" action. No blur, no gradient, only a faint light-theme shadow.
- Desktop/Laptop: two balanced columns, equal-height rows. Tablet: same cards. Mobile: the secondary cards (Breadth, FII/DII, Global, Key Levels) moved into one collapsed "More market data" group; nothing deleted.
- Live Breakouts now keeps 3 states apart: scanning / unavailable (request failed, with "this does not mean there are no signals") / scan done with 0 matches. Shows "Daily candles, delayed data. Updated <time>".
- Range card: same zone/state rules and numbers, now shared by all layouts, with Support/Resistance captions.
- Ticker, market-status badge, calculations, API routes, alerts, themes, language switching untouched. No new API, no fake values.

## Results (actual)
- node --test tests/*.test.mjs : 649/649 pass. esbuild bundle of src/main.jsx OK.
- `npm run build` / vite build NOT run (npm install fails offline). Run it on Vercel preview before going live.
- Playwright screenshots of the real Home router, mocked /api responses (fixtures): 390, 820, 1366, 1440 x light/dark x scan ok/none/fail = 24 combos, 0 page overflow, 0 errors. Languages te/hi/kn/ta at all four widths: 0 problems.
- Not verified: real phone, real provider data, 1366x768 exact browser chrome height (viewport 1366x768 used).
## Limitations
- Desktop Home has only these 4 cards plus quick actions, so the lower half of a 900px screen is empty (the other cards were removed from desktop Home earlier on purpose).
- Tablet still shows the existing Market Snapshot card after the four main cards.
- The card title "Market Alerts" keeps the existing translation text.
