import { useState, useEffect } from "react";

var DB="#050816",CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",T1="#FFFFFF",T2="#8FA2C9";

function genCandles(base, count) {
  var arr=[], price=base;
  for(var i=0;i<count;i++){
    var chg=(Math.random()-0.48)*base*0.006;
    var open2=price;
    var close2=parseFloat((open2+chg).toFixed(2));
    var hi=parseFloat((Math.max(open2,close2)+Math.random()*base*0.003).toFixed(2));
    var lo=parseFloat((Math.min(open2,close2)-Math.random()*base*0.003).toFixed(2));
    arr.push({open:open2,close:close2,high:hi,low:lo,vol:Math.floor(100000+Math.random()*500000)});
    price=close2;
  }
  return arr;
}

function findZones(candles) {
  var highs=candles.map(function(c){return c.high;});
  var lows=candles.map(function(c){return c.low;});
  var closes=candles.map(function(c){return c.close;});
  var maxH=Math.max.apply(null,highs);
  var minL=Math.min.apply(null,lows);
  var last=closes[closes.length-1];
  var range=maxH-minL;
  return {
    res1:parseFloat((last+range*0.03).toFixed(2)),
    res2:parseFloat((last+range*0.065).toFixed(2)),
    sup1:parseFloat((last-range*0.025).toFixed(2)),
    sup2:parseFloat((last-range*0.055).toFixed(2)),
    high52w:parseFloat((maxH*1.02).toFixed(2)),
    low52w:parseFloat((minL*0.98).toFixed(2)),
  };
}

function CandleChart(props) {
  var candles=props.candles||[];
  var zones=props.zones||{};
  var W=340,H=200;
  var count=Math.min(50,candles.length);
  var visible=candles.slice(-count);
  if(visible.length<2) return null;
  var prices=visible.reduce(function(a,c){return a.concat([c.high,c.low]);},[] );
  var minP=Math.min.apply(null,prices),maxP=Math.max.apply(null,prices);
  var pad=(maxP-minP)*0.08;
  minP-=pad;maxP+=pad;
  var range=maxP-minP||1;
  var cw=W/count;
  function yP(p){return H-((p-minP)/range)*H;}
  function xC(i){return i*cw+cw/2;}

  // Draw support/resistance zones
  var zonesToDraw=[];
  if(zones.res1&&zones.res1>=minP&&zones.res1<=maxP) zonesToDraw.push({y:yP(zones.res1),color:R,label:"R1 "+zones.res1.toLocaleString("en-IN")});
  if(zones.res2&&zones.res2>=minP&&zones.res2<=maxP) zonesToDraw.push({y:yP(zones.res2),color:R,label:"R2 "+zones.res2.toLocaleString("en-IN"),dash:true});
  if(zones.sup1&&zones.sup1>=minP&&zones.sup1<=maxP) zonesToDraw.push({y:yP(zones.sup1),color:G2,label:"S1 "+zones.sup1.toLocaleString("en-IN")});
  if(zones.sup2&&zones.sup2>=minP&&zones.sup2<=maxP) zonesToDraw.push({y:yP(zones.sup2),color:G2,label:"S2 "+zones.sup2.toLocaleString("en-IN"),dash:true});

  return (
    <svg width={W} height={H} style={{display:"block",width:"100%"}}>
      {/* Grid */}
      {[0,0.25,0.5,0.75,1].map(function(t){
        var y=t*H;
        var price=maxP-t*range;
        return <g key={t}><line x1={0} y1={y} x2={W} y2={y} stroke={BD} strokeWidth="0.5"/><text x={4} y={y-2} fill={T2} fontSize={8}>{price.toLocaleString("en-IN",{maximumFractionDigits:0})}</text></g>;
      })}

      {/* Zone bands */}
      {zones.res1&&zones.res1>=minP&&zones.res1<=maxP?<rect x={0} y={yP(zones.res1)-8} width={W} height={16} fill="rgba(239,68,68,0.08)"/>:null}
      {zones.sup1&&zones.sup1>=minP&&zones.sup1<=maxP?<rect x={0} y={yP(zones.sup1)-8} width={W} height={16} fill="rgba(0,200,83,0.08)"/>:null}

      {/* Zone lines */}
      {zonesToDraw.map(function(z,i){
        return <g key={i}><line x1={0} y1={z.y} x2={W} y2={z.y} stroke={z.color} strokeWidth="1" strokeDasharray={z.dash?"5,3":"none"}/><text x={W-60} y={z.y-3} fill={z.color} fontSize={7} fontWeight="700">{z.label}</text></g>;
      })}

      {/* Candles */}
      {visible.map(function(c,i){
        var bull=c.close>=c.open;
        var col=bull?G2:R;
        var x=i*cw;
        var bTop=yP(Math.max(c.open,c.close));
        var bBot=yP(Math.min(c.open,c.close));
        var bH=Math.max(1,bBot-bTop);
        return (
          <g key={i}>
            <line x1={xC(i)} y1={yP(c.high)} x2={xC(i)} y2={yP(c.low)} stroke={col} strokeWidth="1"/>
            <rect x={x+cw*0.1} y={bTop} width={cw*0.8} height={bH} fill={col} rx="1"/>
          </g>
        );
      })}
    </svg>
  );
}

function detectPattern(candles) {
  if(candles.length<3) return null;
  var n=candles.length;
  var c=candles[n-1],p=candles[n-2];
  var cB=Math.abs(c.close-c.open),cR=c.high-c.low;
  var cUW=c.high-Math.max(c.open,c.close),cLW=Math.min(c.open,c.close)-c.low;
  var cBull=c.close>c.open,pBull=p.close>p.open,pB=Math.abs(p.close-p.open);
  if(cR>0&&cB<cR*0.1) return {name:"Doji",signal:"Indecision",type:"neutral",desc:"Market undecided. Wait for next candle direction."};
  if(cLW>=cB*2&&cUW<=cB*0.3&&!pBull) return {name:"Hammer",signal:"Bullish Reversal",type:"bullish",desc:"Strong buying at lows. Potential reversal up."};
  if(cUW>=cB*2&&cLW<=cB*0.3&&pBull) return {name:"Shooting Star",signal:"Bearish Reversal",type:"bearish",desc:"Strong selling at highs. Potential reversal down."};
  if(!pBull&&cBull&&c.open<p.close&&c.close>p.open&&cB>pB*1.2) return {name:"Bullish Engulfing",signal:"Strong Bullish",type:"bullish",desc:"Bulls took full control. Strong buy signal."};
  if(pBull&&!cBull&&c.open>p.close&&c.close<p.open&&cB>pB*1.2) return {name:"Bearish Engulfing",signal:"Strong Bearish",type:"bearish",desc:"Bears took full control. Strong sell signal."};
  var cBull2=c.close>c.open;
  if(cBull2&&cB>cR*0.7&&c.low==Math.min.apply(null,candles.slice(-5).map(function(x){return x.low;}))) return {name:"Marubozu",signal:"Strong Bullish",type:"bullish",desc:"Full body candle. Strong momentum."};
  return null;
}

function calcRSI(candles) {
  if(candles.length<15) return 50;
  var gains=0,losses=0;
  for(var i=candles.length-14;i<candles.length;i++){
    var diff=candles[i].close-candles[i-1].close;
    if(diff>0) gains+=diff; else losses+=Math.abs(diff);
  }
  if(losses==0) return 100;
  return parseFloat((100-100/(1+gains/losses)).toFixed(1));
}

function calcEMA(candles, period) {
  if(candles.length<period) return candles[candles.length-1].close;
  var k=2/(period+1);
  var ema=candles[0].close;
  for(var i=1;i<candles.length;i++){
    ema=candles[i].close*k+ema*(1-k);
  }
  return parseFloat(ema.toFixed(2));
}

export default function IndexDetail(props) {
  var idx=props.idx||{};
  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};
  var [tf,setTf]=useState("15m");
  var [candles,setCandles]=useState(function(){return genCandles(idx.ltp||23000,80);});
  var [viewTab,setViewTab]=useState("chart");

  useEffect(function(){
    setCandles(genCandles(idx.ltp||23000,80));
  },[tf,idx.label]);

  var last=candles[candles.length-1]||{open:0,close:0,high:0,low:0,vol:0};
  var prev=candles[candles.length-2]||last;
  var chg=last.close-prev.close;
  var chgPct=(chg/prev.close*100).toFixed(2);
  var bull=last.close>=last.open;
  var zones=findZones(candles);
  var pattern=detectPattern(candles);
  var rsi=calcRSI(candles);
  var ema9=calcEMA(candles,9);
  var ema21=calcEMA(candles,21);
  var rsiColor=rsi>70?R:rsi<30?G2:GOLD;
  var trend=last.close>ema21?"Bullish":"Bearish";
  var trendCol=trend=="Bullish"?G2:R;

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:T1,fontSize:16,flexShrink:0}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{idx.label||"INDEX"}</div>
            <div style={{fontSize:8,color:T2}}>Tap to analyze</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:20,fontWeight:900,color:bull?G2:R}}>{last.close.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
            <div style={{fontSize:11,fontWeight:700,color:bull?G2:R}}>{bull?"+":""}{chg.toFixed(2)} ({bull?"+":""}{chgPct}%)</div>
          </div>
        </div>

        {/* OHLV */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {[["Open",last.open],["High",last.high],["Low",last.low],["Vol",(last.vol/100000).toFixed(1)+"L"]].map(function(r){
            return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:1}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:T1}}>{typeof r[1]=="number"?r[1].toLocaleString("en-IN",{maximumFractionDigits:0}):r[1]}</div></div>;
          })}
        </div>

        {/* Timeframes */}
        <div style={{display:"flex",gap:5}}>
          {["5m","15m","1H","1D","1W"].map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{flex:1,background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?GOLD:BD),borderRadius:8,padding:"5px 4px",color:act?GOLD:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
        </div>
      </div>

      {/* View tabs */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,display:"flex",gap:0}}>
        {[["chart","Chart"],["zones","Zones"],["pattern","Pattern"],["analysis","Analysis"]].map(function(t){
          var act=viewTab==t[0];
          return <button key={t[0]} onClick={function(){setViewTab(t[0]);}} style={{flex:1,background:"none",border:"none",borderBottom:"2px solid "+(act?G:"transparent"),padding:"10px 4px",color:act?G2:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
        })}
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {/* CHART TAB */}
        {viewTab=="chart"?(
          <div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:10,marginBottom:12,overflow:"hidden"}}>
              <div style={{fontSize:9,color:T2,marginBottom:6}}>Candlestick Chart  {tf}  Support & Resistance Zones</div>
              <CandleChart candles={candles} zones={zones}/>
            </div>

            {/* Indicators */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[["RSI (14)",rsi,rsiColor,rsi>70?"Overbought":rsi<30?"Oversold":"Neutral"],["Trend",trend,trendCol,"EMA 9/21"],["EMA 9",ema9,GOLD,last.close>ema9?"Price Above":"Price Below"],["EMA 21",ema21,BLUE,last.close>ema21?"Price Above":"Price Below"]].map(function(r){
                return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12}}><div style={{fontSize:8,color:T2,marginBottom:3}}>{r[0]}</div><div style={{fontSize:14,fontWeight:800,color:r[2]}}>{r[1]}</div><div style={{fontSize:8,color:r[2],marginTop:2}}>{r[3]}</div></div>;
              })}
            </div>
          </div>
        ):null}

        {/* ZONES TAB */}
        {viewTab=="zones"?(
          <div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:12}}>Support and Resistance Zones</div>

              {[["Resistance 2 (Strong)",zones.res2,R,"Major selling zone  strong resistance"],["Resistance 1 (Immediate)",zones.res1,R,"First resistance  watch for rejection"],["Current Price",last.close,bull?G2:R,"Current market price"],["Support 1 (Immediate)",zones.sup1,G2,"First support  watch for bounce"],["Support 2 (Strong)",zones.sup2,G2,"Major buying zone  strong support"]].map(function(r,i){
                var isCurrent=i==2;
                return (
                  <div key={r[0]} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,background:isCurrent?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",border:"1px solid "+(isCurrent?r[2]+"44":BD)}}>
                    <div style={{width:4,height:36,borderRadius:2,background:r[2],flexShrink:0}}></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:T2,marginBottom:2}}>{r[0]}</div>
                      <div style={{fontSize:9,color:T2,lineHeight:1.4}}>{r[3]}</div>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:r[2]}}>{typeof r[1]=="number"?r[1].toLocaleString("en-IN",{minimumFractionDigits:2}):r[1]}</div>
                  </div>
                );
              })}
            </div>

            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>52 Week Range</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:G2,fontWeight:700}}>{zones.low52w.toLocaleString("en-IN")} Low</span>
                <span style={{fontSize:10,color:R,fontWeight:700}}>High {zones.high52w.toLocaleString("en-IN")}</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",position:"relative",marginBottom:4}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",background:"linear-gradient(90deg,"+R+","+GOLD+","+G2+")",width:"100%",opacity:0.4,borderRadius:3}}></div>
                <div style={{position:"absolute",top:-2,height:10,width:3,background:"#fff",borderRadius:2,left:((last.close-zones.low52w)/(zones.high52w-zones.low52w)*100)+"%"}}></div>
              </div>
              <div style={{fontSize:9,color:T2,textAlign:"center"}}>Current: {last.close.toLocaleString("en-IN")}  {Math.round((last.close-zones.low52w)/(zones.high52w-zones.low52w)*100)}% from 52W low</div>
            </div>
          </div>
        ):null}

        {/* PATTERN TAB */}
        {viewTab=="pattern"?(
          <div>
            {pattern?(
              <div style={{background:"linear-gradient(135deg,#0A1020,#0B1224)",border:"1px solid "+(pattern.type=="bullish"?G:pattern.type=="bearish"?R:GOLD)+"44",borderRadius:16,padding:16,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:18,fontWeight:900,color:T1}}>{pattern.name}</div>
                  <span style={{background:pattern.type=="bullish"?"rgba(0,200,83,0.15)":pattern.type=="bearish"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",color:pattern.type=="bullish"?G2:pattern.type=="bearish"?R:GOLD,borderRadius:20,padding:"4px 12px",fontSize:10,fontWeight:700}}>{pattern.signal}</span>
                </div>
                <div style={{fontSize:12,color:T1,lineHeight:1.7,marginBottom:12}}>{pattern.desc}</div>
                <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:10}}>
                  <div style={{fontSize:9,color:T2}}>Educational Note: This is a candlestick pattern observation for learning purposes only. Not a buy/sell recommendation.</div>
                </div>
              </div>
            ):(
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:30,marginBottom:10}}>&#128268;</div>
                <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:4}}>No Clear Pattern</div>
                <div style={{fontSize:10,color:T2}}>No significant candlestick pattern detected on latest candles. Market in normal movement.</div>
              </div>
            )}

            {/* Pattern education */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Common Patterns Guide</div>
              {[["Doji","Open = Close. Indecision in market.","neutral"],["Hammer","Long lower wick. Bullish reversal at support.","bullish"],["Shooting Star","Long upper wick. Bearish reversal at resistance.","bearish"],["Engulfing","One candle engulfs previous. Strong reversal.","bullish"],["Marubozu","Full body, no wicks. Strong momentum.","bullish"]].map(function(p){
                var col=p[2]=="bullish"?G2:p[2]=="bearish"?R:GOLD;
                return <div key={p[0]} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}><div style={{width:4,height:4,borderRadius:"50%",background:col,marginTop:5,flexShrink:0}}></div><div><span style={{fontSize:10,fontWeight:700,color:col}}>{p[0]}: </span><span style={{fontSize:10,color:T2}}>{p[1]}</span></div></div>;
              })}
            </div>
          </div>
        ):null}

        {/* ANALYSIS TAB */}
        {viewTab=="analysis"?(
          <div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:12}}>Technical Analysis Summary</div>
              {[
                ["Price vs EMA9",last.close>ema9?"Price Above EMA9":"Price Below EMA9",last.close>ema9?G2:R,last.close>ema9?"Short term bullish":"Short term bearish"],
                ["Price vs EMA21",last.close>ema21?"Price Above EMA21":"Price Below EMA21",last.close>ema21?G2:R,last.close>ema21?"Medium term bullish":"Medium term bearish"],
                ["RSI Signal",rsi>70?"Overbought":rsi<30?"Oversold":"Neutral Zone",rsiColor,rsi>70?"May face selling":"May face buying"],
                ["Support",zones.sup1.toLocaleString("en-IN"),G2,"Watch for bounce here"],
                ["Resistance",zones.res1.toLocaleString("en-IN"),R,"Watch for rejection here"],
              ].map(function(r){
                return (
                  <div key={r[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+BD}}>
                    <div>
                      <div style={{fontSize:10,fontWeight:600,color:T1}}>{r[0]}</div>
                      <div style={{fontSize:8,color:T2,marginTop:2}}>{r[3]}</div>
                    </div>
                    <div style={{background:r[2]+"18",border:"1px solid "+r[2]+"33",borderRadius:8,padding:"3px 10px"}}>
                      <span style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
              <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational analysis only. Not SEBI registered. Not investment advice. Always do your own research before trading.</div>
            </div>
          </div>
        ):null}

      </div>
    </div>
  );
}

