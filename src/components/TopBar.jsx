import { useState, useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import { getLang, LANGUAGES } from "../i18n/translations";

var BG = "#07111F";
var CARD = "#101B2E";
var BD = "#1E3A5F";
var BLUE = "#3B82F6";
var BLUE2 = "#60A5FA";
var PURPLE = "#7C3AED";
var GOLD = "#F59E0B";
var UP = "#22C55E";
var DOWN = "#EF4444";
var T1 = "#FFFFFF";
var T2 = "#94A3B8";
var T3 = "#64748B";

export default function TopBar(props) {
  var user = props.user || {};
  var isPrem = props.isPrem || false;
  var isAdmin = props.isAdmin || false;
  var setTab = props.setTab || function(){};
  var onMenu = props.onMenu || function(){};

  var [time, setTime] = useState(new Date());
  var [showLang, setShowLang] = useState(false);
  var [lang, setCurLang] = useState(getLang());
  var [mktOpen, setMktOpen] = useState(false);

  useEffect(function(){
    var t = setInterval(function(){
      var now = new Date();
      setTime(now);
      var mins = now.getHours()*60+now.getMinutes();
      var day = now.getDay();
      setMktOpen(day>=1&&day<=5&&mins>=9*60+15&&mins<15*60+30);
    }, 1000);
    return function(){clearInterval(t);};
  },[]);

  var timeStr = time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  var dateStr = time.toLocaleDateString("en-IN",{day:"numeric",month:"short"});

  return (
    <div style={{
      background:"linear-gradient(180deg,#0A1628 0%,#07111F 100%)",
      borderBottom:"1px solid "+BD,
      padding:"10px 16px",
      display:"flex",
      alignItems:"center",
      gap:12,
    }}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
        <div style={{
          width:36,height:36,borderRadius:10,
          background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 12px rgba(59,130,246,0.4)",
        }}>
          <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:T1,letterSpacing:-0.3}}>
            Breakout<span style={{color:BLUE2}}>Pro</span>
          </div>
          <div style={{fontSize:7,color:T3,letterSpacing:1.5,fontWeight:600}}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>

      {/* Market status */}
      <div style={{
        display:"flex",alignItems:"center",gap:5,
        background:mktOpen?"rgba(34,197,94,0.1)":"rgba(100,116,139,0.1)",
        border:"1px solid "+(mktOpen?"rgba(34,197,94,0.25)":"rgba(100,116,139,0.25)"),
        borderRadius:20,padding:"4px 10px",
      }}>
        <div style={{
          width:5,height:5,borderRadius:"50%",
          background:mktOpen?UP:T3,
          boxShadow:mktOpen?"0 0 6px #22C55E":"none",
        }}></div>
        <span style={{fontSize:8,fontWeight:600,color:mktOpen?UP:T2}}>{mktOpen?"Live":"Closed"}</span>
      </div>

      {/* PRO badge */}
      {isPrem?(
        <div style={{
          background:"linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.1))",
          border:"1px solid rgba(245,158,11,0.4)",
          borderRadius:20,padding:"3px 10px",
        }}>
          <span style={{fontSize:8,fontWeight:700,color:GOLD}}>PRO</span>
        </div>
      ):null}

      {/* Time */}
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:10,fontWeight:600,color:T2,fontFamily:"monospace"}}>{timeStr}</div>
        <div style={{fontSize:7,color:T3}}>{dateStr}</div>
      </div>

      {/* Language Globe */}
      <button onClick={function(){setShowLang(true);}} style={{
        background:"rgba(30,58,95,0.6)",border:"1px solid "+BD,
        borderRadius:8,padding:"6px 8px",cursor:"pointer",
        display:"flex",alignItems:"center",gap:3,
      }}>
        <span style={{fontSize:9}}>&#127760;</span>
        <span style={{fontSize:8,fontWeight:700,color:T2}}>{(LANGUAGES.find(function(l){return l.code==lang;})||LANGUAGES[0]).flag}</span>
      </button>

      {showLang?<LanguageSelector onClose={function(){setShowLang(false);}} onChange={function(c){setCurLang(c);if(props.onLangChange)props.onLangChange(c);}}/>:null}

      {/* Menu */}
      <button onClick={onMenu} style={{
        background:"rgba(30,58,95,0.6)",border:"1px solid "+BD,
        borderRadius:8,width:32,height:32,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        gap:3,cursor:"pointer",
      }}>
        {[0,1,2].map(function(i){return <div key={i} style={{width:14,height:1.5,background:T2,borderRadius:1}}></div>;})}
      </button>
    </div>
  );
}
