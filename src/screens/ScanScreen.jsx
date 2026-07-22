import { useState } from "react";
import { SECTIONS, getScanResults } from "./ScannerData";
import { hasAccess } from "../i18n/translations";
import ScannerDetailPro from "./ScannerDetailPro";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - ScanScreen.jsx (Scanner Hub)
// 8 sections, premium cards, each opens a detail page. SEBI-safe (no buy/sell).
// Pure black, blue accent, green/red direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// icon glyphs per section (HTML entities).
var SEC_ICON=["&#128202;","&#128200;","&#127919;","&#129302;","&#128218;","&#128176;","&#129518;","&#128640;"];

export default function ScanScreen(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BLUE = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var [scan,setScan]=useState(null);
  var prem=hasAccess();

  if(scan) return <ScannerDetailPro item={scan} onBack={function(){setScan(null);}} onStock={function(s){ if(props.onStock){props.onStock(s);} else {setTab("markets");} }}/>;

  function openItem(it){
    if(it.kind=="tab"){ setTab(it.tab); return; }
    if(it.kind=="calc"){ setTab("tools"); return; }
    setScan(it); // scan kind opens detail page
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"16px 16px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:18,fontWeight:900,color:T1}}>Scanner Hub</div>
        <div style={{fontSize:12,color:T2,marginTop:4}}>Professional market intelligence tools</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
          <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
          <span style={{fontSize:12,color:T3}}>Scan results are simulated for preview. Not live market values.</span>
        </div>
      </div>

      <div style={{padding:16}}>
        {SECTIONS.map(function(sec,si){
          return (
            <div key={sec.name} style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:SEC_ICON[si]||"&#128202;"}}/>
                <span style={{fontSize:12,fontWeight:800,color:T1,letterSpacing:0.3}}>{sec.name}</span>
                {sec.pro?<span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"4px 8px",borderRadius:4}}>PRO</span>:null}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
                {sec.items.map(function(it){
                  var locked=it.pro && !prem;
                  return (
                    <button key={it.id} onClick={function(){ if(locked){setTab("sub");return;} openItem(it); }} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                      <div style={{width:38,height:38,background:CARD2,border:"1px solid "+BD2,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:SEC_ICON[si]||"&#128202;"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:T1}}>{it.title}</span>
                          {it.pro?<span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(212,175,55,0.1)",padding:"4px 4px",borderRadius:3}}>PRO</span>:null}
                          {it.live?<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"4px 4px",borderRadius:3}}><span style={{width:4,height:4,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>:null}
                        </div>
                        <div style={{fontSize:12,color:T2,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.desc}</div>
                      </div>
                      {locked?
                        <span style={{fontSize:12,flexShrink:0}} dangerouslySetInnerHTML={{__html:"&#128274;"}}/>
                        :<span style={{fontSize:16,color:T3,flexShrink:0}}>&#8250;</span>
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn}}>Educational Market Intelligence Only. Not Investment Advice.</div>
        </div>
      </div>
    </div>
  );
}

