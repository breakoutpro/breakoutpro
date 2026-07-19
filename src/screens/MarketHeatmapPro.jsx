import { useState, useRef, useEffect } from "react";
import { DEMO_LABEL, NIFTY50_DEMO, BANKNIFTY_DEMO, EDUCATIONAL_TEXT, generateInsight } from "./MarketHeatmapData";
import { useMarketHeatmapBookmarks } from "../hooks/useMarketHeatmapBookmarks";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - MarketHeatmapPro.jsx
// Reuses the existing real /api/market-mood-data endpoint (already used
// by Market Mood) for real sector data where it exists - not a duplicate
// API. Nifty 50 / Bank Nifty constituent-level tiles and the Financial/
// Energy sectors have no real data source anywhere in this app, so they
// use fixed illustrative figures, clearly and permanently labeled
// "Educational / Demo Heatmap" - never Math.random, never live.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function Tile(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, R = theme.c.down, T3 = theme.c.text3, UP = theme.c.up;

  var c = props.item.chgPct;
  var col = c==null ? T3 : c>=0 ? UP : R;
  return (
    <div style={{background:CARD,border:"1px solid "+(c==null?BD:col),borderRadius:10,padding:12,minHeight:64}}>
      <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:6}}>{props.item.sym||props.item.name}</div>
      <div style={{fontSize:14,fontWeight:800,color:col}}>{c==null?"--":((c>=0?"+":"")+c.toFixed(2)+"%")}</div>
      <div style={{fontSize:12,color:T3,marginTop:2}}>{c==null?"Unavailable":(c>=0?"Up":"Down")}</div>
    </div>
  );
}
function Explain(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:6}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}

function applyFilterSort(items, filter, search){
  var out = items.filter(function(i){
    var name = i.sym || i.name || "";
    if(search.trim() && name.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    return true;
  });
  if(filter=="Gainers") out = out.filter(function(i){ return i.chgPct!=null && i.chgPct>=0; });
  else if(filter=="Losers") out = out.filter(function(i){ return i.chgPct!=null && i.chgPct<0; });
  if(filter=="Alphabetical") out = out.slice().sort(function(a,b){ return (a.sym||a.name).localeCompare(b.sym||b.name); });
  else out = out.slice().sort(function(a,b){ return (b.chgPct||0)-(a.chgPct||0); });
  return out;
}

export default function MarketHeatmapPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; WARN=theme.c.warn;
  var onBack = props.onBack || function(){};
  var bookmarks = useMarketHeatmapBookmarks(); // single instance for this whole subtree

  var [view, setView] = useState("nifty50");
  var [filter, setFilter] = useState("Default");
  var [search, setSearch] = useState("");
  var [sectorStatus, setSectorStatus] = useState("loading");
  var [sectorItems, setSectorItems] = useState([]);

  var abortRef = useRef(null);
  var mountedRef = useRef(true);

  useEffect(function(){
    mountedRef.current = true;
    if(view=="sectors" && sectorStatus=="loading" && sectorItems.length==0){ loadSectors(); }
    return function(){ mountedRef.current=false; if(abortRef.current){ try{abortRef.current.abort();}catch(e){} } };
  }, [view]);

  function loadSectors(){
    if(abortRef.current){ try{ abortRef.current.abort(); }catch(e){} }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    setSectorStatus("loading");
    fetch("/api/market-mood-data",{signal:ctrl.signal})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        if(data && data.sectors && data.sectors.items && data.sectors.items.length>0){
          setSectorItems(data.sectors.items.map(function(it){ return { name:it.name, chgPct:it.chgPct }; }));
          setSectorStatus("ok");
        } else {
          setSectorItems([]); setSectorStatus("empty");
        }
      })
      .catch(function(e){
        if(e && e.name=="AbortError") return;
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        setSectorStatus("error");
      });
  }

  var demoItems = view=="nifty50" ? NIFTY50_DEMO : view=="banknifty" ? BANKNIFTY_DEMO : [];
  var realDisplay = applyFilterSort(sectorItems, filter, search);
  var demoDisplay = applyFilterSort(demoItems, filter, search);
  var viewId = "view_"+view;
  var saved = bookmarks.isBookmarked(viewId);

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Market Heatmap Pro</div>
          <div style={{fontSize:12,color:T2}}>Real sector data where available, demo elsewhere</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {[{id:"nifty50",label:"Nifty 50"},{id:"banknifty",label:"Bank Nifty"},{id:"sectors",label:"Sectors"}].map(function(v){
            var act = v.id==view;
            return <button key={v.id} onClick={function(){setView(v.id);}} style={{flex:1,background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"9px 4px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{v.label}</button>;
          })}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800,color:T2}}>
            {view=="nifty50"?"NIFTY 50 HEATMAP":view=="banknifty"?"BANK NIFTY HEATMAP":"SECTOR HEATMAP"}
          </div>
          <span onClick={function(){bookmarks.toggleBookmark(viewId);}} style={{fontSize:18,color:saved?WARN:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
        </div>

        {(view=="nifty50"||view=="banknifty") ? (
          <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"6px 10px",marginBottom:14,display:"inline-block"}}>
            <span style={{fontSize:12,fontWeight:700,color:WARN}}>{DEMO_LABEL.toUpperCase()}</span>
          </div>
        ) : null}

        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search symbol..." style={{flex:1,minWidth:140,background:CARD,border:"1px solid "+BD,borderRadius:9,padding:"9px 11px",color:T1,fontSize:12,fontFamily:"inherit"}}/>
          {["Default","Gainers","Losers","Alphabetical"].map(function(f){
            var act=f==filter;
            return <button key={f} onClick={function(){setFilter(f);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"8px 10px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{f}</button>;
          })}
        </div>

        {view=="sectors" ? (
          <div>
            {sectorStatus=="loading" ? (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T2,fontSize:12}}>Loading real sector data...</div>
            ) : sectorStatus=="error" ? (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:R,fontSize:12}}>Data temporarily unavailable. <button onClick={loadSectors} style={{background:"none",border:"1px solid "+BLUE,borderRadius:8,padding:"7px 14px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Retry</button></div>
            ) : (
              <div>
                {realDisplay.length>0 ? (
                  <div>
                    <div style={{fontSize:12,color:BLUE,marginBottom:8}}>Real, live sector data (via the same source used by Market Mood):</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                      {realDisplay.map(function(it){ return <Tile key={it.name} item={it}/>; })}
                    </div>
                  </div>
                ) : (
                  <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T3,fontSize:12,marginBottom:16}}>No real sector data available right now.</div>
                )}
                <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"6px 10px",marginBottom:10,display:"inline-block"}}>
                  <span style={{fontSize:12,fontWeight:700,color:WARN}}>FINANCIAL / ENERGY - {DEMO_LABEL.toUpperCase()}</span>
                </div>
                <div style={{fontSize:12,color:T3,marginBottom:12}}>No real data source exists for these two sectors in Breakout Pro.</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {demoDisplay.length==0 ? (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T3,fontSize:12}}>No entries match your search.</div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {demoDisplay.map(function(it){ return <Tile key={it.sym} item={it}/>; })}
              </div>
            )}
          </div>
        )}

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:14,marginTop:6}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{generateInsight(view=="sectors"?realDisplay:demoDisplay)}</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:10}}>EDUCATIONAL EXPLANATIONS</div>
        <Explain title="What is a Heatmap?" text={EDUCATIONAL_TEXT.heatmap}/>
        <Explain title="Change %" text={EDUCATIONAL_TEXT.changePct}/>
        <Explain title="Sector Grouping" text={EDUCATIONAL_TEXT.sector}/>
        <Explain title="Direction Color" text={EDUCATIONAL_TEXT.direction}/>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:6}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational only. Not investment advice. Never a market-direction prediction.</div>
        </div>
      </div>
    </div>
  );
}
