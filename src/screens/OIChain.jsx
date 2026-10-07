import { useState, useEffect } from "react";
import { nowT } from "../utils/helpers";
import dataService from "../services/dataService";

import { useTheme } from "../theme/ThemeProvider";
var DB="#050505",CB="#101318",BD="#20242D",G="#00C853",G2="#00E676",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB";

// lot/step are exchange contract specs (lot size, strike spacing) - static
// reference data published by NSE/BSE, not live market data, so they stay
// as a small static table. Spot/change/pct used to be fabricated here and
// are now read from dataService.getIndices() (real, Yahoo-backed) instead -
// see the "indices" state below. LIVE_SUPPORTED names which symbols have a
// real DhanHQ option-chain mapping (api/providers/dhan.js SEC map) and can
// show a live chain; everything else shows "Data Unavailable" rather than
// a fabricated chain. Keep this list in sync with
// dhan.js's OPTION_CHAIN_SUPPORTED_UNDERLYINGS.
var LIVE_SUPPORTED=["NIFTY","BANKNIFTY","SENSEX","FINNIFTY"];
var SYMS=[
  {sym:"NIFTY",     step:50, lot:50},
  {sym:"BANKNIFTY", step:100,lot:15},
  {sym:"SENSEX",    step:100,lot:10},
  {sym:"FINNIFTY",  step:50, lot:40},
  {sym:"MIDCPNIFTY",step:25, lot:75},
  {sym:"RELIANCE",  step:20, lot:250},
  {sym:"TCS",       step:20, lot:150},
  {sym:"HDFCBANK",  step:10, lot:550},
  {sym:"ICICIBANK", step:10, lot:700},
  {sym:"INFY",      step:10, lot:400},
  {sym:"WIPRO",     step:5,  lot:1500},
  {sym:"SBIN",      step:5,  lot:1500},
  {sym:"TATAMOTORS",step:5,  lot:1350},
  {sym:"AXISBANK",  step:10, lot:1200},
  {sym:"BAJFINANCE",step:50, lot:125},
];

function fV(n){if(n==null)return "--";if(n>=10000000)return(n/10000000).toFixed(1)+"Cr";if(n>=100000)return(n/100000).toFixed(1)+"L";if(n>=1000)return(n/1000).toFixed(0)+"K";return n;}

function hhmmss(iso){
  if(!iso) return "--:--:--";
  var d = new Date(iso);
  if(isNaN(d.getTime())) return "--:--:--";
  return d.toLocaleTimeString("en-IN",{hour12:false});
}

// Maps the backend's windowed option-chain strikes (real DhanHQ fields) into
// the same {s,atm,d,cL,pL,...} row shape the render JSX below already
// expects, so the rendering code itself barely has to change - only what
// FEEDS it changed, from Math.random() to real normalized fields.
function mapRows(oiData, step){
  if(!oiData || !oiData.strikes) return [];
  return oiData.strikes.map(function(row){
    var ce = row.ce || {}, pe = row.pe || {};
    var dOiCallPct = (ce.oi!=null && ce.previousOi) ? ((ce.oi-ce.previousOi)/ce.previousOi*100) : null;
    var dOiPutPct = (pe.oi!=null && pe.previousOi) ? ((pe.oi-pe.previousOi)/pe.previousOi*100) : null;
    return {
      s: row.strike,
      atm: row.strike === oiData.atmStrike,
      d: step ? Math.round((row.strike - oiData.atmStrike)/step) : 0,
      cL: ce.ltp, pL: pe.ltp,
      cV: ce.volume, pV: pe.volume,
      cO: ce.oi, pO: pe.oi,
      cDOi: (ce.oi!=null && ce.previousOi!=null) ? (ce.oi-ce.previousOi) : null,
      pDOi: (pe.oi!=null && pe.previousOi!=null) ? (pe.oi-pe.previousOi) : null,
      ccP: dOiCallPct!=null ? parseFloat(dOiCallPct.toFixed(2)) : null,
      pcP: dOiPutPct!=null ? parseFloat(dOiPutPct.toFixed(2)) : null,
      ceIv: ce.iv, peIv: pe.iv,
      cd: ce.delta, pd: pe.delta,
      gm: ce.gamma, th: ce.theta, vg: ce.vega
    };
  });
}

export default function OIChainScreen(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  G2=theme.c.up; R=theme.c.down; T1=theme.c.text1; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CB = theme.c.card, DB = theme.c.bg, G = theme.c.brand;

  var [sym,setSym]=useState("NIFTY");
  var [exp,setExp]=useState(null);
  var [expOptions,setExpOptions]=useState([]);
  var [expStatus,setExpStatus]=useState({status:"UNAVAILABLE",message:"Loading expiries..."});
  var [view,setView]=useState("LTP");
  var [oiData,setOiData]=useState(null);
  var [oiStatus,setOiStatus]=useState({status:"UNAVAILABLE",message:"Loading option chain..."});
  var [indices,setIndices]=useState({}); // real, Yahoo-backed - keyed by index symbol
  var [order,setOrder]=useState(null);
  var [side,setSide]=useState("BUY");
  var [lots,setLots]=useState("1");
  var [tradeMsg,setTradeMsg]=useState(null);

  var sd=SYMS.find(function(x){return x.sym==sym;})||SYMS[0];
  var isLive=LIVE_SUPPORTED.indexOf(sym)>=0;

  // Real index spot/change/pct (NIFTY/BANKNIFTY/SENSEX/FINNIFTY) for the
  // ticker row - fetched once and refreshed every 15s (matches this
  // endpoint's own Cache-Control: s-maxage=15 in api/market.js). Any symbol
  // not in this result (stocks, MIDCPNIFTY) shows "--" in the ticker
  // instead of a fabricated price - this screen only wires up a real data
  // source for the 4 index symbols; extending it to live stock quotes is a
  // separate task.
  useEffect(function(){
    var cancelled=false;
    function loadIndices(){
      dataService.getIndices().then(function(list){
        if(cancelled || !list) return;
        var byKey={};
        list.forEach(function(row){ byKey[row.key]=row; });
        setIndices(byKey);
      });
    }
    loadIndices();
    var t=setInterval(loadIndices,15000);
    return function(){cancelled=true;clearInterval(t);};
  },[]);

  // Expiry list - real DhanHQ expirylist, never hardcoded. Refetched only
  // when the symbol changes (expiry dates don't change within a session).
  useEffect(function(){
    var cancelled=false;
    if(!isLive){
      setExpOptions([]); setExp(null);
      setExpStatus({status:"UNAVAILABLE", message:"Live Option Intelligence is not available for "+sym+" yet. Supported: "+LIVE_SUPPORTED.join(", ")+"."});
      return;
    }
    setExpStatus({status:"UNAVAILABLE", message:"Loading expiries..."});
    dataService.getExpiryList(sym).then(function(res){
      if(cancelled) return;
      if(!res){ setExpStatus({status:"UNAVAILABLE", message:"Could not reach the Option Intelligence backend."}); return; }
      setExpStatus({status:res.status, message:res.message});
      var list=res.expiries||[];
      setExpOptions(list);
      setExp(function(prev){ return (prev && list.indexOf(prev)>=0) ? prev : (list[0]||null); });
    });
    return function(){cancelled=true;};
  },[sym,isLive]);

  // Option chain - polls every 5s. The backend (api/market.js) enforces the
  // real 3-second-per-key Dhan rate limit and serves cached/STALE data
  // itself, so this client-side interval is just "how often to ask",
  // never a guarantee of a fresh upstream hit.
  useEffect(function(){
    var cancelled=false;
    if(!isLive || !exp){
      setOiData(null);
      setOiStatus(isLive ? {status:"UNAVAILABLE", message:"Waiting for expiry..."} : {status:"UNAVAILABLE", message:"Live Option Intelligence is not available for "+sym+" yet. Supported: "+LIVE_SUPPORTED.join(", ")+"."});
      return;
    }
    function load(){
      dataService.getOptionChain(sym, exp, 5).then(function(res){
        if(cancelled) return;
        if(!res){ setOiStatus({status:"UNAVAILABLE", message:"Could not reach the Option Intelligence backend."}); setOiData(null); return; }
        setOiStatus({status:res.status, message:res.message, updated:res.updated});
        if(res.status==="UNAVAILABLE"){ setOiData(null); } else { setOiData(res); }
      });
    }
    load();
    var t=setInterval(load,5000);
    return function(){cancelled=true;clearInterval(t);};
  },[sym,exp,isLive]);

  function chSym(s){setSym(s);setView("LTP");}

  function openOrder(strike,type,ltp,lot){
    if(ltp==null) return; // no real LTP for this leg - nothing to trade on
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
      var pos={id:Date.now(),sym:order.sym+" "+order.strike+order.type,market:"options",side:side,qty:qty,entry:order.ltp,sl:null,tgt:null,time:nowT(),date:new Date().toLocaleDateString("en-IN"),type:"option"};
      var newBal=side=="BUY"?bal-cost:bal;
      var positions=(saved.positions||[]).concat([pos]);
      var tradesUsed=(saved.tradesUsed||0)+1;
      localStorage.setItem("bp_pt2",JSON.stringify(Object.assign({},saved,{balance:newBal,positions:positions,tradesUsed:tradesUsed})));
      setTradeMsg({t:"success",m:side+" "+order.sym+" "+order.strike+order.type+" x"+qty+" @ Rs"+order.ltp});
      setTimeout(function(){setTradeMsg(null);setOrder(null);},2500);
    }catch(e){setTradeMsg({t:"error",m:"Error placing order"});}
  }

  // No real chain yet (still loading, symbol unsupported, or backend
  // reports UNAVAILABLE) - show that plainly instead of an empty/fake grid.
  // "Loading..." (status UNAVAILABLE with no oiData at all, first paint)
  // is distinguished from a real backend-reported UNAVAILABLE via the
  // presence of a message already set to something other than the initial
  // loading placeholder, which is good enough for this compact banner.
  var chainRows=mapRows(oiData, sd.step);
  var statusMeta = (oiStatus.status==="LIVE") ? {label:"LIVE",colorKey:"up"}
    : (oiStatus.status==="STALE") ? {label:"STALE",colorKey:"gold"}
    : {label:"UNAVAILABLE",colorKey:"text3"};

  if(!oiData || chainRows.length===0){
    return(
      <div style={{background:DB,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:T1,fontFamily:"Inter,sans-serif",fontSize:13,padding:24,textAlign:"center",gap:10}}>
        <div style={{display:"flex",gap:4,overflowX:"auto",maxWidth:"100%"}}>
          {SYMS.map(function(s){
            var act=sym==s.sym;
            return <button key={s.sym} onClick={function(){chSym(s.sym);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>
        <div style={{fontSize:14,fontWeight:800,color:T1}}>Option Intelligence - Data Unavailable</div>
        <div style={{fontSize:12,color:T2,maxWidth:360}}>{oiStatus.message || expStatus.message || "Real-time DhanHQ option chain data could not be loaded for "+sym+"."}</div>
      </div>
    );
  }

  var pcr = oiData.pcrOi; // OI PCR (Put OI / Call OI), computed server-side over the FULL chain - see api/market.js normalizeOptionChain()
  var pcrVol = oiData.pcrVolume; // Volume PCR, kept distinct per spec - never mixed with OI PCR
  var pcrC = pcr==null ? T2 : (pcr>1.2?G2:pcr<0.8?R:BLUE);
  var mCO=Math.max.apply(null,chainRows.map(function(r){return r.cO||0;}).concat([1]));
  var mPO=Math.max.apply(null,chainRows.map(function(r){return r.pO||0;}).concat([1]));
  var tCO=chainRows.reduce(function(s,r){return s+(r.cO||0);},0);
  var tPO=chainRows.reduce(function(s,r){return s+(r.pO||0);},0);
  var idxReal = indices[sym];
  var atmSig = idxReal ? (idxReal.up?"Long Buildup":"Short Covering") : null;
  var atmC = idxReal ? (idxReal.up?G2:BLUE) : T2;

  // Max Pain - server-computed over the FULL chain (api/market.js), not
  // re-derived from this windowed view, so it stays accurate even though
  // only an ATM+/-5 slice is rendered here.
  var maxPain = oiData.maxPain;

  var oiBuildup=chainRows.filter(function(r){
    return (r.cO||0)>mCO*0.4||(r.pO||0)>mPO*0.4;
  }).sort(function(a,b){return ((b.cO||0)+(b.pO||0))-((a.cO||0)+(a.pO||0))}).slice(0,4);

  var ivSamples=[];
  chainRows.forEach(function(r){ if(r.ceIv!=null) ivSamples.push(r.ceIv); if(r.peIv!=null) ivSamples.push(r.peIv); });
  var avgIV = ivSamples.length ? (ivSamples.reduce(function(a,b){return a+b;},0)/ivSamples.length) : null;
  var ivTrend = avgIV==null ? "--" : (avgIV>20?"High":"Low");

  return(
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Ticker - real NIFTY/BANKNIFTY/SENSEX/FINNIFTY spot from
          dataService.getIndices() (Yahoo-backed, already real elsewhere in
          the app). Symbols without a real quote in that result show "--"
          rather than a fabricated price. */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,overflowX:"auto",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-flex"}}>
          {SYMS.slice(0,5).map(function(s){
            var r=indices[s.sym];
            var act=sym==s.sym;
            return(
              <button key={s.sym} onClick={function(){chSym(s.sym);}} style={{background:act?"rgba(37,99,235,0.1)":"none",border:"none",borderRight:"1px solid "+BD,padding:"12px 16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",flexShrink:0,borderBottom:act?"2px solid "+BLUE:"2px solid transparent"}}>
                <div style={{fontSize:12,fontWeight:700,color:act?BLUE:T1}}>{s.sym}</div>
                {r ? (
                  <div>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:r.up?G2:R}}>{r.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                    <div style={{fontSize:12,color:r.up?G2:R}}>{r.up?"+":""}{r.change!=null?r.change.toFixed(2):""} ({r.up?"+":""}{r.chgPct}%)</div>
                  </div>
                ) : <div style={{fontSize:12,color:T2}}>--</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data status - LIVE/STALE/UNAVAILABLE, never silently blurred, plus
          "Updated HH:MM:SS" (requirement: data freshness must be visible). */}
      <div style={{background:CB,padding:"4px 12px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid "+BD}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:theme.c[statusMeta.colorKey],flexShrink:0}}></span>
        <span style={{fontSize:12,fontWeight:800,color:theme.c[statusMeta.colorKey]}}>{statusMeta.label}</span>
        <span style={{fontSize:12,color:T2}}>Updated {hhmmss(oiStatus.updated)}</span>
        {oiStatus.status!=="LIVE" && oiStatus.message ? <span style={{fontSize:12,color:T2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>- {oiStatus.message}</span> : null}
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
          <select onChange={function(e){setExp(e.target.value);}} value={exp||""} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"4px 8px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none"}}>
            {expOptions.map(function(e){return <option key={e} value={e}>{e}</option>;})}
          </select>
        </div>
      </div>

      {/* Enhanced Stats — PCR, Max Pain, IV */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"8px 12px",display:"flex",gap:12,overflowX:"auto"}}>
        {[["OI PCR",pcr!=null?pcr.toFixed(2):"--",pcrC],["Vol PCR",pcrVol!=null?pcrVol.toFixed(2):"--",T2],["Max Pain",maxPain!=null?maxPain.toLocaleString("en-IN"):"--",BLUE],["Avg IV",avgIV!=null?avgIV.toFixed(1)+"%":"--","#60A5FA"],["IV Trend",ivTrend,avgIV>20?R:G2],["Call OI (window)",fV(tCO),R],["Put OI (window)",fV(tPO),G2],["ATM",oiData.atmStrike,BLUE]].map(function(r){
          return <div key={r[0]} style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:12,color:T2}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
        })}
      </div>

      {/* OI Buildup Section */}
      <div style={{background:"rgba(59,130,246,0.06)",borderBottom:"1px solid "+BD,padding:"8px 12px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#60A5FA",letterSpacing:0.5,marginBottom:8}}>&#128269; OI BUILDUP (Key Levels)</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {oiBuildup.map(function(r){
            var isCall=(r.cO||0)>(r.pO||0);
            return (
              <div key={r.s} style={{background:isCall?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)",border:"1px solid "+(isCall?R:G2)+"44",borderRadius:8,padding:"4px 12px"}}>
                <div style={{fontSize:12,fontWeight:700,color:isCall?R:G2}}>{r.s}</div>
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
        <div style={{fontSize:12,color:T1,lineHeight:1.6}}>
          {pcr!=null ? ("OI PCR "+pcr.toFixed(2)+" - "+(pcr>1?"Bullish (Puts dominating, supports likely held)":"Bearish (Calls dominating, resistance likely)")+". ") : null}
          {maxPain!=null ? ("Max Pain at "+maxPain.toLocaleString("en-IN")+" - market likely to gravitate here near expiry. ") : null}
          {avgIV!=null ? ("Avg IV "+avgIV.toFixed(1)+"% ("+ivTrend+" volatility, this expiry's visible window). ") : null}
          <span style={{color:G2,fontWeight:600}}>Key support: {oiBuildup[1]?oiBuildup[1].s:"--"}</span>, <span style={{color:R,fontWeight:600}}>Key resistance: {oiBuildup[0]?oiBuildup[0].s:"--"}</span>.
        </div>
      </div>

      {/* LTP View */}
      {view=="LTP"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:4,padding:"4px 4px",background:"rgba(255,255,255,0.04)"}}>
            {["Vol","CALL","dOI%","STRIKE","dOI%","PUT","Vol"].map(function(h,i){
              return <div key={i} style={{fontSize:12,fontWeight:700,color:i==3?BLUE:i<3?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          {chainRows.map(function(r){
            var cP=((r.cO||0)/mCO)*100,pP=((r.pO||0)/mPO)*100;
            return(
              <div key={r.s}>
                {r.atm?(
                  <div style={{background:"rgba(0,200,83,0.08)",borderTop:"1px solid rgba(0,200,83,0.2)",borderBottom:"1px solid rgba(0,200,83,0.2)",padding:"4px 12px",display:"flex",justifyContent:"space-between"}}>
                    {atmSig ? <span style={{fontSize:12,fontWeight:700,color:atmC}}>{atmSig}</span> : <span></span>}
                    <span style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:T1}}>{oiData.underlyingLtp!=null?oiData.underlyingLtp.toLocaleString("en-IN",{minimumFractionDigits:2}):"--"}</span>
                  </div>
                ):null}
                <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:4,padding:"8px 4px",background:r.d<0?"rgba(0,200,83,0.03)":r.d>0?"rgba(239,68,68,0.03)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:cP+"%",background:"rgba(0,200,83,0.15)"}}></div><div style={{fontSize:12,color:G2,textAlign:"center",position:"relative"}}>{fV(r.cV)}</div></div>
                  <div style={{textAlign:"center",cursor:r.cL!=null?"pointer":"default",background:"rgba(0,200,83,0.06)",borderRadius:4,opacity:r.cL!=null?1:0.4}} onClick={function(){openOrder(r.s,"CE",r.cL,sd.lot);}}><div style={{fontSize:12,fontWeight:700,color:G2}}>{r.cL!=null?r.cL:"--"}</div>{r.cL!=null?<div style={{fontSize:12,color:G2}}>TAP</div>:null}</div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:12,color:r.ccP==null?T2:r.ccP>=0?G2:R}}>{r.ccP==null?"--":(r.ccP>=0?"+":"")+r.ccP+"%"}</div></div>
                  <div style={{textAlign:"center",background:r.atm?"rgba(37,99,235,0.15)":"transparent",borderRadius:3}}>
                    <div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>
                    {r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}
                  </div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:12,color:r.pcP==null?T2:r.pcP>=0?G2:R}}>{r.pcP==null?"--":(r.pcP>=0?"+":"")+r.pcP+"%"}</div></div>
                  <div style={{textAlign:"center",cursor:r.pL!=null?"pointer":"default",background:"rgba(239,68,68,0.06)",borderRadius:4,opacity:r.pL!=null?1:0.4}} onClick={function(){openOrder(r.s,"PE",r.pL,sd.lot);}}><div style={{fontSize:12,fontWeight:700,color:R}}>{r.pL!=null?r.pL:"--"}</div>{r.pL!=null?<div style={{fontSize:12,color:R}}>TAP</div>:null}</div>
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
          {chainRows.map(function(r){
            var cP=((r.cO||0)/mCO)*100,pP=((r.pO||0)/mPO)*100;
            return(
              <div key={r.s} style={{display:"grid",gridTemplateColumns:"1fr 0.8fr 0.8fr 0.8fr 1fr",gap:4,padding:"8px 4px",borderBottom:"1px solid rgba(255,255,255,0.03)",background:r.atm?"rgba(37,99,235,0.08)":"transparent"}}>
                <div style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:cP+"%",background:"rgba(0,200,83,0.2)"}}></div><div style={{fontSize:12,fontWeight:600,color:G2,textAlign:"center",position:"relative"}}>{fV(r.cO)}</div></div>
                <div style={{textAlign:"center",fontSize:12,color:r.cDOi==null?T2:r.cDOi>=0?G2:R}}>{r.cDOi==null?"--":(r.cDOi>=0?"+":"")+fV(Math.abs(r.cDOi))}</div>
                <div style={{textAlign:"center",background:r.atm?"rgba(37,99,235,0.15)":"transparent",borderRadius:3}}><div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>{r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}</div>
                <div style={{textAlign:"center",fontSize:12,color:r.pDOi==null?T2:r.pDOi>=0?G2:R}}>{r.pDOi==null?"--":(r.pDOi>=0?"+":"")+fV(Math.abs(r.pDOi))}</div>
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
          {chainRows.map(function(r){
            return(
              <div key={r.s} style={{display:"grid",gridTemplateColumns:"0.8fr 0.7fr 0.7fr 0.7fr 0.8fr 0.7fr 0.7fr 0.7fr",gap:4,padding:"8px 4px",borderBottom:"1px solid rgba(255,255,255,0.03)",background:r.atm?"rgba(37,99,235,0.08)":"transparent"}}>
                <div style={{textAlign:"center",fontSize:12,color:G2,fontWeight:600}}>{r.cd!=null?r.cd:"--"}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.ceIv!=null?r.ceIv+"%":"--"}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.vg!=null?r.vg:"--"}</div>
                <div style={{textAlign:"center",background:r.atm?"rgba(37,99,235,0.15)":"transparent",borderRadius:3}}><div style={{fontSize:12,fontWeight:900,color:r.atm?BLUE:T1}}>{r.s}</div>{r.atm?<div style={{fontSize:12,color:BLUE}}>ATM</div>:null}</div>
                <div style={{textAlign:"center",fontSize:12,color:R,fontWeight:600}}>{r.pd!=null?r.pd:"--"}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.peIv!=null?r.peIv+"%":"--"}</div>
                <div style={{textAlign:"center",fontSize:12,color:BLUE}}>{r.gm!=null?r.gm:"--"}</div>
                <div style={{textAlign:"center",fontSize:12,color:R}}>{r.th!=null?r.th:"--"}</div>
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
        <div style={{fontSize:12,color:theme.c.warn}}>Live option chain data via DhanHQ ({statusMeta.label}). Educational tool, not SEBI registered, not investment advice. The Buy/Sell panel below trades virtual paper-trading money only - no real orders are ever placed.</div>
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
