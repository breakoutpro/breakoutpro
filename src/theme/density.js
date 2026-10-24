import { useResponsive } from "../hooks/useResponsive";

// BreakoutPro - theme/density.js
// ONE place for the compact desktop spacing scale (4px/8px based). Screens call
// useDensity() and use d.on to choose between the compact desktop value and the
// value they already had. Mobile and tablet (d.on false) keep their existing
// sizes exactly: nothing here scales the app, it only supplies tighter paddings
// and grid hints for laptop and desktop widths (1024px and up).
// Rules: no backtick, no triple-equals, ASCII only.

export var DESKTOP_DENSITY = {
  on: true,
  pagePad: 16,      // page content padding
  gap: 12,          // gap between cards
  cardPad: 12,      // card inner padding
  radius: 12,       // card radius
  headPad: "8px 16px",  // detail page header band
  back: 36,         // back button box
  title: 18,        // detail page title
  row: "8px 12px"   // list row padding
};

export function densityFor(isDesktop){
  if(isDesktop) return DESKTOP_DENSITY;
  return { on:false, pagePad:16, gap:12, cardPad:16, radius:16, headPad:"12px 16px", back:44, title:18, row:"16px" };
}

export function useDensity(){
  var r = useResponsive();
  return densityFor(r.isDesktop);
}
