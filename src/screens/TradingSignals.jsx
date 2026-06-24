// BreakoutPro - TradingSignals.jsx
// Home page trading signals - candle and chart patterns across timeframes.
// Balanced green/red mix, clear pattern icons. Rules: no backtick, ASCII only.

var CARD="#101318",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Balanced bullish/bearish mix for a professional look.
var SIGNALS=[
  {sym:"SHRIRAMFIN",frame:"15m",time:"03:15 PM",pattern:"Bullish Engulfing",bull:true, ptype:"candle",ltp:"993.35",  chg:"+12.50",pct:"+1.27%", up:true},
  {sym:"RELIANCE",  frame:"1h", time:"03:10 PM",pattern:"Morning Star",     bull:true, ptype:"candle",ltp:"2,845.60",chg:"+34.20",pct:"+1.21%", up:true},
  {sym:"WIPRO",     frame:"15m",time:"03:15 PM",pattern:"Bearish Engulfing",bull:false,ptype:"candle",ltp:"174.49",  chg:"-5.69", pct:"-3.16%", up:false},
  {sym:"TATASTEEL", frame:"15m",time:"03:05 PM",pattern:"Cup and Handle",   bull:true, ptype:"chart", ltp:"987.30",  chg:"+18.40",pct:"+1.90%", up:true},
  {sym:"BHARTIARTL",frame:"15m",time:"03:00 PM",pattern:"Double Top",       bull:false,ptype:"chart", ltp:"1,901.60",chg:"-15.00",pct:"-0.78%", up:false},
  {sym:"ADANIENT",  frame:"15m",time:"03:00 PM",pattern:"Shooting Star",    bull:false,ptype:"candle",ltp:"2,962.90",chg:"-96.70",pct:"-3.16%", up:false},
  {sym:"HINDALCO",  frame:"15m",time:"02:30 PM",pattern:"Bearish Harami",   bull:false,ptype:"candle",ltp:"986.80",  chg:"-27.40",pct:"-2.70%", up:false},
  {sym:"NIFTY",     frame:"1h", time:"02:15 PM",pattern:"Double Bottom",    bull:true, ptype:"chart", ltp:"23,824.10",chg:"+128.50",pct:"+0.54%",up:true},
];

// Clear two-candle pattern icon.
function CandleIcon(props){
  var c=props.bull?UP:DOWN;
  var o=props.bull?DOWN:UP;
  return (
    <svg width="26" height="30" viewBox="0 0 26 30">
      <line x1="8" y1="3" x2="8" y2="27" stroke={o} strokeWidth="1.6"/>
      <rect x="3.5" y="9" width="9" height="12" rx="1.5" fill={o}/>
      <line x1="18" y1="2" x2="18" y2="28" stroke={c} strokeWidth="1.6"/>
      <rect x="13.5" y="7" width="9" height="15" rx="1.5" fill={c}/>
    </svg>
  );
}

// Chart pattern icon - trendline with arrow.
function ChartIcon(props){
  var c=props.bull?UP:DOWN;
  if(props.bull){
    return (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <polyline points="3,20 9,22 14,14 20,16 25,6" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="21,8 25,6 24,11" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <polyline points="3,8 9,6 14,14 20,12 25,22" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="21,20 25,22 24,17" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function TradingSignals(props){
  var setTab=props.setTab||function(){};
  var go=function(){setTab("scan");};

  return (
    <div style={{padding:"14px 14px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <span style={{fontSize:13,fontWeight:800,color:T1}}>Trading Signals</span>
        <button onClick={go} style={{background:"none",border:"none",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
      </div>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden"}}>
        {SIGNALS.map(function(s,i){
          var pc=s.bull?UP:DOWN;
          var bg=s.bull?"rgba(34,197,94,0.10)":"rgba(239,68,68,0.10)";
          var bdc=s.bull?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)";
          return (
            <div key={s.sym+i} onClick={go} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 13px",borderBottom:i<SIGNALS.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>

              {/* PATTERN ICON */}
              <div style={{width:50,height:50,borderRadius:12,background:bg,border:"1px solid "+bdc,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {s.ptype=="candle"?<CandleIcon bull={s.bull}/>:<ChartIcon bull={s.bull}/>}
              </div>

              {/* STOCK + FRAME + PATTERN */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:3}}>{s.sym}</div>
                <div style={{fontSize:9.5,color:T3,marginBottom:4}}>Frame: {s.frame}  &#8226;  {s.time}</div>
                <div style={{fontSize:11,fontWeight:700,color:pc,display:"flex",alignItems:"center",gap:3}}>
                  {s.pattern}
                  <span dangerouslySetInnerHTML={{__html:s.bull?"&#8599;":"&#8600;"}}/>
                </div>
              </div>

              {/* PRICE + CHANGE */}
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3}}>
                  &#8377;{s.ltp}
                  <span style={{fontSize:9}} dangerouslySetInnerHTML={{__html:s.up?"&#9650;":"&#9660;"}}/>
                </div>
                <div style={{fontSize:10,color:s.up?UP:DOWN,marginTop:2,fontFamily:"monospace"}}>{s.chg} ({s.pct})</div>
                <div style={{fontSize:10,color:CYAN,fontWeight:700,marginTop:3}}>Charts &#8250;</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
