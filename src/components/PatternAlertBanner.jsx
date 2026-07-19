import { useEffect, useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var CARD="#0D1B2A",BD="#203A5A";
var BLUE="#3B82F6",PURPLE="#8B5CF6";
var UP="#22C55E",DOWN="#EF4444",GOLD="#F5B942",T1="#FFFFFF",T2="#C9D4E5";

export default function PatternAlertBanner(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1; UP=theme.c.up;

  var alert = props.alert;
  var onDismiss = props.onDismiss || function(){};
  var onView = props.onView || function(){};
  var [visible,setVisible]=useState(false);

  useEffect(function(){
    if(alert){
      setVisible(true);
      var t=setTimeout(function(){ setVisible(false); setTimeout(onDismiss,300); },6000);
      return function(){clearTimeout(t);};
    }
  },[alert]);

  if(!alert) return null;

  var col = alert.type=="bullish"?UP:alert.type=="bearish"?DOWN:GOLD;

  return (
    <div style={{position:"fixed",top:visible?12:-120,left:12,right:12,zIndex:3000,transition:"top 0.35s ease",fontFamily:"Inter,Arial,sans-serif"}}>
      <div onClick={onView} style={{background:"linear-gradient(135deg,"+CARD+",#0A1525)",border:"1px solid "+col+"50",borderLeft:"4px solid "+col,borderRadius:14,padding:"12px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:13}}>&#128202;</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <span style={{fontSize:11,fontWeight:800,color:T1}}>{alert.sym}</span>
            <span style={{fontSize:7,fontWeight:700,color:col,background:col+"15",borderRadius:6,padding:"1px 6px"}}>{alert.conf}%</span>
          </div>
          <div style={{fontSize:9,color:T2}}>{alert.pattern} pattern detected - watchlist alert</div>
        </div>
        <button onClick={function(e){e.stopPropagation();setVisible(false);setTimeout(onDismiss,300);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:6,width:22,height:22,color:T2,fontSize:11,cursor:"pointer",flexShrink:0}}>X</button>
      </div>
    </div>
  );
}
