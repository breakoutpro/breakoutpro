import { useState } from "react";
import { STOCKS } from "../data/stocks";
import { EXTRA_STOCKS_1 } from "../data/extraStocks1";
import { EXTRA_STOCKS_2 } from "../data/extraStocks2";
import { EXTRA_STOCKS_3 } from "../data/extraStocks3";

var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var CYAN="#60A5FA",UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

var ALL_STOCKS=STOCKS.concat(EXTRA_STOCKS_1).concat(EXTRA_STOCKS_2).concat(EXTRA_STOCKS_3);

export default function SearchScreen(props){
  var onBack=props.onBack||function(){};
  var onSelect=props.onSelect||function(){};
  var [query,setQuery]=useState("");

  var results=query.trim().length>0
    ?ALL_STOCKS.filter(function(s){
      var q=query.toUpperCase();
      return s.sym.indexOf(q)!=-1||(s.name&&s.name.toUpperCase().indexOf(q)!=-1);
    }).slice(0,30)
    :ALL_STOCKS.slice(0,20);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T1,fontSize:18,cursor:"pointer",padding:0,lineHeight:1}}>&#8592;</button>
        <div style={{flex:1,display:"flex",alignItems:"center",background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:12,padding:"0 12px",height:40,gap:8}}>
          <span style={{fontSize:14,color:T3}}>&#128269;</span>
          <input
            autoFocus
            value={query}
            onChange={function(e){setQuery(e.target.value);}}
            placeholder="Search stocks, indices..."
            style={{background:"none",border:"none",outline:"none",color:T1,fontSize:13,fontFamily:"inherit",flex:1}}
          />
          {query.length>0&&(
            <button onClick={function(){setQuery("");}} style={{background:"none",border:"none",color:T3,fontSize:14,cursor:"pointer",padding:0}}>&#10005;</button>
          )}
        </div>
      </div>

      {query.trim().length==0&&(
        <div style={{padding:"10px 16px 6px"}}>
          <div style={{fontSize:10,fontWeight:700,color:T3,letterSpacing:0.8}}>POPULAR STOCKS</div>
        </div>
      )}

      <div style={{paddingBottom:80}}>
        {results.length==0?(
          <div style={{textAlign:"center",padding:"50px 20px",color:T3}}>
            <div style={{fontSize:24,marginBottom:8}}>&#128269;</div>
            <div style={{fontSize:13}}>No results for "{query}"</div>
          </div>
        ):(
          results.map(function(s,i){
            var up=s.up!=null?s.up:(s.chgPct>=0);
            return (
              <div key={s.sym} onClick={function(){onSelect(s);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid "+BD,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:11,background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:CYAN}}>{s.sym.slice(0,3)}</span>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:10,color:T3,marginTop:2}}>{s.name||s.sym} &bull; {s.sect||"Equity"}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp?s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}):"--"}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN,marginTop:2}}>{up?"+":""}{s.chgPct!=null?s.chgPct.toFixed(2):"--.--"}%</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
