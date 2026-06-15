import React from "react";

var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

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

export function LTPRows(props) {
  var chain = props.chain;
  var symData = props.symData;
  var maxCallOI = Math.max.apply(null, chain.rows.map(function(r){return r.callOI;}));
  var maxPutOI  = Math.max.apply(null, chain.rows.map(function(r){return r.putOI;}));
  var atmSignal = symData.change>=0?"Long Buildup":"Short Covering";
  var atmSignalColor = symData.change>=0?G2:"#F59E0B";

  return (
    <div>
      {chain.rows.map(function(row){
        var callPct=(row.callOI/maxCallOI)*100;
        var putPct=(row.putOI/maxPutOI)*100;
        var itmCall=row.dist<0;
        var itmPut=row.dist>0;
        return (
          <div key={row.strike}>
            {row.isATM?(
              <div style={{background:"rgba(0,200,83,0.08)",borderTop:"1px solid rgba(0,200,83,0.2)",borderBottom:"1px solid rgba(0,200,83,0.2)",padding:"4px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:9,fontWeight:700,color:atmSignalColor}}>{atmSignal}</span>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontFamily:"monospace",fontSize:11,fontWeight:900,color:symData.change>=0?G2:R}}>{symData.spot.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
                  <span style={{fontSize:8,color:symData.change>=0?G2:R}}>{symData.change>=0?"":""} {Math.abs(symData.changePct)}%</span>
                </div>
              </div>
            ):null}
            <div style={{display:"grid",gridTemplateColumns:"0.8fr 0.9fr 0.9fr 0.8fr 0.8fr 0.9fr 0.8fr",gap:1,padding:"7px 6px",background:itmCall?"rgba(0,200,83,0.04)":itmPut?"rgba(239,68,68,0.04)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:0,top:0,height:"100%",width:callPct+"%",background:"rgba(0,200,83,0.15)"}}></div>
                <div style={{fontSize:9,fontWeight:600,color:G2,textAlign:"center",position:"relative"}}>{fmtVol(row.callVol)}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:G2}}>Rs{row.callLTP}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:8,fontWeight:600,color:row.callChgPct>=0?G2:R}}>{row.callChgPct>=0?"+":""}{row.callChgPct}%</div>
              </div>
              <div style={{textAlign:"center",background:row.isATM?"rgba(245,158,11,0.15)":"transparent",borderRadius:4,padding:"2px"}}>
                <div style={{fontSize:11,fontWeight:900,color:row.isATM?"#F59E0B":T1}}>{row.strike}</div>
                {row.isATM?<div style={{fontSize:6,color:"#F59E0B",fontWeight:700}}>ATM</div>:null}
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:8,fontWeight:600,color:row.putChgPct>=0?G2:R}}>{row.putChgPct>=0?"+":""}{row.putChgPct}%</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:R}}>Rs{row.putLTP}</div>
              </div>
              <div style={{position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:putPct+"%",background:"rgba(239,68,68,0.15)"}}></div>
                <div style={{fontSize:9,fontWeight:600,color:R,textAlign:"center",position:"relative"}}>{fmtVol(row.putVol)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OIRows(props) {
  var chain = props.chain;
  var maxCallOI = Math.max.apply(null, chain.rows.map(function(r){return r.callOI;}));
  var maxPutOI  = Math.max.apply(null, chain.rows.map(function(r){return r.putOI;}));
  return (
    <div>
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
              <div style={{fontSize:11,fontWeight:900,color:row.isATM?"#F59E0B":T1}}>{row.strike}</div>
              {row.isATM?<div style={{fontSize:6,color:"#F59E0B"}}>ATM</div>:null}
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
  );
}

export function GreeksRows(props) {
  var chain = props.chain;
  return (
    <div>
      {chain.rows.map(function(row){
        return (
          <div key={row.strike} style={{display:"grid",gridTemplateColumns:"0.8fr 0.8fr 0.8fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr",gap:1,padding:"6px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:row.isATM?"rgba(245,158,11,0.08)":"transparent"}}>
            <div style={{textAlign:"center",fontSize:9,color:G2,fontWeight:600}}>{row.callDelta}</div>
            <div style={{textAlign:"center",fontSize:9,color:"#3B82F6"}}>{row.iv}%</div>
            <div style={{textAlign:"center",fontSize:9,color:"#F59E0B"}}>{row.vega}</div>
            <div style={{textAlign:"center",background:row.isATM?"rgba(245,158,11,0.15)":"transparent",borderRadius:4,padding:"1px"}}>
              <div style={{fontSize:11,fontWeight:900,color:row.isATM?"#F59E0B":T1}}>{row.strike}</div>
              {row.isATM?<div style={{fontSize:6,color:"#F59E0B"}}>ATM</div>:null}
            </div>
            <div style={{textAlign:"center",fontSize:9,color:R,fontWeight:600}}>{row.putDelta}</div>
            <div style={{textAlign:"center",fontSize:9,color:"#3B82F6"}}>{(row.iv+0.5).toFixed(1)}%</div>
            <div style={{textAlign:"center",fontSize:9,color:"#F59E0B"}}>{row.gamma}</div>
            <div style={{textAlign:"center",fontSize:9,color:R}}>{row.theta}</div>
          </div>
        );
      })}
    </div>
  );
}
