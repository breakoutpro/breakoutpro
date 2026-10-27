# Home market ticker - changed files (not deployed)

Copy each file under files/ to the same path in the repo.

| File | Change |
|---|---|
| src/components/MarketTicker.jsx | Rewritten: 36px slim marquee. Name, value, signed percent only. No status words or timestamps. rAF scroll on a native overflow-x container (touch and keyboard scrolling kept). Two identical halves, integer-pixel group widths, seamless wrap. Pause on hover, focus, touch, wheel, hidden tab. Reduced motion: no animation. Clones are aria-hidden and not focusable. |
| src/state/marketTickerModel.js | Added pure helpers (visibleTickerItems, pctDir, formatTickerPct, formatTickerValue, loopCopies, wrapOffset). Existing exports and data source unchanged. |
| src/App.jsx | Ticker renders on Home only (desktop: under the header). Mobile placement removed from here. Desktop chrome height counts the ticker only on Home. |
| src/screens/home/EquityHomeMobile.jsx | Mounts the ticker directly below the Home header. |
| src/screens/home/EquityHomeTablet.jsx | Same, for tablet Home. |
| tests/market-ticker.test.mjs | Updated and extended (Home-only mounting, no status text, omitted items, sign colours, loop maths, motion contract). |

Expectation changes: ticker no longer shows LIVE/CLOSED/DELAYED or times; INDIA VIX now follows the sign colour rule (was neutral); ticker no longer appears on other tabs.
GIFT NIFTY has no verified provider, so it is omitted rather than shown with a value.

Not run: vite build, live provider test, real-device test. Browser tests used a harness with fixture data (Chromium, DPR 1).
