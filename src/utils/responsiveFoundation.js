// BreakoutPro - responsiveFoundation.js
// PHASE 0 - THE single responsive configuration source for the entire app.
// Every current and future page (Home, Scanner, Markets, AI, Options
// Intelligence, Watchlist, Portfolio, News, Settings, etc.) reads layout
// values from this file. No page-specific responsive system is permitted -
// if a new page needs a value this file doesn't have, extend this file,
// don't build a parallel one.
//
// This is a pure function module: no React state, no side effects. Every
// consumer passes the same breakpoint id (from the existing
// useResponsive().breakpoint) and gets the same answer back - that is what
// makes this a genuine single source of truth rather than N independent
// implementations that can silently drift apart from each other.
//
// Tier mapping - the app's real breakpoint system (confirmed stable across
// every prior phase), mapped onto the five named device tiers:
//   Mobile     = "xs" | "sm"            (0-767px)
//   Tablet     = "md"                    (768-1023px)
//   Laptop     = "lg"                    (1024-1365px)
//   Desktop    = "xl"                    (1366-1919px)
//   Ultra-wide = "xxl" | "tv" | "tv4k"    (1920px+)
//
// Rules: no backtick, no triple-equals, ASCII only.

export function getResponsiveTier(breakpoint){
  if(breakpoint=="xs" || breakpoint=="sm") return "mobile";
  if(breakpoint=="md") return "tablet";
  if(breakpoint=="lg") return "laptop";
  if(breakpoint=="xl") return "desktop";
  if(breakpoint=="xxl" || breakpoint=="tv" || breakpoint=="tv4k") return "ultrawide";
  return "laptop"; // safest fallback if an unrecognized breakpoint ever appears
}

// ---- THE FIVE-TIER CONFIGURATION TABLE ----
// Every dimension requested for Phase 0. cardWidth is expressed as a
// minimum width (for use in CSS Grid's minmax(MIN, 1fr) pattern) rather
// than a fixed pixel width - a fixed width on a grid track is exactly the
// bug that caused the horizontal-overflow incident fixed a few rounds ago,
// so this file does not repeat that mistake at the foundation level.
var TIERS = {
  mobile: {
    maxWidth: "100%",
    gridColumns: 1,
    cardMinWidth: 0,          // full-width stacked cards
    cardHeightCompact: 140, cardHeightMedium: 200, cardHeightLarge: 260,
    widgetPadding: 10,
    gridGap: 8,
    borderRadius: 10,
    fontTitle: 13, fontPrimaryNumber: 16, fontSecondary: 12, fontLabel: 10,
    iconSize: 16,
    tableRowHeight: 32,       // touch-target-friendly minimum
    sparklineW: "100%", sparklineH: 32, // fluid - touch scrolling makes fixed width unnecessary
    chartHeight: 220,
    heatmapTileSize: 44,      // touch-target minimum
    density: { visibleRows: 3, visibleTiles: 4, visibleCards: 3 },
    aboveFoldHeight: 600
  },
  tablet: {
    maxWidth: "100%",
    gridColumns: 2,
    cardMinWidth: 260,
    cardHeightCompact: 160, cardHeightMedium: 220, cardHeightLarge: 300,
    widgetPadding: 11,
    gridGap: 10,
    borderRadius: 9,
    fontTitle: 13, fontPrimaryNumber: 17, fontSecondary: 12, fontLabel: 10,
    iconSize: 16,
    tableRowHeight: 32,
    sparklineW: "100%", sparklineH: 32,
    chartHeight: 300,
    heatmapTileSize: 52,
    density: { visibleRows: 4, visibleTiles: 6, visibleCards: 4 },
    aboveFoldHeight: 700
  },
  laptop: {
    maxWidth: "100%",
    gridColumns: 3,
    cardMinWidth: 240,
    cardHeightCompact: 180, cardHeightMedium: 420, cardHeightLarge: 500,
    widgetPadding: 12,
    gridGap: 12,
    borderRadius: 10,
    fontTitle: 14, fontPrimaryNumber: 19, fontSecondary: 12, fontLabel: 11,
    iconSize: 16,
    tableRowHeight: 34,
    sparklineW: 90, sparklineH: 30,
    chartHeight: 420,
    heatmapTileSize: 60,
    density: { visibleRows: 5, visibleTiles: 8, visibleCards: 4 },
    aboveFoldHeight: 700
  },
  desktop: {
    maxWidth: "100%",
    gridColumns: 4,
    cardMinWidth: 260,
    cardHeightCompact: 190, cardHeightMedium: 500, cardHeightLarge: 600,
    widgetPadding: 14,
    gridGap: 14,
    borderRadius: 10,
    fontTitle: 15, fontPrimaryNumber: 20, fontSecondary: 12, fontLabel: 11,
    iconSize: 18,
    tableRowHeight: 36,
    sparklineW: 110, sparklineH: 36,
    chartHeight: 500,
    heatmapTileSize: 68,
    density: { visibleRows: 8, visibleTiles: 16, visibleCards: 4 },
    aboveFoldHeight: 850
  },
  ultrawide: {
    maxWidth: 1800,           // Responsive Blueprint v1.0 - centered, never unbounded
    gridColumns: 6,
    cardMinWidth: 280,
    cardHeightCompact: 210, cardHeightMedium: 600, cardHeightLarge: 700,
    widgetPadding: 16,
    gridGap: 16,
    borderRadius: 10,
    fontTitle: 16, fontPrimaryNumber: 21, fontSecondary: 13, fontLabel: 12,
    iconSize: 20,
    tableRowHeight: 38,
    sparklineW: 130, sparklineH: 42,
    chartHeight: 600,
    heatmapTileSize: 76,
    density: { visibleRows: 12, visibleTiles: 24, visibleCards: 6 },
    aboveFoldHeight: 1000
  }
};

// getResponsiveConfig(breakpoint) - the one function every page and every
// widget calls, present and future. Returns the complete tier config plus
// the tier name itself.
export function getResponsiveConfig(breakpoint){
  var tier = getResponsiveTier(breakpoint);
  var t = TIERS[tier];
  return {
    tier: tier,
    maxWidth: t.maxWidth,
    gridColumns: t.gridColumns,
    cardMinWidth: t.cardMinWidth,
    cardHeightCompact: t.cardHeightCompact,
    cardHeightMedium: t.cardHeightMedium,
    cardHeightLarge: t.cardHeightLarge,
    widgetPadding: t.widgetPadding,
    gridGap: t.gridGap,
    borderRadius: t.borderRadius,
    fontTitle: t.fontTitle,
    fontPrimaryNumber: t.fontPrimaryNumber,
    fontSecondary: t.fontSecondary,
    fontLabel: t.fontLabel,
    iconSize: t.iconSize,
    tableRowHeight: t.tableRowHeight,
    sparklineW: t.sparklineW,
    sparklineH: t.sparklineH,
    chartHeight: t.chartHeight,
    heatmapTileSize: t.heatmapTileSize,
    density: t.density,
    aboveFoldHeight: t.aboveFoldHeight
  };
}
