import { useState, useRef, useEffect } from "react";
import { SYMBOLS, calcEMA, calcRSI, calcMACD, findSupportResistance, determineTrend, calcTechnicalVolatility } from "./StockResearchProData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - StockResearchPro.jsx
// AI Stock Research Pro. IMPORTANT SCOPE NOTE: Breakout Pro has no real
// company-fundamentals data source anywhere (no financials, shareholding,
// valuation, SWOT, competitor, or sector-comparison API exists in this
// app). Rather than fabricate that data for an arbitrary searched stock -
// which would be actively misleading for real financial decisions - this
// screen provides REAL technical analysis only, computed from the same
// real /api/history.js endpoint Chart.jsx already uses (not a duplicate
// API), and clearly labels every fundamentals-dependent section as
// unavailable instead of inventing numbers.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function UnavailableCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T3 = theme.c.text3;

  return (
    <div style={{background:CARD,border:"1px dashed "+BD,borderRadius:16,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:T3,lineHeight:1.6}}>Not available - Breakout Pro has no real data source for this section. Shown honestly rather than invented.</div>
    </div>
  );
}

export default function StockResearchPro(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, R = theme.c.down, T3 = theme.c.text3, UP = theme.c.up, T2 = theme.c.gold; T1=theme.c.text1;

  var onBack = props.onBack || function(){};
  var [symIdx, setSymIdx] = useState(3); // default RELIANCE
  var [status, setStatus] = useState("loading");
  var [candles, setCandles] = useState([]);
  var abortRef = useRef(null);
  var mountedRef = useRef(true);

  useEffect(function(){
    mountedRef.current = true;
    load();
    return function(){ mountedRef.current=false; if(abortRef.current){ try{abortRef.current.abort();}catch(e){} } };
  }, [symIdx]);

  function load(){
    if(abortRef.current){ try{ abortRef.current.abort(); }catch(e){} }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    var api = SYMBOLS[symIdx].api;
    fetch("/api/history?symbol="+encodeURIComponent(api)+"&range=6mo&interval=1d",{signal:ctrl.signal})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        if(data && data.candles && data.candles.length>0){
          var mapped = data.candles.filter(function(c){
            return isFinite(c.open)&&isFinite(c.high)&&isFinite(c.low)&&isFinite(c.close);
          });
          setCandles(mapped);
          setStatus(mapped.length>0 ? "ok" : "empty");
        } else {
          setCandles([]); setStatus("empty");
        }
      })
      .catch(function(e){
        if(e && e.name=="AbortError") return;
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        setCandles([]); setStatus("error");
      });
  }

  var closes = candles.map(function(c){ return c.close; });
  var ema9 = closes.length ? calcEMA(closes,9) : [];
  var ema21 = closes.length ? calcEMA(closes,21) : [];
  var rsi = closes.length ? calcRSI(closes,14) : null;
  var macd = closes.length ? calcMACD(closes) : null;
  var sr = candles.length ? findSupportResistance(candles) : null;
  var trend = closes.length ? determineTrend(closes) : null;
  var vol = closes.length ? calcTechnicalVolatility(closes) : null;
  var lastClose = closes.length ? closes[closes.length-1] : null;
  var lastVolume = candles.length ? candles[candles.length-1].volume : null;

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>AI Stock Research Pro</div>
          <div style={{fontSize:12,color:T2}}>Real technical data only. Educational, not investment advice.</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.6}}>Breakout Pro does not have a real company-fundamentals data source. Company Overview, Financials, Shareholding, Valuation, SWOT, Timeline, Competitors, Similar Stocks, and Sector Comparison are shown as honestly unavailable below rather than invented. Only the symbols already proven real for this app (the same 8 used in Chart) can be researched here.</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>SELECT SYMBOL</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {SYMBOLS.map(function(s,i){
            var act = i==symIdx;
            return <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{s.sym}</button>;
          })}
        </div>

        {status=="loading" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T2,fontSize:12}}>Loading real historical data...</div>
        ) : status=="error" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:R,fontSize:12}}>Data temporarily unavailable. <button onClick={load} style={{background:"none",border:"1px solid "+BLUE,borderRadius:16,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Retry</button></div>
        ) : status=="empty" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No real data available for this symbol right now.</div>
        ) : (
          <div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>TECHNICAL ANALYSIS (real, computed from actual price history)</div>
              <Row label="Last Close" value={lastClose!=null?lastClose.toFixed(2):"--"}/>
              <Row label="Trend" value={trend||"--"} color={trend=="Uptrend"?UP:trend=="Downtrend"?R:T1}/>
              <Row label="EMA 9" value={ema9.length?ema9[ema9.length-1].toFixed(2):"--"}/>
              <Row label="EMA 21" value={ema21.length?ema21[ema21.length-1].toFixed(2):"--"}/>
              <Row label="RSI (14)" value={rsi!=null?rsi.toFixed(1):"Insufficient data"} color={rsi!=null?(rsi>70?R:rsi<30?UP:T1):T3}/>
              <Row label="MACD" value={macd?macd.macd.toFixed(3):"Insufficient data"}/>
              <Row label="MACD Signal" value={macd?macd.signal.toFixed(3):"Insufficient data"}/>
              <Row label="Volume (latest session)" value={lastVolume!=null?lastVolume.toLocaleString("en-IN"):"--"}/>
              <Row label="Support (30-session low)" value={sr?sr.support.toFixed(2):"--"}/>
              <Row label="Resistance (30-session high)" value={sr?sr.resistance.toFixed(2):"--"} last={true}/>
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>TECHNICAL VOLATILITY (real, computed - not a fundamentals risk score)</div>
              {vol ? (
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:vol.label=="Low"?UP:vol.label=="High"?R:T2}}>{vol.label}</div>
                  <div style={{fontSize:12,color:T2,marginTop:4}}>Recent daily price swings averaging {vol.stdDevPct.toFixed(2)}% - a real measure of recent volatility, not a prediction.</div>
                </div>
              ) : <div style={{fontSize:12,color:T3}}>Insufficient data.</div>}
            </div>

            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>AI SUMMARY (rule-based, only from the real data above)</div>
              <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.7}}>
                {trend=="Uptrend" ? "Price has closed higher on most of the last 10 sessions, consistent with an uptrend structure. " : trend=="Downtrend" ? "Price has closed lower on most of the last 10 sessions, consistent with a downtrend structure. " : "Price has moved without a clear directional bias over the last 10 sessions. "}
                {rsi!=null ? (rsi>70 ? "RSI is above 70, a level some chart readers watch for overbought conditions. " : rsi<30 ? "RSI is below 30, a level some chart readers watch for oversold conditions. " : "RSI is in a neutral range. ") : ""}
                {vol ? ("Recent volatility is "+vol.label.toLowerCase()+" based on actual daily price swings. ") : ""}
                This summary only restates the real technical figures above - it does not predict future price movement and does not account for fundamentals, which Breakout Pro does not have real data for.
              </div>
            </div>

            <UnavailableCard title="Company Overview"/>
            <UnavailableCard title="Business Summary, Market Cap, Sector, Industry, CEO, Website"/>
            <UnavailableCard title="Financial Analysis (Revenue, Net Profit, EPS, ROE, ROCE, Debt to Equity, Book Value, Dividend Yield)"/>
            <UnavailableCard title="Shareholding (Promoters, FII, DII, Public)"/>
            <UnavailableCard title="Valuation (PE, PB, EV/EBITDA)"/>
            <UnavailableCard title="SWOT Analysis"/>
            <UnavailableCard title="Fundamentals-Based Risk Score and Checklist"/>
            <UnavailableCard title="Company Timeline"/>
            <UnavailableCard title="Competitors"/>
            <UnavailableCard title="Similar Stocks"/>
            <UnavailableCard title="Sector Comparison"/>
          </div>
        )}
      </div>
    </div>
  );
}

function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border; T1=theme.c.text1;

  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:props.color||T1}}>{props.value}</span>
    </div>
  );
}
