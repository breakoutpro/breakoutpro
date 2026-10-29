# Mobile overflow fix + combined market strip + Breaking News ticker
src/screens/home/HomeHub.jsx        ROOT CAUSE of the clipping: the hub's grid had no column template, so its single implicit column grew to the widest nowrap child; now gridTemplateColumns minmax(0,1fr). Uses MarketStrip + NewsTicker.
src/screens/home/HomeStrips.jsx     MarketStrip (Crude, Nat Gas, Sector Top/Weakest in ONE row; scrolls inside itself on mobile) and NewsTicker (separate slim Breaking News row, 10 s rotation, pause on hover/focus/touch-hold, hidden when no verified headline). Old CommodityNewsStrip/SectorStrip removed. News comes from the hook App already runs (no extra request).
src/screens/home/HomeCalculator.jsx Mobile: Long/Short toggle on its own full-width row, shrinkable shell (min-width 0); desktop unchanged.
src/App.jsx                         passes liveNews (existing hook result) to Home.
src/screens/home/EquityHome{Mobile,Tablet,Desktop,Laptop}.jsx  pass liveNews to HomeHub.
## Results
- node --test: 651/651 pass; esbuild bundle of src/main.jsx OK; vite build NOT run (npm install offline).
- Real App in Chromium (mocked APIs), 360x800, 390x844, 430x932, 1366x768, 1440x900 (100% zoom): all checks pass, including a per-element check that nothing in Home extends past the viewport (the earlier test only looked at document scroll width, which missed clipping inside the app's scroll box).
- News rotates in ~10 s, hover / keyboard focus / touch-hold pause it, tap opens News, empty news hides the ticker, calculator results unchanged (975 / 854), dark theme fits.
## Notes
- The mobile market strip is wider than the screen on purpose (Crude + Gas + sector); it scrolls sideways inside its own box and the page does not move.
- Live APIs and a real phone not tested.
