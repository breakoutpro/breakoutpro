import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

var STRATEGIES=[
  {id:"ema_cross", label:"EMA Crossover",   desc:"Buy when EMA9 > EMA21, Sell when EMA9 < EMA21"},
  {id:"rsi",       label:"RSI Strategy",     desc:"Buy RSI < 30, Sell RSI > 70"},
  {id:"supertrend",label:"Supertrend",       desc:"Buy on green Supertrend, Sell on red"},
  {id:"macd",      label:"MACD Crossover",   desc:"Buy MACD > Signal, Sell MACD < Signal"},
  {id:"breakout",  label:"Breakout Strategy",desc:"Buy 52-week high breakout with volume"},
];

var SYMBOLS=["NIFTY","RELIANCE","TCS","HDFCBANK","ICICIBANK","TATAMOTORS","INFY","SBIN","BAJFINANCE","WIPRO"];
var TIMEFRAMES=["1D","1W","1M","3M","6M","1Y"];

function genCandle(prev,seed){
  var s=seed;
  function r(){s=(s*9301+49297)%233280;return s/233280;}
  var chg=(r()-0.48)*prev*0.015;
  var o=parseFloat(prev.toFixed(2));
  var c=parseFloat((prev+chg).toFixed(2));
  var h=parseFloat((Math.max(o,c)+r()*prev*0.005).toFixed(2));
  var l=parseFloat((Math.min(o,c)-r()*prev*0.005).toFixed(2));
  var vol=Math.floor(500000+r()*2000000);
  return{o:o,h:h,l:l,c:c,vol:vol};
}

function genCandles(startPrice,count,seedBase){
  var arr=[],price=startPrice;
  for(var i=0;i<count;i++){
    var cd=genCandle(price,seedBase+i*7);
    arr.push(cd);
    price=cd.c;
  }
  return arr;
}

function calcEMA(candles,period){
  var k=2/(period+1),ema=candles[0].c;
  return candles.map(function(c){ema=c.c*k+ema*(1-k);return ema;});
}

function calcRSI(candles,period){
  if(period===undefined)period=14;
  var gains=[],losses=[];
  for(var i=1;i<candles.length;i++){
    var d=candles[i].c-candles[i-1].c;
    gains.push(d>0?d:0);losses.push(d<0?-d:0);
  }
  var avgG=gains.slice(0,period).reduce(function(s,v){return s+v;},0)/period;
  var avgL=losses.slice(0,period).reduce(function(s,v){return s+v;},0)/period;
  var result=[];
  for(var j=period;j<gains.length;j++){
    avgG=(avgG*(period-1)+gains[j])/period;
    avgL=(avgL*(period-1)+losses[j])/period;
    result.push(avgL===0?100:100-(100/(1+avgG/avgL)));
  }
  return result;
}

function runBacktest(candles,strategyId){
  var trades=[],position=null,capital=100000,equity=capital;
  var ema9=calcEMA(candles,9);
  var ema21=calcEMA(candles,21);
  var rsi=calcRSI(candles,14);
  var peak=capital,maxDD=0;

  for(var i=22;i<candles.length;i++){
    var c=candles[i];
    var signal=null;

    if(strategyId==="ema_cross"){
      if(!position&&ema9[i]>ema21[i]&&ema9[i-1]<=ema21[i-1]) signal="BUY";
      else if(position&&ema9[i]<ema21[i]&&ema9[i-1]>=ema21[i-1]) signal="SELL";
    } else if(strategyId==="rsi"){
      var ri=i-22+rsi.length-(candles.length-22);
      if(ri>=0&&ri<rsi.length){
        if(!position&&rsi[ri]<30) signal="BUY";
        else if(position&&rsi[ri]>70) signal="SELL";
      }
    } else if(strategyId==="supertrend"){
      var trend=c.c>((c.h+c.l)/2+2*(c.h-c.l));
      var prevTrend=candles[i-1].c>((candles[i-1].h+candles[i-1].l)/2+2*(candles[i-1].h-candles[i-1].l));
      if(!position&&trend&&!prevTrend) signal="BUY";
      else if(position&&!trend&&prevTrend) signal="SELL";
    } else if(strategyId==="macd"){
      var macd12=ema9[i],macd26=ema21[i];
      var pm12=ema9[i-1],pm26=ema21[i-1];
      if(!position&&macd12>macd26&&pm12<=pm26) signal="BUY";
      else if(position&&macd12<macd26&&pm12>=pm26) signal="SELL";
    } else if(strategyId==="breakout"){
      var recent=candles.slice(Math.max(0,i-52),i);
      var high52=Math.max.apply(null,recent.map(function(r){return r.h;}));
      if(!position&&c.c>high52*0.99&&c.vol>candles[i-1].vol*1.5) signal="BUY";
      else if(position&&c.c<position.entry*0.97) signal="SELL";
    }

    if(signal==="BUY"&&!position){
      var qty=Math.floor(equity/c.c);
      position={entry:c.c,qty:qty,i:i};
    } else if(signal==="SELL"&&position){
      var pnl=(c.c-position.entry)*position.qty;
      equity+=pnl;
      if(equity>peak)peak=equity;
      var dd=((peak-equity)/peak)*100;
      if(dd>maxDD)maxDD=dd;
      trades.push({entry:position.entry,exit:c.c,qty:position.qty,pnl:parseFloat(pnl.toFixed(2)),pnlPct:parseFloat(((c.c-position.entry)/position.entry*100).toFixed(2)),win:pnl>0,entryI:position.i,exitI:i});
      position=null;
    }
  }

  var wins=trades.filter(function(t){return t.win;}).length;
  var totalPnl=trades.reduce(function(s,t){return s+t.pnl;},0);
  var avgWin=wins>0?trades.filter(function(t){return t.win;}).reduce(function(s,t){return s+t.pnlPct;},0)/wins:0;
  var losses2=trades.filter(function(t){return !t.win;}).length;
  var avgLoss=losses2>0?trades.filter(function(t){return !t.win;}).reduce(function(s,t){return s+Math.abs(t.pnlPct);},0)/losses2:0;

  return{
    trades:trades,
    totalTrades:trades.length,
    winRate:trades.length>0?(wins/trades.length*100).toFixed(1):0,
    totalPnl:parseFloat(totalPnl.toFixed(2)),
    totalPnlPct:parseFloat(((equity-capital)/capital*100).toFixed(2)),
    finalEquity:parseFloat(equity.toFixed(2)),
    maxDrawdown:parseFloat(maxDD.toFixed(2)),
    avgWin:parseFloat(avgWin.toFixed(2)),
    avgLoss:parseFloat(avgLoss.toFixed(2)),
    profitFactor:avgLoss>0?parseFloat((avgWin/avgLoss).toFixed(2)):0,
    wins:wins,losses:losses2,
  };
}

function fmtN(n){return n==null||isNaN(n)?"--":n.toLocaleString("en-IN",{maximumFractionDigits:2});}

export default function Backtesting(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1; UP=theme.c.up;

  var onBack=props.onBack||function(){};
  var [strategy,setStrategy]=useState("ema_cross");
  var [symbol,setSymbol]=useState("NIFTY");
  var [timeframe,setTimeframe]=useState("1Y");
  var [result,setResult]=useState(null);
  var [running,setRunning]=useState(false);
  var [showTrades,setShowTrades]=useState(false);

  function runTest(){
    setRunning(true);setResult(null);setShowTrades(false);
    setTimeout(function(){
      var counts={"1D":30,"1W":60,"1M":90,"3M":180,"6M":252,"1Y":365};
      var count=counts[timeframe]||252;
      var bases={"NIFTY":23800,"RELIANCE":2845,"TCS":3654,"HDFCBANK":1742,"ICICIBANK":1289,"TATAMOTORS":876,"INFY":1567,"SBIN":824,"BAJFINANCE":7234,"WIPRO":478};
      var base=bases[symbol]||1000;
      var seed=symbol.split("").reduce(function(s,c){return s+c.charCodeAt(0);},0)*strategy.length;
      var candles=genCandles(base,count,seed);
      var res=runBacktest(candles,strategy);
      setResult(res);
      setRunning(false);
    },800);
  }

  var strat=STRATEGIES.find(function(s){return s.id==strategy;})||STRATEGIES[0];

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"16px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Backtesting</div>
          <div style={{fontSize:12,color:T2}}>Test strategies on simulated price data - Educational only</div>
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>

        {/* Strategy Select */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>STRATEGY</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {STRATEGIES.map(function(s){
              var act=strategy==s.id;
              return (
                <div key={s.id} onClick={function(){setStrategy(s.id);setResult(null);}} style={{background:act?"rgba(59,130,246,0.12)":CB,border:"1px solid "+(act?BLUE:BD),borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:act?BLUE:T3,flexShrink:0}}></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:act?BLUE2:T1}}>{s.label}</div>
                    <div style={{fontSize:12,color:T3,marginTop:4}}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Symbol + Timeframe */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>SYMBOL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {SYMBOLS.map(function(s){
                var act=symbol==s;
                return <button key={s} onClick={function(){setSymbol(s);setResult(null);}} style={{background:act?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"4px 8px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>;
              })}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>PERIOD</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {TIMEFRAMES.map(function(t){
                var act=timeframe==t;
                return <button key={t} onClick={function(){setTimeframe(t);setResult(null);}} style={{background:act?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"4px 8px",color:act?"#A78BFA":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
              })}
            </div>
          </div>
        </div>

        {/* Run Button */}
        <button onClick={runTest} disabled={running} style={{width:"100%",background:running?"rgba(59,130,246,0.3)":""+BLUE+"",border:"none",borderRadius:14,padding:"16px",color:"#fff",fontSize:14,fontWeight:700,cursor:running?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
          {running?(
            <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"bt-spin 0.8s linear infinite"}}></div><span>Running Backtest...</span></>
          ):(
            <><span>&#9654;</span><span>Run Backtest — {symbol} {strat.label} {timeframe}</span></>
          )}
        </button>

        {/* Results */}
        {result&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>SIMULATED DATA</span>
              <span style={{fontSize:12,color:T3}}>Results use generated price series, not real historical market prices.</span>
            </div>
            {/* Summary Cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[
                ["Total Return",  (result.totalPnlPct>=0?"+":"")+result.totalPnlPct+"%",  result.totalPnlPct>=0?UP:DOWN],
                ["Win Rate",      result.winRate+"%",                                       parseFloat(result.winRate)>=50?UP:DOWN],
                ["Total Trades",  result.totalTrades,                                       BLUE2],
                ["Max Drawdown",  "-"+result.maxDrawdown+"%",                               DOWN],
                ["Profit Factor", result.profitFactor+"x",                                  result.profitFactor>=1?UP:DOWN],
                ["Final Equity",  "Rs"+fmtN(result.finalEquity),                            result.finalEquity>=100000?UP:DOWN],
              ].map(function(r){
                return (
                  <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px"}}>
                    <div style={{fontSize:12,color:T3,marginBottom:4}}>{r[0]}</div>
                    <div style={{fontSize:16,fontWeight:900,color:r[2],fontFamily:"monospace"}}>{r[1]}</div>
                  </div>
                );
              })}
            </div>

            {/* Win/Loss bar */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:UP}}>Wins: {result.wins}</span>
                <span style={{fontSize:12,fontWeight:700,color:DOWN}}>Losses: {result.losses}</span>
              </div>
              <div style={{height:8,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden",display:"flex"}}>
                <div style={{height:8,background:UP,width:(result.wins/Math.max(result.totalTrades,1)*100)+"%",borderRadius:"4px 0 0 4px"}}></div>
                <div style={{height:8,background:DOWN,flex:1,borderRadius:"0 4px 4px 0"}}></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                <span style={{fontSize:12,color:UP}}>Avg Win: +{result.avgWin}%</span>
                <span style={{fontSize:12,color:DOWN}}>Avg Loss: -{result.avgLoss}%</span>
              </div>
            </div>

            {/* Trade Log */}
            <button onClick={function(){setShowTrades(function(p){return !p;});}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:10,padding:"12px",color:T2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:showTrades?8:12}}>
              {showTrades?"Hide":"Show"} Trade Log ({result.trades.length} trades)
            </button>
            {showTrades&&(
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:12}}>
                <div style={{display:"grid",gridTemplateColumns:"0.5fr 1fr 1fr 1fr",padding:"8px 12px",borderBottom:"1px solid "+BD}}>
                  {["#","Entry","Exit","P&L"].map(function(h){return <div key={h} style={{fontSize:12,fontWeight:700,color:T3}}>{h}</div>;})}
                </div>
                {result.trades.slice(0,20).map(function(t,i){
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"0.5fr 1fr 1fr 1fr",padding:"8px 12px",borderBottom:i<result.trades.length-1?"1px solid rgba(30,42,77,0.4)":"none",alignItems:"center"}}>
                      <div style={{fontSize:12,color:T3}}>#{i+1}</div>
                      <div style={{fontSize:12,color:T1,fontFamily:"monospace"}}>{fmtN(t.entry)}</div>
                      <div style={{fontSize:12,color:T1,fontFamily:"monospace"}}>{fmtN(t.exit)}</div>
                      <div style={{fontSize:12,fontWeight:700,color:t.win?UP:DOWN}}>{t.win?"+":""}{t.pnlPct}%</div>
                    </div>
                  );
                })}
                {result.trades.length>20&&<div style={{padding:"8px 12px",fontSize:12,color:T3,textAlign:"center"}}>...and {result.trades.length-20} more trades</div>}
              </div>
            )}

            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:12,color:BLUE}}>&#9888; Educational simulation only. Past performance does not guarantee future results. Not SEBI registered. Not investment advice.</div>
            </div>
          </div>
        )}
      </div>
      <style>{"@keyframes bt-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
