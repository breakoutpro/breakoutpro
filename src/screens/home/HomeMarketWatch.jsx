import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { CATEGORIES, INSTRUMENTS, getCategoryItems } from "../../state/marketWatchModel";

// BreakoutPro - HomeMarketWatch.jsx
// Premium "Global & Indian Market Watch" component.
// Positioned near top of Home page directly below header / slim ticker.
// Compact, continuously updating market watchlist across India, Global, Commodities, Currencies.
//
// DATA INTEGRITY CONTRACT:
// - Live, Delayed, Last Close, Stale, and Data feed not connected honestly distinguished.
// - GIFT NIFTY and MCX INR always show "Data feed not connected" with null value.
// - Never shows NYMEX/COMEX USD prices as MCX INR.
// - Closed markets clearly display last session's close and timestamp.
//
// Rules: no backtick, no triple-equals, ASCII only.

var STORAGE_KEY = "bp_marketwatch_cfg";

function readStoredCfg(){
  try {
    if(typeof localStorage == "undefined") return { order:{}, hidden:{} };
    var s = localStorage.getItem(STORAGE_KEY);
    if(!s) return { order:{}, hidden:{} };
    var parsed = JSON.parse(s);
    return parsed && typeof parsed == "object" ? parsed : { order:{}, hidden:{} };
  } catch(e){
    return { order:{}, hidden:{} };
  }
}

function writeStoredCfg(cfg){
  try {
    if(typeof localStorage != "undefined"){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    }
  } catch(e){}
}

function ChevronRight(props){
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={props.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}>
      <path d="M6 3l5 5-5 5"/>
    </svg>
  );
}

function GearIcon(props){
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export default function HomeMarketWatch(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var big = !!props.big;
  var mm = props.mm || {};
  var data = mm.data;
  var go = props.setTab || function(){};

  var [activeTab, setActiveTab] = useState("india");
  var [nowMs, setNowMs] = useState(Date.now());
  var [customizing, setCustomizing] = useState(false);
  var [config, setConfig] = useState(readStoredCfg);

  useEffect(function(){
    var timer = setInterval(function(){ setNowMs(Date.now()); }, 15000);
    return function(){ clearInterval(timer); };
  }, []);

  var items = getCategoryItems(activeTab, data, props.futures, config, nowMs);
  var allDefs = INSTRUMENTS[activeTab] || [];

  function handleOpenInstrument(it){
    if(it.isIndex && props.onOpenIndex && (it.id == "NIFTY" || it.id == "BANKNIFTY" || it.id == "SENSEX")){
      props.onOpenIndex({ key:it.id, label:it.name, val:it.valFormatted, ltp:it.value, up:it.dir != "down", pct:it.changePercent });
      return;
    }
    if(it.route){
      go(it.route);
      return;
    }
    go("markets");
  }

  function toggleHide(id){
    var nextHidden = Object.assign({}, config.hidden);
    if(nextHidden[id]) delete nextHidden[id];
    else nextHidden[id] = true;
    var next = Object.assign({}, config, { hidden:nextHidden });
    setConfig(next);
    writeStoredCfg(next);
  }

  function moveItem(id, dir){
    var currentDefs = INSTRUMENTS[activeTab] || [];
    var currentOrder = (config.order && config.order[activeTab]) ? config.order[activeTab].slice() : currentDefs.map(function(d){ return d.id; });
    var idx = currentOrder.indexOf(id);
    if(idx < 0) return;
    var targetIdx = idx + dir;
    if(targetIdx < 0 || targetIdx >= currentOrder.length) return;
    var temp = currentOrder[idx];
    currentOrder[idx] = currentOrder[targetIdx];
    currentOrder[targetIdx] = temp;
    var nextOrder = Object.assign({}, config.order);
    nextOrder[activeTab] = currentOrder;
    var next = Object.assign({}, config, { order:nextOrder });
    setConfig(next);
    writeStoredCfg(next);
  }

  function resetConfig(){
    var next = { order:{}, hidden:{} };
    setConfig(next);
    writeStoredCfg(next);
  }

  var cardBg = light ? "rgba(255,255,255,0.92)" : c.card;
  var cardBd = "1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border);
  var shadow = light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 3px rgba(15,23,42,0.04)" : "0 4px 14px rgba(0,0,0,0.25)";

  return (
    <section data-testid="home-market-watch" aria-label="Global and Indian Market Watch"
      style={{position:"relative",width:"100%",boxSizing:"border-box",background:cardBg,border:cardBd,borderRadius:big ? 16 : 14,boxShadow:shadow,padding:big ? "14px 16px 12px" : "12px 10px 10px",overflow:"hidden"}}>
      {/* Header Bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10,flexWrap:"nowrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
          <span style={{width:4,height:18,background:c.blue,borderRadius:2,flexShrink:0}}/>
          <h2 data-testid="mw-heading" style={{margin:0,fontSize:big ? 15 : 13.5,fontWeight:800,color:c.text1,letterSpacing:"-0.01em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {t("mw.title", "Global & Indian Market Watch")}
          </h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <button type="button" data-testid="mw-customize-toggle" onClick={function(){ setCustomizing(!customizing); }} title={t("mw.customize", "Customize")}
            style={{background:"none",border:"1px solid " + (customizing ? c.blue : c.border),borderRadius:8,padding:"4px 7px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:customizing ? c.blue : c.text3,fontFamily:"inherit"}}>
            <GearIcon color={customizing ? c.blue : c.text3}/>
            <span style={{display:big ? "inline" : "none"}}>{customizing ? t("mw.done", "Done") : t("mw.customize", "Customize")}</span>
          </button>
          <button type="button" data-testid="mw-view-all" onClick={function(){ go("markets"); }} title={t("mw.view_all", "View All Markets")}
            style={{background:c.blueSoft,border:"1px solid " + (light ? "rgba(37,99,235,0.2)" : "rgba(77,141,248,0.25)"),borderRadius:8,padding:"4px 9px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,fontSize:11.5,fontWeight:700,color:c.blue,fontFamily:"inherit"}}>
            <span>{t("mw.view_all", "View All Markets")}</span>
            <ChevronRight color={c.blue}/>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div role="tablist" aria-label="Market Categories" style={{display:"flex",alignItems:"center",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:8,borderBottom:"1px solid " + c.border,marginBottom:10}}>
        {CATEGORIES.map(function(cat){
          var active = activeTab == cat.id;
          return (
            <button key={cat.id} type="button" role="tab" aria-selected={active} data-testid={"mw-tab-" + cat.id} onClick={function(){ setActiveTab(cat.id); }}
              style={{background:active ? c.blue : (light ? "rgba(238,242,255,0.7)" : c.card2),color:active ? "#ffffff" : c.text2,border:"1px solid " + (active ? c.blue : c.border),borderRadius:20,padding:big ? "5px 14px" : "4px 11px",fontSize:big ? 12 : 11,fontWeight:active ? 700 : 600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",transition:"all 0.15s ease",flexShrink:0}}>
              {t(cat.labelKey, cat.fallback)}
            </button>
          );
        })}
      </div>

      {/* Customize Overlay / Panel */}
      {customizing ? (
        <div data-testid="mw-customize-panel" style={{background:light ? "#F8FAFC" : c.card2,border:"1px dashed " + c.blue,borderRadius:10,padding:10,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:11.5,fontWeight:700,color:c.text1}}>Customize {t(CATEGORIES.filter(function(x){ return x.id == activeTab; })[0].labelKey)} Watchlist</span>
            <button type="button" data-testid="mw-reset-btn" onClick={resetConfig} style={{background:"none",border:"none",fontSize:11,fontWeight:600,color:c.blue,cursor:"pointer",padding:0}}>{t("mw.reset", "Reset")}</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:180,overflowY:"auto"}}>
            {allDefs.map(function(def, idx){
              var isHidden = !!(config.hidden && config.hidden[def.id]);
              return (
                <div key={def.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",background:cardBg,borderRadius:6,border:"1px solid " + c.border}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                    <input type="checkbox" checked={!isHidden} onChange={function(){ toggleHide(def.id); }} id={"mw-chk-" + def.id} style={{cursor:"pointer"}}/>
                    <label htmlFor={"mw-chk-" + def.id} style={{fontSize:11.5,fontWeight:600,color:isHidden ? c.text3 : c.text1,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{def.name}</label>
                    <span style={{fontSize:9,color:c.text3}}>({def.exchange})</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <button type="button" onClick={function(){ moveItem(def.id, -1); }} disabled={idx == 0} style={{background:"none",border:"none",color:idx == 0 ? c.text3 : c.text1,cursor:idx == 0 ? "default" : "pointer",padding:"2px 5px",fontSize:11}}>&#9650;</button>
                    <button type="button" onClick={function(){ moveItem(def.id, 1); }} disabled={idx == allDefs.length - 1} style={{background:"none",border:"none",color:idx == allDefs.length - 1 ? c.text3 : c.text1,cursor:idx == allDefs.length - 1 ? "default" : "pointer",padding:"2px 5px",fontSize:11}}>&#9660;</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Watchlist Body: Mobile Clean Rows or Desktop Multi-Column Cards */}
      {big ? (
        /* Desktop Structured Grid / Columns */
        <div data-testid="mw-grid-desktop" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:8,maxHeight:340,overflowY:"auto"}}>
          {items.map(function(it){
            var isUp = it.dir == "up";
            var isDown = it.dir == "down";
            var col = isUp ? c.up : (isDown ? c.down : c.text2);
            var statusBg = it.status == "LIVE" ? c.blueSoft : (it.status == "LAST_CLOSE" ? (light ? "#F1F5F9" : c.card2) : (it.status == "UNAVAILABLE" ? (light ? "#FEE2E2" : "rgba(239,68,68,0.12)") : (light ? "#FEF3C7" : "rgba(245,158,11,0.12)")));
            var statusCol = it.status == "LIVE" ? c.blue : (it.status == "LAST_CLOSE" ? c.text3 : (it.status == "UNAVAILABLE" ? (light ? "#991B1B" : "#FCA5A5") : (light ? "#92400E" : "#FCD34D")));
            var statusText = it.connected ? t("mw." + it.status.toLowerCase(), it.statusLabel) : t("mw.not_connected", "Data feed not connected");

            return (
              <div key={it.id} data-testid={"mw-item-" + it.id} onClick={function(){ handleOpenInstrument(it); }} role="button" tabIndex={0}
                style={{display:"flex",flexDirection:"column",justifyContent:"space-between",gap:6,background:light ? "#FAFCFF" : c.card2,border:"1px solid " + (light ? "#E2E8F0" : c.border),borderRadius:10,padding:"10px 12px",cursor:"pointer",transition:"transform 0.1s ease, border-color 0.1s ease",outline:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6}}>
                  <div style={{minWidth:0}}>
                    <span style={{display:"block",fontSize:12.5,fontWeight:800,color:c.text1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.name}</span>
                    <span style={{display:"block",fontSize:9.5,fontWeight:600,color:c.text3,marginTop:1}}>{it.exchange}</span>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:statusBg,color:statusCol,letterSpacing:"0.02em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                    {statusText}
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:6,marginTop:2}}>
                  <div>
                    {it.connected && it.valFormatted ? (
                      <span style={{fontSize:15,fontWeight:800,color:c.text1,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{it.valFormatted}</span>
                    ) : (
                      <span style={{fontSize:11,fontWeight:600,color:c.text3}}>{t("mw.not_connected", "Data feed not connected")}</span>
                    )}
                  </div>
                  <div style={{textAlign:"right"}}>
                    {it.connected && it.chgFormatted ? (
                      <span style={{fontSize:12,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{it.chgFormatted}</span>
                    ) : null}
                    {it.timeFormatted ? (
                      <span style={{display:"block",fontSize:9,fontWeight:500,color:c.text3,marginTop:1}}>{it.timeFormatted}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile Clean Single-Line Rows */
        <div data-testid="mw-list-mobile" style={{display:"flex",flexDirection:"column",gap:4,maxHeight:300,overflowY:"auto"}}>
          {items.map(function(it){
            var isUp = it.dir == "up";
            var isDown = it.dir == "down";
            var col = isUp ? c.up : (isDown ? c.down : c.text2);
            var statusBg = it.status == "LIVE" ? c.blueSoft : (it.status == "LAST_CLOSE" ? (light ? "#F1F5F9" : c.card2) : (it.status == "UNAVAILABLE" ? (light ? "#FEE2E2" : "rgba(239,68,68,0.12)") : (light ? "#FEF3C7" : "rgba(245,158,11,0.12)")));
            var statusCol = it.status == "LIVE" ? c.blue : (it.status == "LAST_CLOSE" ? c.text3 : (it.status == "UNAVAILABLE" ? (light ? "#991B1B" : "#FCA5A5") : (light ? "#92400E" : "#FCD34D")));
            var statusText = it.connected ? t("mw." + it.status.toLowerCase(), it.statusLabel) : t("mw.not_connected", "Data feed not connected");

            return (
              <div key={it.id} data-testid={"mw-item-" + it.id} onClick={function(){ handleOpenInstrument(it); }} role="button" tabIndex={0}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,padding:"7px 8px",background:light ? "#FAFCFF" : c.card2,border:"1px solid " + (light ? "#EDF2F7" : c.border),borderRadius:8,cursor:"pointer",minHeight:38,boxSizing:"border-box"}}>
                {/* Left: Name and Exchange */}
                <div style={{flex:"1 1 0",minWidth:0,paddingRight:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    <span style={{fontSize:12,fontWeight:800,color:c.text1,overflow:"hidden",textOverflow:"ellipsis"}}>{it.name}</span>
                    <span style={{fontSize:9,fontWeight:600,color:c.text3,flexShrink:0}}>{it.exchange}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                    <span style={{fontSize:8.5,fontWeight:700,padding:"1px 4px",borderRadius:3,background:statusBg,color:statusCol,textTransform:"uppercase",letterSpacing:"0.02em",whiteSpace:"nowrap"}}>
                      {statusText}
                    </span>
                    {it.timeFormatted ? <span style={{fontSize:8.5,color:c.text3,whiteSpace:"nowrap"}}>{it.timeFormatted}</span> : null}
                  </div>
                </div>

                {/* Right: Value & % Change */}
                <div style={{flex:"0 0 auto",textAlign:"right",minWidth:72}}>
                  {it.connected && it.valFormatted ? (
                    <div>
                      <div style={{fontSize:12.5,fontWeight:800,color:c.text1,fontVariantNumeric:"tabular-nums",lineHeight:1.2}}>{it.valFormatted}</div>
                      {it.chgFormatted ? (
                        <div style={{fontSize:10.5,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums",lineHeight:1.1,marginTop:1}}>{it.chgFormatted}</div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{fontSize:10,fontWeight:600,color:c.text3,lineHeight:1.2}}>{t("c.unavailable", "Unavailable")}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
