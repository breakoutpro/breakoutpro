// BreakoutPro - homeTierDensity.js
// Home-specific density and layout values. As of Phase 0, this file no
// longer maintains its own independent set of tier constants - it derives
// shared values (padding, gap, typography, sparkline size, row height)
// from the single app-wide responsiveFoundation.js, and layers Home's own
// widget-specific values (opportunity card counts, scanner rows, candle
// counts, per-widget heights) on top. This is what "no duplicate
// responsive logic" means in practice: one number, defined once, read
// from many places - not the same number typed twice in two files that
// could silently drift apart.
//
// getHomeTierConfig(breakpoint) keeps its exact existing shape and values -
// every widget file already calling this function continues to work
// unchanged; only the internal source of the shared values changed.
//
// Rules: no backtick, no triple-equals, ASCII only.

import { getResponsiveTier, getResponsiveConfig } from "./responsiveFoundation";

export function getHomeTier(breakpoint){
  var tier = getResponsiveTier(breakpoint);
  // Home's tier-density logic (Blueprint v1.2) covers Laptop/Desktop/
  // Ultra-wide only - Mobile/Tablet screens never reach this function in
  // practice (Home's Mobile/Tablet layouts are separate, frozen files),
  // but default to laptop's numbers as the safest fallback rather than
  // leaving anything undefined if it ever were called.
  if(tier=="mobile" || tier=="tablet") return "laptop";
  return tier;
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

// Blueprint v1.2 Section 12: Home-specific values that DO scale by tier,
// beyond what the generic app-wide foundation defines.
var HOME_TIER_EXTRAS = {
  laptop:    { breakoutCards: 4, keyLevelsCandles: 60,  scannerRows: 5,  heatmapTiles: 8,
               aiBriefHeight: 180, breakoutIntelHeight: 180, keyLevelsHeight: 420, supportingHeight: 180 },
  desktop:   { breakoutCards: 4, keyLevelsCandles: 90,  scannerRows: 8,  heatmapTiles: 16,
               aiBriefHeight: 190, breakoutIntelHeight: 190, keyLevelsHeight: 500, supportingHeight: 180 },
  ultrawide: { breakoutCards: 6, keyLevelsCandles: 120, scannerRows: 12, heatmapTiles: 24,
               aiBriefHeight: 200, breakoutIntelHeight: 210, keyLevelsHeight: 600, supportingHeight: 180 }
};

// getHomeTierConfig(breakpoint) - the one function every Home widget calls.
// Same shape and values as before Phase 0 - verified unchanged - now
// sourced from the shared foundation plus Home's own extras layered on top.
export function getHomeTierConfig(breakpoint){
  var tier = getHomeTier(breakpoint);
  var shared = getResponsiveConfig(breakpoint); // pulls from the one app-wide source
  var extra = HOME_TIER_EXTRAS[tier];
  return {
    tier: tier,
    breakoutCards: extra.breakoutCards,
    keyLevelsCandles: extra.keyLevelsCandles,
    scannerRows: extra.scannerRows,
    heatmapTiles: extra.heatmapTiles,
    aiBriefMaxLines: HOME_FIXED_DENSITY.aiBriefMaxLines,
    aiBriefFactCount: HOME_FIXED_DENSITY.aiBriefFactCount,
    keyLevelsCount: HOME_FIXED_DENSITY.keyLevelsCount,
    marketBreadthMetrics: HOME_FIXED_DENSITY.marketBreadthMetrics,
    sectorStrengthCount: HOME_FIXED_DENSITY.sectorStrengthCount,
    cardPadding: shared.widgetPadding,
    gridGap: shared.gridGap,
    widgetTitle: shared.fontTitle,
    primaryNumber: shared.fontPrimaryNumber,
    secondaryText: shared.fontSecondary,
    label: shared.fontLabel,
    aiBriefHeight: extra.aiBriefHeight,
    breakoutIntelHeight: extra.breakoutIntelHeight,
    sparklineW: shared.sparklineW,
    sparklineH: shared.sparklineH,
    keyLevelsHeight: extra.keyLevelsHeight,
    tableRowHeight: shared.tableRowHeight,
    supportingHeight: extra.supportingHeight
  };
}
