# BreakoutPro — Test Results Report

**Date**: November 13, 2026  
**Node Version**: v22.23.5  
**Build Tool**: Vite v4.5.14  
**Test Runner**: Node test runner (`node --test`)  
**Browser Engine**: Headless Chromium (Playwright)

---

## 1. Unit & Integration Test Suites

### Command:
```bash
node --test tests/home-intelligence.test.mjs tests/market-ticker.test.mjs tests/market-watch.test.mjs tests/theme.test.mjs tests/alert-client.test.mjs tests/next-move-i18n.test.mjs tests/next-move-ui.test.mjs
```

### Summary:
- **Total Tests**: 355
- **Passed**: 355 (100%)
- **Failed**: 0
- **Duration**: ~406 ms

### Breakdown:
1. `tests/market-watch.test.mjs` (11/11 PASSED):
   - `ok 1` - four market categories exist: India, Global, Commodities, Currencies
   - `ok 2` - all 22 requested instruments are defined in their correct categories
   - `ok 3` - CRITICAL: GIFT NIFTY always shows disconnected and never fabricates a price
   - `ok 4` - CRITICAL: MCX commodities always show disconnected and never show NYMEX USD prices
   - `ok 5` - verified Indian index quotes distinguish LIVE and LAST_CLOSE honestly
   - `ok 6` - global indices, commodities, and currencies resolve correctly from global items
   - `ok 7` - futures feed resolves when Angel One data is present, else shows disconnected
   - `ok 8` - customization allows reordering and hiding instruments
   - `ok 9` - all mw.* translation keys exist in all five languages
   - `ok 10` - HomeHub renders HomeMarketWatch between HomeTicker and NewsTicker
   - `ok 11` - new market watch files adhere to repo conventions: ASCII only, no backticks, no triple-equals
2. `tests/home-intelligence.test.mjs` (7/7 PASSED)
3. `tests/market-ticker.test.mjs` (25/25 PASSED)
4. `tests/alert-client.test.mjs` (19/19 PASSED)
5. `tests/next-move-i18n.test.mjs` (3/3 PASSED)
6. `tests/next-move-ui.test.mjs` (24/24 PASSED)
7. `tests/theme.test.mjs` (266/266 PASSED)

---

## 2. Production Build Verification

### Command:
```bash
npm run build
```

### Result:
- **Status**: SUCCESS (Exit code 0)
- **Transform**: 300 modules transformed cleanly
- **Bundle**:
  - `dist/index.html` (1.84 kB)
  - `dist/assets/index-2bbe3a7f.js` (324.93 kB)
  - All chunks created without errors or unhandled dependencies.

---

## 3. Responsive & Theme Layout Validation (Headless Chromium)

### Command:
```bash
python3 /tmp/validate_responsive.py
```

### Viewports Tested:
| Viewport | Dimensions | Scroll Width | Inner Width | Overflow? | Watchlist Rendered? | Status |
|---|---|---|---|---|---|---|
| Mobile 360 | 360x800 | 360px | 360px | None | Yes | **PASS** |
| Mobile 390 | 390x844 | 390px | 390px | None | Yes | **PASS** |
| Mobile 430 | 430x932 | 430px | 430px | None | Yes | **PASS** |
| Tablet 768 | 768x1024 | 768px | 768px | None | Yes | **PASS** |
| Desktop 1366 | 1366x768 | 1366px | 1366px | None | Yes | **PASS** |
| Desktop 1440 | 1440x900 | 1440px | 1440px | None | Yes | **PASS** |
| Desktop 1920 | 1920x1080 | 1920px | 1920px | None | Yes | **PASS** |

### Themes Tested (at 390px Mobile):
- **Light Theme**: PASS (No overflow, contrast >= 4.5:1 maintained)
- **Dark Theme**: PASS (No overflow, contrast >= 4.5:1 maintained)
- **AMOLED Theme**: PASS (True black `#000000` background, no overflow)

### Locales Tested (at 390px Mobile):
- **English (`en`)**: PASS (Clean layout, no clipped strings)
- **Telugu (`te`)**: PASS (Native Telugu typography, no clipped strings)
- **Hindi (`hi`)**: PASS (Native Devanagari typography, no clipped strings)
- **Kannada (`kn`)**: PASS (Native Kannada typography, no clipped strings)
- **Tamil (`ta`)**: PASS (Native Tamil typography, no clipped strings)

---

## 4. Feed & Data Integrity Verification

| Instrument | Exchange | Current Feed Status | Behavior |
|---|---|---|---|
| NIFTY 50 | NSE | Supported (Yahoo / Indian API) | LIVE during open hours, LAST CLOSE with IST timestamp when closed |
| BANK NIFTY | NSE | Supported (Yahoo / Indian API) | LIVE during open hours, LAST CLOSE with IST timestamp when closed |
| SENSEX | BSE | Supported (Yahoo / Indian API) | LIVE during open hours, LAST CLOSE with IST timestamp when closed |
| GIFT NIFTY | NSE IX | **UNSUPPORTED** | Marked "Data feed not connected", value `null`, NEVER fabricated |
| INDIA VIX | NSE | Supported (Yahoo / Indian API) | LIVE / LAST CLOSE with neutral styling |
| NIFTY 50 Futures | NSE FO | Supported via Angel One | LIVE if active Angel One credentials; "Data feed not connected" if no active tick |
| BANK NIFTY Futures | NSE FO | Supported via Angel One | LIVE if active Angel One credentials; "Data feed not connected" if no active tick |
| S&P 500, NASDAQ, DOW | US Indices | Supported (Global cue / Yahoo) | LIVE / LAST CLOSE depending on US market session |
| DXY (US Dollar Index) | ICE | Supported (Global cue / Yahoo) | LIVE / LAST CLOSE with 2 decimals |
| US 10-Yr Yield | Cboe | Supported (Global cue / Yahoo) | Displayed with `%` suffix |
| MCX Gold, Silver, Crude, NatGas | MCX | **UNSUPPORTED** | Marked "Data feed not connected", NEVER substituted with NYMEX USD |
| Brent Crude, WTI Crude | ICE / NYMEX | Supported (Global cue / Yahoo) | Explicitly labeled USD ($), formatted as commodities |
| USD/INR, EUR/INR, GBP/INR | Forex | Supported (Global cue / Yahoo) | Formatted with 4 decimal places |
| USD/JPY | Forex | Supported (Global cue / Yahoo) | Formatted with 2 decimal places |
