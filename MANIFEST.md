# BreakoutPro — Global & Indian Market Watch Manifest

## Summary of Changes
Enhancement of the BreakoutPro Home Page with a high-fidelity "Global & Indian Market Watch" inspired by Investing.com's market watchlist design, strictly respecting BreakoutPro design tokens, theme contrast, 5-language localization, and zero-fabrication data integrity rules.

---

## Changed and Added Files

### 1. State & Logic Models
- **`src/state/marketWatchModel.js` (NEW)**
  - Defines the 4 market categories: `India`, `Global`, `Commodities`, `Currencies`.
  - Defines metadata for all 22 requested instruments across the 4 categories.
  - Implements `resolveInstrument()` with strict status resolution:
    - `LIVE`: Open market session with verified fresh quote (<120s old).
    - `DELAYED`: Older quote during open session or provider delayed.
    - `LAST_CLOSE`: Session closed with last confirmed price and IST timestamp.
    - `STALE`: Outdated quote (>900s).
    - `UNAVAILABLE`: Feed not connected or provider unsupported ("Data feed not connected").
  - Strictly prevents price fabrication: GIFT NIFTY and MCX INR commodities are explicitly designated `unsupported: true`, returning null prices and "Data feed not connected".
  - Prevents NYMEX USD commodities from being falsely displayed as MCX INR.
  - Formats timestamps accurately in Asia/Kolkata (IST) without timezone leakage.
  - Formats numbers with appropriate precision (2 decimals for indices/stocks/commodities, 4 decimals for forex pairs, % for treasury yield).
  - Handles watchlist customization (reordering, hiding, resetting) with localStorage persistence (`bp_marketwatch_cfg`).
  - Follows repository conventions: ASCII only, double quotes, no backticks, `==`/`!=` (no `===`).

### 2. UI Components
- **`src/screens/home/HomeMarketWatch.jsx` (NEW)**
  - Tabbed market watchlist placed right beneath `HomeTicker` and above `NewsTicker` on Home.
  - Category tabs: India, Global, Commodities, Currencies with active count badges.
  - Mobile layout (<768px): Compact single-line rows with instrument name, exchange/source badge, last price, signed percentage change pill (green/red), and status/timestamp caption. Fits comfortably on 360px without text clipping.
  - Desktop layout (>=768px): Structured multi-column grid with hover card states, category switcher, and quick navigation.
  - "View All Markets" link routing to the full `/markets` view.
  - Watchlist customization drawer/dialog to reorder, toggle visibility, and reset categories.
  - Clicking any instrument navigates to its chart/details view via `onOpenIndex()`.
  - Full theme integration: uses `theme.c` tokens (`bg`, `card`, `card2`, `text1`, `text2`, `text3`, `border`, `up`, `down`, `blue`).
  - Strict accessibility: high contrast ratios (>= 4.5:1), ARIA labels, semantic markup.

- **`src/screens/home/HomeHub.jsx` (MODIFIED)**
  - Integrated `<HomeMarketWatch />` cleanly between `<HomeTicker />` and `<NewsTicker />`.
  - Preserved all existing Home features: Next Move Intelligence, Range Intelligence, Smart Market Alerts, Market Breadth, breakout setups, Intraday Volume Shockers, Day High/Low Crossers, VWAP Radar, CPR/Pivot Levels, Audio Brief, and categorized tools.

### 3. Localization
- **`src/i18n/lang/en.js` (MODIFIED)** — Added 22 `mw.*` keys for English.
- **`src/i18n/lang/te.js` (MODIFIED)** — Added 22 `mw.*` keys for Telugu (తెలుగు) in ASCII unicode escapes.
- **`src/i18n/lang/hi.js` (MODIFIED)** — Added 22 `mw.*` keys for Hindi (हिन्दी) in ASCII unicode escapes.
- **`src/i18n/lang/kn.js` (MODIFIED)** — Added 22 `mw.*` keys for Kannada (ಕನ್ನಡ) in ASCII unicode escapes.
- **`src/i18n/lang/ta.js` (MODIFIED)** — Added 22 `mw.*` keys for Tamil (தமிழ்) in ASCII unicode escapes.
- **`src/i18n/translations.jsx` (MODIFIED)** — Merged `ALERT_PACKS` from `src/alerts/alertLang.js` so single-selector `useTranslation()` handles all keys consistently across the app.

### 4. API & Data Layer
- **`api/market-mood-data.js` (MODIFIED)**
  - Expanded `GLOBAL_SYMS` to include S&P 500 (`^GSPC`), US 10-Year Treasury Yield (`^TNX`), Brent Crude (`BZ=F`), and Currencies (`INR=X`, `EURINR=X`, `GBPINR=X`, `JPY=X`).
  - Preserved existing global cue consumers and naming conventions (e.g., `Crude Oil (WTI)`).

### 5. Automated Tests
- **`tests/market-watch.test.mjs` (NEW)**
  - 11 comprehensive automated tests covering:
    - 4 category definitions.
    - All 22 requested instruments.
    - GIFT NIFTY always shows disconnected and never fabricates prices.
    - MCX INR commodities always show disconnected and never show NYMEX USD prices.
    - Honest distinction between LIVE and LAST_CLOSE with accurate timestamps.
    - Formatting of global indices, commodities, currencies, and yields.
    - Futures feed resolution via Angel One.
    - Watchlist reordering, hiding, and resetting.
    - 5-language localization key parity.
    - HomeHub integration order.
    - Repo code style (ASCII only, no backticks, no `===`).

### 6. Cleanup of Deprecated / Dead Files
- Removed unused and deprecated legacy files: `src/hooks/useWatchlistAlerts.jsx`, `src/screens/Alerts.jsx`, `src/screens/AlertsData.jsx`, `src/screens/home/HomeCalculator.jsx`, `src/screens/home/HomeMarketTiles.jsx`. (Confirmed 0 production imports; required absent by repository test suites).
