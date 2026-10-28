# Desktop market tiles -15%
CHANGED: src/screens/home/HomeMarketTiles.jsx only (tiles are rendered on desktop/laptop only; mobile and tablet do not use this component).
Tile height 78 -> 66px; padding 12x16 -> 10x14; gap 14 -> 12; label 13 -> 11, price 22 -> 19, change 14 -> 12, Unavailable 15 -> 13. Plain CSS values, no zoom/transform.
Unchanged vs approved version: HomeHub.jsx, HomeSearch.jsx (six cards, search bar, header, wave, footer, spacing), all mobile code.
## Test results
- node --test: 651/651 pass; real App in Chromium: all 5 tiles 66px tall, same top, aligned at 1440 and 1366; six cards 345x104 unchanged; mobile 390 and tablet 768 have no tiles, card sizes unchanged; no overflow.
- Not run: vite build (offline).
