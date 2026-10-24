# Desktop layout + trader colour system - manifest (27 files)

Layout
- src/App.jsx: on screens other than Home, the desktop content column is capped at 1360px and centred (readable width at 1920). Home keeps its own 1280px cap. No other shell change.
- Home (4 layouts) from the previous task is unchanged; Alerts status tiles get a bottom gap.

Colour system
- src/theme/tokens.js: new palettes. Light #F4F6FA / #FFFFFF / #172033, border #D8DEE8, accent #2563EB; brand, blue, info and chart line are now blue (#215AD5 in light, #4D8DF8 in dark/AMOLED); indigo accent2 added; danger is neutral slate. up/down stay green/red (#127336 / #B91C1C light) and are reserved for market meaning. Values are slightly darker than the suggested #15803D / #2563EB text colours so every text and tinted-chip pair passes WCAG AA 4.5:1 (enforced by tests).
- Shell and status: App.jsx (login logo, button, error box, drawer, heatmap, header logout), TopBar, MarketBadge, LaunchKit, provenance.js, MarketMoodData (LIVE/session now blue, DELAYED amber).
- Screens: Settings (swatches, toggles), VoiceAlertWidget, Alerts, AIBriefing, AI, OptionsIntelPro, PaperTrading, GlobalHome, InlineScreens, OIChain, Learn, AcademyData, AcademyHome, MarketMood, DetailedAnalysis, NextMoveCard, EarlyDirectionPanel.
- index.html: pre-paint background matches the new light page colour.
- tests: color-policy.test.mjs (new), theme.test.mjs (updated).

Not changed: APIs, calculations, auth, alert logic, translations.
