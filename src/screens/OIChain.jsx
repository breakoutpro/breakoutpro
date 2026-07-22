import { useState, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#050505",CB="#101318",BD="#20242D",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB";

var SYMS=[
  {sym:"NIFTY",     spot:23969.20,step:50, lot:50, change:346.30, pct:1.47},
  {sym:"BANKNIFTY", spot:52134.80,step:100,lot:15, change:867.40, pct:1.69},
  {sym:"SENSEX",    spot:76692.70,step:100,lot:10, change:1164.75,pct:1.54},
  {sym:"FINNIFTY",  spot:24123.45,step:50, lot:40, change:234.50, pct:0.98},
  {sym:"MIDCPNIFTY",spot:17265.90,step:25, lot:75, change:127.30, pct:0.74},
  {sym:"RELIANCE",  spot:2845.60, step:20, lot:250,change:47.60,  pct:1.71},
  {sym:"TCS",       spot:3654.20, step:20, lot:150,change:-35.80, pct:-0.97},
  {sym:"HDFCBANK",  spot:1742.50, step:10, lot:550,change:32.50,  pct:1.90},
  {sym:"ICICIBANK", spot:1289.30, step:10, lot:700,change:29.40,  pct:2.33},
  {sym:"INFY",      spot:1567.80, step:10, lot:400,change:-22.10, pct:-1.39},
  {sym:"WIPRO",     spot:478.90,  step:5,  lot:1500,change:13.90, pct:2.99},
  {sym:"SBIN",      spot:812.30,  step:5,  lot:1500,change:17.40, pct:2.18},
  {sym:"TATAMOTORS",spot:945.60,  step:5,  lot:1350,change:20.70, pct:2.23},
  {sym:"AXISBANK",  spot:1156.70, step:10, lot:1200,change:16.80, pct:1.47},
  {sym:"BAJFINANCE",spot:7234.50, step:50, lot:125, change:134.50,pct:1.89},
];

var EXP={NIFTY:["19 Jun","26 Jun","31 Jul"],BANKNIFTY:["18 Jun","25 Jun","31 Jul"],SENSEX:["20 Jun","27 Jun","01 Aug"],FINNIFTY:["17 Jun","24 Jun","29 Jul"],MIDCPNIFTY:["16 Jun","23 Jun","28 Jul"]};
function getExp(s){return EXP[s]||["26 Jun","31 Jul","28 Aug"];}

function fV(n){if(n>=10000000)return(n/10000000).toFixed(1)+"Cr";if(n>=100000)return(n/100000).toFixed(1)+"L";if(n>=1000)return(n/1000).toFixed(0)+"K";return n;}

function genChain(spot,step){
  var atm=Math.round(spot/step)*step,rows=[];
  for(var i=-8;i<=8;i++){
    var s=atm+i*step,d=Math.abs(i);
    var iC=Math.max(0,spot-s),iP=Math.max(0,s-spot),tv=Math.max(5,spot*0.008/(d*0.8+1));
    var cL=parseFloat((iC+tv+(Math.random()-0.3)*tv*0.2).toFixed(2));
    var pL=parseFloat((iP+tv+(Math.random()-0.3)*tv*0.2).toFixed(2));
    var bV=Math.floor(spot*15);
    var cV=Math.floor((bV/(d*1.4+1))*(0.8+Math.random()*0.4));
    var pV=Math.floor((bV/(d*1.4+1))*(0.8+Math.random()*0.4));
    var cO=Math.floor(cV*(2+Math.random()*3)),pO=Math.floor(pV*(2+Math.random()*3));
    var pc=cL*(0.4+Math.random()*0.5),pp=pL*(1.5+Math.random()*1.0);
    var iv=parseFloat((14+d*1.2+Math.random()*3).toFixed(1));
    var cd=parseFloat(Math.max(0.01,Math.min(0.99,0.5-i*0.07)).toFixed(2));
    rows.push({s:s,atm:i==0,d:i,cL:cL,pL:pL,cV:cV,pV:pV,cO:cO,pO:pO,
      ccP:parseFloat(((cL-pc)/pc*100).toFixed(2)),pcP:parseFloat(((pL-pp)/pp*100).toFixed(2)),
      iv:iv,cd:cd,pd:parseFloat((cd-1).toFixed(2)),
      gm:parseFloat((0.003/(d*0.5+1)+Math.random()*0.001).toFixed(4)),
      th:parseFloat((-cL*0.008-Math.random()*2).toFixed(2)),
      vg:parseFloat((cL*0.12+Math.random()*2).toFixed(2))});
  }
  return {rows:rows,atm:atm};
}

export default function OIChainScreen(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CB = theme.c.card, DB = theme.c.bg, G = theme.c.brand;

  var [sym,setSym]=useState("NIFTY");
  var [exp,setExp]=useState("19 Jun");
  var [view,setView]=useState("LTP");
  var [chain,setChain]=useState(null);
  var [sd,setSd]=useState(SYMS[0]);
  var [order,setOrder]=useState(null);
  var [side,setSide]=useState("BUY");
  var [lots,setLots]=useState("1");
  var [tradeMsg,setTradeMsg]=useState(null);

  function build(s){
    var d=SYMS.find(function(x){return x.sym==s;})||SYMS[0];
    setSd(d);setChain(genChain(d.spot,d.step));
  }

  useEffect(function(){build("NIFTY");},[]);
  useEffect(function(){
    var t=setInterval(function(){
      setChain(function(p){return p?genChain(sd.spot*(1+(Math.random()-0.49)*0.001),sd.step):p;});
    },5000);
    return function(){clearInterval(t);};
  },[sd]);

  function chSym(s){setSym(s);setExp(getExp(s)[0]);build(s);}

  function openOrder(strike,type,ltp,lot){
    setOrder({strike:strike,type:type,ltp:ltp,lot:lot,sym:sym});
    setSide("BUY");setLots("1");
  }

  function placeOrder(){
    try{
      var l=parseInt(lots)||1;
      var qty=l*(order.lot);
      var cost=order.ltp*qty;
      var saved=JSON.parse(localStorage.getItem("bp_pt2")||"{}");
      var bal=saved.balance||100000;
      if(side=="BUY"&&cost>bal){setTradeMsg({t:"error",m:"Insufficient balance! Need Rs"+cost.toFixed(0)});return;}
      var pos={id:Date.now(),sym:order.sym+" "+order.strike+order.type,market:"options",side:side,qty:qty,entry:order.ltp,sl:null,tgt:null,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString("en-IN"),type:"option"};
      var newBal=side=="BUY"?bal-cost:bal;
      var positions=(saved.positions||[]).concat([pos]);
      var tradesUsed=(saved.tradesUsed||0)+1;
      localStorage.setItem("bp_pt2",JSON.stringify(Object.assign({},saved,{balance:newBal,positions:positions,tradesUsed:tradesUsed})));
      setTradeMsg({t:"success",m:side+" "+order.sym+" "+order.strike+order.type+" x"+qty+" @ Rs"+order.ltp});
      setTimeout(function(){setTradeMsg(null);setOrder(null);},2500);
    }catch(e){setTradeMsg({t:"error",m:"Error placing order"});}
  }

  if(!chain)return(<div style={{background:DB,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:T1,fontFamily:"Inter,sans-serif",fontSize:14}}>Loading Option Chain...</div>);

  var tCO=chain.rows.reduce(function(a,r){return a+r.cO;},0);
  var tPO=chain.rows.reduce(function(a,r){return a+r.pO;},0);
  var pcr=(tPO/tCO).toFixed(2);
  var pcrC=parseFloat(pcr)>1.2?G2:parseFloat(pcr)<0.8?R:BLUE;
  var mCO=Math.max.apply(null,chain.rows.map(function(r){return r.cO;}));
  var mPO=Math.max.apply(null,chain.rows.map(function(r){return r.pO;}));
  var atmSig=sd.change>=0?"Long Buildup":"Short Covering";
  var atmC=sd.change>=0?G2:BLUE;

  var maxPain=chain.rows.reduce(function(best,r){
    var totalPain=chain.rows.reduce(function(sum,r2){
      if(r.strike>=r2.strike) return sum+r2.cO*(r.strike-r2.strike);
      return sum+r2.pO*(r2.strike-r.strike);
    },0);
    return totalPain<best.pain?{strike:r.strike,pain:totalPain}:best;
  },{strike:chain.atm,pain:Infinity}).strike;

  var oiBuildup=chain.rows.filter(function(r){
    return r.cO>mCO*0.4||r.pO>mPO*0.4;
  }).sort(function(a,b){return (b.cO+b.pO)-(a.cO+a.pO)}).slice(0,4);

  var avgIV=chain.rows.reduce(function(s,r){return s+r.iv;},0)/chain.rows.length;
  var ivTrend=avgIV>20?"High":"Low";

  return(
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Ticker */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,overflowX:"auto",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-flex"}}>
          {SYMS.slice(0,5).map(function(s){
            var up=s.change>=0,act=sym==s.sym;
            return(
              <button key={s.sym} onClick={function(){chSym(s.sym);}} style={{background:act?"rgba(37,99,235,0.1)":"none",border:"none",borderRight:"1px solid "+BD,padding:"12px 16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",flexShrink:0,borderBottom:act?"2px solid "+BLUE:"2px solid transparent"}}>
                <div style={{fontSize:12,fontWeight:700,color:act?BLUE:T1}}>{s.sym}</div>
                <div style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:up?G2:R}}>{s.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                <div style={{fontSize:12,color:up?G2:R}}>{up?"+":""}{s.change}({up?"+":""}{s.pct}%)</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{background:CB,padding:"8px 12px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:8,paddingBottom:4}}>
          {SYMS.map(function(s){
            var act=sym==s.sym;
            return <button key={s.sym} onClick={function(){chSym(s.sym);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {["LTP","OI","Greeks"].map(function(v){
            var act=view==v;
            return <button key={v} onClick={function(){setView(v);}} style={{background:act?"rgba(30,144,255,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"4px 12px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{v}</button>;
          })}
          <div style={{flex:1}}></div>
          <select onChange={function(e){setExp(e.target.value);}} value={exp} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"4px 8px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none"}}>
            {getExp(sym).map(function(e){return <option key={e} value={e}>{e}</option>;})}
          </select>
        </div>
      </div>

      {/* Enhanced Stats — PCR, Max Pain, IV */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"8px 12px",display:"flex",gap:12,overflowX:"auto"}}>
        {[["PCR",pcr,pcrC],["Max Pain",maxPain.toLocaleString("en-IN"),BLUE],["Avg IV",avgIV.toFixed(1)+"%","#60A5FA"],["IV Trend",ivTrend,avgIV>20?R:G2],["Call OI",fV(tCO),R],["Put OI",fV(tPO),G2],["ATM",chain.atm,BLUE]].map(function(r){
          return <div key={r[0]} style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:12,color:T2}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
        })}
      </div>

      {/* OI Buildup Section */}
      <div style={{background:"rgba(59,130,246,0.06)",borderBottom:"1px solid "+BD,padding:"8px 12px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#60A5FA",letterSpacing:0.5,marginBottom:8}}>&#128269; OI BUILDUP (Key Levels)</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {oiBuildup.map(function(r){
            var isCall=r.cO>r.pO;
            return (
              <div key={r.strike} style={{background:isCall?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)",border:"1px solid "+(isCall?R:G2)+"44",borderRadius:8,padding:"4px 12px"}}>
                <div style={{fontSize:12,fontWeight:700,color:isCall?R:G2}}>{r.strike}</div>
                <div style={{fontSize:12,color:"#94A3B8"}}>{isCall?"Resistance":"Support"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Option Analysis */}
      <div style={{background:theme.c.card,borderBottom:"1px solid "+BD,padding:"8px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:20,height:20,borderRadius:6,background:"#2563EB",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:900,color:"#fff"}}>AI</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:"#A78BFA"}}>AI OPTION ANALYSIS</span>
        </div>
        <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>
          PCR {pcr} — {parseFloat(pcr)>1?"Bullish (Puts dominating, supports likely held)":"Bearish (Calls dominating, resistance likely)"}. Max Pain at {maxPain.toLocaleString("en-IN")} — market likely to gravitate here near expiry. IV at {avgIV.toFixed(1)}% ({ivTrend} volatility). <span style={{color:G2,fontWeight:600}}>Key support: {oiBuildup[1]?oiBuildup[1].strike:"--"}</span>, <span style={{color:R,fontWeight:600}}>Key resistance: {oiBuildup[0]?oiBuildup[0].strike:"--"}</span>.
        </div>
      </div>

      {/* LTP View */}
      {view=="LTP"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:4,padding:"4px 4px",background:"rgba(255,255,255,0.04)"}}>
            {["Vol","CALL","Chg%","STRIKE","Chg%","PUT","Vol"].map(function(h,i){
              return <div key={i} style={{fontSize:12,fontWeight:700,color:i==3?BLUE:i<3?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          {chain.rows.map(function(r){
            var cP=(r.cO/mCO)*100,pP=(r.pO/mPO)*100;
            return(
              <div key={r.s}>
                {r.atm?(
                  <div style={{background:"rgba(0,200,83,0.08)",borderTop:"1px solid rgba(0,200,83,0.2)",borderBottom:"1px solid rgba(0,200,83,0.2)",padding:"4px 12px",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:atmC}}>{atmSig}</span>
                    <span style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:sd.change>=0?G2:R}}>{sd.spot.toLocaleString("en-IN",{minimumFractionDigits:2})} {sd.change>=0?"":""}</span>
                  </div>
                ):null}
                <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:4,padding:"8px 4px",background:r.d<0?"rgba(0,200,83,0.03)":r.d>0?"rgba(239,68,68,0.03)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:cP+"%",background:"rgba(0,200,83,0.15)"}}></div><div style={{fontSize:12,color:G2,textAlign:"center",position:"relative"}}>{fV(r.cV)}</div></div>
                  <div style={{textAlign:"center",cursor:"pointer",background:"rgba(0,200,83,0.06)",borderRadius:4}} onClick={function(){openOrder(r.s,"CE",r.cL,sd.lot);}}><div style={{fontSize:12,fontWeight:700,color:G2}}>{r.cL}</div><div style={{fontSize:12,color:G2}}>TAP</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:12,color:r.ccP>=0?G2:R}}>{r.ccP>=0?"+":""}{r.ccP}%</div></div>
                  <div style={{textAlign:"center",background:r.atm?"rgba(245,158,11,0.15)":"transparent",borderRadius:3}}>
                    <div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>
                    {r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}
                  </div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:12,color:r.pcP>=0?G2:R}}>{r.pcP>=0?"+":""}{r.pcP}%</div></div>
                  <div style={{textAlign:"center",cursor:"pointer",background:"rgba(239,68,68,0.06)",borderRadius:4}} onClick={function(){openOrder(r.s,"PE",r.pL,sd.lot);}}><div style={{fontSize:12,fontWeight:700,color:R}}>{r.pL}</div><div style={{fontSize:12,color:R}}>TAP</div></div>
                  <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,height:"100%",width:pP+"%",background:"rgba(239,68,68,0.15)"}}></div><div style={{fontSize:12,color:R,textAlign:"center",position:"relative"}}>{fV(r.pV)}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* OI View */}
      {view=="OI"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 0.8fr 0.8fr 0.8fr 1fr",gap:4,padding:"4px 4px",background:"rgba(255,255,255,0.04)"}}>
            {["Call OI","Chg OI","STRIKE","Chg OI","Put OI"].map(function(h,i){return <div key={i} style={{fontSize:12,fontWeight:700,color:i==2?BLUE:i<2?G2:R,textAlign:"center"}}>{h}</div>;})}
          </div>
          {chain.rows.map(function(r){
            var cP=(r.cO/mCO)*100,pP=(r.pO/mPO)*100;
            var ccOI=Math.floor(r.cO*(Math.random()-0.4)*0.3);
            var pcOI=Math.floor(r.pO*(Math.random()-0.4)*0.3);
            return(
              <div key={r.s} style={{display:"grid",gridTemplateColumns:"1fr 0.8fr 0.8fr 0.8fr 1fr",gap:4,padding:"8px 4px",borderBottom:"1px solid rgba(255,255,255,0.03)",background:r.atm?"rgba(245,158,11,0.08)":"transparent"}}>
                <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:cP+"%",background:"rgba(0,200,83,0.2)"}}></div><div style={{fontSize:12,fontWeight:600,color:G2,textAlign:"center",position:"relative"}}>{fV(r.cO)}</div></div>
                <div style={{textAlign:"center",fontSize:12,color:ccOI>=0?G2:R}}>{ccOI>=0?"+":""}{fV(Math.abs(ccOI))}</div>
                <div style={{textAlign:"center",background:r.atm?"rgba(245,158,11,0.15)":"transparent",borderRadius:3}}><div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>{r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}</div>
                <div style={{textAlign:"center",fontSize:12,color:pcOI>=0?G2:R}}>{pcOI>=0?"+":""}{fV(Math.abs(pcOI))}</div>
                <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,height:"100%",width:pP+"%",background:"rgba(239,68,68,0.2)"}}></div><div style={{fontSize:12,fontWeight:600,color:R,textAlign:"center",position:"relative"}}>{fV(r.pO)}</div></div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* Greeks View */}
      {view=="Greeks"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.7fr 0.7fr 0.7fr 0.8fr 0.7fr 0.7fr 0.7fr",gap:4,padding:"4px 4px",background:"rgba(255,255,255,0.04)"}}>
            {["C.D","C.IV","C.Vg","STRIKE","P.D","P.IV","Gm","Th"].map(function(h,i){return <div key={i} style={{fontSize:12,fontWeight:700,color:i==3?BLUE:i<3?G2:i>=6?BLUE:R,textAlign:"center"}}>{h}</div>;})}
          </div>
          {chain.rows.map(function(r){
            return(
              <div key={r.s} style={{display:"grid",gridTemplateColumns:"0.8fr 0.7fr 0.7fr 0.7fr 0.8fr 0.7fr 0.7fr 0.7fr",gap:4,padding:"8px 4px",borderBottom:"1px solid rgba(255,255,255,0.03)",background:r.atm?"rgba(245,158,11,0.08)":"transparent"}}>
                <div style={{textAlign:"center",fontSize:12,color:G2,fontWeight:600}}>{r.cd}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.iv}%</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.vg}</div>
                <div style={{textAlign:"center",background:r.atm?"rgba(245,158,11,0.15)":"transparent",borderRadius:3}}><div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>{r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}</div>
                <div style={{textAlign:"center",fontSize:12,color:R,fontWeight:600}}>{r.pd}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{(r.iv+0.5).toFixed(1)}%</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.gm}</div>
                <div style={{textAlign:"center",fontSize:12,color:R}}>{r.th}</div>
              </div>
            );
          })}
          <div style={{padding:12,background:CB,borderTop:"1px solid "+BD}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[["Delta","Price sensitivity"],["IV","Implied volatility"],["Vega","IV sensitivity"],["Gamma","Delta change rate"],["Theta","Daily time decay"]].map(function(r){return <div key={r[0]} style={{fontSize:12,color:T2}}><span style={{color:BLUE,fontWeight:700}}>{r[0]}:</span> {r[1]}</div>;})}
            </div>
          </div>
        </div>
      ):null}

      <div style={{background:"rgba(249,115,22,0.06)",borderTop:"1px solid rgba(249,115,22,0.15)",padding:"8px 12px"}}>
        <div style={{fontSize:12,color:theme.c.warn}}>Demo data only. Educational. Not SEBI registered. Not investment advice.</div>
      </div>

      {/* Order Modal */}
      {order?(
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:500,background:"rgba(0,0,0,0.7)"}} onClick={function(){setOrder(null);}}>
          <div style={{background:CB,borderRadius:"16px 16px 0 0",padding:16,border:"1px solid "+BD}} onClick={function(e){e.stopPropagation();}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:900,color:T1}}>{order.sym} {order.strike} {order.type}</div>
                <div style={{fontSize:12,color:T2}}>LTP: Rs{order.ltp} | Lot: {order.lot}</div>
              </div>
              <button onClick={function(){setOrder(null);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,color:T1,cursor:"pointer",fontSize:14}}>X</button>
            </div>
            {tradeMsg?(
              <div style={{background:tradeMsg.t=="success"?"rgba(37,99,235,0.15)":"rgba(239,68,68,0.15)",border:"1px solid "+(tradeMsg.t=="success"?BLUE:R),borderRadius:10,padding:"12px 12px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:tradeMsg.t=="success"?BLUE:R}}>{tradeMsg.m}</div>
              </div>
            ):null}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {["BUY","SELL"].map(function(s){
                var act=side==s;
                return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:act?(s=="BUY"?G:R)+"22":"rgba(255,255,255,0.05)",border:"2px solid "+(act?s=="BUY"?G:R:BD),borderRadius:10,padding:12,color:act?s=="BUY"?G2:R:T2,fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>;
              })}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:T2,marginBottom:4}}>Lots (1 lot = {order.lot} qty)</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={function(){setLots(function(l){return String(Math.max(1,parseInt(l||1)-1));});}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,width:34,height:34,color:T1,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>-</button>
                <input style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"8px",color:T1,fontSize:14,fontFamily:"inherit",outline:"none",textAlign:"center"}} type="number" value={lots} onChange={function(e){setLots(e.target.value);}}/>
                <button onClick={function(){setLots(function(l){return String(parseInt(l||0)+1);});}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,width:34,height:34,color:T1,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>+</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 12px",marginBottom:12,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:T2}}>Order Value</span>
              <span style={{fontSize:14,fontWeight:700,color:side=="BUY"?G2:R}}>Rs{(order.ltp*(parseInt(lots)||1)*order.lot).toFixed(0)}</span>
            </div>
            <button onClick={placeOrder} style={{width:"100%",background:side=="BUY"?G:R,border:"none",borderRadius:12,padding:12,color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>
              {side} {order.sym} {order.strike}{order.type}
            </button>
            <div style={{fontSize:12,color:theme.c.warn,textAlign:"center"}}>Virtual money only. Educational paper trading.</div>
          </div>
        </div>
      ):null}

    </div>
  );
}
