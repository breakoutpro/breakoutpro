# Dashboard polish (8 items) - changed files (repo-relative)
src/screens/home/HomeMarketTiles.jsx  1 compact status (LIVE only when verified live, else quote time IST); 4 colour from day change (pct, else abs change); 7 card click handler
src/screens/home/HomeStrips.jsx       2 news row/chip/divider not rendered without a verified headline; 8 labels "Crude WTI" / "Gas NYMEX", USD, delayed + IST time
src/screens/home/HomeCalculator.jsx   6 Long/Short selector (Long default), Target 1:2, direction-aware validation
src/screens/home/HomeHub.jsx          passes onOpenIndex; short footer only on large layouts
src/components/DisclaimerTicker.jsx   5 optional wrap mode (static, centred, 10px) - default scrolling strip unchanged
src/App.jsx                           3 header search width (flex 1 1 300, min 280, max 340); 5 wrap mode on mobile Home + 100dvh column on Home; 7 index deep link state
src/screens/Markets.jsx               7 opens the existing IndexFullPage when a Home index card sent it
src/screens/home/EquityHome{Mobile,Tablet,Desktop,Laptop}.jsx  pass onOpenIndex to HomeHub
## Results
- node --test: 651/651 pass; esbuild bundle of src/main.jsx OK; vite build NOT run (npm install offline).
- Real App in Chromium (mocked APIs), 1366/1440/1920 and 360/390/430: 55 checks pass - search placeholder fits, no badges, sparkline colour = day change (both signs), calculator Long/Short maths and rejections, empty-news hidden, index cards open detail pages, mobile disclaimer full/unclipped above nav, calculator visible at scroll end, desktop footer unchanged.
## Honest notes
- No verified MCX natural gas (INR) source exists in the project. Kept NYMEX NG=F in USD, labelled; no conversion.
- Index detail page (IndexFullPage) is the existing screen: its levels/OI/about are its own stored content, not live; only the price and change passed in are live.
- Mobile 100dvh fix could not be reproduced on a real phone browser here (headless Chromium has no collapsing URL bar); verified layout only.
- Live APIs not tested.
