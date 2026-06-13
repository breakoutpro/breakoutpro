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

function genOIChain(spotPrice, expiry) {
  var strikes = [];
  var step = spotPrice > 50000 ? 100 : 50;
  var atm = Math.round(spotPrice / step) * step;
  var range = expiry == "weekly" ? 10 : 15;
  for (var i = -range; i <= range; i++) {
    var strike = atm + i * step;
    var distFromATM = Math.abs(i);
    var isATM = i == 0;
    var callOI = isATM
      ? Math.floor(80000 + Math.random() * 40000)
      : Math.floor(Math.max(5000, 100000 / (distFromATM * 1.5 + 1) + Math.random() * 20000));
    var putOI = isATM
      ? Math.floor(75000 + Math.random() * 40000)
      : Math.floor(Math.max(5000, 95000 / (distFromATM * 1.5 + 1) + Math.random() * 20000));
    var callChgOI = Math.floor((Math.random() - 0.45) * callOI * 0.3);
    var putChgOI = Math.floor((Math.random() - 0.45) * putOI * 0.3);
    var callLTP = isATM
      ? parseFloat((spotPrice * 0.02 + Math.random() * 20).toFixed(1))
      : parseFloat((Math.max(0.5, spotPrice * 0.02 / (distFromATM + 1) + Math.random() * 10)).toFixed(1));
    var putLTP = isATM
      ? parseFloat((spotPrice * 0.02 + Math.random() * 20).toFixed(1))
      : parseFloat((Math.max(0.5, spotPrice * 0.02 / (distFromATM + 1) + Math.random() * 10)).toFixed(1));
    strikes.push({
      strike: strike,
      isATM: isATM,
      callOI: callOI,
      putOI: putOI,
      callChgOI: callChgOI,
      putChgOI: putChgOI,
      callLTP: callLTP,
      putLTP: putLTP,
      callIV: parseFloat((20 + distFromATM * 1.2 + Math.random() * 3).toFixed(1)),
      putIV: parseFloat((21 + distFromATM * 1.2 + Math.random() * 3).toFixed(1)),
    });
  }
  return strikes;
}

function calcPCR(chain) {
  if(!chain || chain.length == 0) return 1;
  var totalPutOI = 0, totalCallOI = 0;
  chain.forEach(function(s) { totalPutOI += s.putOI; totalCallOI += s.callOI; });
  return totalCallOI > 0 ? parseFloat((totalPutOI / totalCallOI).toFixed(2)) : 1;
}

function calcMaxPain(chain) {
  if(!chain || chain.length == 0) return 0;
  var minLoss = Infinity, maxPainStrike = chain[0].strike;
  chain.forEach(function(target) {
    var totalLoss = 0;
    chain.forEach(function(s) {
      if (s.strike < target.strike) totalLoss += s.callOI * (target.strike - s.strike);
      if (s.strike > target.strike) totalLoss += s.putOI * (s.strike - target.strike);
    });
    if (totalLoss < minLoss) { minLoss = totalLoss; maxPainStrike = target.strike; }
  });
  return maxPainStrike;
}

function findSupportResistance(chain, spotPrice) {
  if(!chain || chain.length == 0) return {support:[], resistance:[]};
  var sorted = chain.slice().sort(function(a, b) { return b.putOI - a.putOI; });
  var support = sorted.filter(function(s) { return s.strike <= spotPrice; }).slice(0, 3).map(function(s) { return s.strike; });
  var sorted2 = chain.slice().sort(function(a, b) { return b.callOI - a.callOI; });
  var resistance = sorted2.filter(function(s) { return s.strike >= spotPrice; }).slice(0, 3).map(function(s) { return s.strike; });
  return { support: support, resistance: resistance };
}

function fmtOI(val) {
  if (val >= 100000) return (val / 100000).toFixed(1) + "L";
  if (val >= 1000) return (val / 1000).toFixed(1) + "K";
  return val;
}

function OIBar(props) {
  var pct = Math.min(100, (props.val / props.max) * 100);
  return (
    <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:2}}>
      <div style={{width:pct+"%",height:"100%",background:props.color,borderRadius:2}}></div>
    </div>
  );
}

export default function OIChain() {
  var SYMBOLS = [
    {label:"NIFTY",     spot:23622.90},
    {label:"BANKNIFTY", spot:56814.80},
    {label:"FINNIFTY",  spot:24123.45},
    {label:"SENSEX",    spot:73863.45},
    {label:"MIDCPNIFTY",spot:17265.90},
  ];
  var [symIdx, setSymIdx] = useState(0);
  var [expiry, setExpiry] = useState("weekly");
  var [view, setView] = useState("chain");
  var [chain, setChain] = useState(function(){ return genOIChain(23622.90, "weekly"); });
  var [lastUpdate, setLastUpdate] = useState("");

  var sym = SYMBOLS[symIdx];

  function refreshChain() {
    var newChain = genOIChain(sym.spot, expiry);
    setChain(newChain);
    setLastUpdate(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  }

  useEffect(function() { refreshChain(); }, [symIdx, expiry]);

  var pcr = calcPCR(chain);
  var maxPain = calcMaxPain(chain);
  var sr = findSupportResistance(chain, sym.spot);
  var pcrColor = pcr > 1.3 ? G2 : pcr < 0.7 ? R : GOLD;
  var pcrLabel = pcr > 1.3 ? "Bullish" : pcr < 0.7 ? "Bearish" : "Neutral";
  var maxCallOI = chain.length > 0 ? Math.max.apply(null, chain.map(function(s){return s.callOI;})) : 1;
  var maxPutOI = chain.length > 0 ? Math.max.apply(null, chain.map(function(s){return s.putOI;})) : 1;
  var totalCallOI = chain.reduce(function(s,r){return s+r.callOI;},0);
  var totalPutOI = chain.reduce(function(s,r){return s+r.putOI;},0);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>OI <span style={{color:G}}>Chain</span></div>
            <div style={{fontSize:8,color:T2}}>Demo data  Live on market days</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {lastUpdate ? <div style={{fontSize:7,color:T2}}>{lastUpdate}</div> : null}
            <button onClick={refreshChain} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:8,padding:"6px 10px",color:G,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Refresh</button>
          </div>
        </div>

        {/* Symbol selector */}
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {SYMBOLS.map(function(s,i){
            var act=symIdx==i;
            return <button key={s.label} onClick={function(){setSymIdx(i);}} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 12px",color:act?"#fff":T2,fontSize:10,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}}>{s.label}</button>;
          })}
        </div>

        {/* Expiry + View */}
        <div style={{display:"flex",gap:6}}>
          {[["weekly","Weekly"],["monthly","Monthly"]].map(function(e){
            var act=expiry==e[0];
            return <button key={e[0]} onClick={function(){setExpiry(e[0]);}} style={{background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?GOLD:BD),borderRadius:20,padding:"4px 10px",color:act?GOLD:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{e[1]}</button>;
          })}
          <div style={{flex:1}}></div>
          {[["chain","Chain"],["analysis","Analysis"]].map(function(v){
            var act=view==v[0];
            return <button key={v[0]} onClick={function(){setView(v[0]);}} style={{background:act?BLUE+"33":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 10px",color:act?BLUE:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{v[1]}</button>;
          })}
        </div>
      </div>

      {/* Spot + Key Metrics */}
      <div style={{padding:"10px 14px 0"}}>
        <div style={{background:"linear-gradient(135deg,#0F1629,#0A1A0A)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:14,padding:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:T2}}>{sym.label} SPOT</div>
              <div style={{fontSize:24,fontWeight:900,fontFamily:"monospace",color:G2}}>{sym.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:T2,marginBottom:2}}>Max Pain</div>
              <div style={{fontSize:18,fontWeight:900,color:GOLD}}>{maxPain.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              ["PCR",pcr.toFixed(2),pcrColor,pcrLabel],
              ["Call OI",fmtOI(totalCallOI),R,"Resistance"],
              ["Put OI",fmtOI(totalPutOI),G2,"Support"],
              ["Max Pain",maxPain,"#F59E0B","Pain Level"],
            ].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                  <div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div>
                  <div style={{fontSize:12,fontWeight:800,color:r[2]}}>{r[1]}</div>
                  <div style={{fontSize:6,color:T2,marginTop:1}}>{r[3]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support/Resistance */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:"rgba(0,200,83,0.06)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:10}}>
            <div style={{fontSize:9,color:G2,fontWeight:700,marginBottom:6}}>PUT Support Levels</div>
            {sr.support.map(function(s){
              return <div key={s} style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T1,marginBottom:3}}>{s.toLocaleString("en-IN")}</div>;
            })}
          </div>
          <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:10}}>
            <div style={{fontSize:9,color:R,fontWeight:700,marginBottom:6}}>CALL Resistance Levels</div>
            {sr.resistance.map(function(s){
              return <div key={s} style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T1,marginBottom:3}}>{s.toLocaleString("en-IN")}</div>;
            })}
          </div>
        </div>

        {/* Analysis View */}
        {view=="analysis" ? (
          <div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>OI Analysis</div>
              {[
                {label:"Total Call OI",val:fmtOI(totalCallOI),color:R,pct:Math.round(totalCallOI/(totalCallOI+totalPutOI)*100)},
                {label:"Total Put OI", val:fmtOI(totalPutOI), color:G2,pct:Math.round(totalPutOI/(totalCallOI+totalPutOI)*100)},
              ].map(function(r){
                return (
                  <div key={r.label} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:10,color:T2}}>{r.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:r.color}}>{r.val} ({r.pct}%)</span>
                    </div>
                    <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:r.pct+"%",height:"100%",background:r.color,borderRadius:3}}></div>
                    </div>
                  </div>
                );
              })}
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:10,marginTop:8}}>
                <div style={{fontSize:10,fontWeight:700,color:pcrColor,marginBottom:4}}>PCR Signal: {pcrLabel}</div>
                <div style={{fontSize:9,color:T2,lineHeight:1.7}}>
                  {pcr > 1.3
                    ? "Put OI is much higher than Call OI. Market is oversold. Bullish reversal possible."
                    : pcr < 0.7
                    ? "Call OI is much higher than Put OI. Market is overbought. Bearish reversal possible."
                    : "PCR is in neutral zone. Market showing indecision. Wait for directional move."}
                </div>
              </div>
            </div>
            <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:12,marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:6}}>Max Pain Analysis</div>
              <div style={{fontSize:9,color:T2,lineHeight:1.7}}>Max Pain is at <span style={{color:GOLD,fontWeight:700}}>{maxPain}</span>. Market tends to move towards max pain near expiry. Spot is {sym.spot > maxPain ? "above" : "below"} max pain by {Math.abs(sym.spot - maxPain).toFixed(0)} points. Expiry pressure {sym.spot > maxPain ? "pulls market down" : "pulls market up"} towards {maxPain}.</div>
            </div>
          </div>
        ) : null}

        {/* Chain View */}
        {view=="chain" ? (
          <div>
            {/* Header Row */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 2fr",gap:2,padding:"6px 8px",background:"rgba(255,255,255,0.04)",borderRadius:8,marginBottom:4}}>
              {["OI","ChgOI","IV","LTP","STRIKE","LTP","IV","OI"].map(function(h,i){
                var isCall = i < 4;
                var isStrike = i == 4;
                return <div key={i} style={{fontSize:7,fontWeight:700,color:isStrike?GOLD:isCall?R:G2,textAlign:"center"}}>{h}</div>;
              })}
            </div>

            {/* Call/Put labels */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,padding:"3px 8px",marginBottom:4}}>
              <div style={{fontSize:9,fontWeight:700,color:R,textAlign:"center"}}>CALLS</div>
              <div style={{fontSize:9,fontWeight:700,color:GOLD,textAlign:"center"}}>STRIKE</div>
              <div style={{fontSize:9,fontWeight:700,color:G2,textAlign:"center"}}>PUTS</div>
            </div>

            {/* Rows */}
            {chain.map(function(row) {
              var isATM = row.isATM;
              var isSupport = sr.support.indexOf(row.strike) != -1;
              var isResist = sr.resistance.indexOf(row.strike) != -1;
              var rowBg = isATM ? "rgba(245,158,11,0.12)" : "transparent";
              var rowBd = isATM ? "1px solid rgba(245,158,11,0.3)" : isSupport ? "1px solid rgba(0,200,83,0.2)" : isResist ? "1px solid rgba(239,68,68,0.2)" : "1px solid transparent";
              return (
                <div key={row.strike} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 2fr",gap:2,padding:"5px 8px",background:rowBg,border:rowBd,borderRadius:6,marginBottom:2}}>
                  {/* Call OI */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:700,color:R}}>{fmtOI(row.callOI)}</div>
                    <OIBar val={row.callOI} max={maxCallOI} color={R}/>
                  </div>
                  {/* Call Chg OI */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:8,color:row.callChgOI>0?R:"#F97316"}}>{row.callChgOI>0?"+":""}{fmtOI(Math.abs(row.callChgOI))}</div>
                  </div>
                  {/* Call IV */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:8,color:T2}}>{row.callIV}%</div>
                  </div>
                  {/* Call LTP */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:600,color:T1}}>{row.callLTP}</div>
                  </div>
                  {/* Strike */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:900,color:isATM?GOLD:T1}}>{row.strike}</div>
                    {isATM ? <div style={{fontSize:6,color:GOLD,fontWeight:700}}>ATM</div> : null}
                    {isSupport ? <div style={{fontSize:6,color:G2}}>SUP</div> : null}
                    {isResist ? <div style={{fontSize:6,color:R}}>RES</div> : null}
                  </div>
                  {/* Put LTP */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:600,color:T1}}>{row.putLTP}</div>
                  </div>
                  {/* Put IV */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:8,color:T2}}>{row.putIV}%</div>
                  </div>
                  {/* Put OI */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:700,color:G2}}>{fmtOI(row.putOI)}</div>
                    <OIBar val={row.putOI} max={maxPutOI} color={G2}/>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Disclaimer */}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Demo data for educational purposes. Live OI data requires market hours connection. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
