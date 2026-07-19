import { useState } from "react";
import { PatternCard, PatternDetail } from "./ChartPatternsUI";
import { PATTERNS } from "./PatternData";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";


export default function ChartPatterns() {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand, BLUE = theme.c.blue; T1=theme.c.text1;

  var [search,setSearch] = useState("");
  var [filter,setFilter] = useState("All");
  var [sel,setSel] = useState(null);
  var [favs,setFavs] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_favs")||"[]");}catch(e){return [];}});
  var [done,setDone] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_pat_done")||"[]");}catch(e){return [];}});
  var [recent,setRecent] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_recent")||"[]");}catch(e){return [];}});

  function open(p) {
    setSel(p);
    var nr=[p.id].concat(recent.filter(function(r){return r!=p.id;})).slice(0,5);
    setRecent(nr);
    try{localStorage.setItem("bp_recent",JSON.stringify(nr));}catch(e){}
    if(done.indexOf(p.id)==-1){var nd=done.concat([p.id]);setDone(nd);try{localStorage.setItem("bp_pat_done",JSON.stringify(nd));}catch(e){}}
  }

  function toggleFav(id) {
    var nf=favs.indexOf(id)!=-1?favs.filter(function(f){return f!=id;}):favs.concat([id]);
    setFavs(nf);try{localStorage.setItem("bp_favs",JSON.stringify(nf));}catch(e){}
  }

  if(sel) return <PatternDetail p={sel} onBack={function(){setSel(null);}}/>;

  var FILTERS = ["All","Bullish","Bearish","Continuation","Reversal","Candlestick","Advanced","Favorites"];
  var filtered = PATTERNS.filter(function(p){
    var ms = !search||p.name.toLowerCase().indexOf(search.toLowerCase())!=-1;
    var mf = filter=="All"||filter==p.type||filter==p.cat||(filter=="Favorites"&&favs.indexOf(p.id)!=-1);
    return ms&&mf;
  });
  var progress = Math.round((done.length/PATTERNS.length)*100);
  var recentPats = recent.map(function(id){return PATTERNS.find(function(p){return p.id==id;});}).filter(Boolean);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Chart <span style={{color:BLUE}}>Patterns</span></div>
            <div style={{fontSize:8,color:T2}}>{PATTERNS.length} patterns  Beginner to Pro</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8,color:T2}}>Progress</div>
            <div style={{fontSize:14,fontWeight:900,color:progress==100?GOLD:BLUE}}>{progress}%</div>
          </div>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:progress+"%",background:progress==100?GOLD:BLUE,borderRadius:2}}></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"7px 12px",marginBottom:8}}>
          <span style={{color:T2,fontSize:12}}></span>
          <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:T1,fontFamily:"inherit"}} placeholder="Search patterns..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search?<button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:T2}}>X</button>:null}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
          {FILTERS.map(function(f){var act=filter==f;return <button key={f} onClick={function(){setFilter(f);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 10px",color:act?"#fff":T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{f}</button>;})}
        </div>
      </div>
      <div style={{padding:"12px 14px 0"}}>
        {progress==100?<div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:14,marginBottom:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:GOLD}}>Chart Master Badge!</div><div style={{fontSize:10,color:T2}}>All {PATTERNS.length} patterns studied</div></div>:null}
        {recentPats.length>0&&!search&&filter=="All"?(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,fontWeight:700,color:T2,marginBottom:6}}>RECENTLY VIEWED</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {recentPats.map(function(p){var tc=p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;return <div key={p.id} onClick={function(){open(p);}} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"7px 10px",flexShrink:0,cursor:"pointer",minWidth:90,textAlign:"center"}}><div style={{fontSize:8,fontWeight:700,color:tc}}>{p.type}</div><div style={{fontSize:9,fontWeight:700,color:T1}}>{p.name.slice(0,12)}</div></div>;})}
            </div>
          </div>
        ):null}
        <div style={{fontSize:9,fontWeight:700,color:T2,marginBottom:8}}>{filtered.length} PATTERNS</div>
        {filtered.map(function(p){return <PatternCard key={p.id} p={p} isFav={favs.indexOf(p.id)!=-1} isDone={done.indexOf(p.id)!=-1} onClick={function(){open(p);}} onFav={function(){toggleFav(p.id);}}/>;  })}
        {filtered.length==0?<div style={{textAlign:"center",padding:"40px 0",color:T2}}><div style={{fontSize:13,fontWeight:700,marginBottom:4}}>No patterns found</div><div style={{fontSize:10}}>Try different search or filter</div></div>:null}
      </div>
    </div>
  );
}

