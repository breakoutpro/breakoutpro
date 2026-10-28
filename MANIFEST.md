# Gann 1x1 Angle Intelligence - manifest

NEW: src/gann/gannMath.js, gannStore.js, gannView.js; src/screens/GannPanel.jsx; tests/gann-math.test.mjs, gann-alerts.test.mjs, gann-ui.test.mjs
CHANGED: src/screens/Chart.jsx, SmartAlertsPro.jsx, src/App.jsx, src/alerts/alertRules.js, alertEngine.js, alertMessage.js, alertView.js, alertLang.js

## Setup
1. Upload every file to the SAME path in your GitHub repo (replace existing).
2. No new dependencies, no new environment variables.
3. Background push needs the existing Smart Alerts setup: device enrolled, VAPID keys, cron scheduler.
4. Do not deploy until you have run `npm run build` and tested on a real device.

## Line definition
value(k) = anchorPrice + dir*scale*k. k = trading-calendar bars of the chosen timeframe since the anchor candle. dir +1 from swing low, -1 from swing high. Scale = fixed price per bar (ATR(14) suggestion, editable).

## Verification (honest)
- Full suite: 649/649 pass (node --test). All use fixtures/mocks.
- Browser harness (Playwright, 67/67): real alert handlers with in-memory store, fixture candles, fixed clock. Not a real provider.
- esbuild bundle of src/main.jsx OK. `vite build` / `npm run build` NOT run (npm install fails offline).
- NOT verified: real Yahoo data, real scheduler run, real device push. Background delivery is NOT claimed production-ready.

## Limitations
- Holidays known for 2026 only.
- Intraday Gann alerts are disabled when reliable intraday candles are missing; daily candles are never used as intraday.
- Gann panel text is English only (like the Chart screen); alert messages are in 5 languages.
- Gann rules are managed from the chart, not the Smart Alerts form.
- Tiny unrelated fix: timeframe button row on Chart now wraps (Refresh button overflowed at 390px).
