# Home responsive layout - change manifest
Files (repo-relative paths):
- src/screens/home/EquityHomeLaptop.jsx  - centered max-width 1280 container, 16px gaps, 12px card radius, 14x16 padding, roomier rows/buttons, removed forced min-height:100vh
- src/screens/home/EquityHomeDesktop.jsx - same changes as Laptop
- src/screens/home/EquityHomeTablet.jsx  - Range card spans full width; bottom padding 40->16, spacer 24->8
- src/screens/home/EquityHomeMobile.jsx  - bottom padding 84->16 (was compensating for the tab bar)
- src/App.jsx - one style change: on non-desktop Home only, app column gets border-box + bottom padding equal to the tab bar so the notification banner and disclaimer ticker are no longer hidden behind it

No change to data, calculations, alerts, translations, themes or Next Move.

Checks that ran: npm test 433/433 pass; layout harness (fixture data) at 360,390,414,768,1024,1280,1366,1440,1920 x light/dark/amoled x 2 scenarios = 54 cases, 0 overflow/clipping/obscured issues; Next Move Home harness at 390,768,1366,1440 (en,te) 16 cases, 0 issues.
Not run: vite build (package registry unreachable here; esbuild bundle of src/main.jsx succeeds).
