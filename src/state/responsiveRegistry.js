// BreakoutPro - src/state/responsiveRegistry.js
// Breakpoints + layouts for every device: mobile -> 4K TV. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

// Breakpoints in px (min width). Ordered.
export var BREAKPOINTS = [
  { id:"xs",   min:0,    max:413,  label:"Mobile portrait" },
  { id:"sm",   min:414,  max:767,  label:"Large mobile" },
  { id:"md",   min:768,  max:1023, label:"Tablet" },
  { id:"lg",   min:1024, max:1365, label:"Laptop" },
  { id:"xl",   min:1366, max:1919, label:"Desktop" },
  { id:"xxl",  min:1920, max:2559, label:"Large monitor" },
  { id:"tv",   min:2560, max:3839, label:"Ultra-wide / TV" },
  { id:"tv4k", min:3840, max:99999, label:"4K / Smart TV" }
];

export var TEST_WIDTHS = [360,390,412,768,1024,1280,1366,1440,1920,2560,3840];

// Return breakpoint id for a window width.
export function getBreakpoint(winW){
  for(var i=0;i<BREAKPOINTS.length;i++){
    if(winW >= BREAKPOINTS[i].min && winW <= BREAKPOINTS[i].max) return BREAKPOINTS[i].id;
  }
  return "xs";
}

// Layout config per breakpoint: shell mode, columns, sidebars, center cap, scale.
export function shellConfig(bp){
  switch(bp){
    case "xs":
    case "sm":
      return { mode:"mobile", columns:1, leftNav:false, rightRail:false, centerMax:640, bottomNav:true, zoom:1, shellMax:640, pad:0 };
    case "md":
      return { mode:"tablet", columns:1, leftNav:false, rightRail:false, centerMax:720, bottomNav:true, zoom:1, shellMax:720, pad:0 };
    case "lg":
      return { mode:"desktop", columns:1, leftNav:true, rightRail:false, centerMax:1100, bottomNav:false, zoom:1.15, shellMax:1600, pad:24 };
    case "xl":
      return { mode:"desktop", columns:1, leftNav:true, rightRail:true, centerMax:900, bottomNav:false, zoom:1.25, shellMax:1800, pad:24 };
    case "xxl":
      return { mode:"desktop", columns:1, leftNav:true, rightRail:true, centerMax:1000, bottomNav:false, zoom:1.35, shellMax:1900, pad:28 };
    case "tv":
      return { mode:"tv", columns:1, leftNav:true, rightRail:true, centerMax:1200, bottomNav:false, zoom:1.5, shellMax:2200, pad:36 };
    case "tv4k":
      return { mode:"tv", columns:1, leftNav:true, rightRail:true, centerMax:1400, bottomNav:false, zoom:1.7, shellMax:2600, pad:48 };
    default:
      return { mode:"mobile", columns:1, leftNav:false, rightRail:false, centerMax:640, bottomNav:true, zoom:1, shellMax:640, pad:0 };
  }
}

// Card grid columns for a breakpoint (auto-fit style hint).
export function cardColumns(bp){
  if(bp=="xs") return 1;
  if(bp=="sm") return 1;
  if(bp=="md") return 2;
  if(bp=="lg") return 2;
  if(bp=="xl") return 3;
  if(bp=="xxl") return 3;
  return 4; // tv, tv4k
}

// Mandatory a11y/layout constants.
export var LAYOUT_RULES = {
  minTouchTarget: 44,     // px, mobile/tablet
  noHorizontalScroll: true,
  gridStyle: "auto-fit-minmax", // never fixed pixel columns
  baseFontPx: 16
};
