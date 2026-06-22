import { useState, useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import { getLang, LANGUAGES } from "../i18n/translations";

var BD="#1E2D4A",BLUE="#3B82F6",BLUE2="#60A5FA";
var UP="#22C55E",T1="#FFFFFF",T2="#94A3B8",T3="#5B6472";

export default function TopBar(props){
  var onMenu=props.onMenu||function(){};
  var [showLang,setShowLang]=useState(false);
  var [lang,setCurLang]=useState(getLang());
  var [mktOpen,setMktOpen]=useState(false);

  useEffect(function(){
    var t=setInterval(function(){
      var now=new Date();
      var mins=now.getHours()*60+now.getMinutes();
      var day=now.getDay();
      setMktOpen(day>=1&&day<=5&&mins>=9*60+15&&mins<15*60+30);
    },30000);
    var now=new Date();
    var mins=now.getHours()*60+now.getMinutes();
    var day=now.getDay();
    setMktOpen(day>=1&&day<=5&&mins>=9*60+15&&mins<15*60+30);
    return function(){clearInterval(t);};
  },[]);

  return (
    <div style={{
      background:"#050505",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      padding:"12px 16px",
      display:"flex",alignItems:"center",gap:10,
    }}>
      {/* Left: minimal logo mark */}
      <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
        <div style={{width:30,height:30,borderRadius:9,background:"#101318",border:"1px solid rgba(77,166,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 20 18" fill="none">
            <line x1="2" y1="10" x2="2" y2="16" stroke={BLUE2} strokeWidth="1.2"/>
            <rect x="0.8" y="10" width="2.4" height="4" rx="0.4" fill={BLUE2}/>
            <line x1="6" y1="8" x2="6" y2="16" stroke="#fff" strokeWidth="1.2"/>
            <rect x="4.8" y="9" width="2.4" height="4" rx="0.4" fill="#fff"/>
            <line x1="10" y1="6" x2="10" y2="15" stroke={BLUE2} strokeWidth="1.2"/>
            <rect x="8.8" y="7" width="2.4" height="4" rx="0.4" fill={BLUE2}/>
            <path d="M1 6L6 3L11 5L18 0" stroke={UP} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            <path d="M14 0L18 0L18 4" stroke={UP} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div style={{fontSize:15,fontWeight:800,letterSpacing:-0.2,whiteSpace:"nowrap"}}>
          <span style={{color:"#FFFFFF"}}>Breakout</span><span style={{color:"#4DA6FF"}}>Pro</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,background:mktOpen?"rgba(34,197,94,0.08)":"rgba(91,100,114,0.12)",border:"1px solid "+(mktOpen?"rgba(34,197,94,0.25)":"rgba(91,100,114,0.2)"),borderRadius:20,padding:"3px 8px",flexShrink:0}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:mktOpen?UP:T3,boxShadow:mktOpen?"0 0 4px "+UP:"none"}}/>
          <span style={{fontSize:8,fontWeight:600,color:mktOpen?UP:T3}}>{mktOpen?"Live":"Closed"}</span>
        </div>
      </div>

      {/* Right: Language + Menu */}
      <button onClick={function(){setShowLang(true);}} style={{background:"#101318",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"0 10px",height:30,display:"flex",alignItems:"center",gap:4,cursor:"pointer",flexShrink:0}}>
        <span style={{fontSize:11,color:T3}}>&#127760;</span>
        <span style={{fontSize:9,fontWeight:700,color:T2}}>EN</span>
      </button>

      <button onClick={onMenu} style={{background:"#101318",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,width:30,height:30,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer",flexShrink:0}}>
        {[0,1,2].map(function(i){return <div key={i} style={{width:12,height:1.5,background:T2,borderRadius:1}}/>;})}</button>

      {showLang?<LanguageSelector onClose={function(){setShowLang(false);}} onChange={function(c){setCurLang(c);if(props.onLangChange)props.onLangChange(c);}}/>:null}
    </div>
  );
}
