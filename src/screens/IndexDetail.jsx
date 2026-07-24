import { useState,useEffect } from "react";
import { genCandles,findZones,detectPattern,calcRSI,calcEMA,CandleChart } from "./IndexHelpers";
import IndexTabs from "./IndexTabs";
import { getConstituents } from "../data/indexConstituents";
import { ALL_NSE_STOCKS } from "../data/marketsStocks";
import { STOCK_META } from "../data/stockMeta";
import StockProfile from "./StockProfile";
import { useTheme } from "../theme/ThemeProvider";
var DB="#050816",CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8FA2C9";
export default function IndexDetail(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; CB=theme.c.card; DB=theme.c.bg; G2=theme.c.up; R=theme.c.down; T1=theme.c.text1; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand;

  var idx=props.idx||{};
  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};
  var [tf,setTf]=useState("15m");
  var [candles,setCandles]=useState(function(){return genCandles(idx.ltp||23000,80);});
  var [viewTab,setViewTab]=useState("chart");
  var [zoom,setZoom]=useState(1);
  var [fullscreen,setFullscreen]=useState(false);
  var [tappedCandle,setTappedCandle]=useState(null);
  var [selStock,setSelStock]=useState(null);
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
  var rsiColor=rsi>70?R:rsi<30?G2:BLUE;
  var trend=last.close>ema21?"Bullish":"Bearish";
  var trendCol=trend=="Bullish"?G2:R;
  var constituentSyms=getConstituents(idx.label);
  var stockList=ALL_NSE_STOCKS.filter(function(s){return constituentSyms.indexOf(s.sym)!=-1;});

  if(selStock) return <StockProfile stock={selStock} meta={STOCK_META[selStock.sym]} onBack={function(){setSelStock(null);}}/>;
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      {/* Header */}
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:44,height:44,cursor:"pointer",color:T1,fontSize:16,flexShrink:0}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{idx.label||"INDEX"}</div>
            <div style={{fontSize:12,color:T2}}>Tap to analyze</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:bull?G2:R}}>{last.close.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
            <div style={{fontSize:12,fontWeight:700,color:bull?G2:R}}>{bull?"+":""}{chg.toFixed(2)} ({bull?"+":""}{chgPct}%)</div>
          </div>
        </div>
        {/* OHLV */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {[["Open",last.open],["High",last.high],["Low",last.low],["Vol",(last.vol/100000).toFixed(1)+"L"]].map(function(r){
            return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:T1}}>{typeof r[1]=="number"?r[1].toLocaleString("en-IN",{maximumFractionDigits:0}):r[1]}</div></div>;
          })}
        </div>
        {/* Timeframes */}
        <div style={{display:"flex",gap:4}}>
          {["5m","15m","1H","1D","1W"].map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{flex:1,background:act?"rgba(37,99,235,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"4px 4px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
        </div>
      </div>
      {/* View tabs */}
      <div style={{background:CB,borderBottom:"1px solid "+BD,display:"flex",gap:4}}>
        {[["chart","Chart"],["stocks","Stocks"],["zones","Zones"],["pattern","Pattern"],["analysis","Analysis"]].map(function(t){
          var act=viewTab==t[0];
          return <button key={t[0]} onClick={function(){setViewTab(t[0]);}} style={{flex:1,background:"none",border:"none",borderBottom:"2px solid "+(act?BLUE:"transparent"),padding:"12px 4px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
        })}
      </div>
      <div style={{padding:"12px 16px 0"}}>
        {/* STOCKS TAB */}
        {viewTab=="stocks"?(
          <div>
            <div style={{fontSize:12,color:T2,marginBottom:12}}>{stockList.length} stocks in {idx.label||"index"}  Tap a stock to view chart &amp; history</div>
            {stockList.length==0?(
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center"}}>
                <div style={{fontSize:12,color:T2}}>Constituent list not available for this index yet.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {stockList.map(function(s){
                  return (
                    <div key={s.sym} onClick={function(){setSelStock(s);}} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                        <div style={{fontSize:12,color:T2,marginTop:4}}>{s.name}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                        <div style={{fontSize:12,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":"-"}{Math.abs(s.chgPct)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ):null}

        {/* CHART TAB */}
        {viewTab=="chart"?(
          <div>
            {fullscreen?(
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:DB,zIndex:1000,flexDirection:"column",display:"flex"}}>
                <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:T1}}>{idx.label} {tf}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={function(){setZoom(function(z){return Math.max(0.5,z-0.5);});}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit"}}>-</button>
                    <span style={{fontSize:12,color:T2}}>{Math.round(zoom*100)+"%"}</span>
                    <button onClick={function(){setZoom(function(z){return Math.min(4,z+0.5);});}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit"}}>+</button>
                    <button onClick={function(){setFullscreen(false);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"4px 12px",color:R,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>X Close</button>
                  </div>
                </div>
                {tappedCandle?(
                  <div style={{background:CB,borderBottom:"1px solid "+BD,padding:"8px 16px",display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:12,fontWeight:700,color:tappedCandle.close>=tappedCandle.open?G2:R}}>{tappedCandle.close>=tappedCandle.open?"Bullish":"Bearish"}</span>
                    {[["O",tappedCandle.open],["H",tappedCandle.high],["L",tappedCandle.low],["C",tappedCandle.close]].map(function(r){return <span key={r[0]} style={{fontSize:12,color:T2}}>{r[0]}:{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</span>;})}
                  </div>
                ):null}
                <div style={{flex:1,padding:8}}>
                  <CandleChart candles={candles} zones={zones} fullscreen={true} zoom={zoom} onCandleTap={function(cv){setTappedCandle(cv);}}/>
                </div>
                <div style={{background:CB,padding:"8px 16px",borderTop:"1px solid "+BD,display:"flex",gap:4}}>
                  {["5m","15m","1H","1D","1W"].map(function(t){var act=tf==t;return <button key={t} onClick={function(){setTf(t);setCandles(genCandles(idx.ltp||23000,80));}} style={{flex:1,background:act?"rgba(37,99,235,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"4px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;})}
                </div>
              </div>
            ):null}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:8,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:T2}}>Candlestick {tf}  Tap candle for info</span>
                <button onClick={function(){setFullscreen(true);}} style={{background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:6,padding:"4px 8px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Full Screen</button>
              </div>
              <CandleChart candles={candles} zones={zones} zoom={zoom} onCandleTap={function(cv){setTappedCandle(cv);}}/>
            </div>
            {/* Zoom */}
            <div style={{display:"flex",gap:4,marginBottom:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:T2}}>Zoom:</span>
              {[0.5,1,2,3].map(function(z){var act=zoom==z;return <button key={z} onClick={function(){setZoom(z);}} style={{background:act?"rgba(37,99,235,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"4px 8px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{z+"x"}</button>;})}
            </div>
            {/* Tapped candle */}
            {tappedCandle?(
              <div style={{background:CB,border:"1px solid "+(tappedCandle.close>=tappedCandle.open?"rgba(0,200,83,0.3)":"rgba(239,68,68,0.3)"),borderRadius:16,padding:"12px 16px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:tappedCandle.close>=tappedCandle.open?G2:R}}>
                    {(function(){var cB=Math.abs(tappedCandle.close-tappedCandle.open),cR=tappedCandle.high-tappedCandle.low||0.01,cUW=tappedCandle.high-Math.max(tappedCandle.open,tappedCandle.close),cLW=Math.min(tappedCandle.open,tappedCandle.close)-tappedCandle.low;if(cR>0&&cB<cR*0.15)return"Doji";if(cLW>=cB*1.8&&cUW<=cB*0.5)return"Hammer";if(cUW>=cB*1.8&&cLW<=cB*0.5)return"Shooting Star";if(cB>cR*0.75)return"Marubozu";return tappedCandle.close>=tappedCandle.open?"Bullish":"Bearish";})()}  Closed at {tappedCandle.close.toLocaleString("en-IN")}
                  </span>
                  <button onClick={function(){setTappedCandle(null);}} style={{background:"none",border:"none",color:T2,cursor:"pointer",fontSize:14}}>X</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                  {[["Open",tappedCandle.open],["High",tappedCandle.high],["Low",tappedCandle.low],["Close",tappedCandle.close]].map(function(r){return <div key={r[0]} style={{textAlign:"center"}}><div style={{fontSize:12,color:T2}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:T1}}>{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>;})}
                </div>
              </div>
            ):null}
            {/* Latest candle always */}
            <div style={{background:CB,border:"1px solid rgba(0,200,83,0.15)",borderRadius:16,padding:"12px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:T2}}>Latest Candle ({tf})  Closed</span>
                <span style={{background:pattern&&pattern.type=="bullish"?"rgba(0,200,83,0.15)":pattern&&pattern.type=="bearish"?"rgba(239,68,68,0.15)":"rgba(37,99,235,0.15)",color:pattern&&pattern.type=="bullish"?G2:pattern&&pattern.type=="bearish"?R:BLUE,borderRadius:20,padding:"4px 8px",fontSize:12,fontWeight:700}}>{pattern?pattern.name:"Normal"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[["Open",last.open],["High",last.high],["Low",last.low],["Close",last.close]].map(function(r){return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div><div style={{fontSize:12,fontWeight:700,color:T1}}>{r[1].toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>;})}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[["RSI (14)",rsi,rsiColor,rsi>70?"Overbought":rsi<30?"Oversold":"Neutral"],["Trend",trend,trendCol,"EMA 9/21"],["EMA 9",ema9,BLUE,last.close>ema9?"Above":"Below"],["EMA 21",ema21,BLUE,last.close>ema21?"Above":"Below"]].map(function(r){return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:12}}><div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div><div style={{fontSize:14,fontWeight:800,color:r[2]}}>{r[1]}</div><div style={{fontSize:12,color:r[2],marginTop:4}}>{r[3]}</div></div>;})}
            </div>
          </div>
        ):null}

        <IndexTabs viewTab={viewTab} zones={zones} last={last} pattern={pattern} rsi={rsi} ema9={ema9} ema21={ema21} trend={trend} trendCol={trendCol} rsiColor={rsiColor}/>

      </div>
    </div>
  );
}
