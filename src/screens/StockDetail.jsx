import { useState } from "react";
import { getStockFull } from "./StockFullData";
import { OverviewTab, FinancialsTab } from "./StockDetailTabs";
import { TechnicalTab, OptionsTab, AITab } from "./StockDetailTabs2";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - StockDetail.jsx
// Tabbed stock deep-dive shell. Pure black, green/red only for direction.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",CARD="#101318",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function StockDetail(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, CARD = theme.c.card, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var s=props.stock||{};
  var sym=s.sym||"STOCK";
  var ltpNum=parseFloat(String(s.ltp||1000).toString().replace(/,/g,""))||1000;
  var up=s.up!=undefined?s.up:true;
  var pct=s.chgPct!=undefined?s.chgPct:1.2;
  var d=getStockFull(sym,ltpNum,up);

  var [tab,setTab]=useState("overview");
  var TABS=[["overview","Overview"],["financials","Financials"],["technical","Technical"],["options","Options"],["ai","AI Analysis"]];

  var openP=Number((ltpNum*0.995).toFixed(2));
  var highP=Number((ltpNum*1.012).toFixed(2));
  var lowP=Number((ltpNum*0.99).toFixed(2));
  var prevP=Number((ltpNum/(1+(up?1:-1)*pct/100)).toFixed(2));

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>

      {/* HEADER */}
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{sym}</div>
            <div style={{fontSize:12,color:T2}}>{d.name}  &#8226;  {d.sector}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:up?UP:DOWN}}>Rs {ltpNum.toLocaleString("en-IN")}</div>
            <div style={{fontSize:12,fontWeight:700,color:up?UP:DOWN}}>{up?"+":"-"}{Math.abs(pct).toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* PRICE DATA */}
      <div style={{padding:"12px 16px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["Open","Rs "+openP.toLocaleString("en-IN")],["High","Rs "+highP.toLocaleString("en-IN")],["Low","Rs "+lowP.toLocaleString("en-IN")],["Prev Close","Rs "+prevP.toLocaleString("en-IN")],["Mkt Cap",d.fundamentals[0].val],["Volume",d.delivery.volume]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 8px"}}>
                <div style={{fontSize:12,color:T2}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginTop:4,fontFamily:"monospace"}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"16px 16px 12px",position:"sticky",top:57,background:BG,zIndex:9}}>
        {TABS.map(function(t){
          var act=tab==t[0];
          return (
            <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:18,padding:"8px 12px",color:act?"#04060D":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{t[1]}</button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div style={{padding:"4px 16px 0"}}>
        {tab=="overview"?<OverviewTab d={d}/>:null}
        {tab=="financials"?<FinancialsTab d={d}/>:null}
        {tab=="technical"?<TechnicalTab d={d}/>:null}
        {tab=="options"?<OptionsTab d={d}/>:null}
        {tab=="ai"?<AITab d={d}/>:null}
      </div>

    </div>
  );
}
