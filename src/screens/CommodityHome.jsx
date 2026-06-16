import { useState, useEffect } from "react";

var DB="#050816",CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",T1="#FFFFFF",T2="#8FA2C9";

function MiniChart(props) {
  var data=props.data||[],color=props.color||GOLD,w=props.w||80,h=props.h||36;
  if(data.length<2)return null;
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return(i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  var fp=pts+" "+w+","+h+" 0,"+h;
  return(
    <svg width={w} height={h} style={{display:"block"}}>
      <defs><linearGradient id={"cg"+color.replace("#","")} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={fp} fill={"url(#cg"+color.replace("#","")+")"}/> 
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function genSpark(base){var arr=[],p=base;for(var i=0;i<20;i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.004)).toFixed(2));arr.push(p);}return arr;}

var COMM_BASE=[
  {sym:"GOLD",      ltp:71245, pct:0.45, up:true,  unit:"10g",   color:GOLD},
  {sym:"SILVER",    ltp:87654, pct:0.82, up:true,  unit:"kg",    color:"#C0C0C0"},
  {sym:"CRUDEOIL",  ltp:6823,  pct:-0.34,up:false, unit:"bbl",   color:"#78716C"},
  {sym:"NATURALGAS",ltp:243,   pct:1.20, up:true,  unit:"mmbtu", color:"#22D3EE"},
  {sym:"COPPER",    ltp:812,   pct:0.67, up:true,  unit:"kg",    color:"#D97706"},
  {sym:"ZINC",      ltp:289,   pct:-0.23,up:false, unit:"kg",    color:"#94A3B8"},
];

var COMM_QUICK=[
  {label:"OI Chain", id:"oi",      icon:"OI",color:"#3B82F6"},
  {label:"Scanner",  id:"scanner", icon:"SC",color:G2},
  {label:"Charts",   id:"chart",   icon:"CH",color:"#8B5CF6"},
  {label:"AI Chat",  id:"ai",      icon:"AI",color:"#EC4899"},
  {label:"Paper",    id:"paper",   icon:"PT",color:G},
  {label:"Analysis", id:"analysis",icon:"AN",color:"#3B82F6"},
  {label:"Learn",    id:"learn",   icon:"LN",color:GOLD},
  {label:"News",     id:"news",    icon:"NW",color:R},
];

export default function CommodityHome(props){
  var setTab=props.setTab||function(){};
  var greeting=props.greeting||"Good Evening";
  var [comms,setComms]=useState(function(){return COMM_BASE.map(function(c){return Object.assign({},c,{spark:genSpark(c.ltp)});});});
  var [time,setTime]=useState(new Date());

  useEffect(function(){
    var t=setInterval(function(){
      setTime(new Date());
      setComms(function(prev){return prev.map(function(c){var chg=(Math.random()-0.48)*c.ltp*0.003;var nl=parseFloat((c.ltp+chg).toFixed(2));return Object.assign({},c,{ltp:nl,spark:c.spark.slice(-19).concat([nl]),up:nl>=c.ltp});});});
    },3000);
    return function(){clearInterval(t);};
  },[]);

  var timeStr=time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return(
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:"linear-gradient(135deg,#0B1224,#12100A)",padding:"14px 16px 12px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,"+GOLD+",#D97706)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,fontWeight:900,color:"#000"}}>{props.user&&props.user.name?props.user.name[0].toUpperCase():"A"}</span>
            </div>
            <div>
              <div style={{fontSize:10,color:T2}}>{greeting}</div>
              <div style={{fontSize:16,fontWeight:900,color:T1}}>{props.user&&props.user.name?props.user.name:"Trader"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:T1}}>{timeStr}</div>
            <div style={{fontSize:8,color:GOLD,fontWeight:700}}>MCX LIVE</div>
          </div>
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:12,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:GOLD,boxShadow:"0 0 8px "+GOLD}}></div>
            <span style={{fontSize:10,fontWeight:700,color:GOLD}}>MCX Commodity Market Open</span>
          </div>
          <span style={{fontSize:8,color:T2}}>3:30 PM - 11:30 PM</span>
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>MCX Live Prices</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {comms.map(function(c){
              return(
                <div key={c.sym} style={{background:CB,border:"1px solid "+BD,borderRadius:20,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+c.color+",transparent)"}}></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div><div style={{fontSize:9,fontWeight:700,color:c.color}}>{c.sym}</div><div style={{fontSize:7,color:T2}}>{c.unit}</div></div>
                    <span style={{fontSize:9,fontWeight:700,color:c.up?G2:R}}>{c.up?"+":""}{c.pct.toFixed(2)}%</span>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:T1,marginBottom:4}}>Rs{c.ltp.toLocaleString("en-IN")}</div>
                  <MiniChart data={c.spark} color={c.color} w={100} h={28}/>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Quick Access</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {COMM_QUICK.map(function(q){return(<button key={q.id+q.icon} onClick={function(){setTab(q.id);}} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"10px 6px",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:q.color,marginBottom:4}}>{q.icon}</div><div style={{fontSize:8,color:T2}}>{q.label}</div></button>);
            })}
          </div>
        </div>

        <div style={{background:"linear-gradient(135deg,#130F00,#0B1224)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:20,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,"+GOLD+",#D97706)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#000"}}>AI</span></div>
              <div><div style={{fontSize:13,fontWeight:800,color:T1}}>AI Commodity Briefing</div><div style={{fontSize:9,color:T2}}>Gold, Silver, Crude Oil Analysis</div></div>
            </div>
            <button onClick={function(){setTab("briefing");}} style={{background:GOLD,border:"none",borderRadius:10,padding:"7px 12px",color:"#000",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Briefing</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[["GOLD","Bullish",G2],["CRUDE","Bearish",R],["DOLLAR","104.2",GOLD]].map(function(r){return<div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"7px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
            })}
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice. Demo data.</div>
        </div>
      </div>
    </div>
  );
}
