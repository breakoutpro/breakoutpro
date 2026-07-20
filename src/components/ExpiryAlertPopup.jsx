// BreakoutPro - ExpiryAlertPopup.jsx
// In-app popup toast shown when an expiry intelligence alert fires.
// Educational observation only. Rules: no backtick, no triple-equals, ASCII.
import { useState, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var BLUE="#4F8CFF",UP="#22C55E",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function ExpiryAlertPopup(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, CARD2 = theme.c.card2, GOLD = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1;

  var [alert,setAlert]=useState(null);

  useEffect(function(){
    var timer=null;
    function onAlert(e){
      try{ setAlert(e.detail); }catch(err){}
      if(timer) clearTimeout(timer);
      timer=setTimeout(function(){ setAlert(null); },5000);
    }
    try{ window.addEventListener("bp_expiry_alert",onAlert); }catch(e){}
    return function(){
      try{ window.removeEventListener("bp_expiry_alert",onAlert); }catch(e){}
      if(timer) clearTimeout(timer);
    };
  },[]);

  if(!alert) return null;

  return (
    <div style={{position:"fixed",top:14,left:0,right:0,zIndex:9999,padding:"0 14px",maxWidth:(props.maxWidth||430),margin:"0 auto",pointerEvents:"none"}}>
      <div onClick={function(){ if(props.onOpen) props.onOpen(); setAlert(null); }} style={{background:"#0F1629",border:"1px solid "+BLUE,borderRadius:14,padding:"12px 13px",display:"flex",alignItems:"center",gap:11,boxShadow:"0 8px 30px rgba(0,0,0,0.6)",pointerEvents:"auto",cursor:"pointer"}}>
        <div style={{width:38,height:38,background:CARD2,border:"1px solid "+BD2,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:17}} dangerouslySetInnerHTML={{__html:alert.icon}}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",padding:"1px 5px",borderRadius:3}}>EXPIRY</span>
            <span style={{fontSize:12,fontWeight:800,color:T1}}>{alert.name}</span>
            <span style={{fontSize:8.5,color:BLUE,fontWeight:700}}>{alert.symbol}</span>
          </div>
          <div style={{fontSize:9.5,color:T2,marginTop:2,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{alert.detail}</div>
        </div>
        <button onClick={function(e){ e.stopPropagation(); setAlert(null); }} style={{background:"none",border:"none",color:T3,fontSize:15,cursor:"pointer",padding:2,flexShrink:0}}>&#10005;</button>
      </div>
    </div>
  );
}
