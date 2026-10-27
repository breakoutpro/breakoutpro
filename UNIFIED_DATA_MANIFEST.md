# Breakout Pro - Unified Live Data + Smart Alerts integration: manifest

## Read first
* `docs/DATA_PROVIDER_COVERAGE.md` - what each provider really serves, freshness rule, symbol/candle/volume coverage, rate limits, what real-time NSE data would need.
* `docs/UNIFIED_DATA_SETUP.md` - deployment, function-count fix, scheduler, how to test a real push.

## New
* `src/market/marketData.js` - one symbol mapping, one freshness rule (LIVE/DELAYED/STALE/UNAVAILABLE), normalised quote and candle shapes (pure, shared by server and browser).
* `api/_lib/marketFeed.js` - server data layer: batched quotes, candles, history, cache, in-flight sharing, circuit breaker, runner snapshots.
* `src/market/marketClient.js`, `src/market/useQuotes.js` - one shared browser quote store and hook.
* `src/market/QuoteBadge.jsx` - freshness badge (5 languages).
* `vercel.json` - rewrites only (`/api/yahoo`, `/api/history` -> `/api/market`).
* `tests/unified-data.test.mjs` - 17 tests.

## Changed
* `api/market.js` - actions `snapshot`, `candles`, `yahoo`, `history`; `indices/quote/quotes` now use the layer; `historical` returns a typed 501 instead of crashing.
* `api/market-mood-data.js` - core index freshness uses the shared rule (feeds ticker, Next Move, Range Intelligence, Direction engine).
* `src/state/marketTickerModel.js` - ticker cannot show live unless the server status is LIVE.
* `api/_lib/alertData.js`, `api/_lib/alertRunner.js`, `src/alerts/alertEngine.js`, `src/alerts/alertMessage.js`, `src/alerts/alertLang.js` - alerts read the shared layer; provider delay respected; notifications state DELAYED and the source in five languages.
* `src/screens/Watchlist.jsx` (live, no simulated prices), `Markets.jsx` (one snapshot call instead of ~400, delayed labelling), `MarketsTop.jsx` (live index strip, other blocks tagged SAMPLE DATA), `StockProfile.jsx` (status badge instead of "LIVE DATA").
* `api/futures-data.js`, `api/news.js`, `tests/group1-news.test.mjs` - import path only.
* `api/_lib/providers/{angelone,yahoo,indianapi,dhan}.js` - moved from `api/providers/` (content unchanged).

## DELETE from your repo (a ZIP cannot delete)
`api/yahoo.js`, `api/history.js`, `api/repo root`, and the folder `api/providers/`.

## Results (actual)
* `node --test tests/*.test.mjs`: **583 tests, 583 pass, 0 fail** (566 before this task + 17 new).
* esbuild bundle of `src/main.jsx` compiles. **`vite build` was not run** (vite is not installed in the sandbox; npm installs are blocked), so a production build is unverified.
* Mock tests only: the scheduler, push sender and data layer run against fake Yahoo responses and a fake push sender. **No real provider call, no real push to a phone, no live deployment was made.** The sandbox cannot reach Yahoo (HTTP 403 from the proxy).
* Rendered with Playwright (mocked API) at 1366x768, 1440x900, 768 and 390 in light/dark/AMOLED and Telugu/Hindi/Kannada/Tamil: no page errors, no horizontal overflow; screenshots in `screenshots/`. Prices in them are mock values.
* Function count: 17 -> 11 (limit 12), asserted by a test.

## Known limits (not hidden)
* Without `exchangeDataDelayedBy` in Yahoo's response the app shows DELAYED, never LIVE, during market hours.
* Per-instance cache only; no shared Redis cache.
* Chart.jsx, StockResearchPro, MarketReplay still read candles via `/api/history` (now rewritten, cached, whitelisted) but show no badge.
* Static sample data remains in MarketsTop (sentiment, FII/DII, global) - now tagged; StockProfile still generates random quarterly/news placeholder sections; Scanner still uses its own daily fetch; `useMarketSnapshot` (`/api/market-snapshot`) still has no deployed backend.
* Breakout Time Frame screen stays Unavailable until a Dhan historical function exists.
