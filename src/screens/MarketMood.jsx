import { getPhase, OVERNIGHT, LEVELS, WATCH, METRICS, computeMood, getVerdict } from "./MarketMoodData";

// BreakoutPro - MarketMood.jsx
// Full 30-second Market Mood screen. Mood gauge + overnight + levels + watch + verdict.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#15803D",DOWN="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Gauge(props){
  var m=props.mood;
  var pct=m.score;
  var deg=(pct/100)*180;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",width:160,height:84,margin:"0 auto",overflow:"hidden"}}>
        <div style={{position:"absolute",width:160,height:160,borderRadius:"50%",border:"14px solid "+BD,boxSizing:"border-box",clipPath:"inset(0 0 50% 0)"}}></div>
        <div style={{position:"absolute",width:160,height:160,borderRadius:"50%",border:"14px solid "+m.color,boxSizing:"border-box",clipPath:"inset(0 0 50% 0)",transform:"rotate("+(deg-180)+"deg)",transformOrigin:"center center",transition:"transform 0.6s"}}></div>
      </div>
      <div style={{marginTop:-8}}>
        <div style={{fontSize:24,fontWeight:900,color:m.color}}>{m.label}</div>
        <div style={{fontSize:10,color:T3,marginTop:2}}>{m.gapText}</div>
      </div>
    </div>
  );
}

function MiniCue(props){
  var c=props.c;
  return (
    <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"9px 10px",minWidth:96}}>
      <div style={{fontSize:9,color:T3,marginBottom:3}}>{c.name}</div>
      <div style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{c.val}</div>
      <div style={{fontSize:9.5,fontWeight:700,color:c.up?UP:DOWN,marginTop:1}}>{c.chg}</div>
    </div>
  );
}

function LevelCard(props){
  var L=props.L;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <span style={{fontSize:13,fontWeight:800,color:T1}}>{L.name}</span>
        <span style={{fontSize:12,fontWeight:700,color:T2,fontFamily:"monospace"}}>{L.ltp}</span>
      </div>
      <div style={{display:"flex",gap:5}}>
        {[["R2",L.r2,DOWN],["R1",L.r1,DOWN],["P",L.piv,GOLD],["S1",L.s1,UP],["S2",L.s2,UP]].map(function(x){
          return (
            <div key={x[0]} style={{flex:1,textAlign:"center",background:CARD2,borderRadius:7,padding:"6px 2px"}}>
              <div style={{fontSize:8,color:x[2],fontWeight:700}}>{x[0]}</div>
              <div style={{fontSize:9.5,color:T1,fontWeight:600,fontFamily:"monospace",marginTop:2}}>{x[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MarketMood(props){
  var phase=getPhase();
  var mood=computeMood();
  var verdict=getVerdict();
  var setTab=props.setTab||function(){};

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:BG,zIndex:350,overflowY:"auto"}}>

      {/* HEADER */}
      <div style={{background:CARD2,borderBottom:"1px solid "+BD,padding:"14px 16px",display:"flex",alignItems:"center",gap:11,position:"sticky",top:0,zIndex:5}}>
        <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>Today's Game Plan</div>
          <div style={{fontSize:9.5,color:T3,marginTop:1,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:phase.dot,display:"inline-block"}}></span>
            {phase.label}  &#8226;  {phase.sub}
          </div>
        </div>
      </div>

      <div style={{padding:"18px 16px 30px"}}>

        {/* MOOD GAUGE */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"20px 16px 16px",marginBottom:16}}>
          <Gauge mood={mood}/>
          <div style={{marginTop:14,background:mood.color+"10",border:"1px solid "+mood.color+"33",borderRadius:12,padding:13}}>
            <div style={{fontSize:9,color:mood.color,fontWeight:800,marginBottom:5,letterSpacing:0.4}}>AI MARKET VERDICT</div>
            <div style={{fontSize:12.5,color:T1,lineHeight:1.7}}>{verdict}</div>
          </div>

          {/* SENTIMENT METRICS - merged from AI Briefing */}
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {METRICS.map(function(m){
              return (
                <div key={m.label} style={{flex:1,background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"9px 4px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:T3,marginBottom:3}}>{m.label}</div>
                  <div style={{fontSize:11,fontWeight:800,color:m.color}}>{m.val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OVERNIGHT */}
        <div style={{fontSize:11,color:T2,fontWeight:800,marginBottom:9,letterSpacing:0.5}}>OVERNIGHT  &#8226;  WHAT HAPPENED LAST NIGHT</div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:16}}>
          {OVERNIGHT.map(function(c){return <MiniCue key={c.name} c={c}/>;})}
        </div>

        {/* KEY LEVELS */}
        <div style={{fontSize:11,color:T2,fontWeight:800,marginBottom:9,letterSpacing:0.5}}>KEY LEVELS TODAY</div>
        {LEVELS.map(function(L){return <LevelCard key={L.name} L={L}/>;})}

        {/* WATCH STOCKS */}
        <div style={{fontSize:11,color:T2,fontWeight:800,margin:"6px 0 9px",letterSpacing:0.5}}>STOCKS TO WATCH</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden",marginBottom:16}}>
          {WATCH.map(function(w,i){
            return (
              <div key={w.sym} onClick={function(){setTab("scan");}} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 13px",borderBottom:i<WATCH.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:w.up?UP:DOWN,flexShrink:0}}></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:T1}}>{w.sym}</div>
                  <div style={{fontSize:9.5,color:T3,marginTop:1}}>{w.note}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,color:w.up?UP:DOWN,background:(w.up?UP:DOWN)+"18",borderRadius:6,padding:"3px 9px"}}>{w.setup}</span>
              </div>
            );
          })}
        </div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.6}}>Educational only. Not SEBI registered. Not investment advice. Levels and cues are for learning, not trade calls.</div>
        </div>

      </div>
    </div>
  );
                  }
