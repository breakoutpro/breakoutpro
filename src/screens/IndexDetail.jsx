import { useState, useEffect } from "react";
import { genCandles, findZones, detectPattern, calcRSI, calcEMA, CandleChart } from "./IndexHelpers";

var DB="#050816",CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",T1="#FFFFFF",T2="#8FA2C9";

export default function IndexDetail(props) {
  var idx=props.idx||{};
  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};
  var [tf,setTf]=useState("15m");
  var [candles,setCandles]=useState(function(){return genCandles(idx.ltp||23000,80);});
  var [viewTab,setViewTab]=useState("chart");
  var [zoom,setZoom]=useState(1);
  var [fullscreen,setFullscreen]=useState(false);
  var [tappedCandle,setTappedCandle]=useState(null);

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
            {fullscreen?(
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:DB,zIndex:1000,flexDirection:"column",display:"flex"}}>
                <div style={{background:CB,padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:T1}}>{idx.label} {tf}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button onClick={function(){setZoom(function(z){return Math.max(0.5,z-0.5);});}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit"}}>-</button>
                    <span style={{fontSize:9,color:T2}}>{Math.round(zoom*100)+"%"}</span>
                    <button onClick={function(){setZoom(function(z){return Math.min(4,z+0.5);});}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit"}}>+</button>
                    <button onClick={function(){setFullscreen(false);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"5px 10px",color:R,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>X Close</button>
                  </div>
                </div>
                {tappedCandle?(
                  <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"6px 14px",display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:tappedCandle.close>=tappedCandle.open?G2:R}}>{tappedCandle.close>=tappedCandle.open?"Bullish":"Bearish"}</span>
                    {[["O",tappedCandle.open],["H",tappedCandle.high],["L",tappedCandle.low],["C",tappedCandle.close]].map(function(r){return <span key={r[0]} style={{fontSize:9,color:T2}}>{r[0]}:{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</span>;})}
                  </div>
                ):null}
                <div style={{flex:1,padding:8}}>
                  <CandleChart candles={candles} zones={zones} fullscreen={true} zoom={zoom} onCandleTap={function(cv){setTappedCandle(cv);}}/>
                </div>
                <div style={{background:CB,padding:"8px 14px",borderTop:"1px solid "+BD,display:"flex",gap:5}}>
                  {["5m","15m","1H","1D","1W"].map(function(t){var act=tf==t;return <button key={t} onClick={function(){setTf(t);setCandles(genCandles(idx.ltp||23000,80));}} style={{flex:1,background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?GOLD:BD),borderRadius:8,padding:"5px",color:act?GOLD:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;})}
                </div>
              </div>
            ):null}

            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:10,marginBottom:8,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:9,color:T2}}>Candlestick {tf}  Tap candle for info</span>
                <button onClick={function(){setFullscreen(true);}} style={{background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:6,padding:"3px 8px",color:BLUE,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Full Screen</button>
              </div>
              <CandleChart candles={candles} zones={zones} zoom={zoom} onCandleTap={function(cv){setTappedCandle(cv);}}/>
            </div>

            {/* Zoom */}
            <div style={{display:"flex",gap:5,marginBottom:8,alignItems:"center"}}>
              <span style={{fontSize:9,color:T2}}>Zoom:</span>
              {[0.5,1,2,3].map(function(z){var act=zoom==z;return <button key={z} onClick={function(){setZoom(z);}} style={{background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?GOLD:BD),borderRadius:6,padding:"4px 8px",color:act?GOLD:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{z+"x"}</button>;})}
            </div>

            {/* Tapped candle */}
            {tappedCandle?(
              <div style={{background:CB,border:"1px solid "+(tappedCandle.close>=tappedCandle.open?"rgba(0,200,83,0.3)":"rgba(239,68,68,0.3)"),borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:700,color:tappedCandle.close>=tappedCandle.open?G2:R}}>
                    {(function(){var cB=Math.abs(tappedCandle.close-tappedCandle.open),cR=tappedCandle.high-tappedCandle.low||0.01,cUW=tappedCandle.high-Math.max(tappedCandle.open,tappedCandle.close),cLW=Math.min(tappedCandle.open,tappedCandle.close)-tappedCandle.low;if(cR>0&&cB<cR*0.15)return"Doji";if(cLW>=cB*1.8&&cUW<=cB*0.5)return"Hammer";if(cUW>=cB*1.8&&cLW<=cB*0.5)return"Shooting Star";if(cB>cR*0.75)return"Marubozu";return tappedCandle.close>=tappedCandle.open?"Bullish":"Bearish";})()}  Closed at {tappedCandle.close.toLocaleString("en-IN")}
                  </span>
                  <button onClick={function(){setTappedCandle(null);}} style={{background:"none",border:"none",color:T2,cursor:"pointer",fontSize:14}}>X</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
                  {[["Open",tappedCandle.open],["High",tappedCandle.high],["Low",tappedCandle.low],["Close",tappedCandle.close]].map(function(r){return <div key={r[0]} style={{textAlign:"center"}}><div style={{fontSize:7,color:T2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:T1}}>{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>;})}
                </div>
              </div>
            ):null}

            {/* Latest candle always */}
            <div style={{background:CB,border:"1px solid rgba(0,200,83,0.15)",borderRadius:12,padding:"10px 14px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:700,color:T2}}>Latest Candle ({tf})  Closed</span>
                <span style={{background:pattern&&pattern.type=="bullish"?"rgba(0,200,83,0.15)":pattern&&pattern.type=="bearish"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",color:pattern&&pattern.type=="bullish"?G2:pattern&&pattern.type=="bearish"?R:GOLD,borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700}}>{pattern?pattern.name:"Normal"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {[["Open",last.open],["High",last.high],["Low",last.low],["Close",last.close]].map(function(r){return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:1}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:T1}}>{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>;})}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[["RSI (14)",rsi,rsiColor,rsi>70?"Overbought":rsi<30?"Oversold":"Neutral"],["Trend",trend,trendCol,"EMA 9/21"],["EMA 9",ema9,GOLD,last.close>ema9?"Above":"Below"],["EMA 21",ema21,BLUE,last.close>ema21?"Above":"Below"]].map(function(r){return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12}}><div style={{fontSize:8,color:T2,marginBottom:3}}>{r[0]}</div><div style={{fontSize:14,fontWeight:800,color:r[2]}}>{r[1]}</div><div style={{fontSize:8,color:r[2],marginTop:2}}>{r[3]}</div></div>;})}
            </div>
          </div>
        ):null}

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
              <div style={{background:CB,border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:"20px",textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:GOLD,marginBottom:6}}>Normal Candle</div>
                <div style={{fontSize:10,color:T2,lineHeight:1.7}}>No significant reversal pattern on latest candle. Market in normal movement. Watch S1 Rs{zones.sup1.toLocaleString("en-IN")} and R1 Rs{zones.res1.toLocaleString("en-IN")} levels.</div>
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
   
