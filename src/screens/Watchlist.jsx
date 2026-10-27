import { useState, useEffect } from "react";
import { ALL_NSE_STOCKS } from "../data/marketsStocks";
import { useWatchlist } from "../hooks/useWatchlist";
import { useTheme } from "../theme/ThemeProvider";
import { useQuotes } from "../market/useQuotes";
import QuoteBadge from "../market/QuoteBadge";
import { t } from "../i18n/translations";
// SAFETY PATCH: useWatchlistAlerts removed - fabricated candle-based pattern
// detection was firing real OS notifications on simulated data. See audit.

var BG="#07111F",CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",UP="#1B5E20",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

// Only symbol and sector come from the static list; prices come from the live data layer (src/market).
var ALL_STOCKS = ALL_NSE_STOCKS.map(function(s){ return {sym:s.sym, sect:s.sect}; });

// Stable module-level reference - this screen's own historical first-run
// seed, preserved exactly as before via the hook's optional customDefault.
var LEGACY_DEFAULT_SEED = ["NIFTY 50","BANKNIFTY","RELIANCE","TCS","HDFCBANK"];



export default function Watchlist(props) {

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, BLUE2=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var wl = useWatchlist(LEGACY_DEFAULT_SEED);
  var list = wl.list;
  var [search, setSearch] = useState("");
  var [showAdd, setShowAdd] = useState(false);
  var live = useQuotes(list);
  var stocks = list.map(function(sym){
    var base = ALL_STOCKS.find(function(s){return s.sym==sym;});
    return { sym:sym, sect: base ? base.sect : "", q: live.quotes[sym] };
  });

  // SAFETY PATCH: continuous Math.random price-ticking removed - these
  // values are demo/simulated (ALL_NSE_STOCKS is a static local dataset,
  // not a live feed) and must not animate as if live. See disclosure
  // banner added to the render below.

  function addStock(sym) {
    wl.add(sym);
    setShowAdd(false);
    setSearch("");
  }

  function removeStock(sym) {
    wl.remove(sym);
  }

  var filtered = ALL_STOCKS.filter(function(s){
    return s.sym.toLowerCase().indexOf(search.toLowerCase())!=-1 && list.indexOf(s.sym)==-1;
  });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>My <span style={{color:BLUE2}}>Watchlist</span></div>
            <div style={{fontSize:12,color:T3}}>{list.length} instruments tracked</div>
          </div>
          <button onClick={function(){setShowAdd(true);}} style={{background:"transparent",border:"1px solid "+BLUE,borderRadius:10,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
        </div>
      </div>

      <div style={{padding:"12px 16px 0"}}>

        {/* Add stock panel */}
        {showAdd?(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:700,color:T1}}>Add to Watchlist</span>
              <button onClick={function(){setShowAdd(false);}} style={{background:"none",border:"none",color:T2,fontSize:14,cursor:"pointer"}}>X</button>
            </div>
            <input
              value={search}
              onChange={function(e){setSearch(e.target.value);}}
              placeholder="Search stocks, NIFTY, BLUE..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"12px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:12}}
            />
            <div style={{maxHeight:240,overflowY:"auto"}}>
              {filtered.length==0?(
                <div style={{textAlign:"center",padding:"16px 0",fontSize:12,color:T3}}>No matches or already added</div>
              ):filtered.slice(0,15).map(function(s){
                return (
                  <div key={s.sym} onClick={function(){addStock(s.sym);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,cursor:"pointer",marginBottom:4,background:"rgba(255,255,255,0.03)"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                      <div style={{fontSize:12,color:T3}}>{s.sect}</div>
                    </div>
                    <span style={{fontSize:14,color:BLUE,fontWeight:700}}>+</span>
                  </div>
                );
              })}
            </div>
          </div>
        ):null}

        {/* Watchlist items */}
        {stocks.length==0?(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"40px 24px",textAlign:"center"}}>
            <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:8}}>Watchlist Empty</div>
            <div style={{fontSize:12,color:T2,marginBottom:16}}>Add stocks, indices, or commodities to track them here</div>
            <button onClick={function(){setShowAdd(true);}} style={{background:"transparent",border:"1px solid "+BLUE,borderRadius:10,padding:"12px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Your First Stock</button>
          </div>
        ):(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:12,color:T3}}>{t("md.delay_note", "Prices come from Yahoo Finance and may be delayed.")}</span>
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
            {stocks.map(function(s){
              var q = s.q, has = q && q.price != null;
              var pct = has && q.changePct != null ? q.changePct : null;
              var dirCol = pct == null ? T2 : (pct > 0 ? UP : (pct < 0 ? DOWN : T2));
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:12,color:T3}}>{s.sect}</div>
                  </div>
                  <div style={{textAlign:"right",minWidth:96}}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:has?T1:T3}}>{has ? q.price.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}) : "--"}</div>
                    <div style={{fontSize:12,fontWeight:700,color:dirCol}}>{pct == null ? "" : (pct > 0 ? "+" : "") + pct.toFixed(2) + "%"}</div>
                    <QuoteBadge quote={q} compact={true} size={10}/>
                  </div>
                  <button onClick={function(){removeStock(s.sym);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,width:24,height:24,color:DOWN,fontSize:12,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>X</button>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* SAFETY PATCH: Pattern Alerts panel + Recent Pattern Alerts history
            removed - their data source (useWatchlistAlerts) generated
            fabricated candles/patterns and is no longer mounted. */}

      </div>
    </div>
  );
}
