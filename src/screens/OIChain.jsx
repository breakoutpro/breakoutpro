import { useState, useEffect } from "react";

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

function getExpiries(sym) {
  return EXPIRIES[sym] || ["26 Jun","31 Jul","28 Aug"];
}

function genChain(spot, step, count) {
  var atm = Math.round(spot/step)*step;
  var rows = [];
  for(var i=-(count);i<=(count);i++) {
    var strike = atm + i*step;
    var isATM = i==0;
    var dist = Math.abs(i);
    var intrinsicC = Math.max(0, spot-strike);
    var intrinsicP = Math.max(0, strike-spot);
    var timeVal = Math.max(5, spot*0.008/(dist*0.8+1));
    var callLTP = parseFloat((intrinsicC + timeVal + (Math.random()-0.3)*timeVal*0.2).toFixed(2));
    var putLTP  = parseFloat((intrinsicP + timeVal + (Math.random()-0.3)*timeVal*0.2).toFixed(2));
    var baseVol = Math.floor(spot*15);
    var callVol = Math.floor((baseVol/(dist*1.4+1)) * (0.8+Math.random()*0.4));
    var putVol  = Math.floor((baseVol/(dist*1.4+1)) * (0.8+Math.random()*0.4));
    var callOI  = Math.floor(callVol * (2+Math.random()*3));
    var putOI   = Math.floor(putVol  * (2+Math.random()*3));
    var prevCallLTP = callLTP * (0.4 + Math.random()*0.5);
    var prevPutLTP  = putLTP  * (1.5 + Math.random()*1.0);
    var callChgPct = parseFloat(((callLTP-prevCallLTP)/prevCallLTP*100).toFixed(2));
    var putChgPct  = parseFloat(((putLTP-prevPutLTP)/prevPutLTP*100).toFixed(2));
    var iv = parseFloat((14 + dist*1.2 + Math.random()*3).toFixed(1));
    var callDelta  = parseFloat(Math.max(0.01, Math.min(0.99, 0.5 - i*0.07)).toFixed(2));
    var putDelta   = parseFloat((callDelta - 1).toFixed(2));
    var gamma  = parseFloat((0.003/(dist*0.5+1)+Math.random()*0.001).toFixed(4));
    var theta  = parseFloat((-callLTP*0.008 - Math.random()*2).toFixed(2));
    var vega   = parseFloat((callLTP*0.12 + Math.random()*2).toFixed(2));
    rows.push({
      strike:strike, isATM:isATM, dist:i,
      callLTP:callLTP, putLTP:putLTP,
      callVol:callVol, putVol:putVol,
      callOI:callOI, putOI:putOI,
      callChgPct:callChgPct, putChgPct:putChgPct,
      iv:iv, callDelta:callDelta, putDelta:putDelta,
      gamma:gamma, theta:theta, vega:vega,
    });
  }
  return {rows:rows, atm:atm};
}

function fmtVol(n) {
  if(n>=10000000) return (n/10000000).toFixed(2)+"Cr";
  if(n>=100000)   return (n/100000).toFixed(2)+"L";
  if(n>=1000)     return (n/1000).toFixed(1)+"K";
  return n;
}

function fmtOI(n) {
  if(n>=10000000) return (n/10000000).toFixed(2)+"Cr";
  if(n>=100000)   return (n/100000).toFixed(1)+"L";
  if(n>=1000)     return (n/1000).toFixed(0)+"K";
  return n;
}

export default function OptionChain() {
  var [selSym, setSelSym] = useState("NIFTY");
  var [expiry, setExpiry] = useState(getExpiries("NIFTY")[0]);
  var [viewTab, setViewTab] = useState("LTP");
  var [chain, setChain] = useState(null);
  var [symData, setSymData] = useState(SYMBOLS[0]);

  function buildChain(sym) {
    var sd = SYMBOLS.find(function(s){return s.sym==sym;})||SYMBOLS[0];
    setSymData(sd);
    setChain(genChain(sd.spot, sd.step, 8));
  }

  useEffect(function(){buildChain("NIFTY");},[]);

  function changeSym(sym) {
    setSelSym(sym);
    setExpiry(getExpiries(sym)[0]);
    buildChain(sym);
  }

  // Refresh prices
  useEffect(function(){
    var t = setInterval(function(){
      setChain(function(prev){
        if(!prev) return prev;
        return genChain(symData.spot*(1+(Math.random()-0.49)*0.001), symData.step, 8);
      });
    }, 5000);
    return function(){clearInterval(t);};
  },[symData]);

  if(!chain) return <div style={{background:DB,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:T1,fontFamily:"Inter,sans-serif"}}>Loading...</div>;

  var totalCallOI = chain.rows.reduce(function(s,r){return s+r.callOI;},0);
  var totalPutOI  = chain.rows.reduce(function(s,r){return s+r.putOI;},0);
  var pcr = (totalPutOI/totalCallOI).toFixed(2);
  var pcrColor = parseFloat(pcr)>1.2?G2:parseFloat(pcr)<0.8?R:GOLD;
  var pcrLabel = parseFloat(pcr)>1.2?"Bullish":parseFloat(pcr)<0.8?"Bearish":"Neutral";
  var maxCallOI = Math.max.apply(null, chain.rows.map(function(r){return r.callOI;}));
  var maxPutOI  = Math.max.apply(null, chain.rows.map(function(r){return r.putOI;}));
  var atmRow = chain.rows.find(function(r){return r.isATM;});
  var atmSignal = symData.change>=0?"Long Buildup":"Short Covering";
  var atmSignalColor = symData.change>=0?G2:GOLD;
  var expiries = getExpiries(selSym);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Top index ticker */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,overflowX:"auto",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-flex",gap:0}}>
          {SYMBOLS.slice(0,5).map(function(s){
            var up=s.change>=0;
            var act=selSym==s.sym;
            return (
              <button key={s.sym} onClick={function(){changeSym(s.sym);}} style={{background:act?"rgba(0,200,83,0.1)":"none",borderRight:"1px solid "+BD,border:"none",borderRight:"1px solid "+BD,padding:"10px 16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",flexShrink:0,borderBottom:act?"2px solid "+G:"2px solid transparent"}}>
                <div style={{fontSize:10,fontWeight:700,color:act?G2:T1}}>{s.sym}</div>
                <div style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:up?G2:R}}>{s.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                <div style={{fontSize:8,color:up?G2:R}}>{up?"+":""}{s.change} ({up?"+":""}{s.changePct}%)</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{background:CB,padding:"10px 12px",borderBottom:"1px solid "+BD}}>
        {/* Symbol row */}
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
          {SYMBOLS.map(function(s){
            var act=selSym==s.sym;
            return <button key={s.sym} onClick={function(){changeSym(s.sym);}} style={{background:act?G:"rgba(255,255,255,0.05)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"4px 10px",color:act?"#fff":T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>

        {/* View + Expiry row */}
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
      <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"8px 12px",display:"flex",gap:12,alignItems:"center"}}>
        <div style={{display:"flex",gap:10,flex:1}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,color:T2}}>PCR</div>
            <div style={{fontSize:12,fontWeight:900,color:pcrColor}}>{pcr}</div>
            <div style={{fontSize:7,color:pcrColor}}>{pcrLabel}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,color:T2}}>Total Call OI</div>
            <div style={{fontSize:10,fontWeight:700,color:R}}>{fmtOI(totalCallOI)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,color:T2}}>Total Put OI</div>
            <div style={{fontSize:10,fontWeight:700,color:G2}}>{fmtOI(totalPutOI)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,color:T2}}>ATM Strike</div>
            <div style={{fontSize:10,fontWeight:700,color:GOLD}}>{chain.atm}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,color:T2}}>Lot Size</div>
            <div style={{fontSize:10,fontWeight:700,color:BLUE}}>{symData.lot}</div>
          </div>
        </div>
      </div>

      {/* LTP View */}
      {viewTab=="LTP"?(
        <div>
          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.9fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:1,padding:"6px 6px",background:"rgba(255,255,255,0.04)"}}>
            {["Volume","Call LTP","Chg%","Strike Price","Chg%","Put LTP","Volume"].map(function(h,i){
              var isStrike=i==3;
              var isCall=i<3;
              return <div key={i} style={{fontSize:7,fontWeight:700,color:isStrike?GOLD:isCall?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,padding:"2px 6px",background:"rgba(255,255,255,0.02)"}}>
            <div style={{fontSize:8,fontWeight:700,color:G2,textAlign:"center"}}>CALLS</div>
            <div style={{fontSize:8,fontWeight:700,color:R,textAlign:"center"}}>PUTS</div>
          </div>

          {chain.rows.map(function(row){
            var callPct=(row.callOI/maxCallOI)*100;
            var putPct=(row.putOI/maxPutOI)*100;
            var isATM=row.isATM;
            var itmCall=row.dist<0;
            var itmPut=row.dist>0;
            return (
              <div key={row.strike}>
                {isATM?(
                  <div style={{background:"rgba(0,200,83,0.08)",borderTop:"1px solid rgba(0,200,83,0.2)",borderBottom:"1px solid rgba(0,200,83,0.2)",padding:"4px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:9,fontWeight:700,color:atmSignalColor}}>{atmSignal}</span>
                      <span style={{fontSize:7,color:T2}}>|</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontFamily:"monospace",fontSize:11,fontWeight:900,color:symData.change>=0?G2:R}}>{symData.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
                      <span style={{fontSize:8,color:symData.change>=0?G2:R}}>{symData.change>=0?"":""} {Math.abs(symData.changePct)}%</span>
                    </div>
                  </div>
                ):null}
                <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.9fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:1,padding:"7px 6px",background:itmCall?"rgba(0,200,83,0.04)":itmPut?"rgba(239,68,68,0.04)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  {/* Call Volume */}
                  <div style={{position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",right:0,top:0,height:"100%",width:callPct+"%",background:"rgba(0,200,83,0.15)"}}></div>
                    <div style={{fontSize:9,fontWeight:600,color:G2,textAlign:"center",position:"relative"}}>{fmtVol(row.callVol)}</div>
                  </div>
                  {/* Call LTP */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:G2}}>Rs{row.callLTP}</div>
                  </div>
                  {/* Call Chg% */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:8,fontWeight:600,color:row.callChgPct>=0?G2:R}}>{row.callChgPct>=0?"+":""}{row.callChgPct}%</div>
                  </div>
                  {/* Strike */}
                  <div style={{textAlign:"center",background:isATM?"rgba(245,158,11,0.15)":"transparent",borderRadius:4,padding:"2px"}}>
                    <div style={{fontSize:11,fontWeight:900,color:isATM?GOLD:T1}}>{row.strike}</div>
                    {isATM?<div style={{fontSize:6,color:GOLD,fontWeight:700}}>ATM</div>:null}
                  </div>
                  {/* Put Chg% */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:8,fontWeight:600,color:row.putChgPct>=0?G2:R}}>{row.putChgPct>=0?"+":""}{row.putChgPct}%</div>
                  </div>
                  {/* Put LTP */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:R}}>Rs{row.putLTP}</div>
                  </div>
                  {/* Put Volume */}
                  <div style={{position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,height:"100%",width:putPct+"%",background:"rgba(239,68,68,0.15)"}}></div>
                    <div style={{fontSize:9,fontWeight:600,color:R,textAlign:"center",position:"relative"}}>{fmtVol(row.putVol)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* OI View */}
      {viewTab=="OI"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.8fr 1fr 1fr",gap:1,padding:"6px",background:"rgba(255,255,255,0.04)"}}>
            {["Call OI","Call Chg OI","STRIKE","Put Chg OI","Put OI"].map(function(h,i){
              var isStrike=i==2;
              return <div key={i} style={{fontSize:7,fontWeight:700,color:isStrike?GOLD:i<2?G2:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          {chain.rows.map(function(row){
            var callPct=(row.callOI/maxCallOI)*100;
            var putPct=(row.putOI/maxPutOI)*100;
            var callChgOI=Math.floor(row.callOI*(Math.random()-0.4)*0.3);
            var putChgOI=Math.floor(row.putOI*(Math.random()-0.4)*0.3);
            return (
              <div key={row.strike} style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.8fr 1fr 1fr",gap:1,padding:"7px 6px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:row.isATM?"rgba(245,158,11,0.08)":"transparent"}}>
                <div style={{position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",right:0,top:0,height:"100%",width:callPct+"%",background:"rgba(0,200,83,0.2)"}}></div>
                  <div style={{fontSize:9,fontWeight:600,color:G2,textAlign:"center",position:"relative"}}>{fmtOI(row.callOI)}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:callChgOI>=0?G2:R}}>{callChgOI>=0?"+":""}{fmtOI(Math.abs(callChgOI))}</div>
                </div>
                <div style={{textAlign:"center",background:row.isATM?"rgba(245,158,11,0.15)":"transparent",borderRadius:4,padding:"1px"}}>
                  <div style={{fontSize:11,fontWeight:900,color:row.isATM?GOLD:T1}}>{row.strike}</div>
                  {row.isATM?<div style={{fontSize:6,color:GOLD}}>ATM</div>:null}
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:putChgOI>=0?G2:R}}>{putChgOI>=0?"+":""}{fmtOI(Math.abs(putChgOI))}</div>
                </div>
                <div style={{position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:putPct+"%",background:"rgba(239,68,68,0.2)"}}></div>
                  <div style={{fontSize:9,fontWeight:600,color:R,textAlign:"center",position:"relative"}}>{fmtOI(row.putOI)}</div>
                </div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* Greeks View */}
      {viewTab=="Greeks"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.8fr 0.8fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr",gap:1,padding:"6px",background:"rgba(255,255,255,0.04)"}}>
            {["C.Delta","C.IV%","C.Vega","STRIKE","P.Delta","P.IV%","Gamma","Theta"].map(function(h,i){
              var isStrike=i==3;
              return <div key={i} style={{fontSize:7,fontWeight:700,color:isStrike?GOLD:i<3?G2:i==6?GOLD:i==7?R:R,textAlign:"center"}}>{h}</div>;
            })}
          </div>
          {chain.rows.map(function(row){
            return (
              <div key={row.strike} style={{display:"grid",gridTemplateColumns:"0.8fr 0.8fr 0.8fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr",gap:1,padding:"6px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:row.isATM?"rgba(245,158,11,0.08)":"transparent"}}>
                <div style={{textAlign:"center",fontSize:9,color:G2,fontWeight:600}}>{row.callDelta}</div>
                <div style={{textAlign:"center",fontSize:9,color:BLUE}}>{row.iv}%</div>
                <div style={{textAlign:"center",fontSize:9,color:GOLD}}>{row.vega}</div>
                <div style={{textAlign:"center",background:row.isATM?"rgba(245,158,11,0.15)":"transparent",borderRadius:4,padding:"1px"}}>
                  <div style={{fontSize:11,fontWeight:900,color:row.isATM?GOLD:T1}}>{row.strike}</div>
                  {row.isATM?<div style={{fontSize:6,color:GOLD}}>ATM</div>:null}
                </div>
                <div style={{textAlign:"center",fontSize:9,color:R,fontWeight:600}}>{row.putDelta}</div>
                <div style={{textAlign:"center",fontSize:9,color:BLUE}}>{row.iv+0.5}%</div>
                <div style={{textAlign:"center",fontSize:9,color:GOLD}}>{row.gamma}</div>
                <div style={{textAlign:"center",fontSize:9,color:R}}>{row.theta}</div>
              </div>
            );
          })}
          <div style={{padding:12,background:CB,borderTop:"1px solid "+BD}}>
            <div style={{fontSize:9,fontWeight:700,color:GOLD,marginBottom:6}}>Greeks Guide</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["Delta","Price change per Re1 move"],["IV","Expected volatility %"],["Vega","Sensitivity to IV change"],["Gamma","Rate of delta change"],["Theta","Daily time decay"]].map(function(r){
 
