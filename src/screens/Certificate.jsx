import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - Certificate.jsx
// Educational-only completion certificate. Only reachable from
// AcademyDashboard.jsx after real 100% completion is verified there.
// The QR code area is an explicit placeholder, never a real scannable
// code. Certificate ID is deterministic (derived from a real timestamp
// and real XP total) - no Math.random anywhere in this file. No gradients.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",GOLD="#D4AF37";

export default function Certificate(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, GOLD = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1;

  var progress = props.progress;
  var onBack = props.onBack || function(){};
  var [name, setName] = useState(function(){ return progress.getCertName(); });
  var [confirmed, setConfirmed] = useState(function(){ return !!progress.getCertName(); });

  function confirm(){
    if(!name.trim()) return;
    progress.setCertName(name.trim());
    setConfirmed(true);
  }

  var certId = confirmed ? progress.generateCertificateId() : null;
  var today = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:40,height:40,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{fontSize:15,fontWeight:800,color:T1}}>Certificate</div>
      </div>

      <div style={{padding:14}}>
        {!confirmed ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T2,marginBottom:10}}>Enter the name to appear on your certificate.</div>
            <input value={name} onChange={function(ev){setName(ev.target.value);}} placeholder="Your full name" style={{width:"100%",background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:"11px 12px",color:T1,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
            <button onClick={confirm} style={{width:"100%",background:BLUE,border:"none",borderRadius:10,padding:12,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Generate Certificate</button>
          </div>
        ) : (
          <div>
            <div style={{background:CARD,border:"2px solid "+GOLD,borderRadius:16,padding:24,textAlign:"center"}}>
              <div style={{fontSize:10,color:T3,letterSpacing:2,marginBottom:6}}>BREAKOUT PRO TRADING ACADEMY</div>
              <div style={{fontSize:13,color:T2,marginBottom:18}}>Certificate of Completion</div>
              <div style={{fontSize:20,fontWeight:800,color:GOLD,marginBottom:6}}>{name}</div>
              <div style={{fontSize:10,color:T3,marginBottom:18}}>has completed all available Trading Academy modules</div>

              <div style={{width:70,height:70,border:"1px dashed "+BD,borderRadius:8,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:8,color:T3,textAlign:"center",lineHeight:1.3}}>QR<br/>Placeholder</div>
              </div>

              <div style={{fontSize:10,color:T2,marginBottom:4}}>Completion Date: {today}</div>
              <div style={{fontSize:9,color:T3}}>Certificate ID: {certId}</div>
            </div>

            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:14}}>
              <div style={{fontSize:8.5,color:theme.c.warn,lineHeight:1.5}}>Educational certificate only - confirms Academy module completion within this app. Not a professional or regulatory qualification, not SEBI-registered, not investment advice.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
