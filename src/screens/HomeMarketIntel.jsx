import { useState } from "react";
import { t } from "../i18n/translations";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - HomeMarketIntel.jsx
// Merged Market Intelligence: FII/DII + Breadth + Sector + Global in one premium section.
// Pure black glass, minimal green/red. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var FII={fii:-1240,dii:2180};
var BREADTH={adv:1320,dec:780,unch:90};
var SECTORS=[
  {name:"IT",chg:1.8,up:true},{name:"Bank",chg:0.6,up:true},{name:"Auto",chg:-0.4,up:false},
  {name:"Pharma",chg:1.1,up:true},{name:"FMCG",chg:-0.2,up:false},{name:"Metal",chg:-0.9,up:false}
];
var GLOBAL=[
  {name:"Dow",val:"42,150",chg:0.3,up:true},{name:"Nasdaq",val:"18,420",chg:0.7,up:true},
  {name:"FTSE",val:"8,210",chg:-0.2,up:false},{name:"Nikkei",val:"39,800",chg:1.2,up:true},
  {name:"Gold",val:"75,400",chg:0.5,up:true},{name:"Crude",val:"6,850",chg:-1.1,up:false}
];

export default function HomeMarketIntel(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, CARD2 = theme.c.card2, GOLD = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3;

  var setTab=props.setTab||function(){};
  var total=BREADTH.adv+BREADTH.dec+BREADTH.unch;
  var advPct=Math.round((BREADTH.adv/total)*100);

  return (
    <div style={{padding:"0 14px",marginTop:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:15,fontWeight:900,color:T1}}>{t("market_intel")}</span>
        <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:theme.c.blue,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Markets &#8594;</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
        <span style={{fontSize:7.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
        <span style={{fontSize:8,color:T3}}>Simulated for preview. Not live market values.</span>
      </div>

      {/* FII / DII */}
      <div onClick={function(){setTab("fiidii");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:9,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:10.5,fontWeight:700,color:T2}}>FII / DII Activity (Rs Cr)</span>
          <span style={{fontSize:9,color:CYAN,fontWeight:700}}>Details &#8594;</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,background:CARD2,borderRadius:9,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:T3,marginBottom:3}}>FII</div>
            <div style={{fontSize:15,fontWeight:800,color:FII.fii>=0?UP:DOWN,fontFamily:"monospace"}}>{FII.fii>=0?"+":""}{FII.fii}</div>
          </div>
          <div style={{flex:1,background:CARD2,borderRadius:9,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:T3,marginBottom:3}}>DII</div>
            <div style={{fontSize:15,fontWeight:800,color:FII.dii>=0?UP:DOWN,fontFamily:"monospace"}}>{FII.dii>=0?"+":""}{FII.dii}</div>
          </div>
        </div>
      </div>

      {/* MARKET BREADTH */}
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <span style={{fontSize:10.5,fontWeight:700,color:T2}}>Market Breadth</span>
          <span style={{fontSize:10,color:T2}}><span style={{color:UP,fontWeight:700}}>{BREADTH.adv}</span> adv / <span style={{color:DOWN,fontWeight:700}}>{BREADTH.dec}</span> dec</span>
        </div>
        <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden"}}>
          <div style={{width:advPct+"%",background:UP}}></div>
          <div style={{flex:1,background:DOWN}}></div>
        </div>
        <div style={{fontSize:9,color:T3,marginTop:7}}>{advPct}% stocks advancing. Breadth is {advPct>=55?"positive":advPct<=45?"weak":"mixed"}.</div>
      </div>

      {/* SECTOR PERFORMANCE */}
      <div onClick={function(){setTab("heatmap");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:9,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:10.5,fontWeight:700,color:T2}}>Sector Performance</span>
          <span style={{fontSize:9,color:CYAN,fontWeight:700}}>Heatmap &#8594;</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {SECTORS.map(function(s){
            return (
              <div key={s.name} style={{background:CARD2,borderRadius:8,padding:"8px 9px"}}>
                <div style={{fontSize:9.5,color:T1,fontWeight:600}}>{s.name}</div>
                <div style={{fontSize:11,fontWeight:800,color:s.up?UP:DOWN,marginTop:2}}>{s.up?"+":""}{s.chg}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GLOBAL MARKETS */}
      <div onClick={function(){setTab("global");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:10.5,fontWeight:700,color:T2}}>Global Markets</span>
          <span style={{fontSize:9,color:CYAN,fontWeight:700}}>View All &#8594;</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
          {GLOBAL.map(function(g){
            return (
              <div key={g.name} style={{background:CARD2,borderRadius:9,padding:"9px 12px",flexShrink:0,minWidth:78}}>
                <div style={{fontSize:9,color:T2}}>{g.name}</div>
                <div style={{fontSize:11,fontWeight:700,color:T1,marginTop:3,fontFamily:"monospace"}}>{g.val}</div>
                <div style={{fontSize:9.5,fontWeight:700,color:g.up?UP:DOWN,marginTop:1}}>{g.up?"+":""}{g.chg}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
