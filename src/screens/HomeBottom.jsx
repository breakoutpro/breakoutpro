import React from "react";
import { GAINERS, LOSERS, SECTORS } from "./HomeData";
import { t, getLang } from "../i18n/translations";

var CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",PURPLE2="#A855F7",GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

export default function HomeBottom(props) {
  var setTab=props.setTab||function(){};
  var lang=getLang();
  var QUICK=[
    {label:"OI Chain",   id:"oi",       icon:"OI",col:BLUE},
    {label:"Scanner",    id:"scanner",  icon:"SC",col:BLUE2},
    {label:"Paper Trade",id:"paper",    icon:"PT",col:UP},
    {label:"AI Chat",    id:"ai",       icon:"AI",col:PURPLE2},
    {label:"Charts",     id:"chart",    icon:"CH",col:PURPLE},
    {label:"Patterns",   id:"patterns", icon:"PA",col:"#06B6D4"},
    {label:"Morning AI", id:"morning",  icon:"MP",col:GOLD},
    {label:"Alerts",     id:"alerts",   icon:"AL",col:DOWN},
  ];
  return (
    <div>
{/* Gainers/Losers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"10px 12px"}}>
            <div style={{fontSize:8,fontWeight:700,color:UP,marginBottom:8}}>{t("topGainers",lang).toUpperCase()}</div>
            {GAINERS.map(function(g){return <div key={g.sym} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:9,color:T1}}>{g.sym}</span><span style={{fontSize:9,fontWeight:700,color:UP}}>+{g.pct}%</span></div>;})}
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"10px 12px"}}>
            <div style={{fontSize:8,fontWeight:700,color:DOWN,marginBottom:8}}>{t("topLosers",lang).toUpperCase()}</div>
            {LOSERS.map(function(l){return <div key={l.sym} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:9,color:T1}}>{l.sym}</span><span style={{fontSize:9,fontWeight:700,color:DOWN}}>{l.pct}%</span></div>;})}
          </div>
        </div>
        {/* Sector strength */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("sectorStrength",lang).toUpperCase()}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {SECTORS.map(function(s){return <div key={s.name} style={{background:(s.up?UP:DOWN)+"15",border:"1px solid "+(s.up?UP:DOWN)+"33",borderRadius:8,padding:"4px 9px"}}><span style={{fontSize:8,fontWeight:700,color:s.up?UP:DOWN}}>{s.name}</span></div>;})}
          </div>
        </div>
        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("quickAccess",lang).toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {QUICK.map(function(q){return <button key={q.id} onClick={function(){setTab(q.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 6px",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:10,fontWeight:800,color:q.col,marginBottom:3}}>{q.icon}</div><div style={{fontSize:7,color:T2,fontWeight:500}}>{q.label}</div></button>;})}
          </div>
        </div>
        {/* Morning AI Pulse */}
        <div style={{background:"linear-gradient(135deg,#0E0820,#101B2E)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#fff"}}>AI</span></div>
            <div><div style={{fontSize:11,fontWeight:700,color:T1}}>{t("morningPulse",lang)}</div><div style={{fontSize:8,color:T2}}>Full market analysis</div></div>
          </div>
          <button onClick={function(){setTab("morning");}} style={{background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("getBriefing",lang)}</button>
        </div>

    </div>
  );
}
