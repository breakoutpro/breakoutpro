# Home dashboard rebuilt to the reference (desktop + mobile)
NEW: src/hooks/useHomePcr.js, src/screens/home/HomeStrips.jsx (Crude/Gas/Flash News strip + Sector strip), src/screens/home/HomeCalculator.jsx
REWRITTEN: src/screens/home/HomeHub.jsx (dashboard body), src/screens/home/HomeMarketTiles.jsx (4 index cards with sparkline, PCR, state)
EDITED: src/screens/home/EquityHome{Mobile,Tablet,Desktop,Laptop}.jsx (render HomeHub with mm; slim ticker removed from Home), api/market-mood-data.js (additive: ltp on global/sector items and natGas)
TESTS: tests/home-ui-fixes.test.mjs, market-ticker.test.mjs, theme.test.mjs (updated to the new Home)
DELETE if you deployed the earlier mobile-polish zip: src/screens/home/MobileNewsSectorTicker.jsx (replaced by HomeStrips.jsx). src/screens/home/HomeSearch.jsx is now unused (left in place).
Needs earlier zips already applied: AuthScreen/HeaderAuth/App.jsx (home-final.zip).
## Data honesty
- Crude is WTI (CL=F) and gas is NYMEX (NG=F), both USD from the existing global feed: labelled WTI / NYMEX, not Brent / MCX (no verified Brent or MCX source exists). Non-LIVE shows (delayed)/(stale); missing shows Unavailable.
- Sparklines: server daily closes (indexHistory). PCR: OI+PCR service for NIFTY/BANKNIFTY, shown only if returned (STALE marked delayed). VIX tag Calm/Elevated uses Market Mood engine thresholds.
- Sector Top/Weakest from sectors feed; STALE rows skipped. Headlines from /api/news, rotate 10s, pause on hover/focus/touch.
- Calculator starts empty; Risk = |Entry-SL| x Qty; invalid input shows "--".
## Tests
- node --test 651/651 pass; esbuild bundle of src/main.jsx OK.
- Real App in Chromium (mocked /api) at 360/390/430/1366/1440/1920: 87 checks pass (layout rows/grids, no overflow, no strip overlap, footer above nav, card/news/sector navigation, calculator maths+validation, news rotation+touch pause, logged-out header, honest unavailable states).
- Not run: vite build (offline); live APIs; reference compared by eye only.
