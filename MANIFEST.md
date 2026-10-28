# Home page - second reference (market boxes + search + six cards) - manifest

All paths are repository-relative. Upload each to the SAME path.
NEW:     src/screens/home/HomeHub.jsx, HomeSearch.jsx, HomeMarketTiles.jsx
CHANGED: src/screens/home/EquityHomeMobile.jsx, EquityHomeTablet.jsx, EquityHomeLaptop.jsx, EquityHomeDesktop.jsx
         src/App.jsx   (3 small edits, see below)
         src/i18n/lang/en.js te.js hi.js kn.js ta.js  (home.tagline, home.hub_alerts, home.search_none)
         tests/market-ticker.test.mjs (updated, see below)
         tests/home-next-move.test.mjs, next-move-ui.test.mjs, theme.test.mjs, home-ui-fixes.test.mjs
           (unchanged since my previous Home ZIP; included so this ZIP alone is complete)
No new dependencies or environment variables. Not deployed.
If you uploaded my earlier "home-redesign" ZIP: HomeCard/HomeRange/HomeBreakouts/HomeSmartAlerts/HomeMore.jsx are unused now (safe to delete, not required).

## Home page now
- Mobile / tablet: existing header + the existing slim scrolling ticker, hero, centred search bar, six cards (2 columns mobile, 3 tablet), existing bottom navigation.
- Desktop (lg and up): existing header/nav, then five market boxes (NIFTY 50, BANK NIFTY, SENSEX, GIFT NIFTY, INDIA VIX), hero, search, six cards in 3 columns.
- Search: HomeSearch uses the same searchStocks() rule as the header search and Search screen and opens the same stock page (App passes onSelectStock). Arrow keys / Enter / Escape work. No new request.
- Market boxes use the SAME model and payload as the ticker (buildTickerItems on App's shared market data). No verified value -> "Unavailable" (GIFT NIFTY always, no provider exists in this project). A quote that is not live shows its state (DELAYED / CLOSED / LAST CONFIRMED) in the box. Green/red only on the % movement.
- Cards: Next Move -> marketmood, Range -> rangeintel, Live Breakouts -> breakoutscan, Smart Market Alerts -> alerts, Scan Breakouts -> scanner, Learn Patterns -> learn. Removed from Home only: Next Move panel, range details, breakout lists, alerts text, breadth etc. Their pages and logic are untouched.

## src/App.jsx edits
1. "breakoutscan" added to KNOWN_TABS (without it Live Breakouts also rendered the More screen).
2. Home now receives onSelectStock (open stock page) for the search bar.
3. JUDGEMENT CALL: the slim strip that App rendered under the desktop header is removed on desktop Home, because the desktop reference shows boxes in that spot and you asked for no duplicate tickers. Mobile/tablet keep the strip. To revert: re-add `import MarketTicker from "./components/MarketTicker";` and `{tab=="home" ? <MarketTicker data={mm.data} networkStatus={mm.networkStatus} status={mm.status} onNavigate={goTo}/> : null}` under GlobalHeader, and remove tiles={true} from EquityHomeDesktop/Laptop.

## tests/market-ticker.test.mjs
The old test required App to render exactly one strip. Replaced by: App renders none (desktop uses boxes), Mobile/Tablet render exactly one strip and no boxes, Desktop/Laptop render boxes and no strip; plus a test that the boxes use the ticker model with the five instruments and no invented value. All other ticker tests untouched.

## Results (actual)
- node --test tests/*.test.mjs : 650/650 pass. esbuild bundle of src/main.jsx OK.
- `npm run build` / vite build NOT run (npm install fails offline). Run it on a Vercel preview before going live.
- Browser check (Playwright, real Home router, fixture data), 390 / 768 / 1366x768 / 1440x900 x light/dark x en/te/hi/kn/ta = 40 combos: 6 cards, 2/3 columns, 5 boxes on desktop tiers and strip on mobile/tablet, no overflow, no clipped text, no overlapping elements, no errors.
  Also (en, light): all six cards open the right destination; search "rel" lists RELIANCE and Enter opens it; a no-match query shows the no-result text; GIFT NIFTY shows "Unavailable"; with failed market data all five boxes show "Unavailable".
- Compared by eye against both references: layout, order, colours and icons match. Differences: mobile keeps the existing slim 36px ticker instead of the reference's taller two-line one; the AMOLED theme was not separately screenshotted (it shares the dark palette code path); the real App shell (GlobalHeader, bottom TabBar) was not mounted in the browser check.
- Not verified: real phone, real provider data, a live click-through inside the full App.
