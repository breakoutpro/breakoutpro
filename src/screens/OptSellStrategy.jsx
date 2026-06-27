import { useState } from "react";
import { getStrategy, payoffAt } from "./OptSellData";

// BreakoutPro - OptSellStrategy.jsx
// Strategy detail page with interactive SVG payoff graph. Educational only.
// Pure black, green positive / red risk. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function PayoffGraph(props){
  var s=props.strat;
  var W=320,H=180,PAD=24;
  var center=s.spot, lo=center*0.85, hi=center*1.15;
  var steps=60, pts=[];
  var minP=0,maxP=0;
  for(var i=0;i<=steps;i++){
    var price=lo+(hi-lo)*(i/steps);
    var pnl=payoffAt(s,price);
    pts.push({price:price,pnl:pnl});
    if(pnl<minP)minP=pnl; if(pnl>maxP)maxP=pnl;
  }
  var rng=(maxP-minP)||1, padR=rng*0.15; minP-=padR; maxP+=padR; rng=maxP-minP;
  function x(price){ return PAD+((price-lo)/(hi-lo))*(W-PAD*2); }
  function y(pnl){ return PAD+(1-((pnl-minP)/rng))*(H-PAD*2); }
  var zeroY=y(0);

  // build path + split into profit (green) and loss (red) by area
  var line=pts.map(function(p,i){ return (i==0?"M":"L")+x(p.price).toFixed(1)+","+y(p.pnl).toFixed(1); }).join(" ");

  return (
    <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block"}}>
      {/* zero line */}
      <line x1={PAD} y1={zeroY} x2={W-PAD} y2={zeroY} stroke={BD} strokeWidth="1" strokeDasharray="3 3"/>
      {/* spot marker */}
      <line x1={x(center)} y1={PAD} x2={x(center)} y2={H-PAD} stroke={BD2} strokeWidth="1"/>
      <text x={x(center)} y={H-6} fontSize="7" fill={T3} textAnchor="middle">Spot</text>
      {/* profit fill above zero */}
      <path d={line+" L"+x(hi)+","+zeroY+" L"+x(lo)+","+zeroY+" Z"} fill={UP} opacity="0.07"/>
      {/* payoff line */}
      <path d={line} fill="none" stroke={CYAN} strokeWidth="2" strokeLinejoin="round"/>
      {/* strikes */}
      {s.legs.map(function(l,i){
        return <line key={i} x1={x(l.strike)} y1={PAD} x2={x(l.strike)} y2={H-PAD} stroke={l.dir=="short"?GOLD:T3} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>;
      })}
    </svg>
  );
}

export default function OptSellStrategy(props){
  var s=getStrategy(props.id);
  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(s.name+". "+s.overview+" Market condition: "+s.condition+" "+s.greeks);
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Row(p){ return <div style={{display:"flex",justifyContent:"space-between",padding:"10px 13px",borderBottom:p.last?"none":"1px solid "+BD2}}><span style={{fontSize:10,color:p.c||T2,fontWeight:600}}>{p.k}</span><span style={{fontSize:10.5,color:T1,fontWeight:600,textAlign:"right",maxWidth:190}}>{p.v}</span></div>; }
  function Sec(p){ return <div style={{marginBottom:14}}><div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:7}}>{p.t}</div>{p.children}</div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>{s.name}</div>
          <div style={{fontSize:9,fontWeight:700,color:CYAN}}>{s.bias}</div>
        </div>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"7px 11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:14}}>
        {/* PAYOFF GRAPH */}
        <Sec t="PAYOFF AT EXPIRY">
          <div style={{background:"#08090D",border:"1px solid "+BD,borderRadius:13,padding:"10px 6px"}}>
            <PayoffGraph strat={s}/>
            <div style={{fontSize:8,color:T3,textAlign:"center",marginTop:4}}>Blue line is profit and loss across price. Gold lines are short strikes.</div>
          </div>
        </Sec>

        <Sec t="OVERVIEW"><div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}><div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{s.overview}</div></div></Sec>

        <Sec t="KEY FACTS">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            <Row k="Market Condition" v={s.condition}/>
            <Row k="Max Profit" c={UP} v={s.maxProfit}/>
            <Row k="Max Loss" c={DOWN} v={s.maxLoss}/>
            <Row k="Break-even" v={s.breakeven}/>
            <Row k="Margin" v={s.margin}/>
            <Row k="Risk" v={s.risk}/>
            <Row k="Reward" v={s.reward} last={true}/>
          </div>
        </Sec>

        <Sec t="GREEKS IMPACT"><div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}><div style={{fontSize:11,color:T1,lineHeight:1.6}}>{s.greeks}</div></div></Sec>
        <Sec t="EXPIRY BEHAVIOUR"><div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}><div style={{fontSize:11,color:T1,lineHeight:1.6}}>{s.expiry}</div></div></Sec>

        <Sec t="COMMON MISTAKES">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
            {s.mistakes.map(function(m,i){ return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"4px 0"}}><span style={{color:DOWN}}>&#33;</span>  {m}</div>; })}
          </div>
        </Sec>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Content Only. This platform is for learning and market intelligence. It does not provide investment advice or trading recommendations. Please consult a SEBI-registered investment adviser before making investment decisions.</div>
        </div>
      </div>
    </div>
  );
}
