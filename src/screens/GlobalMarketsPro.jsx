import { useState, useRef, useEffect } from "react";
import { DEMO_LABEL, REAL_NAME_MAP, REGIONS, DEMO_ITEMS, REAL_ITEMS_BY_REGION, EDUCATIONAL_TEXT, generateInsight } from "./GlobalMarketsData";
import { useGlobalMarketsBookmarks } from "../hooks/useGlobalMarketsBookmarks";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - GlobalMarketsPro.jsx
// Reuses the existing real /api/market-mood-data endpoint (already used
// by Market Mood) for the 6 global instruments it genuinely provides -
// not a duplicate API. Every other requested instrument has no real
// source, so it uses fixed illustrative figures, clearly and permanently
// labeled "Educational / Demo Global Markets" - never Math.random, never
// live, never a market-direction prediction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function Explain(props){
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}
function Tile(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, R = theme.c.down, T3 = theme.c.text3, UP = theme.c.up, T2=theme.c.text2;

  var c = props.item.chgPct;
  var col = c==null ? T3 : c>=0 ? UP : R;
  return (
    <div style={{background:CARD,border:"1px solid "+(c==null?BD:col),borderRadius:16,padding:12,minHeight:64}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:8,flex:1}}>{props.item.name}</div>
        <span onClick={function(e){ e.stopPropagation(); props.onBookmark(); }} style={{fontSize:14,color:props.saved?T2:T3,cursor:"pointer",minWidth:32,minHeight:32,display:"flex",alignItems:"center",justifyContent:"center"}}>{props.saved?"\u2605":"\u2606"}</span>
      </div>
      <div style={{fontSize:14,fontWeight:800,color:col}}>{c==null?"--":((c>=0?"+":"")+c.toFixed(2)+"%")}</div>
      {!props.isReal ? <div style={{fontSize:12,color:T2,marginTop:4}}>Demo</div> : <div style={{fontSize:12,color:BLUE,marginTop:4}}>Real</div>}
    </div>
  );
}

export default function GlobalMarketsPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2;
  // Reassign (not re-declare) the existing module-level color bindings so
  // Explain/Tile, which read them via closure, also reflect the theme.
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  var onBack = props.onBack || function(){};
  var bookmarks = useGlobalMarketsBookmarks(); // single instance for this whole subtree

  var [region, setRegion] = useState("US Markets");
  var [search, setSearch] = useState("");
  var [realStatus, setRealStatus] = useState("loading");
  var [realData, setRealData] = useState({});

  var abortRef = useRef(null);
  var mountedRef = useRef(true);

  useEffect(function(){
    mountedRef.current = true;
    loadReal();
    return function(){ mountedRef.current=false; if(abortRef.current){ try{abortRef.current.abort();}catch(e){} } };
  }, []);

  function loadReal(){
    if(abortRef.current){ try{ abortRef.current.abort(); }catch(e){} }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    setRealStatus("loading");
    fetch("/api/market-mood-data",{signal:ctrl.signal})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        var map = {};
        var items = (data && data.global && data.global.items) || [];
        items.forEach(function(it){ map[it.name] = it.chgPct; });
        setRealData(map);
        setRealStatus(items.length>0 ? "ok" : "empty");
      })
      .catch(function(e){
        if(e && e.name=="AbortError") return;
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        setRealStatus("error");
      });
  }

  var realNames = REAL_ITEMS_BY_REGION[region] || [];
  var realTiles = realNames.map(function(displayName){
    var apiName = REAL_NAME_MAP[displayName];
    var chg = realData.hasOwnProperty(apiName) ? realData[apiName] : null;
    return { name:displayName, chgPct:chg };
  });
  var demoTiles = DEMO_ITEMS[region] || [];
  var allTiles = realTiles.concat(demoTiles).filter(function(t){
    return !search.trim() || t.name.toLowerCase().indexOf(search.trim().toLowerCase())>=0;
  });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Global Markets Dashboard Pro</div>
          <div style={{fontSize:12,color:T2}}>Real data where available, demo elsewhere</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search instrument..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {REGIONS.map(function(r){
            var act=r==region;
            return <button key={r} onClick={function(){setRegion(r);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{r}</button>;
          })}
        </div>

        {realStatus=="error" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,textAlign:"center",color:R,fontSize:12,marginBottom:16}}>Real data temporarily unavailable. <button onClick={loadReal} style={{background:"none",border:"1px solid "+BLUE,borderRadius:16,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Retry</button></div>
        ) : null}

        {(demoTiles.length>0) ? (
          <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"inline-block"}}>
            <span style={{fontSize:12,fontWeight:700,color:T2}}>{DEMO_LABEL.toUpperCase()} (for instruments marked Demo below)</span>
          </div>
        ) : null}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {allTiles.map(function(t){
            var isReal = realNames.indexOf(t.name)>=0;
            return <Tile key={t.name} item={t} isReal={isReal} saved={bookmarks.isBookmarked(t.name)} onBookmark={function(){bookmarks.toggleBookmark(t.name);}}/>;
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{generateInsight(allTiles)}</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>EDUCATIONAL SECTION</div>
        <Explain title="Why Global Markets Matter" text={EDUCATIONAL_TEXT.whyMatters}/>
        <Explain title="Overnight Impact" text={EDUCATIONAL_TEXT.overnightImpact}/>
        <Explain title="Correlation" text={EDUCATIONAL_TEXT.correlation}/>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational only. Not investment advice. Never a market-direction prediction.</div>
        </div>
      </div>
    </div>
  );
}
