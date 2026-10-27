# Vercel build fix: visibleTickerItems not exported

Diagnosis: in the verified source, src/state/marketTickerModel.js DOES export visibleTickerItems
(plus pctDir, formatTickerValue, formatTickerPct, loopCopies, wrapOffset). The export list in the
error (TICKER_ITEMS, istStamp, stateOf, buildTickerItems, stateLabel only) is the OLD model file, so the
repo copy was not replaced. A second file, src/components/MarketTicker1.jsx, is a stray duplicate of the
component (a re-upload under a new name). No source logic change was needed, and no test was edited.

Do on GitHub:
1. Replace src/state/marketTickerModel.js with files/src/state/marketTickerModel.js
2. Replace src/components/MarketTicker.jsx with files/src/components/MarketTicker.jsx
3. DELETE src/components/MarketTicker1.jsx (nothing imports it; App.jsx and the Home screens import MarketTicker)
Also make sure these were uploaded from the earlier ticker zip: src/App.jsx, src/screens/home/EquityHomeMobile.jsx, src/screens/home/EquityHomeTablet.jsx.

visibleTickerItems contract: returns only items with a numeric value and state not unavailable/loading
(GIFT NIFTY is always dropped); fields exactly key, label, route, value, pct, dir, chgAbs.
Ticker still has no LIVE/CLOSED/timestamp labels and is Home only.
