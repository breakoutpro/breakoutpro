import { createContext, useContext, useState, useEffect } from "react";
import { resolveTheme, loadThemeMode, saveThemeMode, deviceFor, applyThemeToDocument, normalizeMode } from "./tokens";

// BreakoutPro - ThemeProvider.jsx
// Provides the theme palette + device breakpoint to the whole app.
// Light Pro (default) / Dark Pro / AMOLED Dark / System, instant switch,
// persisted under "bp_theme". The resolved theme id is also written to the
// document (data-theme, color-scheme, page background). The shape of
// theme.c is unchanged. Rules: no backtick, no triple-equals, ASCII.

var ThemeContext = createContext(null);

export function ThemeProvider(props){
  var [mode,setMode] = useState(loadThemeMode());
  var [palette,setPalette] = useState(resolveTheme(loadThemeMode()));
  var [winW,setWinW] = useState(function(){ try{ return window.innerWidth; }catch(e){ return 430; } });

  // react to window resize for responsive device detection
  useEffect(function(){
    function onResize(){ try{ setWinW(window.innerWidth); }catch(e){} }
    try{ window.addEventListener("resize",onResize); }catch(e){}
    return function(){ try{ window.removeEventListener("resize",onResize); }catch(e){} };
  },[]);

  // react to system theme changes when in system mode
  useEffect(function(){
    if(mode!="system") return;
    var mq;
    try{ mq=window.matchMedia("(prefers-color-scheme: dark)"); }catch(e){ return; }
    function onChange(){ setPalette(resolveTheme("system")); }
    try{ mq.addEventListener("change",onChange); }catch(e){ try{ mq.addListener(onChange); }catch(e2){} }
    return function(){ try{ mq.removeEventListener("change",onChange); }catch(e){ try{ mq.removeListener(onChange); }catch(e2){} } };
  },[mode]);

  // keep the document attribute and page background in step with the palette
  useEffect(function(){ applyThemeToDocument(palette); },[palette]);

  function setTheme(m){
    var n = normalizeMode(m);
    setMode(n); saveThemeMode(n); setPalette(resolveTheme(n));
  }

  var value = { mode:mode, setTheme:setTheme, c:palette, resolved:palette.id, isDark:palette.scheme=="dark", winW:winW, device:deviceFor(winW) };
  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

// Hook: const { c, device, mode, resolved, isDark, setTheme } = useTheme();
export function useTheme(){
  var ctx = useContext(ThemeContext);
  if(!ctx) return { mode:"light", setTheme:function(){}, c:resolveTheme("light"), resolved:"light", isDark:false, winW:430, device:"mobile" };
  return ctx;
}
