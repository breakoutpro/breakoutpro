// BreakoutPro - homeTierDensity.js
// The single source of truth for "how much content each Home widget shows,
// per screen tier" - Blueprint v1.2, Sections 11 and 12.
//
// This is a pure function, not a hook: it takes a breakpoint id (from the
// already-existing useResponsive().breakpoint) and returns a fixed set of
// density numbers. No side effects, no state - every widget calls this
// with the same input and gets the same answer, which is what makes it a
// genuine single source of truth rather than N separate implementations.
//
// Tier mapping (Blueprint v1.2 Section 12's three named tiers, mapped onto
// the real breakpoint system - confirmed stable in Phase 1 validation):
//   Laptop     = "lg"                  (1024-1365px)
//   Desktop    = "xl"                  (1366-1919px)
//   Ultra-wide = "xxl" | "tv" | "tv4k"  (1920px+)
//
// Rules: no backtick, no triple-equals, ASCII only.

export function getHomeTier(breakpoint){
  if(breakpoint=="lg") return "laptop";
  if(breakpoint=="xl") return "desktop";
  if(breakpoint=="xxl" || breakpoint=="tv" || breakpoint=="tv4k") return "ultrawide";
  // Mobile/Tablet breakpoints never reach Home's tier-density logic (Blueprint
  // v1.2 governs Laptop/Desktop/Ultra-wide only) - default to laptop's
  // numbers as the safest fallback rather than leaving anything undefined.
  return "laptop";
}

// Blueprint v1.2 Section 11: fixed counts that never change by tier -
// included here so every widget reads density from one place, even for
// the values that happen to be constant.
export var HOME_FIXED_DENSITY = {
  aiBriefMaxLines: 4,
  aiBriefFactCount: 3,
  keyLevelsCount: 5,        // R2, R1, current, S1, S2 - always exactly 5
  marketBreadthMetrics: 3,  // Advances, Declines, Unchanged - always exactly 3
  sectorStrengthCount: 5    // always exactly 5, per tier list, never scales
};

// Blueprint v1.2 Section 12: the three values that DO scale by tier.
var TIER_DENSITY = {
  laptop:    { breakoutCards: 4, keyLevelsCandles: 60,  scannerRows: 5,  heatmapTiles: 8  },
  desktop:   { breakoutCards: 4, keyLevelsCandles: 90,  scannerRows: 8,  heatmapTiles: 16 },
  ultrawide: { breakoutCards: 6, keyLevelsCandles: 120, scannerRows: 12, heatmapTiles: 24 }
};

// Responsive Blueprint v1.0 - the three tiers' shared layout constants.
// Extended incrementally, phase by phase, as each widget requires specific
// values - not pre-built comprehensively in one pass, per the approved
// implementation rule (no separate foundation phase; each phase adds what
// it needs).
var TIER_LAYOUT = {
  laptop:    { cardPadding:12, gridGap:12, widgetTitle:14, primaryNumber:19, secondaryText:12, label:11,
               aiBriefHeight:180, breakoutIntelHeight:180, sparklineW:90,  sparklineH:30,
               keyLevelsHeight:420, tableRowHeight:34, supportingHeight:180 },
  desktop:   { cardPadding:14, gridGap:14, widgetTitle:15, primaryNumber:20, secondaryText:12, label:11,
               aiBriefHeight:190, breakoutIntelHeight:190, sparklineW:110, sparklineH:36,
               keyLevelsHeight:500, tableRowHeight:36, supportingHeight:180 },
  ultrawide: { cardPadding:16, gridGap:16, widgetTitle:16, primaryNumber:21, secondaryText:13, label:12,
               aiBriefHeight:200, breakoutIntelHeight:210, sparklineW:130, sparklineH:42,
               keyLevelsHeight:600, tableRowHeight:38, supportingHeight:180 }
};

// getHomeTierConfig(breakpoint) - the one function every widget calls.
// Returns the complete density config for whatever tier the breakpoint
// resolves to, plus the tier name itself (useful for widgets that need to
// branch on tier for reasons beyond raw counts, e.g. Phase 4's chart
// detail granularity).
export function getHomeTierConfig(breakpoint){
  var tier = getHomeTier(breakpoint);
  var density = TIER_DENSITY[tier];
  var layout = TIER_LAYOUT[tier];
  return {
    tier: tier,
    breakoutCards: density.breakoutCards,
    keyLevelsCandles: density.keyLevelsCandles,
    scannerRows: density.scannerRows,
    heatmapTiles: density.heatmapTiles,
    aiBriefMaxLines: HOME_FIXED_DENSITY.aiBriefMaxLines,
    aiBriefFactCount: HOME_FIXED_DENSITY.aiBriefFactCount,
    keyLevelsCount: HOME_FIXED_DENSITY.keyLevelsCount,
    marketBreadthMetrics: HOME_FIXED_DENSITY.marketBreadthMetrics,
    sectorStrengthCount: HOME_FIXED_DENSITY.sectorStrengthCount,
    cardPadding: layout.cardPadding,
    gridGap: layout.gridGap,
    widgetTitle: layout.widgetTitle,
    primaryNumber: layout.primaryNumber,
    secondaryText: layout.secondaryText,
    label: layout.label,
    aiBriefHeight: layout.aiBriefHeight,
    breakoutIntelHeight: layout.breakoutIntelHeight,
    sparklineW: layout.sparklineW,
    sparklineH: layout.sparklineH,
    keyLevelsHeight: layout.keyLevelsHeight,
    tableRowHeight: layout.tableRowHeight,
    supportingHeight: layout.supportingHeight
  };
}
