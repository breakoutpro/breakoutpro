import { useState, useEffect } from "react";
import CommodityDetail from "./CommodityDetail";

import { useTheme } from "../theme/ThemeProvider";
var BG="#07111F",CARD="#101B2E",BD="#1E3A5F";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var PURPLE="#7C3AED",PURPLE2="#A855F7";
var GOLD="#F59E0B",GOLD2="#FCD34D";
var UP="#1B5E20",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

function MiniChart(props){
  var d=props.d||[],col=props.col||GOLD,w=props.w||60,h=props.h||28;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function genSpark(base){var a=[],p=base;for(var i=0;i<20;i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.004)).toFixed(2));a.push(p);}return a;}

var COMM_BASE=[
  {sym:"GOLD",      ltp:71245, pct:0.45, up:true,  unit:"10g",  color:GOLD},
  {sym:"SILVER",    ltp:87654, pct:0.82, up:true,  unit:"kg",   color:"#C0C0C0"},
  {sym:"CRUDEOIL",  ltp:6823,  pct:-0.34,up:false, unit:"bbl",  color:"#78716C"},
  {sym:"NATURALGAS",ltp:243,   pct:1.20, up:true,  unit:"mmbtu",color:"#22D3EE"},
];

var ALERTS=[
  {sym:"GOLD",      type:"Breakout",   msg:"Broke above 71,500 resistance",color:UP},
  {sym:"SILVER",    type:"Breakdown",  msg:"Below 87,200 support level",   color:DOWN},
  {sym:"CRUDEOIL",  type:"Support Break",msg:"Testing 6,800 key support", color:DOWN},
  {sym:"NATURALGAS",type:"Volume Spike",msg:"2x average volume detected", color:GOLD},
];

var NEWS=[
  {tag:"OPEC",  title:"OPEC+ meeting today, output decision expected", impact:"high"},
  {tag:"US",    title:"US Crude Inventory data due tonight 8:30 PM",   impact:"high"},
  {tag:"USD",   title:"Dollar Index movement key for Gold direction",  impact:"medium"},
];

var GLOBAL=[
  {label:"Dollar Index", val:"104.2", chg:"-0.1%",up:false},
  {label:"Brent Crude",  val:"$82.4", chg:"+0.6%",up:true},
  {label:"US Markets",   val:"Mixed", chg:"",      up:true},
  {label:"Gold Futures", val:"$2,312",chg:"+0.3%", up:true},
];

var EVENTS=[
  {time:"6:30 PM",label:"US CPI Data",      color:DOWN},
  {time:"8:00 PM",label:"Fed Speech",       color:GOLD},
  {time:"9:00 PM",label:"OPEC Announcement",color:BLUE},
  {time:"10:30 PM",label:"Inventory Data",  color:GOLD},
];

var SETUPS=[
  {sym:"GOLD",     icon:"AU",action:"Buy",  level:71550,conf:83,color:UP},
  {sym:"CRUDEOIL", icon:"CR",action:"Sell", level:6820, conf:79,color:DOWN},
];

var OI_DATA=[
  {sym:"GOLD",     signal:"Long Build-up",  color:UP},
  {sym:"SILVER",   signal:"Short Covering", color:UP},
  {sym:"CRUDEOIL", signal:"Heavy Selling",  color:DOWN},
];

export default function CommodityHome(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var greeting=props.greeting||"Good Evening";
  var [comms,setComms]=useState(function(){return COMM_BASE.map(function(c){return Object.assign({},c,{spark:genSpark(c.ltp)});});});
  var [time,setTime]=useState(new Date());
  var [selComm,setSelComm]=useState(null);

  useEffect(function(){
    // SAFETY PATCH: fake commodity price ticking (Math.random) removed -
    // this screen's prices are demo/simulated. Clock update kept (real).
    var t=setInterval(function(){
      setTime(new Date());
    },3000);
    return function(){clearInterval(t);};
  },[]);

  var timeStr=time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  if(selComm) return <CommodityDetail comm={selComm} onBack={function(){setSelComm(null);}}/>;

  return(
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#1A1208,"+BG+")",padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:800,color:GOLD,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
          <span style={{fontSize:12,color:T3}}>Simulated commodity prices for preview. Not live market values.</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={function(){
              try{var s=JSON.parse(localStorage.getItem("bp_settings")||"{}");s.homeOverride="equity";localStorage.setItem("bp_settings",JSON.stringify(s));}catch(e){}
              setTab("home");
            }} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:28,height:28,color:T1,fontSize:13,cursor:"pointer",flexShrink:0}}>&#8592;</button>
            <div>
              <div style={{fontSize:12,color:T2}}>{greeting}</div>
              <div style={{fontSize:15,fontWeight:800,color:T1}}>{props.user&&props.user.name?props.user.name:"Trader"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:12,fontWeight:600,color:T2}}>{timeStr}</div>
            <div style={{fontSize:12,color:GOLD,fontWeight:700}}>MCX LIVE</div>
          </div>
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:12,padding:"7px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:GOLD,boxShadow:"0 0 6px "+GOLD}}></div>
            <span style={{fontSize:12,fontWeight:700,color:GOLD}}>MCX Commodity Live</span>
          </div>
          <span style={{fontSize:12,color:T3}}>3:30 PM - 11:30 PM</span>
        </div>
      </div>

      <div style={{padding:"10px 16px 0"}}>

        {/* 1. AI Commodity Summary */}
        <div style={{background:"linear-gradient(135deg,#130F00,#101B2E)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:18,padding:16,marginBottom:12,boxShadow:"0 4px 20px rgba(245,158,11,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,"+GOLD+","+GOLD2+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:12,fontWeight:900,color:"#000"}}>AI</span>
            </div>
            <span style={{fontSize:12,fontWeight:800,color:T1}}>AI Commodity Summary</span>
          </div>
          {[["GOLD","Bullish above Rs 71,500",UP],["CRUDE","Weak below Rs 6,850",DOWN],["NATURALGAS","Sideways movement",GOLD]].map(function(r){
            return (
              <div key={r[0]} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:r[2],flexShrink:0}}></div>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{r[0]}</span>
                <span style={{fontSize:12,color:T2}}>{r[1]}</span>
              </div>
            );
          })}
        </div>

        {/* MCX Live Prices */}
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>MCX LIVE PRICES</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {comms.map(function(c){
            return(
              <div key={c.sym} onClick={function(){setSelComm(c);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",position:"relative",overflow:"hidden",cursor:"pointer"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+c.color+",transparent)"}}></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div><div style={{fontSize:12,fontWeight:700,color:c.color}}>{c.sym}</div><div style={{fontSize:12,color:T3}}>{c.unit}</div></div>
                  <span style={{fontSize:12,fontWeight:700,color:c.up?UP:DOWN}}>{c.up?"+":""}{c.pct.toFixed(2)}%</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:T1,marginBottom:4}}>Rs{c.ltp.toLocaleString("en-IN")}</div>
                <MiniChart d={c.spark} col={c.color} w={100} h={26}/>
              </div>
            );
          })}
        </div>

        {/* 2. Top Commodity Alerts */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8}}>TOP COMMODITY ALERTS</span>
            <span style={{fontSize:12,fontWeight:800,color:GOLD,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"1px 6px",borderRadius:5}}>SAMPLE</span>
          </div>
          {ALERTS.map(function(a,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<ALERTS.length-1?"1px solid "+BD:"none"}}>
                <div style={{width:4,height:30,borderRadius:2,background:a.color,flexShrink:0}}></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{a.sym} <span style={{color:a.color}}>{a.type}</span></div>
                  <div style={{fontSize:12,color:T2}}>{a.msg}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. High Impact News */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8}}>HIGH IMPACT NEWS</span>
            <span style={{fontSize:12,fontWeight:800,color:GOLD,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"1px 6px",borderRadius:5}}>SAMPLE</span>
          </div>
          {NEWS.map(function(n,i){
            return (
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<NEWS.length-1?10:0,alignItems:"flex-start"}}>
                <span style={{background:(n.impact=="high"?DOWN:GOLD)+"18",color:n.impact=="high"?DOWN:GOLD,borderRadius:6,padding:"2px 7px",fontSize:12,fontWeight:700,flexShrink:0}}>{n.tag}</span>
                <span style={{fontSize:12,color:T1,lineHeight:1.5}}>{n.title}</span>
              </div>
            );
          })}
        </div>

        {/* 4. Global Factors */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:10}}>GLOBAL FACTORS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {GLOBAL.map(function(g){
              return (
                <div key={g.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:12,color:T3,marginBottom:2}}>{g.label}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{g.val}</div>
                  {g.chg?<div style={{fontSize:12,fontWeight:600,color:g.up?UP:DOWN}}>{g.chg}</div>:null}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Tonight Events */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:10}}>TONIGHT EVENTS</div>
          {EVENTS.map(function(e,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<EVENTS.length-1?8:0}}>
                <div style={{background:e.color+"15",border:"1px solid "+e.color+"33",borderRadius:8,padding:"4px 8px",minWidth:58,textAlign:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:e.color}}>{e.time}</span>
                </div>
                <span style={{fontSize:12,color:T1}}>{e.label}</span>
              </div>
            );
          })}
        </div>

        {/* 6. AI Trade Setup */}
        <div style={{background:"linear-gradient(135deg,#0E0820,#101B2E)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:12,fontWeight:900,color:"#fff"}}>AI</span>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:PURPLE2,letterSpacing:0.5}}>AI TRADE SETUP</span>
          </div>
          {SETUPS.map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"9px 12px",marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:12,color:s.color,fontWeight:600}}>{s.action} {s.action=="Buy"?"above":"below"} Rs{s.level.toLocaleString("en-IN")}</div>
                </div>
                <div style={{background:s.color+"18",border:"1px solid "+s.color+"33",borderRadius:8,padding:"4px 10px"}}>
                  <span style={{fontSize:12,fontWeight:800,color:s.color}}>{s.conf}%</span>
                </div>
              </div>
            );
          })}
          <div style={{fontSize:12,color:T3,marginTop:2}}>Educational analysis only. Not investment advice.</div>
        </div>

        {/* 7. OI & Sentiment */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:10}}>COMMODITY OI and SENTIMENT</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {OI_DATA.map(function(o){
              return <div key={o.sym} style={{background:o.color+"12",border:"1px solid "+o.color+"33",borderRadius:8,padding:"5px 10px"}}><span style={{fontSize:12,fontWeight:700,color:o.color}}>{o.sym}: {o.signal}</span></div>;
            })}
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10,marginBottom:10}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>This is AI-generated market analysis for educational purposes only. It is not investment advice. Please do your own research before trading.</div>
        </div>

      </div>
    </div>
  );
}
