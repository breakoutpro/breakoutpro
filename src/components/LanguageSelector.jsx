import { useState } from "react";
import { LANGUAGES, getLang, setLang, hasAccess } from "../i18n/translations";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - LanguageSelector.jsx
// Premium language picker. Free: English. Others gated behind trial/premium/admin.
// Applies choice and reloads so all screens re-render in the new language.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37",UP="#22C55E";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Admin and premium users unlock all languages.
function isPremium(){ return hasAccess(); }

export default function LanguageSelector(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, CARD = theme.c.card, GOLD = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var [cur,setCur]=useState(getLang());
  var prem=isPremium();

  function choose(l){
    if(!l.free && !prem){
      // gated - send to subscription
      if(props.onUpgrade) props.onUpgrade();
      return;
    }
    setLang(l.code);
    setCur(l.code);
    if(props.onChange) props.onChange(l.code);
    // reload so every screen picks up the new language
    setTimeout(function(){ try{ window.location.reload(); }catch(e){} }, 150);
  }

  return (
    <div onClick={props.onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:theme.c.card2,borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",maxHeight:"80vh",overflowY:"auto",padding:"16px 16px 30px"}}>
        <div style={{width:36,height:4,background:"#2A3441",borderRadius:2,margin:"0 auto 16px"}}></div>
        <div style={{fontSize:17,fontWeight:900,color:T1,marginBottom:3}}>Choose Language</div>
        <div style={{fontSize:10,color:T2,marginBottom:16}}>{prem?"All languages unlocked":"English is free. Other languages need Premium."}</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {LANGUAGES.map(function(l){
            var active=cur==l.code;
            var locked=!l.free && !prem;
            return (
              <button key={l.code} onClick={function(){choose(l);}} style={{background:active?"rgba(59,130,246,0.12)":CARD,border:"1px solid "+(active?BLUE:BD),borderRadius:12,padding:"13px 10px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",position:"relative"}}>
                <div style={{fontSize:14,fontWeight:800,color:active?BLUE:T1}}>{l.native}</div>
                <div style={{fontSize:9,color:T3,marginTop:2}}>{l.name}</div>
                {l.free?
                  <span style={{position:"absolute",top:10,right:10,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",padding:"2px 6px",borderRadius:4}}>FREE</span>
                  :(locked?
                    <span style={{position:"absolute",top:10,right:10,fontSize:9}} dangerouslySetInnerHTML={{__html:"&#128274;"}}/>
                    :<span style={{position:"absolute",top:10,right:10,fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.1)",padding:"2px 6px",borderRadius:4}}>PRO</span>
                  )
                }
              </button>
            );
          })}
        </div>

        {!prem?(
          <button onClick={function(){if(props.onUpgrade)props.onUpgrade();}} style={{width:"100%",background:GOLD,border:"none",borderRadius:11,padding:"13px",marginTop:16,color:"#000",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Unlock All Languages with Premium</button>
        ):null}
      </div>
    </div>
  );
}
