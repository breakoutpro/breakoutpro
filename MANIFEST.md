# BreakoutPro - Live Intraday Scalping Radar (informational) - MANIFEST
(Cumulative ZIP: includes the earlier Intelligence Home files this feature builds on.)

## Files
New - radar: src/market/intradayRadar.js (all calculations, pure), src/hooks/useIntradayRadar.js (fetch, settings, sound), src/screens/home/HomeRadar.jsx (4 sections + controls), src/state/pcrModel.js, tests/intraday-radar.test.mjs
Changed - radar: api/market.js (new action=radar, reuses feed.getCandles 5m), src/screens/home/HomeHub.jsx (order, official disclaimer), HomeSetups.jsx (factual labels: 15-Day High/Low Cross, Daily close / Candle in progress, Delayed / EOD, Last Updated), HomePanels.jsx + src/hooks/useHomePcr.js (PCR Live / Delayed / Last EOD with time; last real value kept in localStorage bp_pcr_last), tests/home-intelligence.test.mjs
Earlier Home work (unchanged here): HomeTicker, HomeStrips, HomeAudioBrief, LargeCapMovers, RiskTargetCalc, riskTargetMath, audioBriefModel, breakoutSetupsModel, useBreakoutSetups, App.jsx, InlineScreens.jsx, en.js, 3 older test files.
DELETE from repo: src/screens/home/HomeMarketTiles.jsx, src/screens/home/HomeCalculator.jsx

## Implemented
1 Informational language: factual event labels only (Volume Surge, Day High/Low Cross, Above/Below/Near VWAP, CPR Narrow/Normal/Wide, 15-Day High/Low Cross). Freshness: Live (only if provider status LIVE and session open) / Delayed / Last Updated HH:MM IST / EOD / Unavailable. Official disclaimer on Home. No buy/sell wording (tested).
3 OI + PCR: Home sentiment panel shows Live / Delayed / Last EOD + time; after close shows the provider value or the last stored real response; nothing invented.
4 INTRADAY VOLUME SHOCKERS: latest completed 5m bar volume vs mean of the same time-of-day bar in earlier sessions (min 3 sessions), thresholds 2x/3x/5x, duplicate suppression per stock+type+candle, optional sound.
5 DAY HIGH & DAY LOW CROSSERS: completed 5m bars, crossing = new session high/low after 3 bars, shows bar time, fresh vs earlier, "Near" shown separately and not as a crossing, session status.
6 VWAP PROXIMITY RADAR: session VWAP from 5m typical price x volume, IST session boundaries, stale/EOD handling, proximity +-0.10/0.20(default)/0.50%.
7 DAILY CPR & PIVOT LEVELS: P, BC, TC, R1, S1, top/bottom, width%, Narrow (<0.25%) / Normal / Wide (>0.50%) from the last full completed session; labelled calculated reference levels.
8 Home order: ticker, JUST IN, setups, shockers, crossers, VWAP, CPR, audio brief, quick grid (desktop: side panels on the right).
9 Controls: volume multiple, universe (NIFTY 50 / Bank Nifty / My Watchlist), VWAP proximity, sound on/off (off by default; turning it on is the permission step), Pause, Resume, Refresh. Refresh every 60 s open / 5 min closed, only while the page is open.

## Providers actually reused
Yahoo Finance 5m candles + quote through the existing api/_lib/marketFeed.js (cache, circuit breaker, completed-bar flags), /api/market-mood-data, /api/news, /api/scanner-data, option-chain service (Dhan, via dataService). No new dependency, secret, scheduler or database.

## NOT implemented / missing provider
- MCX Crude and MCX Natural Gas in INR: NOT shown. The repo has no verified MCX feed (IndianAPI /commodities is unverified and keyed; the CommodityHome screen's "MCX LIVE" prices are hard-coded demo values - it was not changed and should be reviewed). Ticker keeps WTI and NYMEX in USD, labelled.
- Background notifications: not claimed. Alerts and sound work only while the page is open (the repo's scheduled push system is for Smart Alerts rules, not for the radar).
- F&O stock universe: the repo has no F&O list; the universe is NIFTY 50, Bank Nifty or the user's watchlist.
- Real-time: Yahoo does not state delay, so data is shown Delayed (never Live) unless the provider status says LIVE. Resolution is the 5-minute bar, not ticks. Yahoo returns about 5 sessions of 5m bars, so the volume baseline is at most 4 earlier sessions (min 3 required). CPR close = last 5m close (can differ slightly from the official close).
- Cost note: one radar request fetches up to ~52 symbols from Yahoo (cached 30 s open / 10 min closed, 8 in parallel). Real-world rate limits were not tested.

## Tests run
- node --test tests/*.test.mjs : 667 pass, 0 fail (includes 9 new radar tests: 5m volume baseline, crossing logic, VWAP and session boundaries, CPR formulas, open/closed/weekend, missing/malformed data, duplicate suppression, freshness wording, PCR freshness, source/wording checks). All inputs are synthetic.
- esbuild bundle of src/App.jsx: OK. `vite build` NOT run (npm install is offline here).
- Playwright on the bundled real App with MOCKED /api (radar responses are produced by the real intradayRadar.js from synthetic candles) at 360, 390, 430, 768, 1366, 1440, 1920 px: 270 checks, 0 fail (section order, content, thresholds, universe requests, pause/resume/refresh, sound opt-in/mute/dedupe with a stubbed AudioContext, provider failure, missing history, market closed EOD, PCR Live/Delayed/Last EOD and stored fallback, overflow, themes dark, regressions of earlier Home).
- NOT verified against real providers: this workspace cannot reach Yahoo/Dhan. First deploy check: GET /api/market?action=radar&symbols=RELIANCE,TCS,NIFTY and confirm results have vol/cross/vwap/cpr populated during market hours. AMOLED theme and the other 4 languages were not browser-tested.
