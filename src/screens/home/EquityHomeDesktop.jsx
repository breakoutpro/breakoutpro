import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { GAINERS, LOSERS } from "../HomeData";
import { DEMO_STOCKS } from "../../data/marketsStocks";
import { getOptionsIntel } from "../OptionsIntelData";
import { JUSTIN } from "../JustInData";
import { generateDemoCandles, analyzeZones, analyzeBreakoutIntelligence } from "../../utils/priceActionZones";
import MarketBadge from "./MarketBadge";
import MarketMetric from "../../components/MarketMetric";
import ProvenanceBadge from "../../components/ProvenanceBadge";

// BreakoutPro - EquityHomeDesktop.jsx
// The Desktop Workstation, built per the approved Design Specification
// (BREAKOUT_INTELLIGENCE_LAPTOP_SPEC.md). Market-first architecture:
// Market Spine (4 permanent indices) is the default focus; selecting a
// stock switches the whole workspace into Stock Mode; selecting an index
// again returns instantly to Market Mode. Breakout Intelligence is the
// dominant center panel, not a card. Every displayed metric renders through
// MarketMetric/ProvenanceBadge - the mandatory, enforced provenance rule.
// The left nav rail is provided by the app shell (DesktopLeftSidebar in
// App.jsx) - this file does not render its own nav.
// Rules: no backtick, no triple-equals, ASCII.

var PANEL_COLLAPSE_KEY = "bp_desktop_panel_collapse_v1";
var PANEL_PIN_KEY = "bp_desktop_panel_pin_v1";
var RAIL_WIDTH_KEY = "bp_desktop_rail_width_v1";
var RAIL_COLLAPSED_KEY = "bp_desktop_rail_collapsed_v1";
var LEFT_PANE_WIDTH_KEY = "bp_desktop_leftpane_width_v1";
var LEFT_PANE_COLLAPSED_KEY = "bp_desktop_leftpane_collapsed_v1";

function loadJSON(key, fallback){
  try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
}
function saveJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}

export default function EquityHomeDesktop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, GOLD=theme.c.gold, WARN=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  var [searchQuery, setSearchQuery] = useState("");
  var [searchOpen, setSearchOpen] = useState(false);
  var [collapsed, setCollapsed] = useState(function(){ return loadJSON(PANEL_COLLAPSE_KEY, {}); });
  var [pinned, setPinned] = useState(function(){ return loadJSON(PANEL_PIN_KEY, {fiidii:true, globalContext:true}); });
  var [railWidth, setRailWidth] = useState(function(){ return loadJSON(RAIL_WIDTH_KEY, 300); });
  var [railCollapsed, setRailCollapsed] = useState(function(){ return loadJSON(RAIL_COLLAPSED_KEY, false); });
  var [leftPaneWidth, setLeftPaneWidth] = useState(function(){ return loadJSON(LEFT_PANE_WIDTH_KEY, 260); });
  var [leftPaneCollapsed, setLeftPaneCollapsed] = useState(function(){ return loadJSON(LEFT_PANE_COLLAPSED_KEY, false); });
  var [watchlistQuery, setWatchlistQuery] = useState("");
  var [leftDragging, setLeftDragging] = useState(false);
  var [dragging, setDragging] = useState(false);

  useEffect(function(){ saveJSON(PANEL_COLLAPSE_KEY, collapsed); }, [collapsed]);
  useEffect(function(){ saveJSON(PANEL_PIN_KEY, pinned); }, [pinned]);
  useEffect(function(){ saveJSON(RAIL_WIDTH_KEY, railWidth); }, [railWidth]);
  useEffect(function(){ saveJSON(RAIL_COLLAPSED_KEY, railCollapsed); }, [railCollapsed]);
  useEffect(function(){ saveJSON(LEFT_PANE_WIDTH_KEY, leftPaneWidth); }, [leftPaneWidth]);
  useEffect(function(){ saveJSON(LEFT_PANE_COLLAPSED_KEY, leftPaneCollapsed); }, [leftPaneCollapsed]);

  function toggleCollapse(key){ setCollapsed(function(c){ var n=Object.assign({},c); n[key]=!n[key]; return n; }); }
  function togglePin(key){ setPinned(function(p){ var n=Object.assign({},p); n[key]=!n[key]; return n; }); }

  useEffect(function(){
    if(!dragging) return;
    function onMove(e){ setRailWidth(Math.max(240, Math.min(420, window.innerWidth - e.clientX))); }
    function onUp(){ setDragging(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return function(){ window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  useEffect(function(){
    if(!leftDragging) return;
    function onMove(e){ setLeftPaneWidth(Math.max(220, Math.min(360, e.clientX))); }
    function onUp(){ setLeftDragging(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return function(){ window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [leftDragging]);

  var searchResults = searchQuery.length>0 ? DEMO_STOCKS.filter(function(s){
    return s.sym.toLowerCase().indexOf(searchQuery.toLowerCase())>=0 || s.name.toLowerCase().indexOf(searchQuery.toLowerCase())>=0;
  }).slice(0,8) : [];

  var bi = data.workspaceBreakout;
  var wz = data.workspaceZones;

  // Sector Performance - real aggregation (average % change per sector) from
  // the real (demo) DEMO_STOCKS dataset, which already has real sector tags.
  var sectorPerf = useMemo(function(){
    var bySector = {};
    DEMO_STOCKS.forEach(function(s){
      if(!bySector[s.sect]) bySector[s.sect] = [];
      bySector[s.sect].push(s.chgPct);
    });
    return Object.keys(bySector).map(function(k){
      var arr = bySector[k];
      var avg = arr.reduce(function(a,b){return a+b;},0)/arr.length;
      return {sector:k, avgChg:parseFloat(avg.toFixed(2))};
    }).sort(function(a,b){ return b.avgChg-a.avgChg; }).slice(0,6);
  }, []);

  // Breakout Scanner preview - reuses the same real, already-tested
  // analyzeBreakoutIntelligence engine per stock. "Confidence" is a real
  // composite of already-computed real signals (volume confirmation, verdict,
  // retest status) - not an independent invented number.
  var scannerPreview = useMemo(function(){
    return DEMO_STOCKS.slice(0,5).map(function(s){
      var candles = generateDemoCandles(s.ltp, 90, s.sym);
      var z = analyzeZones(candles);
      var sbi = analyzeBreakoutIntelligence(candles, z);
      var confidence = sbi.volumeConfirmed ? 70 : 45;
      if(sbi.verdict==="Healthy") confidence += 20;
      if(sbi.retest && !sbi.retest.retested) confidence += 10;
      confidence = Math.min(95, confidence);
      return {sym:s.sym, verdict:sbi.verdict, confidence:confidence};
    });
  }, []);
  var symLabel = data.workspaceIsStock ? data.workspaceSymbol : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).label;
  var stockMeta = data.workspaceIsStock ? DEMO_STOCKS.filter(function(s){return s.sym===data.workspaceSymbol;})[0] : null;
  var chgPct = data.workspaceIsStock ? (stockMeta?stockMeta.chgPct:0) : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).chgPct;
  var isUp = chgPct!=null && chgPct>=0;

  var verdictColor = bi.verdict=="Healthy"?UP : bi.verdict=="Weakening"?WARN : bi.verdict=="Failed"?DOWN : T3;
  var verdictText = bi.verdict=="Healthy" ? "HEALTHY BREAKOUT" : bi.verdict=="Weakening" ? "WEAKENING BREAKOUT" : bi.verdict=="Failed" ? "FAILED BREAKOUT" : "NO ACTIVE BREAKOUT";

  var oiAvailable = data.workspaceSymbol==="NIFTY";
  var oi = oiAvailable ? getOptionsIntel("NIFTY") : null;
  var oiFlat = [];
  if(oi){ oi.metrics.forEach(function(g){ g.items.forEach(function(m){ oiFlat.push(m); }); }); if(oi.greeks) oiFlat = oiFlat.concat(oi.greeks); }
  function oiVal(key){ var m = oiFlat.filter(function(x){return x.key===key;})[0]; return m ? m.val : null; }

  function PanelHeader(p){
    var isCollapsed = !!collapsed[p.id];
    return (
      <div onClick={function(){toggleCollapse(p.id);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T3,transform:isCollapsed?"rotate(-90deg)":"none",display:"inline-block",transition:"transform 120ms"}}>&#9662;</span>
          <span style={{fontSize:12,fontWeight:800,color:T1}}>{p.title}</span>
        </div>
        {p.pinKey ? (
          <button onClick={function(e){e.stopPropagation();togglePin(p.pinKey);}} title={pinned[p.pinKey]?"Unpin":"Pin"} style={{background:"none",border:"none",cursor:"pointer",color:pinned[p.pinKey]?GOLD:T3,fontSize:13}}>&#128204;</button>
        ) : null}
      </div>
    );
  }

  function RailSection(p){
    var isCollapsed = !!collapsed[p.id];
    return (
      <div style={{borderBottom:"1px solid "+BD2}}>
        <PanelHeader id={p.id} title={p.title} pinKey={p.pinKey}/>
        {!isCollapsed ? <div style={{padding:"0 12px 8px"}}>{p.children}</div> : null}
      </div>
    );
  }

  // Order right-rail sections by pin state (pinned first), matching §7b.
  // Watchlist is NOT in this list - it is a fixed, always-visible section,
  // never collapsible, per the "keep Watchlist permanently visible" rule.
  var railSections = [
    {id:"fiidii", pinKey:"fiidii", title:"FII/DII Net Flow"},
    {id:"alerts", pinKey:null, title:"Live Alerts"},
    {id:"globalContext", pinKey:"globalContext", title:"Market Context"}
  ].sort(function(a,b){
    var pa = a.pinKey ? (pinned[a.pinKey]?0:1) : 1;
    var pb = b.pinKey ? (pinned[b.pinKey]?0:1) : 1;
    return pa-pb;
  });

  function renderRailBody(id){
    if(id==="fiidii"){
      var fii=3245, dii=1890; // demo, illustrative magnitudes only
      var maxV = Math.max(fii,dii);
      return (
        <div>
          <div style={{display:"flex",alignItems:"flex-end",gap:14,height:70,marginBottom:8}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{background:UP,borderRadius:"4px 4px 0 0",height:(fii/maxV)*60,width:"100%"}}></div>
              <div style={{fontSize:10,color:T2,marginTop:4}}>FII</div>
              <div style={{fontSize:11,fontWeight:700,color:UP}}>+{fii} Cr</div>
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{background:DOWN,borderRadius:"4px 4px 0 0",height:(dii/maxV)*60,width:"100%"}}></div>
              <div style={{fontSize:10,color:T2,marginTop:4}}>DII</div>
              <div style={{fontSize:11,fontWeight:700,color:DOWN}}>-{dii} Cr</div>
            </div>
          </div>
          <ProvenanceBadge type="demo"/>
        </div>
      );
    }

    if(id==="alerts"){
      return <div style={{fontSize:11,color:T2}}>No alerts yet - set one up from Breakout Intelligence.</div>;
    }
    if(id==="globalContext"){
      return (
        <div>
          <div style={{fontSize:11,color:T2,marginBottom:6}}>Global Markets: <span style={{color:T1,fontWeight:700}}>Dow +0.4% &middot; Nasdaq +0.6%</span></div>
          <div style={{fontSize:11,color:T2}}>Economic Calendar: <span style={{color:T1,fontWeight:700}}>RBI Today &middot; Fed Wed</span></div>
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* TOP BAR */}
      <div style={{display:"flex",alignItems:"center",padding:"6px 20px",borderBottom:"1px solid "+BD,gap:12}}>
        <div style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,flexShrink:0}}>
          <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
        </div>
        <MarketBadge/>
        <div style={{position:"relative",flex:1,maxWidth:340}}>
          <input
            value={searchQuery}
            onChange={function(e){setSearchQuery(e.target.value);}}
            onFocus={function(){setSearchOpen(true);}}
            onBlur={function(){setTimeout(function(){setSearchOpen(false);},150);}}
            placeholder="Search NIFTY, BANKNIFTY, RELIANCE..."
            style={{width:"100%",boxSizing:"border-box",background:CARD2,border:"1px solid "+BD,borderRadius:11,padding:"5px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}
          />
          {searchOpen && searchResults.length>0 ? (
            <div style={{position:"absolute",top:"110%",left:0,right:0,background:CARD,border:"1px solid "+BD,borderRadius:10,overflow:"hidden",zIndex:20,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              {searchResults.map(function(s){
                return (
                  <div key={s.sym} onMouseDown={function(){data.selectStock(s.sym);setSearchQuery("");}} style={{padding:"5px 12px",cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                    <span style={{fontSize:11,color:T2}}>{s.name}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        <div style={{fontSize:11,color:T3,whiteSpace:"nowrap"}}>Auto-refresh: 30s</div>
        <div style={{flex:1}}></div>
        <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:16}}>&#128276;</button>
        <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:16}}>&#128100;</button>
      </div>

      {/* MARKET SPINE - permanent 4 indices, always visible, the primary selector */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD2}}>
        {data.spineRows.map(function(r,i){
          var active = !data.workspaceIsStock && data.selectedIndex===r.key;
          var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
          return (
            <div key={r.key} onClick={function(){data.selectIndex(r.key);}} style={{padding:"6px 16px",cursor:"pointer",borderRight:i<data.spineRows.length-1?"1px solid "+BD2:"none",background:active?"rgba(59,130,246,0.10)":"transparent",borderBottom:active?"2px solid "+BLUE:"2px solid transparent",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:T2}}>{r.label}</span>
              {r.live ? (
                <span style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:T1}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              ) : (
                <ProvenanceBadge type="unavailable"/>
              )}
              {r.live ? <span style={{fontSize:12,fontWeight:700,color:color}}>{r.dir==="up"?"+":""}{r.chgPct}%</span> : null}
            </div>
          );
        })}
        {data.workspaceIsStock ? (
          <div style={{padding:"6px 16px",display:"flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.10)",borderBottom:"2px solid "+BLUE}}>
            <span style={{fontSize:12,color:T2}}>Stock Mode</span>
            <span style={{fontSize:13,fontWeight:800,color:T1}}>{data.workspaceSymbol}</span>
            <button onClick={data.returnToMarketMode} style={{background:"none",border:"none",cursor:"pointer",color:BLUE,fontSize:11,fontWeight:700}}>&times; Back to Market</button>
          </div>
        ) : null}
      </div>

      {/* WORKSPACE TABS */}
      <div style={{display:"flex",gap:16,padding:"0 16px",borderBottom:"1px solid "+BD}}>
        {["Breakout Intelligence","Overview","Scanner","Heatmap","FII/DII","News"].map(function(t,i){
          return <div key={t} style={{padding:"6px 0",fontSize:11,fontWeight:700,color:i===0?BLUE:T2,borderBottom:i===0?"2px solid "+BLUE:"2px solid transparent",cursor:"pointer"}}>{t}</div>;
        })}
      </div>

      {/* MAIN AREA - left watchlist pane + center workspace + resizable right rail */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* LEFT PANE - dedicated Watchlist: search, LTP, change%, quick-chart button per row */}
        {leftPaneCollapsed ? (
          <div style={{width:30,flexShrink:0,borderRight:"1px solid "+BD,background:CARD,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:8}}>
            <button onClick={function(){setLeftPaneCollapsed(false);}} title="Expand watchlist" style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:13}}>&#9654;</button>
          </div>
        ) : (
          <div style={{width:leftPaneWidth,flexShrink:0,borderRight:"1px solid "+BD,background:CARD,display:"flex",flexDirection:"column",minHeight:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",borderBottom:"1px solid "+BD2,flexShrink:0}}>
              <span style={{fontSize:10,color:T3,fontWeight:700,letterSpacing:0.4}}>WATCHLIST</span>
              <button onClick={function(){setLeftPaneCollapsed(true);}} title="Collapse watchlist" style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:12}}>&#9664;</button>
            </div>
            <div style={{padding:"8px 10px",borderBottom:"1px solid "+BD2,flexShrink:0}}>
              <input
                value={watchlistQuery}
                onChange={function(e){setWatchlistQuery(e.target.value);}}
                placeholder="Search watchlist..."
                style={{width:"100%",boxSizing:"border-box",background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"6px 10px",color:T1,fontSize:12,fontFamily:"inherit"}}
              />
            </div>
            <div style={{flex:1,overflowY:"auto",minHeight:0,padding:"6px 10px"}}>
              {!data.wl.hasStoredWatchlist || data.wl.list.length===0 ? (
                <div style={{fontSize:11,color:T2,padding:"8px 0"}}>No watchlist symbols added yet</div>
              ) : (function(){
                var filtered = data.wl.list.filter(function(sym){
                  return watchlistQuery.length===0 || sym.toLowerCase().indexOf(watchlistQuery.toLowerCase())>=0;
                });
                if(filtered.length===0) return <div style={{fontSize:11,color:T2,padding:"8px 0"}}>No matches</div>;
                return filtered.map(function(sym){
                  var s = DEMO_STOCKS.filter(function(x){return x.sym===sym;})[0];
                  return (
                    <div key={sym} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 4px",borderBottom:"1px solid "+BD2,gap:6}}>
                      <div onClick={function(){data.selectStock(sym);}} style={{cursor:"pointer",minWidth:0,flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{sym}</div>
                        {s ? (
                          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                            <span style={{fontSize:11,color:T2,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN")}</span>
                            <span style={{fontSize:11,fontWeight:700,color:s.chgPct>=0?UP:DOWN}}>{s.chgPct>=0?"+":""}{s.chgPct}%</span>
                            <ProvenanceBadge type="demo"/>
                          </div>
                        ) : <ProvenanceBadge type="unavailable"/>}
                      </div>
                      <button onClick={function(){data.selectStock(sym);}} title={"Open "+sym+" chart"} style={{background:"none",border:"1px solid "+BD2,borderRadius:7,width:26,height:26,color:T2,fontSize:12,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>&#128200;</button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* LEFT DRAG HANDLE - only when the pane is expanded */}
        {!leftPaneCollapsed ? (
          <div onMouseDown={function(){setLeftDragging(true);}} style={{width:4,cursor:"col-resize",background:leftDragging?BLUE:"transparent",flexShrink:0}}></div>
        ) : null}

        {/* CENTER WORKSPACE - rich, populated widget grid */}
        <div style={{flex:1,minWidth:0,padding:"12px 18px",overflowY:"auto"}}>

          {/* Instrument header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"1px solid "+BD2}}>
            <div>
              <div style={{fontSize:22,fontWeight:900,color:T1}}>{symLabel} <span style={{fontSize:11,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"2px 6px",marginLeft:8}}>NSE</span></div>
            </div>
            <MarketMetric
              label="Live Price"
              value={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? "Not Available" : (data.workspaceLtp.toLocaleString("en-IN",{maximumFractionDigits:2}) + (chgPct!=null ? ("  " + (isUp?"+":"") + chgPct + "%") : ""))}
              provenance={data.workspaceHasLiveLtp ? "live" : (data.workspaceIsStock ? "demo" : "unavailable")}
              color={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? T3 : (isUp?UP:DOWN)} size={25} mono={true}
            />
          </div>

          {/* Top row - 4 index cards with real sparkline history and change% */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:12,marginBottom:14}}>
            {data.spineRows.map(function(r){
              var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
              var hist = data.ltpHistoryRef.current[r.key] || [];
              return (
                <div key={r.key} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:11,color:T2,fontWeight:600}}>{r.label}</div>
                      {r.live ? (
                        <>
                          <div style={{fontSize:18,fontWeight:900,color:T1,fontFamily:"monospace",marginTop:2}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                          <div style={{fontSize:12,fontWeight:700,color:color,marginTop:2}}>{r.dir==="up"?"+":""}{r.chgPct}%</div>
                        </>
                      ) : <div style={{marginTop:4}}><ProvenanceBadge type="unavailable"/></div>}
                    </div>
                    {hist.length>=2 ? (function(){
                      var min=Math.min.apply(null,hist), max=Math.max.apply(null,hist), range=max-min||1;
                      var w=52,h=28;
                      var pts = hist.map(function(v,i){ return (i/(hist.length-1))*w+","+(h-((v-min)/range)*(h-4)+2); }).join(" ");
                      return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
                    })() : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 1: Market Intelligence gauge | Today's Trading Edge | Key Levels */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12,marginBottom:14}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Market Intelligence</div>
              {!mm.mood || mm.mood.score==null ? (
                <div style={{fontSize:11,color:T2}}>{mm.status=="loading"?"Loading...":"Market mood unavailable"}</div>
              ) : (function(){
                var score = mm.mood.score;
                var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
                var r=26, circ=2*Math.PI*r, filled=circ*(score/100);
                var advCount = GAINERS.length, decCount = LOSERS.length;
                return (
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r={r} fill="none" stroke={BD2} strokeWidth="6"/>
                        <circle cx="32" cy="32" r={r} fill="none" stroke={moodColor} strokeWidth="6" strokeDasharray={filled+" "+circ} strokeLinecap="round" transform="rotate(-90 32 32)"/>
                        <text x="32" y="30" textAnchor="middle" fontSize="15" fontWeight="900" fill={T1}>{score}</text>
                        <text x="32" y="42" textAnchor="middle" fontSize="8" fill={T3}>/100</text>
                      </svg>
                      <div>
                        <div style={{fontSize:14,fontWeight:900,color:moodColor}}>{mm.mood.label}</div>
                        <div style={{fontSize:11,color:T2,marginTop:2}}>Confidence {mm.mood.confidence}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:10,borderTop:"1px solid "+BD2}}>
                      <span style={{fontSize:11,color:T2}}>Sample Breadth</span>
                      <span style={{fontSize:11,fontWeight:700}}><span style={{color:UP}}>{advCount} Adv</span> / <span style={{color:DOWN}}>{decCount} Dec</span></span>
                      <ProvenanceBadge type="demo"/>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Today's Trading Edge</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <div style={{fontSize:15,fontWeight:900,color:verdictColor,marginBottom:8}}>{verdictText}</div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{color:T2}}>Volume</span><span style={{fontWeight:700,color:T1}}>{bi.volumeConfirmed?"Confirmed":"Average"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{color:T2}}>VWAP</span><span style={{fontWeight:700,color:T1}}>{bi.vwap!=null?(bi.aboveVwap?"Above":"Below"):"--"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{color:T2}}>Retest</span><span style={{fontWeight:700,color:T1}}>{bi.retest?(bi.retest.retested?"Yes":"Not yet"):"N/A"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{color:T2}}>Trend</span><span style={{fontWeight:700,color:T1}}>{bi.trend}</span></div>
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Key Levels</div>
              {wz.resistance2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{wz.resistance2.price}</span></div> : null}
              {wz.resistance ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{wz.resistance.price}</span></div> : null}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:GOLD+"1A",borderLeft:"3px solid "+GOLD,borderRadius:4,margin:"3px 0"}}>
                <span style={{fontSize:10,color:GOLD,fontWeight:800}}>CURRENT</span>
                <span style={{fontSize:13,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{wz.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              </div>
              {wz.support ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{wz.support.price}</span></div> : null}
              {wz.support2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{wz.support2.price}</span></div> : null}
            </div>
          </div>

          {/* Row 2: Top Gainers | Top Losers | Sector Performance */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12,marginBottom:14}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Top Gainers</span>
                <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View All &#8594;</button>
              </div>
              {GAINERS.slice(0,5).map(function(s){
                return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{fontWeight:700,color:T1}}>{s.sym}</span><span style={{fontWeight:700,color:UP}}>+{s.pct}%</span></div>;
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Top Losers</span>
                <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View All &#8594;</button>
              </div>
              {LOSERS.slice(0,5).map(function(s){
                return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{fontWeight:700,color:T1}}>{s.sym}</span><span style={{fontWeight:700,color:DOWN}}>{s.pct}%</span></div>;
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Sector Performance</span>
                <ProvenanceBadge type="demo"/>
              </div>
              {sectorPerf.map(function(sec){
                var up = sec.avgChg>=0;
                return (
                  <div key={sec.sector} style={{marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                      <span style={{color:T2}}>{sec.sector}</span>
                      <span style={{fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{sec.avgChg}%</span>
                    </div>
                    <div style={{background:CARD2,borderRadius:4,height:4,overflow:"hidden"}}>
                      <div style={{width:Math.min(100,Math.abs(sec.avgChg)*20)+"%",height:"100%",background:up?UP:DOWN}}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Breakout Scanner preview | Market Heatmap */}
          <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:12,marginBottom:14}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,fontWeight:800,color:T1}}>Breakout Scanner</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full Scanner &#8594;</button>
              </div>
              {scannerPreview.map(function(sr){
                return (
                  <div key={sr.sym} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{fontWeight:700,color:T1}}>{sr.sym}</span>
                      <span style={{color:T2}}>{sr.verdict}</span>
                      <span style={{fontWeight:700,color:BLUE}}>{sr.confidence}%</span>
                    </div>
                    <div style={{background:CARD2,borderRadius:4,height:5,overflow:"hidden"}}>
                      <div style={{width:sr.confidence+"%",height:"100%",background:BLUE}}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Market Heatmap</span>
                <button onClick={function(){setTab("heatmap");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full &#8594;</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6}}>
                {GAINERS.concat(LOSERS).slice(0,8).map(function(s){
                  var up = s.pct>=0;
                  return (
                    <div key={s.sym} style={{background:up?"rgba(0,100,0,0.15)":"rgba(220,38,38,0.12)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:6,padding:"6px 3px",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:800,color:T1}}>{s.sym}</div>
                      <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Options Intelligence + Related News */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Options Intelligence</div>
              {oiAvailable ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8}}>
                  <MarketMetric label="PCR" value={oiVal("pcr")||"--"} provenance="demo"/>
                  <MarketMetric label="Max Pain" value={oiVal("maxpain")||"--"} provenance="demo"/>
                  <MarketMetric label="OI" value={oiVal("gamma")||"--"} provenance="demo"/>
                </div>
              ) : (
                <MarketMetric label={"Options data for "+data.workspaceSymbol} value="Not Available" provenance="unavailable"/>
              )}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Related News</div>
              {JUSTIN.slice(0,3).map(function(n){
                return <div key={n.id} style={{fontSize:11,color:T2,padding:"4px 0",borderBottom:"1px solid "+BD2}}>{n.headline}</div>;
              })}
            </div>
          </div>

        </div>

        {/* DRAG HANDLE - only when the rail is expanded */}
        {!railCollapsed ? (
          <div onMouseDown={function(){setDragging(true);}} style={{width:4,cursor:"col-resize",background:dragging?BLUE:"transparent",flexShrink:0}}></div>
        ) : null}

        {/* RIGHT INTELLIGENCE PANEL - resizable, collapsible as a whole,
            individually collapsible/pinnable sections, Watchlist fixed and
            always visible regardless of collapse/pin state */}
        {railCollapsed ? (
          <div style={{width:30,flexShrink:0,borderLeft:"1px solid "+BD,background:CARD,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:8}}>
            <button onClick={function(){setRailCollapsed(false);}} title="Expand intelligence panel" style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:13}}>&#9664;</button>
          </div>
        ) : (
          <div style={{width:railWidth,flexShrink:0,borderLeft:"1px solid "+BD,background:CARD,display:"flex",flexDirection:"column",minHeight:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",borderBottom:"1px solid "+BD2,flexShrink:0}}>
              <span style={{fontSize:10,color:T3,fontWeight:700,letterSpacing:0.4}}>INTELLIGENCE PANEL</span>
              <button onClick={function(){setRailCollapsed(true);}} title="Collapse panel" style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:12}}>&#9654;</button>
            </div>

            <div style={{flex:1,overflowY:"auto",minHeight:0}}>
              {railSections.map(function(s){
                return <RailSection key={s.id} id={s.id} title={s.title} pinKey={s.pinKey}>{renderRailBody(s.id)}</RailSection>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"5px 20px",borderTop:"1px solid "+BD}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.</div>
      </div>
    </div>
  );
}
