import { useState, useEffect, useRef } from "react";
import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { LANGS, SIGNAL_FEED } from "./VoiceData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - VoiceAlertWidget
// Home page alert control. Master toggle, voice on/off, bell on/off, language, recent.
// Rules: no backticks, no triple-equals, ASCII only.

var CARD="#101318",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function kindColor(k){
  if(k=="breakout") return BLUE;
  if(k=="volume") return T2;
  return UP;
}
function kindLabel(k){
  if(k=="breakout") return "Breakout";
  if(k=="volume") return "Volume";
  return "Pattern";
}

function MiniToggle(props){
  return (
    <button onClick={props.onClick} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",flex:1}}>
      <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:12,color:T1,fontWeight:600,flex:1,textAlign:"left"}}>{props.label}</span>
      <div style={{width:34,height:19,borderRadius:10,background:props.on?UP:"rgba(255,255,255,0.12)",position:"relative",flexShrink:0}}>
        <div style={{position:"absolute",top:2.5,left:props.on?17:2.5,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></div>
      </div>
    </button>
  );
}

export default function VoiceAlertWidget(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var va=useVoiceAlerts();
  var [showLang,setShowLang]=useState(false);
  var idxRef=useRef(0);

  useEffect(function(){
    if(!va.enabled) return;
    var t=setInterval(function(){
      var base=SIGNAL_FEED[idxRef.current%SIGNAL_FEED.length];
      idxRef.current=idxRef.current+1;
      // Attach the current formation time so the announcement includes it.
      var now=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      var sig=Object.assign({},base,{time:now});
      va.fire(sig);
    },12000);
    return function(){clearInterval(t);};
  },[va.enabled]);

  var curLang=LANGS.filter(function(l){return l.id==va.lang;})[0]||LANGS[0];

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{background:CARD,border:"1px solid "+(va.enabled?"rgba(34,197,94,0.3)":BD),borderRadius:16,padding:"16px"}}>

        {/* HEADER ROW + MASTER TOGGLE */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:va.enabled?12:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:34,height:34,borderRadius:10,background:va.enabled?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.04)",border:"1px solid "+(va.enabled?"rgba(34,197,94,0.3)":BD),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:va.speaking?"&#128266;":"&#128276;"}}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:T1}}>Smart Alerts</div>
              <div style={{fontSize:12,color:va.enabled?UP:T3,marginTop:4,fontWeight:600}}>
                {va.enabled?(va.speaking?"Speaking...":"Scanning all stocks"):"Tap to enable"}
              </div>
            </div>
          </div>
          <button onClick={va.toggle} style={{width:46,height:26,borderRadius:13,border:"none",background:va.enabled?UP:"rgba(255,255,255,0.12)",position:"relative",cursor:"pointer",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:va.enabled?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></div>
          </button>
        </div>

        {va.enabled?(
          <div>
            {/* VOICE + BELL TOGGLES */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <MiniToggle icon="&#128266;" label="Voice" on={va.voiceOn} onClick={function(){va.setVoiceOn(!va.voiceOn);}}/>
              <MiniToggle icon="&#128276;" label="Bell" on={va.bellOn} onClick={function(){va.setBellOn(!va.bellOn);}}/>
            </div>

            {/* ALERT MODE SELECTOR: Normal / Voice / Priority */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[["normal","&#128276;","Normal"],["voice","&#128266;","Voice"],["priority","&#128680;","Priority"]].map(function(opt){
                var act=va.mode==opt[0];
                return (
                  <button key={opt[0]} onClick={function(){va.setMode(opt[0]);}} style={{flex:1,background:act?"rgba(34,197,94,0.14)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?"rgba(34,197,94,0.4)":BD),borderRadius:9,padding:"8px 4px",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                    <div style={{fontSize:14}} dangerouslySetInnerHTML={{__html:opt[1]}}/>
                    <div style={{fontSize:12,color:act?UP:T3,fontWeight:act?700:600,marginTop:4}}>{opt[2]}</div>
                  </button>
                );
              })}
            </div>

            {/* SCANNING + LANGUAGE */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,background:"rgba(34,197,94,0.06)",borderRadius:8,padding:"8px 12px"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:UP,animation:"pulse-dot 1.4s infinite"}}></div>
                <span style={{fontSize:12,color:UP,fontWeight:700}}>Live scanning</span>
              </div>
              <button onClick={function(){setShowLang(!showLang);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:12,color:T1,fontWeight:600}} dangerouslySetInnerHTML={{__html:curLang.native}}/>
                <span style={{fontSize:12,color:T3}}>&#9662;</span>
              </button>
            </div>

            {/* LANGUAGE PICKER */}
            {showLang?(
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                {LANGS.map(function(l){
                  var act=l.id==va.lang;
                  return (
                    <button key={l.id} onClick={function(){va.setLang(l.id);setShowLang(false);if(va.voiceOn)va.speak(l.native);}} style={{background:act?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit"}}>
                      <span style={{fontSize:12,color:act?BLUE:T2,fontWeight:600}} dangerouslySetInnerHTML={{__html:l.native}}/>
                    </button>
                  );
                })}
              </div>
            ):null}

            {/* RECENT ALERTS */}
            {va.recent.length>0?(
              <div>
                <div style={{fontSize:12,color:T3,fontWeight:700,marginBottom:8,letterSpacing:0.3}}>RECENT ALERTS</div>
                {va.recent.slice(0,4).map(function(a,i){
                  var c=kindColor(a.kind);
                  return (
                    <div key={a.t+"_"+i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderTop:i>0?"1px solid rgba(255,255,255,0.04)":"none"}}>
                      <span style={{fontSize:12,fontWeight:800,color:c,background:c+"22",borderRadius:4,padding:"4px 8px",flexShrink:0}}>{kindLabel(a.kind)}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{a.sym}</div>
                        <div style={{fontSize:12,color:T3,marginTop:4}}>{a.tf?a.tf+"  ":""}{a.info}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{fontSize:12,color:T3,textAlign:"center",padding:"8px 0"}}>Waiting for the next signal...</div>
            )}

            {/* TEST BUTTON */}
            <button onClick={function(){va.fire(SIGNAL_FEED[0]);}} style={{width:"100%",marginTop:12,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:9,padding:"8px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Test Alert</button>
          </div>
        ):null}

      </div>
    </div>
  );
}
