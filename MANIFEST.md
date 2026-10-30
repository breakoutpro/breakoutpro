# BreakoutPro - Complete Intelligence Home (reference-image upgrade) - MANIFEST

## Files
Added: src/screens/home/HomeTicker.jsx (slim market ticker), HomeSetups.jsx (hero setups), HomeAudioBrief.jsx (1-min audio brief), HomePanels.jsx (desktop NIFTY / sentiment / sector panels), src/state/audioBriefModel.js, src/hooks/useBreakoutSetups.js, src/hooks/breakoutSetupsModel.js, src/screens/LargeCapMovers.jsx (Top Gainers & Losers), src/screens/RiskTargetCalc.jsx + riskTargetMath.js (calculator moved from Home to Tools, math unchanged), tests/home-intelligence.test.mjs
Changed: src/screens/home/HomeHub.jsx (new Home layout, 8-button grid), HomeStrips.jsx (JUST IN, pause control, source/time), src/App.jsx (movers route/KNOWN_TABS, desktop More menu "Risk Calculator"), src/screens/InlineScreens.jsx (Tools "Risk & Target" pill), src/i18n/lang/en.js, tests/home-ui-fixes.test.mjs, market-ticker.test.mjs, theme.test.mjs
DELETE from repo: src/screens/home/HomeMarketTiles.jsx, src/screens/home/HomeCalculator.jsx

## Feature inventory
Already working (reused, unchanged): breakout scanner (/api/scanner-data), OI chain + PCR (dataService), Options Intelligence Pro, Chart Pattern Scanner, Stock Research Pro, Strategy Builder, Backtesting, News (/api/news), market-mood data (/api/market-mood-data), Tools, Next Move, themes, auth, routing.
Needs UI integration (done): Home ticker, JUST IN, setups, quick grid, side panels, calculator in Tools.
New implementation (done): audio brief (browser speechSynthesis), Top Gainers & Losers (shared quote store, NIFTY 50), news pause/resume control.
Needs data provider / NOT implemented (no verified source in repo; not faked): MCX Crude/Nat Gas in INR (Home shows WTI and NYMEX in USD, labelled), GIFT NIFTY, intraday (15m/1h) setups on Home, Conflicting setup state (classifier has none), TradingView-style interactive chart on Home (Home shows daily-close line only, labelled), order-flow/footprint, bulk/block deals, Screener/Tijori/Trendlyne-style fundamentals, results calendar on Home, live broker execution (intentionally absent).

## Preserved / improved / added
Preserved: all routes and screens (VWAP+9EMA scalper, OI, alerts, etc. stay reachable from More), calculations, auth, themes (light/dark/AMOLED), language. Improved: Home. Added: items above.
Home states: setups are Confirmed (after close), Waiting (market open, candle forming) or Unavailable (request failed); empty = "No confirmed setups right now."; data labelled "Daily candles, delayed, not live".
Audio brief: hidden unless the browser supports speech AND there is verified text; uses device TTS (voice and availability depend on the device).

## APIs reused
/api/market-mood-data, /api/news (single request via App hook), /api/scanner-data, option-chain service (dataService.getExpiryList/getOptionChain), shared quote store (useQuotes). No new API, dependency or secret.

## Tests run
- node --test tests/*.test.mjs : 658 pass, 0 fail (logic + source-structure tests).
- esbuild bundle of src/App.jsx: OK. `vite build`: NOT run (npm install is offline here).
- Playwright against the bundled real App with MOCKED /api (and a stubbed speechSynthesis) at 360x800, 390x844, 430x932, 768x1024, 1366x768, 1440x900, 1920x1080: 187 checks, 0 fail (overflow per element, ticker one line/scroll, JUST IN rotation/pause/resume/hover/focus/touch/navigation, setup states, 8-button navigation, audio play/pause/resume/stop, no-speech hide, side panels, Tools calculator, missing news/commodities, delayed not LIVE, dark theme, no page errors).
- AMOLED theme and the 3 other languages were not browser-tested here.
- NOT verified against real providers (no network access to them from this workspace): every value above came from mocks.

## Limitations
Setups are daily-candle only (20 NIFTY large caps), so no 15m timeframe like the reference image. Mobile Home shows up to 3 setup cards, so the quick grid sits below the first screen. Browser speech quality varies by device.
