import { getPattern } from "./PatternInfo";

// BreakoutPro - StockSignalDetail.jsx
// Full stock analysis page opened from a trading signal.
// Pattern + key levels + price action read. Rules: no backtick, ASCII only.

var BG="#050505",CARD="#101318",BD="#1B2330",CARD2="#0B0E13";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Derive simple levels around the price for a teaching view.
function buildLevels(s){
  var p=parseFloat(String(s.ltp).replace(/,/g,""));
  if(!p||isNaN(p)) p=100;
  return {
    price:p,
    r2:(p*1.025),
    r1:(p*1.012),
    pivot:(p*1.003),
    s1:(p*0.988),
    s2:(p*0.975),
  };
}
function fmt(n){
  return n.toLocaleString("en-IN",{maximumFractionDigits:2,minimumFractionDigits:2});
}
function biasColor(b){
  if(b=="Bullish") return UP;
  if(b=="Bearish") return DOWN;
  return GOLD;
}

function LevelRow(props){
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:props.last?"none":"1px solid rgba(255,255,255,0.04)"}}>
      <span style={{fontSize:11,color:props.color,fontWeight:700}}>{props.label}</span>
      <span style={{fontSize:12.5,color:T1,fontWeight:700,fontFamily:"monospace"}}>&#8377;{props.val}</span>
    </div>
  );
}

export default function StockSignalDetail(props){
  var s=props.s;
  var setTab=props.setTab||function(){};
  var info=getPattern(s.pattern);
  var bc=biasColor(info.bias);
  var L=buildLevels(s);

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:BG,zIndex:300,overflowY:"auto"}}>

      {/* HEADER */}
      <div style={{background:CARD2,borderBottom:"1px solid "+BD,padding:"14px 16px",display:"flex",alignItems:"center",gap:11,position:"sticky",top:0,zIndex:5}}>
        <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9.5,color:T3,marginTop:1}}>Frame: {s.frame}  &#8226;  {s.time}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace"}}>&#8377;{s.ltp}</div>
          <div style={{fontSize:10,color:s.up?UP:DOWN,fontFamily:"monospace"}}>{s.chg} ({s.pct})</div>
        </div>
      </div>

      <div style={{padding:"16px"}}>

        {/* PATTERN BADGE CARD */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:15,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:15,fontWeight:800,color:T1}}>{s.pattern}</span>
            <span style={{background:bc+"22",color:bc,border:"1px solid "+bc+"44",borderRadius:8,padding:"4px 12px",fontSize:11,fontWeight:800}}>{info.bias}</span>
          </div>
          <div style={{fontSize:12.5,color:"#D4D8E0",lineHeight:1.7}}>{info.what}</div>
        </div>

        {/* WHAT MAY HAPPEN NEXT */}
        <div style={{background:bc+"10",border:"1px solid "+bc+"33",borderRadius:14,padding:15,marginBottom:14}}>
          <div style={{fontSize:10,color:bc,fontWeight:800,marginBottom:6,letterSpacing:0.4}}>WHAT MAY HAPPEN NEXT</div>
          <div style={{fontSize:12.5,color:T1,lineHeight:1.7}}>{info.next}</div>
        </div>

        {/* KEY LEVELS */}
        <div style={{fontSize:11,color:T2,fontWeight:800,marginBottom:8,letterSpacing:0.5}}>KEY LEVELS TODAY</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"6px 15px",marginBottom:14}}>
          <LevelRow label="Resistance 2" val={fmt(L.r2)} color={DOWN}/>
          <LevelRow label="Resistance 1" val={fmt(L.r1)} color={DOWN}/>
          <LevelRow label="Pivot" val={fmt(L.pivot)} color={GOLD}/>
          <LevelRow label="Support 1" val={fmt(L.s1)} color={UP}/>
          <LevelRow label="Support 2" val={fmt(L.s2)} color={UP} last={true}/>
        </div>

        {/* HOW TO USE */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:15,marginBottom:14}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:800,marginBottom:6,letterSpacing:0.4}}>HOW TO USE THIS</div>
          <div style={{fontSize:12.5,color:"#D4D8E0",lineHeight:1.7}}>{info.action}</div>
        </div>

        {/* OPEN FULL CHART */}
        <button onClick={function(){setTab("scan");props.onClose();}} style={{width:"100%",background:"rgba(59,130,246,0.12)",border:"1px solid "+BLUE,borderRadius:12,padding:13,color:CYAN,fontSize:12.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>Open Live Chart &#8594;</button>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginBottom:20}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.6}}>Educational only. Not SEBI registered. Not investment advice. Levels are auto-calculated for learning, not trade calls.</div>
        </div>

      </div>
    </div>
  );
}
