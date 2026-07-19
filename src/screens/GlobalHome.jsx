import { useState, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
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

function MiniChart(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  var data = props.data || [];
  var color = props.color || BLUE;
  var w = props.w || 80, h = props.h || 32;
  if (data.length < 2) return null;
  var min = Math.min.apply(null,data), max = Math.max.apply(null,data), range = max-min||1;
  var pts = data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

var GLOBAL_MKT = [
  {label:"DOW JONES",  ltp:42750.60, pct:0.34, up:true,  flag:"US"},
  {label:"NASDAQ",     ltp:18920.30, pct:0.67, up:true,  flag:"US"},
  {label:"S&P 500",    ltp:5890.45,  pct:0.41, up:true,  flag:"US"},
  {label:"GIFT NIFTY", ltp:24010.50, pct:0.28, up:true,  flag:"IN"},
  {label:"NIKKEI 225", ltp:38450.20, pct:-0.22,up:false, flag:"JP"},
  {label:"HANG SENG",  ltp:18234.60, pct:-0.45,up:false, flag:"HK"},
  {label:"DAX",        ltp:18720.30, pct:0.18, up:true,  flag:"DE"},
  {label:"FTSE 100",   ltp:8267.40,  pct:0.23, up:true,  flag:"UK"},
];

function genSpark(base) {
  var arr=[], p=base;
  for(var i=0;i<20;i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.003)).toFixed(2));arr.push(p);}
  return arr;
}

export default function GlobalHome(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand; T1=theme.c.text1;

  var setTab = props.setTab || function(){};
  var user = props.user || {};
  var [mkts, setMkts] = useState(function(){
    return GLOBAL_MKT.map(function(m){return Object.assign({},m,{spark:genSpark(m.ltp)});});
  });
  var [time, setTime] = useState(new Date());

  useEffect(function(){
    var t=setInterval(function(){
      setTime(new Date());
      setMkts(function(prev){
        return prev.map(function(m){
          var chg=(Math.random()-0.48)*m.ltp*0.002;
          var nl=parseFloat((m.ltp+chg).toFixed(2));
          return Object.assign({},m,{ltp:nl,spark:m.spark.slice(-19).concat([nl])});
        });
      });
    },4000);
    return function(){clearInterval(t);};
  },[]);

  var timeStr=time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#050816,#080D20)",padding:"14px 16px 12px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,"+BLUE+",#1E40AF)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,fontWeight:900,color:"#fff"}}>{user.name?user.name[0].toUpperCase():"A"}</span>
            </div>
            <div>
              <div style={{fontSize:10,color:T2}}>{props.greeting||"Good Night"}</div>
              <div style={{fontSize:16,fontWeight:900,color:T1}}>{user.name||"Trader"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:T1}}>{timeStr}</div>
            <div style={{fontSize:8,color:BLUE,fontWeight:700}}>GLOBAL MARKETS</div>
          </div>
        </div>
        <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:BLUE,boxShadow:"0 0 8px "+BLUE}}></div>
            <span style={{fontSize:10,fontWeight:700,color:BLUE}}>Global Markets Active</span>
          </div>
          <span style={{fontSize:8,color:T2}}>US/EU/Asia Markets</span>
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {/* GIFT NIFTY highlight */}
        <div style={{background:"linear-gradient(135deg,#0A0F1E,#0B1224)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:20,padding:"14px 16px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:T2,marginBottom:2,fontWeight:600}}>GIFT NIFTY FUTURES</div>
              <div style={{fontFamily:"monospace",fontSize:24,fontWeight:900,color:T1,marginBottom:2}}>24,010.50</div>
              <div style={{fontSize:12,fontWeight:700,color:G2}}>+65.50 (+0.27%) Tomorrow outlook: Positive</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{background:"rgba(0,200,83,0.12)",border:"1px solid rgba(0,200,83,0.25)",borderRadius:12,padding:"8px 14px"}}>
                <div style={{fontSize:8,color:T2,marginBottom:2}}>Tomorrow NSE</div>
                <div style={{fontSize:12,fontWeight:700,color:G2}}>Gap Up Expected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Markets Grid */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Global Markets</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {mkts.map(function(m){
              return (
                <div key={m.label} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"10px 12px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:m.up?"linear-gradient(90deg,"+G+",transparent)":"linear-gradient(90deg,"+R+",transparent)"}}></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:8,fontWeight:700,color:T2}}>{m.flag}</span>
                    <span style={{fontSize:9,fontWeight:700,color:m.up?G2:R}}>{m.up?"+":""}{m.pct}%</span>
                  </div>
                  <div style={{fontSize:9,fontWeight:700,color:T1,marginBottom:2}}>{m.label}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>{m.ltp.toLocaleString("en-IN")}</div>
                    <MiniChart data={m.spark} color={m.up?G2:R} w={55} h={24}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* US Key Data */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Key Global Indicators</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["US 10Y Bond","4.28%","Yield",GOLD],["Dollar Index","104.23","DXY",BLUE],["Crude Oil","$82.40/bbl","WTI","#78716C"],["Gold","$2,312/oz","COMEX",GOLD],["VIX","14.2","Fear Index",G2],["Crypto BTC","$67,234","Bitcoin",theme.c.warn]].map(function(r){
              return <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"9px 10px"}}><div style={{fontSize:7,color:T2,marginBottom:1}}>{r[2]}</div><div style={{fontSize:8,fontWeight:700,color:r[3]}}>{r[0]}</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{r[1]}</div></div>;
            })}
          </div>
        </div>

        {/* Tomorrow outlook */}
        <div style={{background:"linear-gradient(135deg,#050A1A,#0B1224)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:20,padding:16,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:10}}>Tomorrow Market Prediction</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {[["NIFTY Gap","Gap Up 50-80pts",G2],["BANKNIFTY","Flat to Positive",GOLD],["Global Cue","Positive",G2],["FII Trend","Buying",G2]].map(function(r){
              return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 10px"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
            })}
          </div>
          <div style={{background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.15)",borderRadius:10,padding:"8px 12px"}}>
            <div style={{fontSize:9,color:T2}}>AI Prediction</div>
            <div style={{fontSize:11,color:T1,lineHeight:1.6,marginTop:2}}>Global cues positive. Gift Nifty showing gap up. Watch for 24000 resistance. Bullish bias for tomorrow opening.</div>
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:theme.c.warn}}>Educational only. Not SEBI registered. Not investment advice. Demo data.</div>
        </div>
      </div>
    </div>
  );
}

