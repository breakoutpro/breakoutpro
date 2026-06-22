import React from "react";

var BG = "#07111F";
var CARD = "#101B2E";
var BD = "#1E3A5F";
var BLUE = "#3B82F6";
var BLUE2 = "#60A5FA";
var T2 = "#94A3B8";
var T3 = "#475569";

var TABS = [
  {id:"home",    label:"Home",    icon:"&#127968;"},
  {id:"markets", label:"Markets", icon:"&#128200;"},
  {id:"scan",    label:"Scan",    icon:"&#128269;"},
  {id:"learn",   label:"Learn",   icon:"&#128218;"},
  {id:"ai",      label:"AI",      icon:"&#129504;"},
  {id:"alerts",  label:"Alerts",  icon:"&#128276;"},
];

export default function TabBar(props) {
  var tab = props.tab || "home";
  var setTab = props.setTab || function(){};

  return (
    <div style={{
      position:"fixed",bottom:0,left:0,right:0,zIndex:100,
      background:"rgba(7,17,31,0.95)",
      backdropFilter:"blur(20px)",
      borderTop:"1px solid #1E3A5F",
      padding:"6px 4px 10px",
      display:"flex",
      boxShadow:"0 -4px 20px rgba(0,0,0,0.4)",
    }}>
      {TABS.map(function(t){
        var act = tab==t.id;
        return (
          <button key={t.id} onClick={function(){setTab(t.id);}} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            padding:"4px 2px",fontFamily:"inherit",
          }}>
            <div style={{
              width:28,height:28,borderRadius:8,
              background:act?"linear-gradient(135deg,"+BLUE+",#6366F1)":"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:act?"0 2px 8px rgba(59,130,246,0.4)":"none",
              transition:"all 0.2s",
            }}>
              <span style={{fontSize:14,color:act?"#fff":T3}} dangerouslySetInnerHTML={{__html:t.icon}}/>
            </div>
            <span style={{fontSize:7,fontWeight:act?700:500,color:act?BLUE2:T3}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
