import { useState, useEffect } from "react";
import { LTPRows, OIRows, GreeksRows } from "./OIChainRows";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var SYMBOLS = [
  {sym:"NIFTY",     spot:23969.20, step:50,  lot:50,  change:346.30, changePct:1.47},
  {sym:"BANKNIFTY", spot:52134.80, step:100, lot:15,  change:867.40, changePct:1.69},
  {sym:"SENSEX",    spot:76692.70, step:100, lot:10,  change:1164.75,changePct:1.54},
  {sym:"FINNIFTY",  spot:24123.45, step:50,  lot:40,  change:234.50, changePct:0.98},
  {sym:"MIDCPNIFTY",spot:17265.90, step:25,  lot:75,  change:127.30, changePct:0.74},
  {sym:"RELIANCE",  spot:2845.60,  step:20,  lot:250, change:47.60,  changePct:1.71},
  {sym:"TCS",       spot:3654.20,  step:20,  lot:150, change:-35.80, changePct:-0.97},
  {sym:"HDFCBANK",  spot:1742.50,  step:10,  lot:550, change:32.50,  changePct:1.90},
  {sym:"ICICIBANK", spot:1289.30,  step:10,  lot:700, change:29.40,  changePct:2.33},
  {sym:"INFY",      spot:1567.80,  step:10,  lot:400, change:-22.10, changePct:-1.39},
  {sym:"WIPRO",     spot:478.90,   step:5,   lot:1500,change:13.90,  changePct:2.99},
  {sym:"SBIN",      spot:812.30,   step:5,   lot:1500,change:17.40,  changePct:2.18},
  {sym:"TATAMOTORS",spot:945.60,   step:5,   lot:1350,change:20.70,  changePct:2.23},
  {sym:"AXISBANK",  spot:1156.70,  step:10,  lot:1200,change:16.80,  changePct:1.47},
  {sym:"BAJFINANCE",spot:7234.50,  step:50,  lot:125, change:134.50, changePct:1.89},
];

var EXPIRIES = {
  NIFTY:    ["19 Jun","26 Jun","31 Jul","28 Aug"],
  BANKNIFTY:["18 Jun","25 Jun","31 Jul","28 Aug"],
  SENSEX:   ["20 Jun","27 Jun","01 Aug","29 Aug"],
  FINNIFTY: ["17 Jun","24 Jun","29 Jul","26 Aug"],
  MIDCPNIFTY:["16 Jun","23 Jun","28 Jul","25 Aug"],
};

function getExpiries(sym) { return EXPIRIES[sym]||["26 Jun","31 Jul","28 Aug"]; }

function fmtOI(n) {
  if(n>=10000000) return (n/10000000).toFixed(2)+"Cr";
  if(n>=100000)   return (n/100000).toFixed(1)+"L";
  if(n>=1000)     return (n/1000).toFixed(0)+"K";
  return n;
}

function genChain(spot, step) {
  var atm=Math.round(spot/step)*step;
  var rows=[];
  for(var i=-8;i<=8;i++){
    var strike=atm+i*step;
    var dist=Math.abs(i);
    var intrC=Math.max(0,spot-strike);
    var intrP=Math.max(0,strike-spot);
    var tVal=Math.max(5,spot*0.008/(dist*0.8+1));
    var cLTP=parseFloat((intrC+tVal+(Math.random()-0.3)*tVal*0.2).toFixed(2));
    var pLTP=parseFloat((intrP+tVal+(Math.random()-0.3)*tVal*0.2).toFixed(2));
    var bVol=Math.floor(spot*15);
    var cVol=Math.floor((bVol/(dist*1.4+1))*(0.8+Math.random()*0.4));
    var pVol=Math.floor((bVol/(dist*1.4+1))*(0.8+Math.random()*0.4));
    var cOI=Math.floor(cVol*(2+Math.random()*3));
    var pOI=Math.floor(pVol*(2+Math.random()*3));
    var pCLTP=cLTP*(0.4+Math.random()*0.5);
    var pPLTP=pLTP*(1.5+Math.random()*1.0);
    var iv=parseFloat((14+dist*1.2+Math.random()*3).toFixed(1));
    var cDelta=parseFloat(Math.max(0.01,Math.min(0.99,0.5-i*0.07)).toFixed(2));
    rows.push({
      strike:strike, isATM:i==0, dist:i,
      callLTP:cLTP, putLTP:pLTP,
      callVol:cVol, putVol:pVol,
      callOI:cOI, putOI:pOI,
      callChgPct:parseFloat(((cLTP-pCLTP)/pCLTP*100).toFixed(2)),
      putChgPct:parseFloat(((pLTP-pPLTP)/pPLTP*100).toFixed(2)),
      iv:iv, callDelta:cDelta, putDelta:parseFloat((cDelta-1).toFixed(2)),
      gamma:parseFloat((0.003/(dist*0.5+1)+Math.random()*0.001).toFixed(4)),
      theta:parseFloat((-cLTP*0.008-Math.random()*2).toFixed(2)),
      vega:parseFloat((cLTP*0.12+Math.random()*2).toFixed(2)),
    });
  }
  return {rows:rows, atm:atm};
}

export default function OptionChain() {
  var [selSym,setSelSym] = useState("NIFTY");
  var [expiry,setExpiry] = useState("19 Jun");
  var [viewTab,setViewTab] = useState("LTP");
  var [chain,setChain] = useState(null);
  var [symData,setSymData] = useState(SYMBOLS[0]);

  function buildChain(sym) {
    var sd=SYMBOLS.find(function(s){return s.sym==sym;})||SYMBOLS[0];
    setSymData(sd);
    setChain(genChain(sd.spot,sd.step));
  }

  useEffect(function(){buildChain("NIFTY");},[]);

  useEffect(function(){
    var t=setInterval(function(){
      setChain(function(prev){
        if(!prev) return prev;
        return genChain(symData.spot*(1+(Math.random()-0.49)*0.001),symData.step);
      });
    },5000);
    return function(){clearInterval(t);};
  },[symData]);

  function changeSym(sym){setSelSym(sym);setExpiry(getExpiries(sym)[0]);buildChain(sym);}

  if(!chain) return <div style={{background:DB,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:T1}}>Loading...</div>;

  var totalCOI=chain.rows.reduce(function(s,r){return s+r.callOI;},0);
  var totalPOI=chain.rows.reduce(function(s,r){return s+r.putOI;},0);
  var pcr=(totalPOI/totalCOI).toFixed(2);
  var pcrC=parseFloat(pcr)>1.2?G2:parseFloat(pcr)<0.8?R:GOLD;
  var pcrL=parseFloat(pcr)>1.2?"Bullish":parseFloat(pcr)<0.8?"Bearish":"Neutral";
  var expiries=getExpiries(selSym);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Top ticker */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,overflowX:"auto",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-flex"}}>
          {SYMBOLS.slice(0,5).map(function(s){
            var up=s.change>=0; var act=selSym==s.sym;
            return (
              <button key={s.sym} onClick={function(){changeSym(s.sym);}} style={{background:act?"rgba(0,200,83,0.1)":"none",borderRight:"1px solid "+BD,border:"none",borderRight:"1px solid "+BD,padding:"10px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",flexShrink:0,borderBottom:act?"2px solid "+G:"2px solid transparent"}}>
                <div style={{fontSize:9,fontWeight:700,color:act?G2:T1}}>{s.sym}</div>
                <div style={{fontFamily:"monospace",fontSize:11,fontWeight:900,color:up?G2:R}}>{s.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                <div style={{fontSize:7,color:up?G2:R}}>{up?"+":""}{s.change} ({up?"+":""}{s.changePct}%)</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{background:CB,padding:"8px 12px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
          {SYMBOLS.map(function(s){
            var act=selSym==s.sym;
            return <button key={s.sym} onClick={function(){changeSym(s.sym);}} style={{background:act?G:"rgba(255,255,255,0.05)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"3px 8px",color:act?"#fff":T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["LTP","OI","Greeks"].map(function(v){
            var act=viewTab==v;
            return <button key={v} onClick={function(){setViewTab(v);}} style={{background:act?"rgba(30,144,255,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"5px 12px",color:act?BLUE:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{v}</button>;
          })}
          <div style={{flex:1}}></div>
          <select onChange={function(e){setExpiry(e.target.value);}} value={expiry} style={{background:CB,border:"1px solid "+BD,borderRadius:8,padding:"5px 8px",color:T1,fontSize:9,fontFamily:"inherit",outline:"none"}}>
            {expiries.map(function(e){return <option key={e} value={e}>{e} W</option>;})}
          </select>
        </div>
      </div>

      {/* PCR Stats */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"7px 12px",display:"flex",gap:14,alignItems:"center"}}>
        {[["PCR",pcr,pcrC,pcrL],["Call OI",fmtOI(totalCOI),R,null],["Put OI",fmtOI(totalPOI),G2,null],["ATM",chain.atm,GOLD,null],["Lot",symData.lot,BLUE,null]].map(function(r){
          return (
            <div key={r[0]} style={{textAlign:"center"}}>
              <div style={{fontSize:7,color:T2}}>{r[0]}</div>
              <div style={{fontSize:11,fontWeight:700,color:r[2]}}>{r[1]}</div>
              {r[3]?<div style={{fontSize:7,color:r[2]}}>{r[3]}</div>:null}
            </div>
          );
        })}
      </div>

      {/* LTP View Headers */}
      {viewTab=="LTP"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.9fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:1,padding:"6px",background:"rgba(255,255,255,0.04)"}}>
            {["Volume","Call LTP","Chg%","Strike","Chg%","Put LTP","Volume"].map(function(h,i){
              return <div key={i} style={{fontSize:7,fontWeight:700,color:i==3?GOLD:i<3?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,padding:"2px 6px",background:"rgba(255,255,255,0.02)"}}>
            <div style={{fontSize:8,fontWeight:700,color:G2,textAlign:"center"}}>CALLS</div>
            <div style={{fontSize:8,fontWeight:700,color:R,textAlign:"center"}}>PUTS</div>
          </div>
          <LTPRows chain={chain} symData={symData}/>
        </div>
      ):null}

      {/* OI View */}
      {viewTab=="OI"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.8fr 1fr 1fr",gap:1,padding:"6px",background:"rgba(255,255,255,0.04)"}}>
            {["Call OI","Call Chg","STRIKE","Put Chg","Put OI"].map(function(h,i){
              return <div key={i} style={{fontSize:7,fontWeight:700,color:i==2?GOLD:i<2?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          <OIRows chain={chain}/>
        </div>
      ):null}

      {/* Greeks View */}
      {viewTab=="Greeks"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.8fr 0.8fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr",gap:1,padding:"6px",background:"rgba(255,255,255,0.04)"}}>
            {["C.Delta","C.IV","C.Vega","STRIKE","P.Delta","P.IV","Gamma","Theta"].map(function(h,i){
              return <div key={i} style={{fontSize:7,fontWeight:700,color:i==3?GOLD:i<3?G2:i==6?GOLD:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          <GreeksRows chain={chain}/>
          <div style={{padding:10,background:CB,borderTop:"1px solid "+BD}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[["Delta","Re1 move sensitivity"],["IV","Expected volatility"],["Vega","IV change sensitivity"],["Gamma","Delta change rate"],["Theta","Daily time decay"]].map(function(r){
                return <div key={r[0]} style={{fontSize:8,color:T2}}><span style={{color:GOLD,fontWeight:700}}>{r[0]}:</span> {r[1]}</div>;
              })}
            </div>
          </div>
        </div>
      ):null}

      <div style={{background:"rgba(249,115,22,0.06)",borderTop:"1px solid rgba(249,115,22,0.15)",padding:"8px 12px"}}>
        <div style={{fontSize:8,color:"#F97316"}}>Demo data  Educational only. Not SEBI registered. Not investment advice.</div>
      </div>
    </div>
  );
    }
