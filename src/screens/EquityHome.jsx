import { useState, useEffect } from "react";

var DB = "#050816";
var CB = "#0B1224";
var BD = "#1B2A4D";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8FA2C9";
var GRAD = "linear-gradient(135deg,#0B1224,#0D1830)";

function MiniChart(props) {
  var data = props.data || [];
  var color = props.color || G2;
  var w = props.w || 80, h = props.h || 36;
  if (data.length < 2) return null;
  var min = Math.min.apply(null,data), max = Math.max.apply(null,data), range = max-min||1;
  var pts = data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  var fillPts = pts + " "+w+","+h+" 0,"+h;
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <defs>
        <linearGradient id={"g"+color.replace("#","")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={"url(#g"+color.replace("#","")+")"}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function genSpark(base, n) {
  var arr = [], p = base;
  for(var i=0;i<(n||20);i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.005)).toFixed(2));arr.push(p);}
  return arr;
}

var EQUITY_IDX = [
  {label:"NIFTY 50",  ltp:23969.20, chg:346.30,  pct:1.47,  up:true},
  {label:"SENSEX",    ltp:76692.70, chg:1164.75, pct:1.54,  up:true},
  {label:"BANK NIFTY",ltp:52134.80, chg:867.40,  pct:1.69,  up:true},
  {label:"MIDCAP",    ltp:43876.20, chg:324.10,  pct:0.74,  up:true},
];

var QUICK = [
  {label:"OI Chain",  id:"oi",       icon:"OI", color:"#3B82F6"},
  {label:"Scanner",   id:"scanner",  icon:"SC", color:G2},
  {label:"Scalper",   id:"scalper",  icon:"SP", color:GOLD},
  {label:"Charts",    id:"chart",    icon:"CH", color:"#8B5CF6"},
  {label:"AI Chat",   id:"ai",       icon:"AI", color:"#EC4899"},
  {label:"Analysis",  id:"analysis", icon:"AN", color:BLUE},
  {label:"Learn",     id:"learn",    icon:"LN", color:GOLD},
  {label:"Heatmap",   id:"heatmap",  icon:"HM", color:R},
  {label:"OI Chain",  id:"oi",       icon:"FD", color:G2},
  {label:"FII/DII",   id:"fiidii",   icon:"FI", color:"#F97316"},
  {label:"Patterns",  id:"patterns", icon:"PA", color:"#06B6D4"},
  {label:"Paper Trade",id:"paper",   icon:"PT", color:G},
];

export default function EquityHome(props) {
  var setTab = props.setTab || function(){};
  var user = props.user || {};
  var news = props.news || [];
  var [sparks, setSparks] = useState(function(){
    var s={};
    EQUITY_IDX.forEach(function(x){s[x.label]=genSpark(x.ltp);});
    return s;
  });
  var [indices, setIndices] = useState(EQUITY_IDX);
  var [time, setTime] = useState(new Date());

  useEffect(function(){
    var t=setInterval(function(){
      setTime(new Date());
      setIndices(function(prev){
        return prev.map(function(idx){
          var chg=(Math.random()-0.48)*idx.ltp*0.0008;
          var nl=parseFloat((idx.ltp+chg).toFixed(2));
          return Object.assign({},idx,{ltp:nl,chg:parseFloat((nl-EQUITY_IDX.find(function(x){return x.label==idx.label;}).ltp+idx.chg).toFixed(2))});
        });
      });
      setSparks(function(prev){
        var ns=Object.assign({},prev);
        EQUITY_IDX.forEach(function(x){
          var arr=prev[x.label]||[];
          ns[x.label]=arr.slice(-19).concat([arr[arr.length-1]*(1+(Math.random()-0.48)*0.003)]);
        });
        return ns;
      });
    },3000);
    return function(){clearInterval(t);};
  },[]);

  var hour=time.getHours();
  var greeting=props.greeting||(hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening");
  var isMorning=props.session=="morning";
  var timeStr=time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Welcome */}
      <div style={{background:GRAD,padding:"14px 16px 12px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,"+G+",#00A040)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,fontWeight:900,color:"#fff"}}>{user.name?user.name[0].toUpperCase():"A"}</span>
            </div>
            <div>
              <div style={{fontSize:10,color:T2}}>{greeting}</div>
              <div style={{fontSize:16,fontWeight:900,color:T1}}>{user.name||"Trader"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:T1}}>{timeStr}</div>
            <div style={{fontSize:8,color:G2,fontWeight:700}}>NSE LIVE</div>
          </div>
        </div>
        {/* Market status */}
        <div style={{background:isMorning?"rgba(245,158,11,0.08)":"rgba(0,200,83,0.08)",border:"1px solid "+(isMorning?"rgba(245,158,11,0.2)":"rgba(0,200,83,0.2)"),borderRadius:12,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:isMorning?GOLD:G2,boxShadow:"0 0 8px "+(isMorning?GOLD:G2)}}></div>
            <span style={{fontSize:10,fontWeight:700,color:isMorning?GOLD:G2}}>{isMorning?"Pre-Market Prep  Opens 9:15 AM":"NSE/BSE Market Open"}</span>
          </div>
          <span style={{fontSize:8,color:T2}}>{isMorning?"Check Global Cues":"9:15 AM - 3:30 PM"}</span>
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {/* Index Cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {indices.map(function(idx){
            var sp=sparks[idx.label]||[];
            return (
              <div key={idx.label} style={{background:CB,border:"1px solid "+BD,borderRadius:20,padding:"12px 14px",position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:idx.up?"linear-gradient(90deg,"+G+",transparent)":"linear-gradient(90deg,"+R+",transparent)"}}></div>
                <div style={{fontSize:9,color:T2,marginBottom:4,fontWeight:600}}>{idx.label}</div>
                <div style={{fontFamily:"monospace",fontSize:16,fontWeight:900,color:T1,marginBottom:2}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <span style={{fontSize:10,fontWeight:700,color:idx.up?G2:R}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart data={sp} color={idx.up?G2:R} w={70} h={30}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Quick Access</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {QUICK.map(function(q){
              return (
                <button key={q.id+q.icon} onClick={function(){setTab(q.id);}} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"10px 6px",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all 0.2s"}}>
                  <div style={{fontSize:11,fontWeight:800,color:q.color,marginBottom:4}}>{q.icon}</div>
                  <div style={{fontSize:8,color:T2,fontWeight:500}}>{q.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Briefing card */}
        <div style={{background:"linear-gradient(135deg,#0A1A0F,#0B1224)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:16,marginBottom:14,boxShadow:"0 4px 30px rgba(0,200,83,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:14,fontWeight:900,color:"#fff"}}>AI</span>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:T1}}>AI Market Briefing</div>
                <div style={{fontSize:9,color:T2}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
              </div>
            </div>
            <button onClick={function(){setTab("briefing");}} style={{background:G,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Briefing</button>
          </div>
          {/* Sentiment meter */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:9,color:T2}}>Market Sentiment</span>
              <span style={{fontSize:9,fontWeight:700,color:G2}}>Bullish 68%</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:"68%",background:"linear-gradient(90deg,"+G+","+G2+")",borderRadius:3}}></div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[["FII","Net Buyer",G2],["DII","Net Buyer",G2],["VIX","14.2 Low",GOLD]].map(function(r){
              return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"7px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
            })}
          </div>
        </div>

        {/* News */}
        {news.length>0?(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:T1}}>Market News</div>
              <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:G2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>View All</button>
            </div>
            {news.slice(0,3).map(function(n,i){
              return (
                <div key={i} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontSize:11,fontWeight:600,color:T1,lineHeight:1.5,marginBottom:4}}>{n.title}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:8,color:G2,fontWeight:600,background:"rgba(0,200,83,0.1)",borderRadius:10,padding:"1px 7px"}}>{n.source||"ET Markets"}</span>
                    <span style={{fontSize:8,color:T2}}>{n.pubDate||""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ):null}

      </div>
    </div>
  );
}
