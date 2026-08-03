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
  var [pinned, setPinned] = useState(function(){ return loadJSON(PANEL_PIN_KEY, {watchlist:true, fiidii:true, news:true}); });
  var [railWidth, setRailWidth] = useState(function(){ return loadJSON(RAIL_WIDTH_KEY, 300); });
  var [railCollapsed, setRailCollapsed] = useState(function(){ return loadJSON(RAIL_COLLAPSED_KEY, false); });
  var [watchlistQuery, setWatchlistQuery] = useState("");
  var [dragging, setDragging] = useState(false);

  useEffect(function(){ saveJSON(PANEL_COLLAPSE_KEY, collapsed); }, [collapsed]);
  useEffect(function(){ saveJSON(PANEL_PIN_KEY, pinned); }, [pinned]);
  useEffect(function(){ saveJSON(RAIL_WIDTH_KEY, railWidth); }, [railWidth]);
  useEffect(function(){ saveJSON(RAIL_COLLAPSED_KEY, railCollapsed); }, [railCollapsed]);

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

  var searchResults = searchQuery.length>0 ? DEMO_STOCKS.filter(function(s){
    return s.sym.toLowerCase().indexOf(searchQuery.toLowerCase())>=0 || s.name.toLowerCase().indexOf(searchQuery.toLowerCase())>=0;
  }).slice(0,8) : [];

  var bi = data.workspaceBreakout;
  var wz = data.workspaceZones;

  var [keyLevelsIdx, setKeyLevelsIdx] = useState(0); // 0=NIFTY, 1=BANKNIFTY, 2=SENSEX - local to the Key Levels card, independent of the global spine selection
  var keyLevelsZones = useMemo(function(){
    var syms = ["NIFTY","BANKNIFTY","SENSEX"];
    var sym = syms[keyLevelsIdx];
    var row = data.spineRows.filter(function(r){ return r.key===sym; })[0];
    var fallback = {NIFTY:24500,BANKNIFTY:51500,SENSEX:80000}[sym];
    var price = (row && row.live) ? row.ltp : fallback;
    var candles = generateDemoCandles(price, 60, sym);
    var zones = analyzeZones(candles);
    var klbi = analyzeBreakoutIntelligence(candles, zones);
    var prevCandle = candles[candles.length-2];
    var openCandle = candles[0];
    zones.vwap = klbi.vwap;
    zones.prevHigh = prevCandle ? prevCandle.h : null;
    zones.prevLow = prevCandle ? prevCandle.l : null;
    zones.openingRangeHigh = openCandle ? openCandle.h : null;
    zones.openingRangeLow = openCandle ? openCandle.l : null;
    return zones;
  }, [keyLevelsIdx, data.spineRows]);

  var sectorPerf = useMemo(function(){
    var bySector = {};
    DEMO_STOCKS.forEach(function(s){
      if(!bySector[s.sect]) bySector[s.sect] = [];
      bySector[s.sect].push(s.chgPct);
    });
    var all = Object.keys(bySector).map(function(k){
      var arr = bySector[k];
      var avg = arr.reduce(function(a,b){return a+b;},0)/arr.length;
      return {sector:k, avgChg:parseFloat(avg.toFixed(2))};
    }).sort(function(a,b){ return b.avgChg-a.avgChg; });
    return { strong: all.slice(0,5), weak: all.slice(-5).reverse() };
  }, []);

  var breadth = useMemo(function(){
    var adv=0, dec=0, unch=0;
    DEMO_STOCKS.forEach(function(s){
      if(s.chgPct>0) adv++; else if(s.chgPct<0) dec++; else unch++;
    });
    return {adv:adv, dec:dec, unch:unch};
  }, []);

  var scannerPreview = useMemo(function(){
    return DEMO_STOCKS.slice(0,5).map(function(s){
      var candles = generateDemoCandles(s.ltp, 90, s.sym);
      var z = analyzeZones(candles);
      var sbi = analyzeBreakoutIntelligence(candles, z);
      var confidence = sbi.volumeConfirmed ? 70 : 45;
      if(sbi.verdict==="Healthy") confidence += 20;
      if(sbi.retest && !sbi.retest.retested) confidence += 10;
      confidence = Math.min(95, confidence);
      var zoneLevel = z.support ? z.support.price : (z.resistance ? z.resistance.price : null);
      var zoneLabel = z.support ? "Near Support" : (z.resistance ? "Near Resistance" : "No Clear Zone");
      var lastCandle = candles[candles.length-1];
      var rangePct = ((lastCandle.h-lastCandle.l)/lastCandle.c)*100;
      var riskLevel = rangePct<1 ? "Low" : (rangePct<2.5 ? "Moderate" : "High");
      return {sym:s.sym, verdict:sbi.verdict, confidence:confidence, zoneLevel:zoneLevel, zoneLabel:zoneLabel, riskLevel:riskLevel};
    });
  }, []);
  var symLabel = data.workspaceIsStock ? data.workspaceSymbol : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).label;
  var stockMeta = data.workspaceIsStock ? DEMO_STOCKS.filter(function(s){return s.sym===data.workspaceSymbol;})[0] : null;
  var chgPct = data.workspaceIsStock ? (stockMeta?stockMeta.chgPct:0) : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).chgPct;
  var isUp = chgPct!=null && chgPct>=0;

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
    {id:"watchlist", pinKey:"watchlist", title:"Watchlist"},
    {id:"fiidii", pinKey:"fiidii", title:"FII/DII Net Flow"},
    {id:"alerts", pinKey:null, title:"Live Alerts"},
    {id:"news", pinKey:"news", title:"Market News"}
  ].sort(function(a,b){
    var pa = a.pinKey ? (pinned[a.pinKey]?0:1) : 1;
    var pb = b.pinKey ? (pinned[b.pinKey]?0:1) : 1;
    return pa-pb;
  });

  function renderRailBody(id){
    if(id==="watchlist"){
      return (
        <div>
          <input
            value={watchlistQuery}
            onChange={function(e){setWatchlistQuery(e.target.value);}}
            placeholder="Search watchlist..."
            style={{width:"100%",boxSizing:"border-box",background:CARD2,border:"1px solid "+BD,borderRadius:8,padding:"6px 10px",color:T1,fontSize:11,fontFamily:"inherit",marginBottom:8}}
          />
          {!data.wl.hasStoredWatchlist || data.wl.list.length===0 ? (
            <div style={{fontSize:11,color:T2,padding:"6px 0"}}>No watchlist symbols added yet</div>
          ) : (function(){
            var filtered = data.wl.list.filter(function(sym){
              return watchlistQuery.length===0 || sym.toLowerCase().indexOf(watchlistQuery.toLowerCase())>=0;
            });
            if(filtered.length===0) return <div style={{fontSize:11,color:T2,padding:"6px 0"}}>No matches</div>;
            return filtered.map(function(sym){
              var s = DEMO_STOCKS.filter(function(x){return x.sym===sym;})[0];
              return (
                <div key={sym} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD2,gap:6}}>
                  <div onClick={function(){data.selectStock(sym);}} style={{cursor:"pointer",minWidth:0,flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:T1}}>{sym}</div>
                    {s ? (
                      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                        <span style={{fontSize:10,color:T2,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN")}</span>
                        <span style={{fontSize:10,fontWeight:700,color:s.chgPct>=0?UP:DOWN}}>{s.chgPct>=0?"+":""}{s.chgPct}%</span>
                      </div>
                    ) : <ProvenanceBadge type="unavailable"/>}
                  </div>
                  <button onClick={function(){data.selectStock(sym);}} title={"Open "+sym} style={{background:"none",border:"1px solid "+BD2,borderRadius:6,width:22,height:22,color:T2,fontSize:10,cursor:"pointer",flexShrink:0}}>&#128200;</button>
                </div>
              );
            });
          })()}
        </div>
      );
    }
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
    if(id==="news"){
      return (
        <div>
          {JUSTIN.slice(0,5).map(function(n){
            return <div key={n.id} style={{fontSize:11,color:T2,padding:"4px 0",borderBottom:"1px solid "+BD2}}>{n.headline}</div>;
          })}
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

        {/* CENTER WORKSPACE - rich, populated widget grid */}
        <div style={{flex:1,minWidth:0,padding:"12px 18px",overflowY:"auto"}}>

          {/* Instrument header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:8,borderBottom:"1px solid "+BD2}}>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:T1}}>{symLabel} <span style={{fontSize:11,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"2px 6px",marginLeft:8}}>NSE</span></div>
            </div>
            <MarketMetric
              label="Live Price"
              value={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? "Not Available" : (data.workspaceLtp.toLocaleString("en-IN",{maximumFractionDigits:2}) + (chgPct!=null ? ("  " + (isUp?"+":"") + chgPct + "%") : ""))}
              provenance={data.workspaceHasLiveLtp ? "live" : (data.workspaceIsStock ? "demo" : "unavailable")}
              color={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? T3 : (isUp?UP:DOWN)} size={16} mono={true}
            />
          </div>

          {/* Top row - 4 index cards with real sparkline history and change% */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8,marginBottom:9}}>
            {data.spineRows.map(function(r){
              var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
              var hist = data.ltpHistoryRef.current[r.key] || [];
              return (
                <div key={r.key} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,marginBottom:9}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Market Intelligence</div>
              {!mm.mood || mm.mood.score==null ? (
                <div style={{fontSize:11,color:T2}}>{mm.status=="loading"?"Loading...":"Market mood unavailable"}</div>
              ) : (function(){
                var score = mm.mood.score;
                var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
                var r=26, circ=2*Math.PI*r, filled=circ*(score/100);
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
                    <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid "+BD2}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:11,color:T2}}>Market Breadth</span>
                        <ProvenanceBadge type="demo"/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700}}>
                        <span style={{color:UP}}>{breadth.adv} Adv</span>
                        <span style={{color:DOWN}}>{breadth.dec} Dec</span>
                        <span style={{color:T2}}>{breadth.unch} Unch</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>AI Market Brief</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              {(function(){
                var vixLtp = mm.data && mm.data.indices && mm.data.indices.VIX && mm.data.indices.VIX.ltp;
                var riskLevel = vixLtp!=null ? (vixLtp<13?"Low":(vixLtp<=18?"Moderate":"High")) : null;
                var riskColor = riskLevel==="Low"?UP:(riskLevel==="High"?DOWN:theme.c.gold);
                var biasColor = bi.trend==="Uptrend"?UP:(bi.trend==="Downtrend"?DOWN:T2);
                return (
                  <div>
                    <div style={{fontSize:11,color:T2,lineHeight:1.5,marginBottom:6}}>{symLabel} is {bi.trend.toLowerCase()}, volume is {bi.volumeConfirmed?"confirmed":"average"}, and price is {bi.aboveVwap===true?"above":(bi.aboveVwap===false?"below":"near")} VWAP.</div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>Important Events</span><span style={{fontWeight:700,color:T1}}>RBI Today, Fed Wed</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>Risk Level</span><span style={{fontWeight:700,color:riskLevel?riskColor:T3}}>{riskLevel||"Not Available"}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>Trading Bias</span><span style={{fontWeight:700,color:biasColor}}>{bi.trend}</span></div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Key Levels</div>
              <div style={{display:"flex",gap:4,marginBottom:10}}>
                {["NIFTY 50","BANK NIFTY","SENSEX"].map(function(lbl,i){
                  var active = i===keyLevelsIdx;
                  return <button key={lbl} onClick={function(){setKeyLevelsIdx(i);}} style={{flex:1,background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:7,padding:"5px 2px",color:active?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>;
                })}
              </div>
              {keyLevelsZones.resistance2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.resistance2.price}</span></div> : null}
              {keyLevelsZones.resistance ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:DOWN,fontWeight:700}}>R1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.resistance.price}</span></div> : null}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:GOLD+"1A",borderLeft:"3px solid "+GOLD,borderRadius:4,margin:"3px 0"}}>
                <span style={{fontSize:10,color:GOLD,fontWeight:800}}>CURRENT</span>
                <span style={{fontSize:13,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{keyLevelsZones.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              </div>
              {keyLevelsZones.support ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S1</span><span style={{fontSize:13,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.support.price}</span></div> : null}
              {keyLevelsZones.support2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:UP,fontWeight:700}}>S2</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.support2.price}</span></div> : null}
              <div style={{borderTop:"1px solid "+BD2,marginTop:6,paddingTop:6}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:10}}><span style={{color:T2}}>VWAP</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.vwap!=null?keyLevelsZones.vwap.toLocaleString("en-IN"):"--"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:10}}><span style={{color:T2}}>Prev High / Low</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.prevHigh!=null?keyLevelsZones.prevHigh.toLocaleString("en-IN")+" / "+keyLevelsZones.prevLow.toLocaleString("en-IN"):"--"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:10}}><span style={{color:T2}}>Opening Range</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.openingRangeHigh!=null?keyLevelsZones.openingRangeHigh.toLocaleString("en-IN")+" / "+keyLevelsZones.openingRangeLow.toLocaleString("en-IN"):"--"}</span></div>
              </div>
            </div>
          </div>

          {/* Row 2: Top Gainers | Top Losers | Sector Performance */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,marginBottom:9}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Top Gainers</span>
                <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View All &#8594;</button>
              </div>
              {GAINERS.slice(0,5).map(function(s){
                return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{fontWeight:700,color:T1}}>{s.sym}</span><span style={{fontWeight:700,color:UP}}>+{s.pct}%</span></div>;
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Top Losers</span>
                <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View All &#8594;</button>
              </div>
              {LOSERS.slice(0,5).map(function(s){
                return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{fontWeight:700,color:T1}}>{s.sym}</span><span style={{fontWeight:700,color:DOWN}}>{s.pct}%</span></div>;
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Sector Strength</span>
                <ProvenanceBadge type="demo"/>
              </div>
              <div style={{fontSize:9,color:T2,fontWeight:700,marginBottom:4}}>TOP STRONG</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:5,marginBottom:8}}>
                {sectorPerf.strong.map(function(sec){
                  return (
                    <div key={sec.sector} style={{background:"rgba(0,100,0,0.18)",border:"1px solid "+UP+"40",borderRadius:8,padding:"6px 5px",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:800,color:T1,letterSpacing:0.3}}>{sec.sector.toUpperCase()}</div>
                      <div style={{fontSize:10,fontWeight:700,color:UP,marginTop:2}}>+{sec.avgChg}%</div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:9,color:T2,fontWeight:700,marginBottom:4}}>TOP WEAK</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:5}}>
                {sectorPerf.weak.map(function(sec){
                  return (
                    <div key={sec.sector} style={{background:"rgba(220,38,38,0.15)",border:"1px solid "+DOWN+"40",borderRadius:8,padding:"6px 5px",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:800,color:T1,letterSpacing:0.3}}>{sec.sector.toUpperCase()}</div>
                      <div style={{fontSize:10,fontWeight:700,color:DOWN,marginTop:2}}>{sec.avgChg}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Breakout Scanner preview | Market Heatmap */}
          <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:8,marginBottom:9}}>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,fontWeight:800,color:T1}}>Breakout Scanner</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full Scanner &#8594;</button>
              </div>
              {scannerPreview.map(function(sr){
                var riskColor = sr.riskLevel==="Low"?UP:(sr.riskLevel==="High"?DOWN:theme.c.gold);
                return (
                  <div key={sr.sym} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                      <span style={{fontWeight:700,color:T1}}>{sr.sym}</span>
                      <span style={{color:T2}}>{sr.verdict}</span>
                      <span style={{fontWeight:700,color:BLUE}}>{sr.confidence}%</span>
                    </div>
                    <div style={{background:CARD2,borderRadius:4,height:5,overflow:"hidden",marginBottom:3}}>
                      <div style={{width:sr.confidence+"%",height:"100%",background:BLUE}}></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                      <span style={{color:T2}}>{sr.zoneLabel}{sr.zoneLevel!=null?" ("+sr.zoneLevel.toLocaleString("en-IN")+")":""}</span>
                      <span style={{fontWeight:700,color:riskColor}}>Risk: {sr.riskLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
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
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
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
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:9}}>
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
