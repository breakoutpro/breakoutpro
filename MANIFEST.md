# Global Responsive Density Fix - manifest
Approach: desktop-only density (src/theme/density.js useDensity; D.on true for lg/xl/xxl). Mobile (<1024) and tablet code paths unchanged. No CSS zoom/scale added (existing TV-only zoom untouched).

## Files (repo-relative)
NEW: src/theme/density.js
CHANGED: src/App.jsx (shell padding/gap, centre cap 1360->1440, sidebar width/height, header 56px, More screen columns), src/screens/FiiDiiIntelligencePro.jsx, StockProfile.jsx, ScanScreen.jsx, Scanner.jsx, MarketsTop.jsx, Markets.jsx, MarketsUI.jsx, OptionsIntelPro.jsx, ChartPatterns.jsx, ChartPatternsUI.jsx, Settings.jsx, SettingsAlerts.jsx, VoiceAlertWidget.jsx, CandleScreen.jsx, AcademyHome.jsx
TEST: tests/color-policy.test.mjs (width-cap assertion 1360 -> 1440 to match the requested ~1440 cap)

## Verified (real app components, Playwright/Chromium, mocked API)
- 40 screens x 1366x768, 1440x900, 1920x1080, 768x1024, 390x844 (light): 0 flagged for horizontal overflow/clipping.
- 1366x768 dark and AMOLED: 40 screens, 0 flagged.
- Unit tests: node --test tests/*.test.mjs -> 485 tests, 485 pass, 0 fail.
- Screenshots reviewed for Home/Markets/FII-DII/Settings/Patterns/More/Academy/Candle.

## NOT verified / known gaps
- Production build: `vite build` could NOT run (vite not installed, npm registry unreachable). Full-app esbuild bundle compiled OK (compile check only, not a Vite build).
- The six screenshots mentioned were not received; audit used real renders.
- Roughly 60 other screens sharing the 44px back-button header are only partly densified (named screens done; others still single-column/larger on desktop but with no overflow).
- Interactions (dropdowns, modals) not exhaustively exercised; live provider data not tested (mocked).
- Sweep flags overflow/clipping only; visual balance judged from screenshots of a subset.
