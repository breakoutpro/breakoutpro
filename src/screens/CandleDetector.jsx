import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - CandleDetector.jsx
// SAFETY PATCH: this screen previously ran a continuous Math.random candle
// generator feeding a live-looking pattern scan. That generation was
// stopped in an earlier patch, which left dead controls and a perpetual
// false "scanning in real time" state. This version removes those and
// shows one honest static message instead. No fake candle generation is
// restarted here. Rules: no backtick, no triple-equals, ASCII only.

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var STOCKS=["NIFTY 50","BANKNIFTY","RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","TATAMOTORS","AXISBANK"];

export default function CandleDetector(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; CB=theme.c.card; DB=theme.c.bg; T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3;
  var BLUE=theme.c.blue; 

  var setTab = props.setTab || function(){};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:32}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:8}}>Candle <span style={{color:BLUE}}>Detector</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>SIMULATED</span>
          <span style={{fontSize:12,color:T3}}>Pattern detection is paused while this feature is rebuilt with real data.</span>
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>WATCHING</div>
        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
          {STOCKS.map(function(sym){
            return <div key={sym} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",flexShrink:0,textAlign:"center",minWidth:70}}>
              <div style={{fontSize:12,fontWeight:700,color:T1}}>{sym}</div>
            </div>;
          })}
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"32px 24px",textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:4}}>Detection Paused</div>
          <div style={{fontSize:12,color:T2}}>Simulated pattern detection is paused while this feature is being rebuilt with real market data.</div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn}}>Educational pattern detection only. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
