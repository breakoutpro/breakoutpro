// BreakoutPro - MarketsDash.jsx
// Moneycontrol-style horizontally scrollable indices dashboard table.
// Rules: no backticks, no triple-equals, ASCII only.

var CARD="#101318",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T3="#5B6472";

var MARKETS_DASH=[
  {name:"NIFTY 50",val:"23,982.87",chg:"+347.20",pct:1.47,up:true},
  {name:"SENSEX",val:"76,695.34",chg:"+1163.50",pct:1.54,up:true},
  {name:"BANK NIFTY",val:"52,161.30",chg:"+866.40",pct:1.69,up:true},
  {name:"NIFTY IT",val:"34,210.55",chg:"+312.85",pct:0.92,up:true},
  {name:"FIN NIFTY",val:"23,445.10",chg:"+198.30",pct:0.85,up:true},
  {name:"MIDCAP",val:"54,320.75",chg:"-142.60",pct:-0.26,up:false},
  {name:"INDIA VIX",val:"13.42",chg:"-0.38",pct:-2.75,up:false},
];

var HEAD={flex:"0 0 110px",fontSize:9,fontWeight:700,color:T3,letterSpacing:0.4};
var HEADR={flex:"0 0 100px",textAlign:"right",fontSize:9,fontWeight:700,color:T3,letterSpacing:0.4};

export default function MarketsDash(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{minWidth:380}}>
          <div style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:"1px solid "+BD,background:"rgba(255,255,255,0.02)"}}>
            <span style={HEAD}>INDEX</span>
            <span style={HEADR}>VALUE</span>
            <span style={{flex:"0 0 90px",textAlign:"right",fontSize:9,fontWeight:700,color:T3,letterSpacing:0.4}}>CHANGE</span>
            <span style={{flex:"0 0 70px",textAlign:"right",fontSize:9,fontWeight:700,color:T3,letterSpacing:0.4}}>% CHG</span>
          </div>
          {MARKETS_DASH.map(function(m,i){return(
            <div key={m.name} onClick={function(){setTab("markets");}} style={{display:"flex",alignItems:"center",padding:"11px 14px",borderBottom:i<MARKETS_DASH.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
              <span style={{flex:"0 0 110px",fontSize:12,fontWeight:700,color:T1}}>{m.name}</span>
              <span style={{flex:"0 0 100px",textAlign:"right",fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{m.val}</span>
              <span style={{flex:"0 0 90px",textAlign:"right",fontSize:11,fontWeight:600,color:m.up?UP:DOWN,fontFamily:"monospace"}}>{m.chg}</span>
              <span style={{flex:"0 0 70px",textAlign:"right",fontSize:11.5,fontWeight:800,color:m.up?UP:DOWN}}>{m.up?"+":""}{m.pct}%</span>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}
