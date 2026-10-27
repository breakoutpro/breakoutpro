# Breakout Pro - colour system manifest

## Tokens (src/theme/tokens.js, all three themes)
- Primary Blue #2563EB: `primary` / `accent` (button + selection fill, white text 5.2:1). Text/link blue (`blue`, `brand`) stays #215AD5 in light mode so blue text on its own tint stays AA (#2563EB itself gave 4.2:1 there).
- Teal: `teal` (AA-safe text: #0F766E light, #2DD4BF dark/AMOLED), `tealBase` #0D9488 (fills, borders, chart marks), `tealSoft` tint.
- Violet: `violet`/`accent2` (AA-safe text: #7C3AED light, #A78BFA dark/AMOLED), `violetBase` #8B5CF6, `violetSoft` tint. accent2 was indigo and unused, now violet.
- Green/red: unchanged, still only up/down/bull/bear/chartUp/chartDown.
- Surfaces unchanged: white/light grey, deep navy/slate, near-black AMOLED.
- `shadow.glow()` now returns "none".

## Changed behaviour of look only (no logic)
- Removed: login background and button gradients, splash glow + progress glow, glow dots (LaunchKit, GlobalHome, CommodityHome, Guardian, ExpiryAlerts), glass/glow home cards (EquityHomeDesktop/Laptop), mic button glow.
- Green/red no longer used for generic controls: Markets tabs/sort chips/live pill, MarketAnalysis tabs, ScanScreen LIVE badge, Expiry and Signals toggles, voice mic (listening) -> blue.
- Violet for AI labels (AI Option Analysis, AI Trading Pattern Analysis, AI Market Briefing title, voice mic). Teal for VWAP and informational "Tomorrow's Watch".
- Chart drawing tools: multicolour red/green/orange/purple replaced by blue/teal/slate.

## Files changed (22 source + 1 test)
See list in COLOR_SYSTEM_FILES.txt (paths are repo-relative).

## Tests
- Updated tests/color-policy.test.mjs: accent2 hue range now violet (245-275, was indigo 225-260); added tests for primary/teal/violet tokens, AA contrast, no gradients in tokens.
- `node --test tests/*.test.mjs`: 566 tests, 566 pass, 0 fail.

## Verification and limits
- esbuild bundle of src/main.jsx compiles. `vite build` was NOT run (not available here).
- Rendered with Playwright (Chromium) at 1366x768, 1440x900, 768x1024, 390x844 in light/dark/AMOLED, no page errors, no horizontal overflow: Markets, Scanner hub, Options Intelligence Pro, Stock Profile, Smart Alerts, AI Briefing, with tab bar.
- Smart Alerts screenshots show the "alert server unreachable" state because the harness has no backend; its code only changed through shared tokens. Home screen and the live ticker were not rendered in the harness (ticker code untouched). Telugu/Hindi/Kannada/Tamil strings untouched; language was only checked as English in this sweep.
- Many other screens (Academy, Social Studio, Guardian data, etc.) still contain module-level hardcoded hex fallbacks; not refactored per the brief.
