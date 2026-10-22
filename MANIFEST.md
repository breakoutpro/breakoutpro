# Four UI fixes - manifest
- src/App.jsx: password eye icon now visible (it was white-on-white after the theme work), 44px tap target, aria-label/aria-pressed, applies to the single password field used by Login and Register; welcome modal no longer opens (showTutorial starts false); "Enable Alert Notifications" banner removed; new goBack() (browser-history aware); Home navigation now uses goTo so browser Back works; Market Mood, Scanner and Range Intelligence Back buttons use goBack.
- src/screens/NextMoveHomeCard.jsx: "View Full Analysis" link removed; card taps now reach the card (Detailed Analysis section keeps its own taps).
- src/screens/home/EquityHome{Mobile,Tablet,Laptop,Desktop}.jsx: dropped the now-unused onOpen prop; Laptop/Desktop Live Breakouts card opens the scanner as a whole (rows no longer double-fire).
- tests/theme.test.mjs: one assertion changed (it required the removed banner's button; now asserts the banner is gone).
- tests/home-ui-fixes.test.mjs: new source-level tests for the four changes.
Not changed: auth logic, APIs, calculations, alerts logic, themes, translations.
Results: npm test 438/438 pass. Browser checks (fixture data) at 390 and 1366 px: 42/42 pass. Layout harness at 390/1366 (2 themes x 2 scenarios): 0 issues. vite build NOT run (registry unreachable, vite not installed).
