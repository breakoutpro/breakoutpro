import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
import { DEMO_STOCKS } from "../data/marketsStocks";
import { searchStocks } from "../utils/searchStocks";
// BreakoutPro - SearchScreen.jsx
// Search stocks, indices, ETFs. Educational platform. Recent searches saved.
// Pure black glass. Rules: no backtick, no triple-equals, ASCII only.
//
// DATA SOURCE: DEMO_STOCKS + searchStocks() - the SAME dataset and SAME
// case-insensitive symbol-or-name matching rule that desktop's header
// search (App.jsx's GlobalHeader) uses. This file used to keep its own
// separate, much smaller "UNIVERSE" array (18 entries, symbol-only
// matching, no Adani entry at all) which is why mobile search returned
// "No results" for queries desktop found fine - removed entirely in favor
// of the one shared source.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function loadRecent(){
  try{ return JSON.parse(localStorage.getItem("bp_recent_search")||"[]"); }catch(e){ return []; }
}
function pushRecent(sym){
  try{
    var r=loadRecent().filter(function(x){return x!=sym;});
    r.unshift(sym); r=r.slice(0,6);
    localStorage.setItem("bp_recent_search",JSON.stringify(r));
  }catch(e){}
}

export default function SearchScreen(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var [q,setQ]=useState("");
  var [recent,setRecent]=useState(loadRecent());

  function choose(s){
    pushRecent(s.sym); setRecent(loadRecent());
    if(props.onSelect) props.onSelect(s);
  }
  function clearRecent(){
    try{ localStorage.removeItem("bp_recent_search"); }catch(e){}
    setRecent([]);
  }

  var results = searchStocks(q);
  var trending = DEMO_STOCKS.slice(0,6);
  var recentItems = recent.map(function(sym){ return DEMO_STOCKS.filter(function(s){return s.sym==sym;})[0]; }).filter(Boolean);

  function Row(props2){
    var s=props2.s;
    return (
      <div onClick={function(){choose(s);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 12px",borderBottom:props2.last?"none":"1px solid "+BD2,cursor:"pointer"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
          <div style={{fontSize:12,color:T3,marginTop:4}}>{s.name}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN")}</div>
          <div style={{fontSize:12,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.chgPct}%</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <input autoFocus value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Search stocks, indices, ETFs" style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
      </div>

      <div style={{padding:16}}>
        {q?(
          results.length?(
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
              {results.map(function(s,i){ return <Row key={s.sym} s={s} last={i==results.length-1}/>; })}
            </div>
          ):(
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center"}}>
              <div style={{fontSize:12,color:T2}}>No results for "{q}". Try another symbol.</div>
            </div>
          )
        ):(
          <div>
            {recentItems.length?(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.4}}>RECENT</span>
                  <button onClick={clearRecent} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>
                </div>
                <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
                  {recentItems.map(function(s,i){ return <Row key={s.sym} s={s} last={i==recentItems.length-1}/>; })}
                </div>
              </div>
            ):null}

            <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>TRENDING</div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
              {trending.map(function(s,i){ return <Row key={s.sym} s={s} last={i==trending.length-1}/>; })}
            </div>

            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
              <div style={{fontSize:12,color:theme.c.warn}}>Educational Market Intelligence Only. Not Investment Advice.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

