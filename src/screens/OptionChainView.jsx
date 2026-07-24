
import { useTheme } from "../theme/ThemeProvider";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";
var CB = "#0F1629";
var BD = "#1E2D4A";

function genOptionChain(spot, sym) {
  var atm = Math.round(spot/100)*100;
  if(sym=="BANKNIFTY") atm = Math.round(spot/100)*100;
  var strikes = [];
  var step = spot > 10000 ? 100 : 50;
  for(var i=-8;i<=8;i++){
    var strike = atm + i*step;
    var isATM = i==0;
    var dist = Math.abs(i);
    var callPrem = isATM ? parseFloat((spot*0.018).toFixed(2)) : parseFloat((Math.max(0.5, spot*0.018/(dist*1.4+1) + (i<0?Math.max(0,spot-strike):0))).toFixed(2));
    var putPrem = isATM ? parseFloat((spot*0.017).toFixed(2)) : parseFloat((Math.max(0.5, spot*0.017/(dist*1.4+1) + (i>0?Math.max(0,strike-spot):0))).toFixed(2));
    var callOI = isATM ? Math.floor(85000+Math.random()*30000) : Math.floor(Math.max(2000,70000/(dist*1.5+1)+Math.random()*15000));
    var putOI = isATM ? Math.floor(80000+Math.random()*30000) : Math.floor(Math.max(2000,65000/(dist*1.5+1)+Math.random()*15000));
    var callDelta = isATM ? 0.50 : parseFloat((Math.max(0.01,Math.min(0.99, 0.5 - i*0.06))).toFixed(2));
    var putDelta = parseFloat((callDelta - 1).toFixed(2));
    var iv = parseFloat((18 + dist*1.5 + Math.random()*2).toFixed(1));
    strikes.push({
      strike:strike, isATM:isATM, itm: i<0,
      callPrem:callPrem, putPrem:putPrem,
      callOI:callOI, putOI:putOI,
      callDelta:callDelta, putDelta:putDelta,
      callIV:iv, putIV:parseFloat((iv+0.5).toFixed(1)),
      callChg:parseFloat(((Math.random()-0.45)*callPrem*0.3).toFixed(2)),
      putChg:parseFloat(((Math.random()-0.45)*putPrem*0.3).toFixed(2)),
    });
  }
  return {strikes:strikes, spot:spot, atm:atm};
}

function fmtOI(n) {
  if(n>=100000) return (n/100000).toFixed(1)+"L";
  if(n>=1000) return (n/1000).toFixed(0)+"K";
  return n;
}

function OptionChainView(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CB=theme.c.card; G2=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1;

  var sym = props.sym;
  var lot = props.lot;
  var spot = props.spot;
  var expiry = props.expiry;
  var onTrade = props.onTrade;
  var chain = genOptionChain(spot, sym);

  var totalCallOI = chain.strikes.reduce(function(s,r){return s+r.callOI;},0);
  var totalPutOI = chain.strikes.reduce(function(s,r){return s+r.putOI;},0);
  var pcr = (totalPutOI/totalCallOI).toFixed(2);
  var pcrColor = pcr>1.2?G2:pcr<0.8?R:BLUE;

  return (
    <div>
      {/* Chain Header */}
      <div style={{background:CB,border:"1px solid rgba(236,72,153,0.2)",borderRadius:16,padding:12,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{sym} Options</div>
            <div style={{fontSize:12,color:T2}}>Expiry: {expiry} | Lot: {lot} | Spot: Rs{spot.toLocaleString("en-IN")}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:T2}}>PCR</div>
            <div style={{fontSize:14,fontWeight:900,color:pcrColor}}>{pcr}</div>
            <div style={{fontSize:12,color:pcrColor}}>{pcr>1.2?"Bullish":pcr<0.8?"Bearish":"Neutral"}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["ATM Strike",chain.atm,BLUE],["Total Call OI",fmtOI(totalCallOI),R],["Total Put OI",fmtOI(totalPutOI),G2]].map(function(r){
            return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontSize:12,color:T2}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
          })}
        </div>
      </div>

      {/* Chain Table Header */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 0.7fr 0.7fr 0.8fr 0.8fr 0.7fr 1fr",gap:4,padding:"4px 8px",background:"rgba(255,255,255,0.04)",borderRadius:6,marginBottom:4}}>
        {["OI","Chg","Premium","STRIKE","Premium","Chg","OI"].map(function(h,i){
          var isStrike=i==3;
          return <div key={i} style={{fontSize:12,fontWeight:700,color:isStrike?BLUE:i<3?R:G2,textAlign:"center"}}>{h}</div>;
        })}
      </div>

      {/* CALLS / PUTS label */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,padding:"4px 8px",marginBottom:4}}>
        <div style={{fontSize:12,fontWeight:700,color:R,textAlign:"center"}}>CALLS</div>
        <div style={{fontSize:12,fontWeight:700,color:BLUE,textAlign:"center"}}>STRIKE</div>
        <div style={{fontSize:12,fontWeight:700,color:G2,textAlign:"center"}}>PUTS</div>
      </div>

      {/* Chain Rows */}
      {chain.strikes.map(function(row){
        var maxCallOI=Math.max.apply(null,chain.strikes.map(function(s){return s.callOI;}));
        var maxPutOI=Math.max.apply(null,chain.strikes.map(function(s){return s.putOI;}));
        var callPct=(row.callOI/maxCallOI)*100;
        var putPct=(row.putOI/maxPutOI)*100;
        var rowBg=row.isATM?"rgba(37,99,235,0.1)":"rgba(255,255,255,0.02)";
        var rowBd=row.isATM?"1px solid rgba(37,99,235,0.3)":"1px solid transparent";
        return (
          <div key={row.strike} style={{display:"grid",gridTemplateColumns:"1fr 0.7fr 0.7fr 0.8fr 0.8fr 0.7fr 1fr",gap:4,padding:"8px",background:rowBg,border:rowBd,borderRadius:6,marginBottom:4}}>
            {/* Call OI */}
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",right:0,top:0,height:"100%",width:callPct+"%",background:"rgba(239,68,68,0.15)",borderRadius:3}}></div>
              <div style={{fontSize:12,fontWeight:700,color:R,textAlign:"center",position:"relative"}}>{fmtOI(row.callOI)}</div>
            </div>
            {/* Call Chg */}
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:12,color:row.callChg>=0?G2:R}}>{row.callChg>=0?"+":""}{row.callChg}</div>
            </div>
            {/* Call Premium - clickable */}
            <div onClick={function(){onTrade({sym:sym+" "+row.strike+"CE",side:"BUY",ltp:row.callPrem,lot:lot,delta:row.callDelta,iv:row.callIV,type:"CE",strike:row.strike});}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:5,padding:"4px",textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:700,color:R}}>{row.callPrem}</div>
              <div style={{fontSize:12,color:T2}}>d:{row.callDelta}</div>
            </div>
            {/* Strike */}
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:900,color:row.isATM?BLUE:T1}}>{row.strike}</div>
              {row.isATM?<div style={{fontSize:12,color:BLUE,fontWeight:700}}>ATM</div>:null}
              {row.itm?<div style={{fontSize:12,color:BLUE}}>ITM</div>:null}
            </div>
            {/* Put Premium - clickable */}
            <div onClick={function(){onTrade({sym:sym+" "+row.strike+"PE",side:"BUY",ltp:row.putPrem,lot:lot,delta:row.putDelta,iv:row.putIV,type:"PE",strike:row.strike});}} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:5,padding:"4px",textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:700,color:G2}}>{row.putPrem}</div>
              <div style={{fontSize:12,color:T2}}>d:{row.putDelta}</div>
            </div>
            {/* Put Chg */}
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:12,color:row.putChg>=0?G2:R}}>{row.putChg>=0?"+":""}{row.putChg}</div>
            </div>
            {/* Put OI */}
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",width:putPct+"%",background:"rgba(0,200,83,0.15)",borderRadius:3}}></div>
              <div style={{fontSize:12,fontWeight:700,color:G2,textAlign:"center",position:"relative"}}>{fmtOI(row.putOI)}</div>
            </div>
          </div>
        );
      })}

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:8,marginTop:12}}>
        <div style={{fontSize:12,color:theme.c.warn}}>Tap CE/PE premium to paper trade. Educational only. Not real options.</div>
      </div>
    </div>
  );
}

export { OptionChainView };
