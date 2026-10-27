# Smart Alerts (production) - manifest

Base: breakoutpro-main_2.zip. This ZIP holds ONLY new/changed files at repo-relative paths; copy them over the repo.
No existing test was removed. Secrets, node_modules, caches and build output are excluded.

## Files
NEW (server)
- api/alerts.js - single function: status, enroll, get, saveSettings, saveRule, toggleRule, deleteRule, subscribe, unsubscribe, test, checkNow, clearHistory, unenroll, cron
- api/_lib/alertStore.js (Upstash REST + in-memory test adapter), alertAuth.js, alertRunner.js, alertData.js (Yahoo adapter), webpush.js (RFC 8291 + VAPID)
NEW (shared/browser)
- src/alerts/: alertRules.js, alertCandles.js, alertEngine.js, alertLang.js (5 languages), alertMessage.js, alertView.js, alertsClient.js, pushClient.js, useSmartAlertsPro.js, openIntent.js
- src/screens/SmartAlertsPro.jsx (the new screen, route "alerts"); src/screens/VoiceData.js (replaces VoiceData.jsx)
NEW (ops/docs): docs/SMART_ALERTS_SETUP.md, .github/workflows/smart-alerts-cron.yml, scripts/generate-vapid-keys.mjs
NEW (tests): tests/alert-{api,candles,client,data,engine,rules,webpush}.test.mjs, tests/alert-helpers.mjs, tests/direction-fixtures.mjs (repair)
CHANGED: .env.example (names only), public/sw.js, src/App.jsx, src/hooks/useVoiceAlerts.js, src/i18n/translations.jsx, src/screens/Settings.jsx (passes setTab), src/screens/VoiceAlertWidget.jsx
DELETED (do not ship, remove from repo): src/hooks/useWatchlistAlerts.jsx, src/screens/Alerts.jsx, src/screens/AlertsData.jsx, src/screens/VoiceData.jsx

## Test results (exact)
`node --test tests/*.test.mjs`: 559 tests, 559 pass, 0 fail (460 existing + 99 new).
New: api 19, candles 12, client 19, data 7, engine 26, rules 6, webpush 10.
direction-fixtures repair: the file was absent from the ZIP. It is a RECONSTRUCTION (makePayload, makeBars, NOW) inferred from how DirectionEngine reads its input and how 6 test files call it; all 144 tests in those files pass. If you have the original, prefer it.
Build: `vite build` NOT run (vite/npm not installable here). Substitute: esbuild bundled the whole app (src/main.jsx, packages external) with no errors - a resolve/compile check only.
UI: Playwright/Chromium layout sweep of the real screen (mock API): 4 widths (390, 768, 1366, 1440) x 5 languages x 3 themes + not-set-up and sign-in states = 76 configurations, 0 overflow, 0 page errors, 0 tap targets under 44 px; rule create/validate/save, filter and open-instrument interactions worked.

## Checklist
### 1. Implemented and tested (fixtures/mocks - no live provider)
- Price above/below (fresh-cross, hysteresis, cooldown, between-checks crosses), % move, breakout/breakdown on completed candles (wick/forming never fire, re-arm), 9 candle patterns with trend context, volume spike vs documented baseline, price+volume combos
- Stale data, provider errors/rate limits, market closed/weekend/holiday, daily vs intraday, dedupe + suppressed counter, cooldown/re-arm, retries
- Watchlist-only scope (NIFTY/BANK NIFTY only when enabled), threshold/symbol validation on the server
- Device enrollment, per-device isolation (cross-device read/edit/delete blocked, client-sent ids ignored), cron secret (header only, timing-safe)
- Web Push crypto (byte-exact RFC 8291 vector, VAPID ES256), SSRF allowlist, subscription lifecycle (add, de-duplicate, cap, 410 removal, revive), sender failure handling (410/401/413/429/5xx/network)
- Service worker behaviour (executed in a sandbox): shows server text only, click opens/focuses the alert, hostile URLs neutralised, subscription rotation
- Five languages for push title/body/reason, permission/status messages, voice phrases (placeholder parity and native-script checks); language stored per device; voice voice-selection and graceful fallback
- Demo generators removed (random candles hook, SIGNAL_FEED); source checks; secrets only on the server; red/green only for direction

### 2. Implemented but requires deployment configuration
- Upstash Redis keys, VAPID keys, CRON_SECRET (Vercel env), GitHub secrets ALERTS_APP_URL + CRON_SECRET, then a redeploy (docs/SMART_ALERTS_SETUP.md)
- Vercel Hobby limit: api/ now has 13 functions (limit 12) - merge/remove one or use Pro
- On-device check of notification permission, push receipt with the app closed, and tap-to-open (iOS needs the Home Screen PWA)

### 3. Blocked or not verifiable here
- Live provider verification: the sandbox cannot reach Yahoo (proxy denied query1.finance.yahoo.com) - the adapter is tested on fixture payloads only; real NSE data is delayed and has no SLA
- END-TO-END BACKGROUND DELIVERY IS NOT VERIFIED: no real Upstash, push service, scheduler run or phone was exercised. Sender, storage, scheduler and auth are implemented and unit/integration-tested with mocks only
- Reliable scheduling: GitHub Actions cron is best-effort (5 min minimum, may be late/skipped); no Dhan historical candles in the repo, so no second provider; index volume absent so index volume rules report unavailable
- Real user accounts: the app has none, so isolation is per enrolled device (clearing browser data orphans server data)
- `vite build`; physical-device testing

## Other findings (not changed, outside this task)
- src/screens/ExpiryAlerts.jsx "Preview a Sample Alert" writes a sample alert into the expiry history (simulateAlert in ExpiryAlertsData.jsx)
- src/App.jsx holds hard-coded sample index values (nifty/sensex/bankNifty useState) and src/screens/StockProfile.jsx has placeholder fundamentals; "Open chart" passes the alert's verified price as the instrument price
- A stray file tests/Gknb (5 bytes) is in the original ZIP
