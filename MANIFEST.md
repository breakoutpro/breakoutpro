# Home Final Redesign - manifest
NEW: src/screens/AuthScreen.jsx (light login/register, old dark page removed from App.jsx), src/components/HeaderAuth.jsx (Login/Register or avatar+name+Logout), src/screens/home/HomeHub.jsx, HomeSearch.jsx, HomeMarketTiles.jsx (if not already in repo)
EDITED: src/App.jsx, src/screens/home/EquityHomeDesktop.jsx, EquityHomeLaptop.jsx, EquityHomeMobile.jsx, EquityHomeTablet.jsx, src/i18n/lang/{en,te,hi,kn,ta}.js
TESTS: tests/home-ui-fixes.test.mjs, market-ticker.test.mjs, theme.test.mjs, home-next-move.test.mjs, next-move-ui.test.mjs

## Test report
- node --test: 651/651 pass
- esbuild bundle of src/main.jsx: OK
- Real App in Chromium (Playwright, mocked /api) at 1366x768, 390x844, 768x1024: 60/60 checks pass
  logged-out Home with Login+Register, light auth screen, validation, bad invite rejected, register -> name shown + buttons hidden,
  dropdown + Escape, Logout restores buttons, login again, close button, no overflow, no page errors
## Not verified
- npm run build (vite) - npm install offline
- Live /api/auth backend and live market data (mocked)
- Auth text is English only
