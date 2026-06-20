import { useState } from "react";
import { ALL_NSE_STOCKS } from "../data/marketsStocks";

var CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

export default function HomeSearch(props){
  var setTab = props.setTab || function(){};
  var [query,setQuery]=useState("");
  var [focused,setFocused]=useState(false);

  var results = query.length>0 ? ALL_NSE_STOCKS.filter(function(s){
    return s.sym.toLowerCase().indexOf(query.toLowerCase())!=-1 || (s.name&&s.name.toLowerCase().indexOf(query.toLowerCase())!=-1);
  }).slice(0,8) : [];

  function goToMarkets(){
    setTab("markets");
  }

  return(
    <div style={{position:"relative",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,background:CARD,border:"1px solid "+(focused?BLUE:BD),borderRadius:12,padding:"9px 12px"}}>
        <span style={{fontSize:12,color:T3}}>&#128269;</span>
        <input
          value={query}
          onChange={function(e){setQuery(e.target.value);}}
          onFocus={function(){setFocused(true);}}
          onBlur={function(){setTimeout(function(){setFocused(false);},150);}}
          placeholder="Search stocks, NIFTY, GOLD, CRUDE..."
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:T1,fontSize:11,fontFamily:"inherit"}}
        />
        {query.length>0?(
          <span onClick={function(){setQuery("");}} style={{fontSize:11,color:T3,cursor:"pointer",padding:"2px 6px"}}>X</span>
        ):null}
      </div>

      {focused&&results.length>0?(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
          {results.map(function(s){
            return (
              <div key={s.sym} onClick={goToMarkets} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderBottom:"1px solid "+BD,cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:7,color:T3}}>{s.sect}</div>
                </div>
                <span style={{fontFamily:"monospace",fontSize:10,color:T2}}>Rs{s.ltp}</span>
              </div>
            );
          })}
        </div>
      ):null}

      {focused&&query.length>0&&results.length==0?(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"14px",zIndex:50,textAlign:"center"}}>
          <span style={{fontSize:10,color:T3}}>No stock found for "{query}"</span>
        </div>
      ):null}
    </div>
  );
}
