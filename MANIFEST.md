# Market Ticker - manifest

## Files (repo-relative)
NEW:     src/state/marketTickerModel.js  (pure model: states, labels, IST stamp)
NEW:     src/components/MarketTicker.jsx (compact strip)
NEW:     tests/market-ticker.test.mjs    (17 tests)
CHANGED: src/App.jsx (import; mounted once per layout; desktop sidebar height now subtracts the 41px strip)

## Data source (nothing new added)
Reuses the payload the app already loads from /api/market-mood-data via useMarketMood (NIFTY, BANKNIFTY, SENSEX, VIX with freshness block and session). No new provider, API, credential or dependency, and no extra network request.
- GIFT NIFTY: no verified provider in this project (api/market-mood-data.js says so). Shown as an honest "UNAVAILABLE / Not available" slot, never a number, not tappable.
- 52-week high/low breadth: omitted. Only a per-stock week52 action exists, no verified market-level summary.

## Behaviour
- Five fixed slots (no layout shift); native horizontal scroll (touch, trackpad, keyboard). No marquee, no duplicated track, so nothing depends on animation and reduced-motion is satisfied by design.
- States shown as words, not colour only: LIVE (open session, quote <= 90s old, fetch live), DELAYED, LAST CONFIRMED (stale or cached/offline), CLOSED, UNAVAILABLE, LOADING. Age is recomputed on the client every 15s, so cached or old data cannot stay "live". Each item shows the IST time of the quote.
- Red/green only for index direction. India VIX change is neutral (a VIX rise is not "bad market" in red/green terms). Labels/borders neutral, live marker blue.
- Tap/Enter: NIFTY, BANK NIFTY, SENSEX -> existing "markets" route; INDIA VIX -> existing "marketmood" route. No dedicated per-index detail route exists, so these are the nearest existing screens. Hidden on the full-screen rangeintel route.
- Accessibility: region landmark, scroll strip focusable, items are buttons with full aria-labels, 2px focus outline.

## Results
- node --test tests/*.test.mjs: 502 tests, 502 pass, 0 fail (485 existing + 17 new).
- Real-app Playwright check (Chromium, mocked /api/market-mood-data), 54 checks, 0 failed: 1366x768, 1440x900, 1920x1080, 768x1024, 390x844 - ticker present once, 41px high, no page overflow, no JS errors; 390 and 768 strip scrolls horizontally; bottom nav present below the ticker at 390; keyboard Tab/Enter navigation and focus outline; reduced-motion; light/dark/AMOLED; scenarios live, delayed, stale-while-open, closed, partial (SENSEX missing), API error.
- Regression sweep of all 40 screens at 1366, 1440, 768, 390 with the ticker mounted: 0 flagged.
- Production build: `vite build` NOT run (vite not installed, npm registry unreachable). Full-app esbuild bundle compiled successfully (compile check only).

## Not verified
- No real provider response was tested: all quotes in checks are mocks, so live accuracy of the Yahoo-sourced values and their timestamps is unverified.
- Session "OPEN" in the mock combined with the sandbox clock produced LIVE labels at 21:xx IST; in production the server computes session per request.
- Not checked on a physical phone/touch device (emulated touch only); landscape phone not tested; non-English labels use English fallbacks (no translation packs added).
