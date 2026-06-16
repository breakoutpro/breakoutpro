import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";

var BG="#07111F",CARD="#101B2E",BD="#1E3A5F";
var BLUE="#3B82F6",BLUE2="#60A5FA",BLUE3="#DBEAFE";
var PURPLE="#7C3AED",PURPLE2="#A855F7";
var GOLD="#F59E0B",GOLD2="#FCD34D";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#94A3B8",T3="#475569";

function MiniChart(props){
  var d=props.d||[],col=props.col||BLUE2,w=props.w||60,h=props.h||28;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function genSpark(base,n){var a=[],p=base;for(var i=0;i<(n||20);i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.004)).toFixed(2));a.push(p);}return a;}

var INDICES=[
  {label:"NIFTY 50",  base:23969.20,pct:1.47,up:true},
  {label:"SENSEX",    base:76692.70,pct:1.54,up:true},
  {label:"BANK NIFTY",base:52134.80,pct:1.69,up:true},
  {label:"MIDCAP 50", base:43876.20,pct:0.74,up:true},
];

var COMM_IDX=[
  {label:"GOLD",      base:71245,  pct:0.45, up:true},
  {label:"SILVER",    base:87654,  pct:0.82, up:true},
  {label:"CRUDEOIL",  base:6823,   pct:-0.34,up:false},
  {label:"NATURALGAS",base:243,    pct:1.20, up:true},
];

var GLOBAL=[
  {label:"Gift Nifty", val:"24,035",chg:"+65",  up:true},
  {label:"Dow Jones",  val:"42,750",chg:"+234",  up:true},
  {label:"Nasdaq",     val:"18,920",chg:"+87",   up:true},
  {label:"S&P 500",    val:"5,890", chg:"+24",   up:true},
  {label:"Crude Oil",  val:"$82.4", chg:"-0.3%", up:false},
  {label:"Gold",       val:"$2,312",chg:"+0.2%", up:true},
  {label:"Dollar Idx", val:"104.2", chg:"-0.1%", up:false},
];

var EVENTS=[
  {type:"Expiry",  label:"NIFTY Weekly Expiry", impact:"high",  color:DOWN},
  {type:"Earnings",label:"Reliance Q4 Results",  impact:"high",  color:GOLD},
  {type:"Data",    label:"US CPI Data at 6:30 PM",impact:"high", color:DOWN},
  {type:"IPO",     label:"Ather Energy IPO Open", impact:"medium",color:BLUE},
];

var NEWS_TICKER=[
  "RBI keeps repo rate unchanged at 6.5%  Positive for banking stocks",
  "FII net buyers of Rs 2,847 Cr  Bullish market sentiment",
  "NIFTY breaks above 24,000  Strong momentum continues",
  "US markets close positive  Gift Nifty gap up expected",
  "Crude oil falls 0.3%  Positive for Indian markets",
];

function getSession(){
  var mins=new Date().getHours()*60+new Date().getMinutes();
  if(mins>=6*60&&mins<9*60+15) return "morning";
  if(mins>=9*60+15&&mins<15*60+30) return "equity";
  if(mins>=15*60+30&&mins<21*60) return "closed";
  if(mins>=21*60&&mins<23*60+30) return "commodity";
  return "global";
}

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var user=props.user||{};
  var news=props.news||[];
  var greeting=props.greeting||"Good Morning";

  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){
    return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [commIdx,setCommIdx]=useState(function(){
    return COMM_IDX.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [selIdx,setSelIdx]=useState(null);
  var [time,setTime]=useState(new Date());
  var [tickerIdx,setTickerIdx]=useState(0);
  var [aiSummary]=useState("Global cues positive. FIIs buying aggressively Rs 2,847 Cr. Banking and IT sectors may outperform. Watch 24,000 resistance on NIFTY.");

  useEffect(function(){
    var t=setInterval(function(){
      setTime(new Date());
      setSess(getSession());
      setIndices(function(prev){
        return prev.map(function(idx){
          var chg=(Math.random()-0.48)*idx.ltp*0.0005;
          var nl=parseFloat((idx.ltp+chg).toFixed(2));
          return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});
        });
      });
      setCommIdx(function(prev){
        return prev.map(function(idx){
          var chg=(Math.random()-0.48)*idx.ltp*0.004;
          var nl=parseFloat((idx.ltp+chg).toFixed(2));
          return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});
        });
      });
    },3000);
    var ticker=setInterval(function(){setTickerIdx(function(i){return(i+1)%NEWS_TICKER.length;});},4000);
    return function(){clearInterval(t);clearInterval(ticker);};
  },[]);

  if(selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;

  var timeStr=time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  var dateStr=time.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  var isComm=sess=="commodity";
  var isClosed=sess=="closed";
  var isMorning=sess=="morning";
  var sessLabel=isMorning?"Pre-Market":sess=="equity"?"Market Open":isComm?"MCX Live":isClosed?"Market Closed":"Global Markets";
  var sessCol=sess=="equity"?UP:isComm?GOLD:isClosed?T3:BLUE;

  var QUICK=[
    {label:"OI Chain",   id:"oi",       icon:"OI",  col:BLUE},
    {label:"Scanner",    id:"scanner",  icon:"SC",  col:BLUE2},
    {label:"Paper Trade",id:"paper",    icon:"PT",  col:UP},
    {label:"AI Chat",    id:"ai",       icon:"AI",  col:PURPLE2},
    {label:"Charts",     id:"chart",    icon:"CH",  col:PURPLE},
    {label:"Patterns",   id:"patterns", icon:"PA",  col:"#06B6D4"},
    {label:"Morning AI", id:"morning",  icon:"MP",  col:GOLD},
    {label:"Alerts",     id:"alerts",   icon:"AL",  col:DOWN},
  ];

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Breaking News Ticker */}
      <div style={{background:"rgba(59,130,246,0.08)",borderBottom:"1px solid "+BD,padding:"6px 16px",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:DOWN,borderRadius:4,padding:"1px 6px",flexShrink:0}}>
            <span style={{fontSize:7,fontWeight:800,color:"#fff"}}>LIVE</span>
          </div>
          <div style={{fontSize:9,color:T2,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
            {NEWS_TICKER[tickerIdx]}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{padding:"10px 16px",background:"linear-gradient(180deg,#0D1A2E,"+BG+")",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Market status */}
            <div style={{background:sess=="equity"?"rgba(34,197,94,0.1)":isComm?"rgba(245,158,11,0.1)":"rgba(59,130,246,0.1)",border:"1px solid "+(sess=="equity"?"rgba(34,197,94,0.25)":isComm?"rgba(245,158,11,0.25)":"rgba(59,130,246,0.25)"),borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:sessCol,boxShadow:"0 0 5px "+sessCol}}></div>
              <span style={{fontSize:8,fontWeight:700,color:sessCol}}>{sessLabel}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontSize:11,fontWeight:600,color:T1}}>{timeStr}</div>
              <div style={{fontSize:7,color:T3}}>{dateStr}</div>
            </div>
            <button onClick={function(){setTab("alerts");}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <span style={{fontSize:10}}>&#128276;</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{padding:"10px 16px 0"}}>

        {/* IMPORTANT MARKET CENTER */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>

          {/* Card Header */}
          <div style={{background:"linear-gradient(135deg,#0D1A2E,#101B2E)",padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:DOWN,boxShadow:"0 0 6px "+DOWN}}></div>
              <span style={{fontSize:11,fontWeight:800,color:T1}}>MARKET CENTER</span>
            </div>
            <span style={{fontSize:8,color:T3}}>Updated live</span>
          </div>

          {/* AI Summary */}
          <div style={{padding:"10px 14px",background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.05))",borderBottom:"1px solid "+BD}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:900,color:"#fff"}}>AI</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:8,fontWeight:700,color:PURPLE2,marginBottom:3,letterSpacing:0.5}}>AI MARKET SUMMARY</div>
                <div style={{fontSize:10,color:T1,lineHeight:1.6}}>{aiSummary}</div>
              </div>
            </div>
          </div>

          {/* Global Cues */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>GLOBAL CUES</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {GLOBAL.map(function(g){
                return (
                  <div key={g.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"7px 10px",flexShrink:0,minWidth:70,textAlign:"center"}}>
                    <div style={{fontSize:7,color:T3,marginBottom:2}}>{g.label}</div>
                    <div style={{fontSize:10,fontWeight:700,color:T1}}>{g.val}</div>
                    <div style={{fontSize:8,fontWeight:600,color:g.up?UP:DOWN}}>{g.chg}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FII/DII */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>FII / DII ACTIVITY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["FII","Net Buy","Rs 2,847 Cr",UP],["DII","Net Buy","Rs 1,234 Cr",UP]].map(function(r){
                return (
                  <div key={r[0]} style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:10,padding:"8px 12px"}}>
                    <div style={{fontSize:8,fontWeight:700,color:T2,marginBottom:2}}>{r[0]}</div>
                    <div style={{fontSize:9,color:r[3],fontWeight:600,marginBottom:1}}>{r[1]}</div>
                    <div style={{fontSize:11,fontWeight:800,color:r[3]}}>{r[2]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today Events */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>TODAY EVENTS</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {EVENTS.map(function(e){
                return (
                  <div key={e.label} style={{background:e.color+"11",border:"1px solid "+e.color+"33",borderRadius:8,padding:"4px 8px"}}>
                    <div style={{fontSize:7,fontWeight:700,color:e.color}}>{e.type}</div>
                    <div style={{fontSize:8,color:T1,fontWeight:500}}>{e.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breaking News */}
          <div style={{padding:"10px 14px"}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>BREAKING NEWS</div>
            {(news.length>0?news:NEWS_TICKER.map(function(t){return {title:t,source:"ET Markets"};})).slice(0,3).map(function(n,i){
              return (
                <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:i==0?DOWN:BLUE,marginTop:4,flexShrink:0}}></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:T1,lineHeight:1.5,fontWeight:500}}>{n.title||n}</div>
                    {n.source?<div style={{fontSize:7,color:T3,marginTop:1}}>{n.source}</div>:null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Cards */}
        {!isComm?(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:9,fontWeight:700,color:T3,letterSpacing:0.8}}>INDICES</div>
              {isClosed?<div style={{fontSize:8,color:T3}}>Market Closed</div>:null}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {indices.map(function(idx){
                var col=idx.up?UP:DOWN;
                return (
                  <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+col+",transparent)"}}></div>
                    <div style={{fontSize:8,fontWeight:600,color:T3,marginBottom:3}}>{idx.label}</div>
                    <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:T1,marginBottom:3}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,fontWeight:700,color:col}}>{idx.up?"+":""}{idx.pct}%</span>
                      <MiniChart d={idx.spark} col={col} w={60} h={24}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ):(
          <div>
            <div style={{fontSize:9,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>MCX LIVE PRICES</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {commIdx.map(function(idx){
                var col=idx.up?UP:DOWN;
                return (
                  <div key={idx.label} style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+GOLD+",transparent)"}}></div>
                    <div style={{fontSize:8,fontWeight:600,color:T3,marginBottom:3}}>{idx.label}</div>
                    <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:T1,marginBottom:3}}>Rs{idx.ltp.toLocaleString("en-IN")}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,fontWeight:700,color:col}}>{idx.up?"+":""}{idx.pct}%</span>
                      <MiniChart d={idx.spark} col={GOLD} w={60} h={24}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>QUICK ACCESS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {QUICK.map(function(q){
              return (
                <button key={q.id} onClick={function(){setTab(q.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 6px",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:800,color:q.col,marginBottom:3}}>{q.icon}</div>
                  <div style={{fontSize:7,color:T2,fontWeight:500}}>{q.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Briefing promo */}
        <div style={{background:"linear-gradient(135deg,#0E0820,#101B2E)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 10px rgba(124,58,237,0.3)"}}>
              <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>AI</span>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T1}}>Morning AI Pulse</div>
              <div style={{fontSize:8,color:T2}}>Full market analysis in 30 sec</div>
            </div>
          </div>
          <button onClick={function(){setTab("morning");}} style={{background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(124,58,237,0.3)"}}>Get Pulse</button>
        </div>

      </div>
    </div>
  );
}
