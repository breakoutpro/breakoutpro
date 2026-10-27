# Data-provider coverage report (Unified Live Data + Smart Alerts)

Audit of the repository as received (after the Smart Alerts and colour-system tasks). "Verified" below means
verified **by reading the code and by mock-contract tests**. The build sandbox has no route to Yahoo, Dhan,
IndianAPI, Upstox or NSE (outbound HTTPS returns 403 from the proxy), so **no provider response was fetched live
and no provider contract was confirmed against the real service.** Every "Yahoo returns X" statement is what the
code expects; the first deployed call is the real test (see "Verify on first deploy" at the end).

## 1. What serves what

| Need | Provider and route (before) | Real-time? | Notes |
|---|---|---|---|
| Index quotes (NIFTY, BANKNIFTY, SENSEX, VIX, FINNIFTY, MIDCAP) | Yahoo v7 quote with cookie+crumb, in `api/market-mood-data.js` (feeds ticker, Home, Next Move, Range Intelligence, Direction engine) | **Unknown. Yahoo does not label NSE data real-time; the old code called a quote LIVE when its timestamp was under 90 s old.** | Now uses the shared freshness rule (below). |
| Index quotes, other route | `api/providers/yahoo.js` v7 **without** crumb, used by `/api/market?action=indices|quote|quotes` | Same | Yahoo rejects uncrumbed v7 calls (the mood route's own comment says so), so this path was likely failing. Replaced by the unified layer. |
| Stock quotes (Markets screen) | Edge route `/api/yahoo`: one Yahoo chart call **per symbol**, 30 symbols per request, 14 requests per poll for 399 stocks, polled every 30 s per open screen | Labelled "live" whenever the market was open | ~400 Yahoo requests per poll per user. Replaced: one cached snapshot call. |
| Stock quotes (Watchlist screen) | None. Static demo list, label "DEMO DATA", change always 0.00% | n/a | Now live via the unified layer. |
| Daily/intraday candles for charts | Edge route `/api/history` (Yahoo v8 chart, any range/interval, 5 min browser cache) | Delayed by provider | Kept (same URL) but now served from `/api/market` through the shared cache, whitelisted ranges, and returns status fields. |
| Candles for Breakout Time Frame screen | `/api/market?action=historical` -> `dhan.getHistoricalCandles` | n/a | **That function does not exist** in `providers/dhan.js` (only index-only `getCandles`). The route threw a TypeError (HTTP 500). `package.json` also references a missing `tests/dhan-historical.test.mjs`. Now returns a typed 501 `historical_not_implemented`; the screen shows Unavailable. Not fixed with Yahoo on purpose: that screen is designed as Dhan-only. |
| Candles for Smart Alerts | `api/_lib/alertData.js` (Yahoo v8 chart) | Delayed by provider | Reused, not duplicated. |
| Scanner | `api/scanner-data.js` (Yahoo v8 daily chart, 20 NIFTY names, one call each) | End-of-day candles | Unchanged (not in scope); a candidate for the shared cache later. |
| Option chain, expiries | Dhan (`DHAN_ACCESS_TOKEN`, `DHAN_CLIENT_ID`), NIFTY/BANKNIFTY/SENSEX/FINNIFTY only | Provider-reported | Has its own 3 s floor, 8 s LIVE window, 120 s UNAVAILABLE cutoff. Unchanged. |
| Futures | Angel One (`/api/futures-data`), NIFTY and BANKNIFTY only | Provider-reported | Unchanged. |
| Upstox LTP | `/api/upstox`, needs `UPSTOX_ACCESS_TOKEN`; no caller found in `src/` | Provider-reported | Unused. |
| NSE direct | `/api/nse` (cookie scrape of nseindia.com) | Unknown | NSE blocks datacentre IPs often; no caller relied on for prices. |
| Fundamentals, 52w, trending, IPO, commodities | IndianAPI (`INDIANAPI_KEY`) | n/a | Unchanged. |
| News | `/api/news` (RSS via rss2json) | n/a | Unchanged. |

Missing routes the client calls (they 404 today, and the screens already handle that): `/api/market-snapshot`
(a FastAPI sidecar in `backend/`, not deployed on Vercel), `/api/market-mood-ai`, `/api/analytics`, `/api/stock-history`.
`useMarketSnapshot` therefore reports unavailable; nothing in this task re-enables or fakes it.

## 2. Freshness rule (one rule, whole app)

Defined once in `src/market/marketData.js` (`classifyQuote`), used by the server feed, the market-mood route, the
ticker model, the alert engine and the browser store.

* **LIVE** only if the provider reports `exchangeDataDelayedBy == 0` **and** the quote timestamp is under 120 s old **and** the NSE session is open.
* **DELAYED** if the provider reports a delay (shown as "Delayed N min"), or the quote is 2-15 min old, or the provider **did not say** whether it is delayed (reason `provider_delay_unreported`). Yahoo's chart endpoint never states the delay, so chart-sourced quotes are never LIVE.
* While the market is closed the last session's price is DELAYED with reason `market_closed` (shown "Last close").
* **STALE** if older than the delay plus 15 min, or a closed-market price older than 5 days.
* **UNAVAILABLE** if there is no timestamp, a future timestamp, or the provider returned nothing. Nothing is ever filled in.

Consequence to expect: unless Yahoo's v7 rows carry `exchangeDataDelayedBy` (or you add a real-time provider), the
app will show **DELAYED** rather than LIVE during market hours. That is the honest result, not a bug.

## 3. NSE symbol coverage and mapping

* One mapping in `src/market/marketData.js`: `RELIANCE` -> `RELIANCE.NS`, `M&M` -> `M&M.NS`, `BAJAJ-AUTO` -> `BAJAJ-AUTO.NS`;
  indices `NIFTY ^NSEI`, `BANKNIFTY ^NSEBANK`, `SENSEX ^BSESN`, `FINNIFTY NIFTY_FIN_SERVICE.NS`, `MIDCAP ^CRSLDX`, `VIX ^INDIAVIX`.
  Aliases (`NIFTY 50`, `BANK NIFTY`, `INDIA VIX`) resolve. Anything else (spaces, paths, queries, over 20 characters) is rejected, not forwarded.
* The old Markets code stripped `&` from symbols (`M&M` became `MM.NS`, a different or missing instrument). Fixed.
* The app's own universe is `ALL_NSE_STOCKS` (399 symbols in `src/data/marketsStocks.js`). The layer accepts any valid NSE ticker, up to 500 per request. Whether Yahoo resolves a given ticker cannot be known offline: unresolved tickers come back UNAVAILABLE, and the Markets screen hides them when live data is present and reports the count.
* Not covered: BSE-only stocks, SME listings Yahoo does not carry, GIFT NIFTY (no verified provider; the ticker and Markets show Unavailable), global indices beyond what the mood route already fetches.

## 4. Candles, volume, timeframes

| Frame | Yahoo request | Notes |
|---|---|---|
| 1m | interval 1m, range 1d | Yahoo keeps about 7 days of 1m. New (not used by alerts). |
| 5m | 5m / 5d | Alerts. |
| 15m | 15m / 5d | Alerts. |
| 1H | 60m / 1mo | Alerts. |
| 1D | 1d / 6mo | Alerts. Daily bars are never treated as live. |

* Each candle carries `complete` (false for the forming bar). Alerts only act on completed bars.
* Stock candles carry volume. **Index candles from Yahoo normally carry volume 0**; the layer reports `volumeAvailable:false` and the alert engine marks volume rules unavailable for indices instead of inventing a spike.
* Gaps are skipped, never interpolated. A future-dated quote is not trusted.

## 5. Rate limits, caching, errors

* Yahoo publishes no limit. Observed behaviour (429 under bursts) is handled: a 429, or three failures in a row, opens a circuit breaker for 30 s, doubling to 10 min; while open the layer makes no provider call and serves cached data whose label degrades with age, or UNAVAILABLE.
* Server cache (per warm instance): quotes 15 s while the market is open, 5 min closed; candles 30 s open, 10 min closed; in-flight sharing so concurrent callers make one request. `Cache-Control: s-maxage` lets Vercel's CDN share one copy across users (identical URLs).
* Quotes: one Yahoo v7 request per 50 symbols (cookie+crumb cached 1 h). If v7 fails with auth or a provider error, a per-symbol chart fallback runs, capped at 20 symbols, never after a 429.
* Browser: one shared store; screens that mount together share one request; exponential back-off (3, 8, 20, 60 s) on failure; polling 15 s when open, 120 s when closed, paused when the tab is hidden; an UNAVAILABLE reply never erases an older real quote.
* **Limit that remains:** serverless instances do not share memory, so the cache is per instance. Under heavy concurrent traffic several instances may each call Yahoo. The CDN header reduces this; a shared Upstash cache would remove it (not added: it needs your approval and another moving part).
* Authentication: Yahoo needs none beyond the crumb cookie. Dhan/Angel One/IndianAPI/Upstox keys stay server-side.

## 6. Can alerts reuse the same data without excessive requests?

Yes. The scheduled run collects the union of every device's watchlist symbols and the frames its rules need, then
calls the shared layer once per symbol and frame (`getSnapshots`): at 5-minute intervals with N distinct symbols
that is at most about N to 3N Yahoo chart calls per run, independent of the number of users. Overlapping runs and
screen traffic on the same warm instance reuse the cache. Per-device isolation is unchanged (rules, language and
push subscriptions are keyed per device; tested with two devices).

## 7. Alerts supported with this data

| Rule | Needs | Status |
|---|---|---|
| Price above/below, percent change | quote + previous close (5m frame meta) | Works; label DELAYED unless the provider reports no delay. |
| Breakout / breakdown | completed bars on the rule timeframe | Works for 5m, 15m, 1H, 1D. |
| Candle patterns | at least the minimum completed bars | Works for stocks and indices. |
| Volume spike, price+volume | real volume for 3-10 sessions | Stocks only. **Indices: unavailable** (no volume). |
| Anything when data is STALE | | Never fires. |

Notifications say DELAYED (with minutes when known) and name the source ("Yahoo Finance") in English, Telugu,
Hindi, Kannada and Tamil. They never say live unless the provider reported no delay.

## 8. What would be needed for genuine real-time NSE data

Yahoo cannot be relied on for live NSE prices. For true real-time stock prices, volume and 1-minute candles use a
licensed feed with a REST/websocket API and an NSE data licence, for example **Dhan Data API** (market-feed and
historical charts; requires the Data API subscription, `DHAN_ACCESS_TOKEN` and `DHAN_CLIENT_ID`, which the repo already
reads), **Upstox** (`/v2/market-quote`, `UPSTOX_ACCESS_TOKEN`, already stubbed in `api/upstox.js`), or **Angel One
SmartAPI** (already used for futures). Plugging one in means adding a provider module under `api/_lib/providers/` that
returns `{price, prevClose, asOf, delayedBySec: 0}` and calling it first in `marketFeed.fetchUpstream`; the freshness
rule then marks those quotes LIVE with no other change. Broker feeds also require an instrument-token map for all ~2000
NSE equities (the Dhan provider in this repo maps only four indices), and the Dhan historical function that
`/api/market?action=historical` calls still has to be written.

## 9. Verify on first deploy (cannot be done offline)

1. `GET /api/market?action=snapshot&symbols=RELIANCE,TCS,NIFTY` returns `status` and `delayedBySec` per symbol. Check whether `delayedBySec` is a number (v7 reports `exchangeDataDelayedBy`) or null.
2. `GET /api/market?action=candles&symbol=RELIANCE&frame=5m` returns candles with volume, and `symbol=NIFTY` returns `volumeAvailable:false`.
3. Look at the Vercel function logs for 401/429 from Yahoo.
