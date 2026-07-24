import OptionsIntel from "./OptionsIntel";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - OptionsIntelPage.jsx
// Dedicated full-page wrapper for Options Intelligence (opened from Home card).
// Pure black premium. Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",BD="#1B2330",T1="#FFFFFF",T2="#A0A7B4";

export default function OptionsIntelPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, T2 = theme.c.text2;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Options Intelligence</div>
          <div style={{fontSize:12,color:T2}}>Full derivatives analytics</div>
        </div>
      </div>
      <div style={{marginTop:8}}>
        <OptionsIntel symbol={props.symbol||"NIFTY"} full={true}/>
      </div>
    </div>
  );
}
