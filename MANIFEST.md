# Compact Next Move Intelligence card - manifest

CHANGED (layout only):
- src/screens/NextMoveHomeCard.jsx
- src/screens/home/EquityHomeDesktop.jsx  (card shell padding 14/16 -> 10/14, heading gap 12 -> 7)
- src/screens/home/EquityHomeLaptop.jsx   (same)
No change to NextMoveEngine, NextMoveHomeView, hooks, translations, data sources. No new files, dependencies or env vars.

## What changed
- Bias smaller (24px -> 17/18px), headline on the same row.
- Price + % change + source/as-of on one row.
- Support/Resistance boxes: less padding, smaller values (still 16-17px).
- ONE status row: data status (LIVE/DELAYED...), setup confirmation, confidence.
- Basis + disclaimer merged into one small line; stale-data warning kept as is.
- Detailed Analysis stays collapsed, button 44px high.

## Measured (Playwright, fixture data, card incl. heading)
Mobile 390 (card 366 wide): 302px -> 231px (-23.5%)
Desktop 1366/1440: 322px -> 223px (-31%)
Stale-data case: 321 -> 248 (mobile), 342 -> 241 (desktop)
Overflow/clipping checks: 60 combos (5 languages x 390/1366/1440 x light/dark x 2 states) 0 problems.
## Tests
node --test tests/*.test.mjs : 649/649 pass. esbuild bundle of src/main.jsx OK.
`npm run build` / vite build NOT run (npm install fails offline). Run it before deploying.
## Not verified
Real phone, real provider data (fixtures only). Mobile heading shell (shared Card) untouched, so mobile saving is a bit under 25%.
