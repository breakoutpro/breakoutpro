# Intelligence-First Homepage Redesign - MANIFEST

Added: src/screens/home/HomeTicker.jsx, src/screens/home/HomeSetups.jsx, src/screens/LargeCapMovers.jsx, src/screens/RiskTargetCalc.jsx, src/screens/riskTargetMath.js, src/hooks/useBreakoutSetups.js, src/hooks/breakoutSetupsModel.js, tests/home-intelligence.test.mjs
Changed: src/App.jsx (movers tab/route, KNOWN_TABS, desktop More menu "Risk Calculator"), src/i18n/lang/en.js, src/screens/InlineScreens.jsx (Tools: "Risk & Target" pill), src/screens/home/HomeHub.jsx, src/screens/home/HomeStrips.jsx (JUST IN label, MarketStrip removed), tests/home-ui-fixes.test.mjs, tests/market-ticker.test.mjs, tests/theme.test.mjs
DELETE from repo: src/screens/home/HomeMarketTiles.jsx, src/screens/home/HomeCalculator.jsx (calculator moved to src/screens/RiskTargetCalc.jsx, math unchanged in riskTargetMath.js)

Data: ticker = /api/market-mood-data (NIFTY/BANKNIFTY NSE, SENSEX BSE, VIX, Crude WTI and Nat Gas NYMEX USD). Setups = existing /api/scanner-data (Yahoo daily candles, prior 15-session high/low): Daily (1D) only, labelled delayed, Unconfirmed while market open, Confirmed after close. VWAP+9EMA button opens the existing simulated practice screen and says so. Movers = NIFTY 50 via shared quote store.
Tests: node --test tests/*.test.mjs = 656 pass, 0 fail. esbuild bundle OK. vite build NOT run (offline). Browser tests (Playwright, mocked /api) 113 pass, 0 fail at 360/390/430/1366/1440. No real API verification was possible.
