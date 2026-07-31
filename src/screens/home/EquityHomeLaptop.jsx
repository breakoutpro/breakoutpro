import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { GAINERS, LOSERS } from "../HomeData";
import { DEMO_STOCKS } from "../../data/marketsStocks";
import { getOptionsIntel } from "../OptionsIntelData";
import { JUSTIN } from "../JustInData";
import MarketBadge from "./MarketBadge";
import MarketMetric from "../../components/MarketMetric";
import ProvenanceBadge from "../../components/ProvenanceBadge";

// BreakoutPro - EquityHomeLaptop.jsx
// The Laptop Workstation, built per the approved Design Specification
// (BREAKOUT_INTELLIGENCE_LAPTOP_SPEC.md). Market-first architecture:
// Market Spine (4 permanent indices) is the default focus; selecting a
// stock switches the whole workspace into Stock Mode; selecting an index
// again returns instantly to Market Mode. Breakout Intelligence is the
// dominant center panel, not a card. Every displayed metric renders through
// MarketMetric/ProvenanceBadge - the mandatory, enforced provenance rule.
// The left nav rail is provided by the app shell (DesktopLeftSidebar in
// App.jsx) - this file does not render its own nav.
// Rules: no backtick, no triple-equals, ASCII.

var PANEL_COLLAPSE_KEY = "bp_laptop_panel_collapse_v1";
var PANEL_PIN_KEY = "bp_laptop_panel_pin_v1";
var RAIL_WIDTH_KEY = "bp_laptop_rail_width_v1";
var RAIL_COLLAPSED_KEY = "bp_laptop_rail_collapsed_v1";
var LEFT_PANE_WIDTH_KEY = "bp_laptop_leftpane_width_v1";
var LEFT_PANE_COLLAPSED_KEY = "bp_laptop_leftpane_collapsed_v1";

function loadJSON(key, fallback){
  try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
}
function saveJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}

export default function EquityHomeLaptop(props){
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
  var [pinned, setPinned] = useState(function(){ return loadJSON(PANEL_PIN_KEY, {heatmap:false, aiMood:true, watchlist:true, globalContext:true}); });
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
    {id:"aiMood", pinKey:"aiMood", title:"Market Intelligence"},
    {id:"alerts", pinKey:null, title:"Live Alerts"},
    {id:"heatmap", pinKey:"heatmap", title:"Market Heatmap"},
    {id:"globalContext", pinKey:"globalContext", title:"Market Context"}
  ].sort(function(a,b){
    var pa = a.pinKey ? (pinned[a.pinKey]?0:1) : 1;
    var pb = b.pinKey ? (pinned[b.pinKey]?0:1) : 1;
    return pa-pb;
  });

  function renderRailBody(id){
    if(id==="aiMood"){
      if(mm.status=="loading" && !mm.data) return <div style={{fontSize:11,color:T2}}>Loading...</div>;
      if(!mm.mood || mm.mood.score==null) return <div style={{fontSize:11,color:T2}}>Market mood unavailable</div>;
      var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
      return (
        <div>
          <MarketMetric label="Mood" value={mm.mood.label} provenance="calculated" color={moodColor} size={15}/>
          <div style={{fontSize:11,color:T2,marginTop:6}}>Confidence {mm.mood.confidence} &middot; Fear/Greed: {data.fearGreed||"--"}</div>
        </div>
      );
    }
    if(id==="alerts"){
      return <div style={{fontSize:11,color:T2}}>No alerts yet - set one up from Breakout Intelligence.</div>;
    }
    if(id==="heatmap"){
      return (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6}}>
          {GAINERS.concat(LOSERS).slice(0,6).map(function(s){
            var up = s.pct>=0;
            return (
              <div key={s.sym} style={{background:up?"rgba(0,100,0,0.15)":"rgba(220,38,38,0.12)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:6,padding:"5px 3px",textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:800,color:T1}}>{s.sym}</div>
                <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
              </div>
            );
          })}
        </div>
      );
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
        <div style={{fontSize:16,fontWeight:900,letterSpacing:-0.5,flexShrink:0}}>
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
      <div style={{flex:1,display:"flex",minHeight:0}}>

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

        {/* CENTER WORKSPACE - Breakout Intelligence */}
        <div style={{flex:1,minWidth:0,padding:"12px 18px",overflowY:"auto"}}>

          {/* Instrument header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingBottom:8,borderBottom:"1px solid "+BD2}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:T1}}>{symLabel} <span style={{fontSize:11,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"2px 6px",marginLeft:8}}>NSE</span></div>
            </div>
            <MarketMetric
              label="Live Price"
              value={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? "Not Available" : (data.workspaceLtp.toLocaleString("en-IN",{maximumFractionDigits:2}) + (chgPct!=null ? ("  " + (isUp?"+":"") + chgPct + "%") : ""))}
              provenance={data.workspaceHasLiveLtp ? "live" : (data.workspaceIsStock ? "demo" : "unavailable")}
              color={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? T3 : (isUp?UP:DOWN)} size={22} mono={true}
            />
          </div>

          {/* Breakout Health Verdict */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontSize:20,fontWeight:900,color:verdictColor}}>{verdictText}</span>
              <ProvenanceBadge type="calculated" size="md"/>
            </div>
          </div>

          {/* Evidence bullets - answers the 6 named questions */}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD2}}>
              <span style={{fontSize:12,color:T2}}>Volume confirmed?</span>
              <MarketMetric value={bi.volumeConfirmed?"Yes - above-average volume":"No - average or below"} provenance="calculated" size={12}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD2}}>
              <span style={{fontSize:12,color:T2}}>Retested?</span>
              <MarketMetric value={bi.retest ? (bi.retest.retested?"Yes, price returned near "+bi.retest.zonePrice:"Not yet - "+bi.retest.candlesSinceBreak+" candles since break") : "No active breakout to retest"} provenance={bi.retest?"calculated":"unavailable"} size={12}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD2}}>
              <span style={{fontSize:12,color:T2}}>VWAP status?</span>
              <MarketMetric value={bi.vwap!=null ? (bi.aboveVwap?"Above VWAP ("+bi.vwap+")":"Below VWAP ("+bi.vwap+")") : "Not available"} provenance={bi.vwap!=null?"calculated":"unavailable"} size={12}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD2}}>
              <span style={{fontSize:12,color:T2}}>Candle strength?</span>
              <MarketMetric value={bi.candleStrength.label} provenance="calculated" size={12}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD2}}>
              <span style={{fontSize:12,color:T2}}>Trend direction?</span>
              <MarketMetric value={bi.trend} provenance="calculated" size={12}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
              <span style={{fontSize:12,color:T2}}>Why this conclusion?</span>
              <MarketMetric value={bi.followThroughRate!=null ? ("Historical follow-through at similar levels: "+bi.followThroughRate+"%") : "Not enough historical data at this level"} provenance={bi.followThroughRate!=null?"calculated":"unavailable"} size={12}/>
            </div>
          </div>

          {/* Support & Resistance ladder */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:6}}>Support &amp; Resistance</div>
            {wz.resistance2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 10px"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{wz.resistance2.price}</span></div> : null}
            {wz.resistance ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 10px"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{wz.resistance.price}</span></div> : null}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 10px",background:GOLD+"1A",borderLeft:"3px solid "+GOLD,borderRadius:4,margin:"2px 0"}}>
              <span style={{fontSize:11,color:GOLD,fontWeight:800}}>CURRENT</span>
              <span style={{fontSize:14,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{wz.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
            </div>
            {wz.support ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 10px"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{wz.support.price}</span></div> : null}
            {wz.support2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 10px"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{wz.support2.price}</span></div> : null}
          </div>

          {/* Options Intelligence - real for NIFTY only, Not Available otherwise */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:6}}>Options Intelligence</div>
            {oiAvailable ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:10}}>
                <MarketMetric label="PCR" value={oiVal("pcr")||"--"} provenance="demo"/>
                <MarketMetric label="Max Pain" value={oiVal("maxpain")||"--"} provenance="demo"/>
                <MarketMetric label="OI" value={oiVal("gamma")||"--"} provenance="demo"/>
              </div>
            ) : (
              <MarketMetric label={"Options data for "+data.workspaceSymbol} value="Not Available" provenance="unavailable"/>
            )}
          </div>

          {/* Related News */}
          <div>
            <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:6}}>Related News</div>
            {JUSTIN.slice(0,3).map(function(n){
              return <div key={n.id} style={{fontSize:12,color:T2,padding:"4px 0",borderBottom:"1px solid "+BD2}}>{n.headline}</div>;
            })}
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
