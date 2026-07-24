import { useState, useEffect } from "react";
import { getBreakpoint, shellConfig, cardColumns } from "../state/responsiveRegistry";

// BreakoutPro - useResponsive.js
// Live breakpoint + shell config from window width. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

export function useResponsive(){
  var initW = 0, initH = 0;
  try{ initW = window.innerWidth || 0; initH = window.innerHeight || 0; }catch(e){ initW = 390; initH = 844; }
  var [winW, setWinW] = useState(initW);
  var [winH, setWinH] = useState(initH);

  useEffect(function(){
    function onResize(){ try{ setWinW(window.innerWidth||0); setWinH(window.innerHeight||0); }catch(e){} }
    try{ window.addEventListener("resize", onResize); onResize(); }catch(e){}
    return function(){ try{ window.removeEventListener("resize", onResize); }catch(e){} };
  }, []);

  var bp = getBreakpoint(winW);
  var isTabletBp = bp=="md";
  var isLandscape = winW >= winH;
  return {
    winW: winW,
    winH: winH,
    breakpoint: bp,
    shell: shellConfig(bp),
    columns: cardColumns(bp),
    isMobile: bp=="xs" || bp=="sm",
    isTablet: isTabletBp,
    isTabletPortrait: isTabletBp && !isLandscape,
    isTabletLandscape: isTabletBp && isLandscape,
    isLandscape: isLandscape,
    isDesktop: bp=="lg" || bp=="xl" || bp=="xxl",
    isTV: bp=="tv" || bp=="tv4k"
  };
}
