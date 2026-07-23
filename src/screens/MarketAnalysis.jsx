import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#050505";
var CB = "#101318";
var BD = "#20242D";
var G = "#1B5E20";
var G2 = "#1B5E20";
var R = "#EF4444";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var INDICES = [
  {sym:"NIFTY 50",   ltp:23622.90, chgPct:0.00, up:true,  sect:"Index"},
  {sym:"SENSEX",     ltp:73863.45, chgPct:1.28, up:true,  sect:"Index"},
  {sym:"BANK NIFTY", ltp:56814.80, chgPct:0.00, up:true,  sect:"Index"},
  {sym:"MIDCAP 50",  ltp:17265.90, chgPct:0.00, up:true,  sect:"Index"},
  {sym:"INDIA VIX",  ltp:14.23,    chgPct:-2.34,up:false, sect:"Volatility"},
  {sym:"FINNIFTY",   ltp:24123.45, chgPct:0.87, up:true,  sect:"Index"},
];

var STOCKS = [
  {sym:"RELIANCE", ltp:2845.60,chgPct:1.71,up:true, sect:"Energy"},
  {sym:"TCS",      ltp:3654.20,chgPct:0.97,up:false,sect:"IT"},
  {sym:"HDFCBANK", ltp:1742.50,chgPct:1.90,up:true, sect:"Bank"},
  {sym:"ICICIBANK",ltp:1289.30,chgPct:2.33,up:true, sect:"Bank"},
  {sym:"INFY",     ltp:1567.80,chgPct:1.40,up:false,sect:"IT"},
  {sym:"WIPRO",    ltp:478.90, chgPct:2.99,up:true, sect:"IT"},
  {sym:"TATAMOTORS",ltp:945.60,chgPct:2.23,up:true, sect:"Auto"},
  {sym:"SBIN",     ltp:812.30, chgPct:2.18,up:true, sect:"Bank"},
  {sym:"AXISBANK", ltp:1156.70,chgPct:1.47,up:true, sect:"Bank"},
  {sym:"BAJFINANCE",ltp:7234.50,chgPct:1.90,up:true,sect:"NBFC"},
  {sym:"MARUTI",   ltp:13240,  chgPct:1.07,up:true, sect:"Auto"},
  {sym:"SUNPHARMA",ltp:1678.40,chgPct:0.98,up:false,sect:"Pharma"},
  {sym:"LT",       ltp:3456.20,chgPct:0.76,up:true, sect:"Infra"},
  {sym:"NTPC",     ltp:398.45, chgPct:0.94,up:true, sect:"Energy"},
  {sym:"ONGC",     ltp:287.30, chgPct:1.23,up:true, sect:"Energy"},
  {sym:"ITC",      ltp:467.80, chgPct:0.34,up:true, sect:"FMCG"},
  {sym:"KOTAKBANK",ltp:2134.50,chgPct:1.12,up:true, sect:"Bank"},
  {sym:"ADANIENT", ltp:2876.40,chgPct:3.24,up:true, sect:"Infra"},
  {sym:"HUL",      ltp:2345.60,chgPct:0.18,up:true, sect:"FMCG"},
  {sym:"ASIANPAINT",ltp:2234.50,chgPct:-0.54,up:false,sect:"Paint"},
];

function calcRSI(candles, period) {
  if(candles.length < period+1) return 50;
  var gains=0, losses=0;
  for(var i=candles.length-period;i<candles.length;i++){
    var chg=candles[i].close-candles[i-1].close;
    if(chg>0) gains+=chg; else losses+=Math.abs(chg);
  }
  if(losses==0) return 100;
  return parseFloat((100-100/(1+gains/losses)).toFixed(1));
}

function calcEMA(candles, period) {
  if(candles.length<period) return candles[candles.length-1].close;
  var k=2/(period+1);
  var ema=candles[candles.length-period].close;
  for(var i=candles.length-period+1;i<candles.length;i++) ema=candles[i].close*k+ema*(1-k);
  return parseFloat(ema.toFixed(2));
}

function calcVWAP(candles) {
  var cumTPV=0,cumVol=0;
  candles.forEach(function(c){var tp=(c.high+c.low+c.close)/3;cumTPV+=tp*c.vol;cumVol+=c.vol;});
  return cumVol>0?parseFloat((cumTPV/cumVol).toFixed(2)):candles[candles.length-1].close;
}

function genCandles(base) {
  var price=base; var arr=[];
  for(var i=0;i<60;i++){
    var chg=(Math.random()-0.48)*base*0.004;
    var open=price; var close=parseFloat((open+chg).toFixed(2));
    arr.push({open:open,close:close,high:parseFloat((Math.max(open,close)+Math.random()*base*0.002).toFixed(2)),low:parseFloat((Math.min(open,close)-Math.random()*base*0.002).toFixed(2)),vol:Math.floor(100000+Math.random()*400000)});
    price=close;
  }
  return arr;
}

function analyze(item) {
  var candles=genCandles(item.ltp);
  var price=item.ltp;
  var rsi=calcRSI(candles,14);
  var ema9=calcEMA(candles,9);
  var ema21=calcEMA(candles,21);
  var vwap=calcVWAP(candles);
  var bullSig=0,bearSig=0;
  if(price>ema9) bullSig++; else bearSig++;
  if(price>ema21) bullSig++; else bearSig++;
  if(price>vwap) bullSig++; else bearSig++;
  if(rsi<40) bullSig++; else if(rsi>60) bearSig++; else bullSig++;
  if(item.up) bullSig++; else bearSig++;
  return {rsi:rsi,ema9:ema9,ema21:ema21,vwap:vwap,bullSig:bullSig,bearSig:bearSig};
}

function AnalysisCard(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CB = theme.c.card; T1=theme.c.text1;

  var item=props.item;
  var [detail,setDetail]=useState(null);
  var res=detail||analyze(item);
  var trend=res.bullSig>=4?"Strong Bullish":res.bullSig==3?"Bullish":res.bearSig>=4?"Strong Bearish":"Mixed";
  var tColor=res.bullSig>=3?G2:res.bearSig>=3?R:BLUE;
  var vol=res.rsi>60?"High":res.rsi<40?"Low":"Medium";
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={function(){setDetail(detail?null:analyze(item));}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{item.sym}</div>
            <span style={{fontSize:12,color:T2,background:"rgba(255,255,255,0.05)",borderRadius:4,padding:"4px 4px"}}>{item.sect}</span>
          </div>
          <div style={{fontSize:12,color:T2,marginTop:4}}>
            Rs{item.ltp>=1000?(item.ltp/1000).toFixed(1)+"K":item.ltp} &nbsp;
            <span style={{color:item.up?G2:R}}>{item.up?"+":""}{item.chgPct.toFixed(2)}%</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,fontWeight:700,color:tColor}}>{trend}</div>
          <div style={{fontSize:12,color:T2}}>{res.bullSig}B / {res.bearSig}Be</div>
        </div>
        <span style={{color:T2,fontSize:12,marginLeft:8}}>{detail?"v":">"}</span>
      </div>
      {detail?(
        <div style={{padding:"0 14px 12px",borderTop:"1px solid "+BD}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
            {[["RSI",detail.rsi,detail.rsi<40?G2:detail.rsi>60?R:BLUE],["EMA9",detail.ema9>=1000?(detail.ema9/1000).toFixed(1)+"K":detail.ema9,item.ltp>detail.ema9?G2:R],["VWAP",detail.vwap>=1000?(detail.vwap/1000).toFixed(1)+"K":detail.vwap,item.ltp>detail.vwap?G2:R]].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div>
                  <div style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[1]}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <div style={{flex:1,background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:8,padding:"8px 8px",textAlign:"center"}}>
              <div style={{fontSize:12,color:T2}}>Bullish</div>
              <div style={{fontSize:14,fontWeight:900,color:G2}}>{detail.bullSig}/5</div>
            </div>
            <div style={{flex:1,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"8px 8px",textAlign:"center"}}>
              <div style={{fontSize:12,color:T2}}>Bearish</div>
              <div style={{fontSize:14,fontWeight:900,color:R}}>{detail.bearSig}/5</div>
            </div>
            <div style={{flex:1,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 8px",textAlign:"center"}}>
              <div style={{fontSize:12,color:T2}}>Volatility</div>
              <div style={{fontSize:12,fontWeight:700,color:BLUE}}>{vol}</div>
            </div>
          </div>
        </div>
      ):null}
    </div>
  );
}

export default function MarketAnalysis() {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CB = theme.c.card, DB = theme.c.bg; T1=theme.c.text1;

  var [activeTab,setActiveTab]=useState("indices");
  var items=activeTab=="indices"?INDICES:STOCKS;
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:18,fontWeight:900,color:T1}}>Market <span style={{color:G}}>Analysis</span></div>
        <div style={{fontSize:12,color:theme.c.warn,fontWeight:700,letterSpacing:1,marginBottom:8}}>EDUCATIONAL - NOT INVESTMENT ADVICE</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
          <span style={{fontSize:12,color:T2}}>Simulated prices and candles for preview. Not live market values.</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["indices","Indices (6)"],["stocks","Stocks (20)"]].map(function(t){
            var act=activeTab==t[0];
            return <button key={t[0]} onClick={function(){setActiveTab(t[0]);}} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"8px 16px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>
      <div style={{padding:"12px 16px"}}>
        <div style={{background:"rgba(30,144,255,0.06)",border:"1px solid rgba(30,144,255,0.15)",borderRadius:10,padding:"8px 12px",marginBottom:12}}>
          <div style={{fontSize:12,color:"#1E90FF"}}>Tap any row to see RSI, EMA, VWAP analysis. Educational only.</div>
        </div>
        {items.map(function(item){return <AnalysisCard key={item.sym} item={item}/>;  })}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12,marginTop:4}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>This application is for educational purposes only. It does not provide investment advice or buy/sell recommendations. Users should conduct their own research before making any investment decisions.</div>
        </div>
      </div>
    </div>
  );
}
