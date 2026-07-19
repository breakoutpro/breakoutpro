import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - WelcomeBack.jsx
// Reopen experience: welcome, time away, missed alerts, market changed.
// Uses cached AI summary (NOT a new AI call). Rules: no backtick, no ===, ASCII.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function WelcomeBack(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, CARD = theme.c.card, CARD2 = theme.c.card2, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  // props: name, gapText, missedAlerts (array), delta (array of {key,changePct}), summary (cached string), onContinue
  var name = props.name || "Trader";
  var missed = props.missedAlerts || [];
  var delta = props.delta || [];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:520,background:CARD,borderTopLeftRadius:22,borderTopRightRadius:22,border:"1px solid "+BD,padding:"20px 18px 26px",maxHeight:"85vh",overflowY:"auto"}}>

        <div style={{width:38,height:4,borderRadius:2,background:BD,margin:"0 auto 16px"}}></div>

        <div style={{fontSize:20,fontWeight:900,color:T1}}>Welcome back, {name}</div>
        <div style={{fontSize:11,color:T3,marginTop:3}}>Last visit {props.gapText || "recently"}</div>

        {props.summary ? (
          <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:12,padding:12,marginTop:14}}>
            <div style={{fontSize:8,color:CYAN,fontWeight:800,marginBottom:4}}>AI MARKET SUMMARY</div>
            <div style={{fontSize:11,color:T1,lineHeight:1.6}}>{props.summary}</div>
          </div>
        ) : null}

        {delta.length ? (
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,color:T3,fontWeight:700,marginBottom:6}}>MARKET CHANGED WHILE YOU WERE AWAY</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {delta.map(function(d,i){
                var pos = d.changePct>=0;
                return (
                  <div key={i} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"8px 11px"}}>
                    <div style={{fontSize:9,color:T2}}>{d.key}</div>
                    <div style={{fontSize:12,fontWeight:800,color:pos?UP:DOWN}}>{pos?"+":""}{d.changePct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {missed.length ? (
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,color:T3,fontWeight:700,marginBottom:6}}>MISSED ALERTS ({missed.length})</div>
            {missed.slice(0,5).map(function(m,i){
              return (
                <div key={i} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"9px 11px",marginBottom:7}}>
                  <div style={{fontSize:10.5,color:T1,fontWeight:600}}>{(m.a && (m.a.title||m.a.body)) || "Alert"}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        <button onClick={props.onContinue} style={{width:"100%",marginTop:18,background:BLUE,border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Continue</button>

        <div style={{fontSize:8,color:T3,textAlign:"center",marginTop:10}}>Educational Market Observation Only. Not Investment Advice.</div>
      </div>
    </div>
  );
}
