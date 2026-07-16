// BreakoutPro - CandleDetector.jsx
// SAFETY PATCH: this screen previously ran a continuous Math.random candle
// generator feeding a live-looking pattern scan. That generation was
// stopped in an earlier patch, which left dead controls and a perpetual
// false "scanning in real time" state. This version removes those and
// shows one honest static message instead. No fake candle generation is
// restarted here. Rules: no backtick, no triple-equals, ASCII only.

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",GOLD="#F59E0B",PURPLE="#7C3AED",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var STOCKS=["NIFTY 50","BANKNIFTY","RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","TATAMOTORS","AXISBANK"];

export default function CandleDetector(props){
  var setTab = props.setTab || function(){};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:30}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:15,fontWeight:900,color:T1,marginBottom:6}}>Candle <span style={{color:PURPLE}}>Detector</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:7.5,fontWeight:800,color:GOLD,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>SIMULATED</span>
          <span style={{fontSize:8,color:T3}}>Pattern detection is paused while this feature is rebuilt with real data.</span>
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>
        <div style={{fontSize:9,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>WATCHING</div>
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
          {STOCKS.map(function(sym){
            return <div key={sym} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"6px 10px",flexShrink:0,textAlign:"center",minWidth:70}}>
              <div style={{fontSize:8,fontWeight:700,color:T1}}>{sym}</div>
            </div>;
          })}
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:4}}>Detection Paused</div>
          <div style={{fontSize:9,color:T2}}>Simulated pattern detection is paused while this feature is being rebuilt with real market data.</div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:8}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational pattern detection only. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
