import { useState, useEffect } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",PURPLE="#7C3AED",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var STOCKS=["NIFTY 50","BANKNIFTY","RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","TATAMOTORS","AXISBANK"];

function genCandle(prev){
  var chg=(Math.random()-0.48)*prev.close*0.005;
  var o=prev.close,cl=parseFloat((o+chg).toFixed(2));
  var hi=parseFloat((Math.max(o,cl)+Math.random()*prev.close*0.003).toFixed(2));
  var lo=parseFloat((Math.min(o,cl)-Math.random()*prev.close*0.003).toFixed(2));
  return{open:o,close:cl,high:hi,low:lo};
}

function detectPattern(c1,c2,c3){
  var body1=Math.abs(c1.close-c1.open);
  var body2=Math.abs(c2.close-c2.open);
  var range2=c2.high-c2.low;
  var upperWick2=c2.high-Math.max(c2.open,c2.close);
  var lowerWick2=Math.min(c2.open,c2.close)-c2.low;

  if(c1.close<c1.open&&c2.close>c2.open&&c2.close>c1.open&&c2.open<c1.close) return {name:"Bullish Engulfing",type:"bullish",conf:82};
  if(c1.close>c1.open&&c2.close<c2.open&&c2.close<c1.open&&c2.open>c1.close) return {name:"Bearish Engulfing",type:"bearish",conf:80};
  if(lowerWick2>body2*2&&upperWick2<body2*0.5&&c2.close>=c2.open) return {name:"Hammer",type:"bullish",conf:75};
  if(upperWick2>body2*2&&lowerWick2<body2*0.5&&c2.close<=c2.open) return {name:"Shooting Star",type:"bearish",conf:74};
  if(body2<range2*0.1) return {name:"Doji",type:"neutral",conf:60};
  if(c3&&c1.close<c1.open&&body2<Math.abs(c1.close-c1.open)*0.4&&c3.close>c3.open&&c3.close>(c1.open+c1.close)/2) return {name:"Morning Star",type:"bullish",conf:85};
  if(c3&&c1.close>c1.open&&body2<Math.abs(c1.close-c1.open)*0.4&&c3.close<c3.open&&c3.close<(c1.open+c1.close)/2) return {name:"Evening Star",type:"bearish",conf:84};
  if(upperWick2<body2*0.1&&lowerWick2<body2*0.1&&c2.close>c2.open) return {name:"Bullish Marubozu",type:"bullish",conf:70};
  if(upperWick2<body2*0.1&&lowerWick2<body2*0.1&&c2.close<c2.open) return {name:"Bearish Marubozu",type:"bearish",conf:70};
  if(c2.high>c2.low&&Math.abs(c2.high-(c1.high||c2.high))<c2.high*0.001) return {name:"Tweezer Top",type:"bearish",conf:62};
  return null;
}

export default function CandleDetector(props){
  var setTab = props.setTab || function(){};
  var [scanning,setScanning]=useState(true);
  var [stocks,setStocks]=useState(function(){
    return STOCKS.map(function(sym){
      var base=sym=="NIFTY 50"?23969:sym=="BANKNIFTY"?52134:1000+Math.random()*2000;
      var candles=[{open:base,close:base,high:base,low:base}];
      for(var i=0;i<5;i++) candles.push(genCandle(candles[candles.length-1]));
      return {sym:sym,candles:candles,pattern:null};
    });
  });
  var [detections,setDetections]=useState([]);
  var [filter,setFilter]=useState("all");

  useEffect(function(){
    if(!scanning) return;
    var t=setInterval(function(){
      setStocks(function(prev){
        return prev.map(function(s){
          var nc=genCandle(s.candles[s.candles.length-1]);
          var newCandles=s.candles.slice(-4).concat([nc]);
          var n=newCandles.length;
          var pattern=detectPattern(newCandles[n-3]||newCandles[0],newCandles[n-2]||newCandles[0],newCandles[n-1]);
          if(pattern){
            setDetections(function(prevD){
              var time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
              return [{id:Date.now()+Math.random(),sym:s.sym,pattern:pattern,time:time,price:nc.close}].concat(prevD).slice(0,30);
            });
          }
          return {sym:s.sym,candles:newCandles,pattern:pattern};
        });
      });
    },4000);
    return function(){clearInterval(t);};
  },[scanning]);

  var filtered = filter=="all"?detections:detections.filter(function(d){return d.pattern.type==filter;});

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:30}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:T1}}>Candle <span style={{color:PURPLE}}>Detector</span></div>
            <div style={{fontSize:9,color:T2}}>12 patterns scanned live across {STOCKS.length} instruments</div>
          </div>
          <button onClick={function(){setScanning(!scanning);}} style={{background:scanning?"rgba(0,200,83,0.12)":"rgba(239,68,68,0.1)",border:"1px solid "+(scanning?G2:R),borderRadius:20,padding:"5px 10px",color:scanning?G2:R,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{scanning?"Live":"Paused"}</button>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["all","All"],["bullish","Bullish"],["bearish","Bearish"]].map(function(f){
            var act=filter==f[0];
            var col=f[0]=="bullish"?G2:f[0]=="bearish"?R:BLUE;
            return <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{flex:1,background:act?col+"18":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"6px 4px",color:act?col:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>
        <div style={{fontSize:9,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>WATCHING</div>
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
          {stocks.map(function(s){
            return <div key={s.sym} style={{background:CB,border:"1px solid "+(s.pattern?(s.pattern.type=="bullish"?G2:s.pattern.type=="bearish"?R:GOLD):BD),borderRadius:10,padding:"6px 10px",flexShrink:0,textAlign:"center",minWidth:70}}>
              <div style={{fontSize:8,fontWeight:700,color:T1}}>{s.sym}</div>
              <div style={{fontSize:7,color:s.pattern?(s.pattern.type=="bullish"?G2:s.pattern.type=="bearish"?R:GOLD):T3,marginTop:2}}>{s.pattern?s.pattern.name:"Scanning"}</div>
            </div>;
          })}
        </div>

        <div style={{fontSize:9,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>DETECTIONS ({filtered.length})</div>

        {filtered.length==0?(
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:4}}>Scanning for patterns...</div>
            <div style={{fontSize:9,color:T2}}>Detections will appear here in real time</div>
          </div>
        ):(
          filtered.map(function(d){
            var col=d.pattern.type=="bullish"?G2:d.pattern.type=="bearish"?R:GOLD;
            return (
              <div key={d.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"11px 14px",marginBottom:8,borderLeft:"3px solid "+col}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:T1}}>{d.sym}</span>
                  <span style={{fontSize:8,color:T3}}>{d.time}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:600,color:col}}>{d.pattern.name}</span>
                  <span style={{fontSize:9,fontWeight:700,color:col}}>{d.pattern.conf}% confidence</span>
                </div>
              </div>
            );
          })
        )}

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:8}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational pattern detection only. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
              }
