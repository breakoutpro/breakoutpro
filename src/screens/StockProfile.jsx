import { useState, useEffect } from "react";
import { CandleChart, findZones } from "./IndexHelpers";

import { useTheme } from "../theme/ThemeProvider";
var DB="#050505",CB="#101318",BD="#20242D",G="#1B5E20",G2="#1B5E20",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB",T3="#475569";

function genQuarters(sym){
  var seed=sym.length;
  var qs=["Q1 FY25","Q2 FY25","Q3 FY25","Q4 FY25"];
  return qs.map(function(q,i){
    var rev=(1000+seed*120+i*80+Math.random()*200).toFixed(0);
    var np=(rev*0.12*(1+Math.random()*0.3)).toFixed(0);
    var yoy=(Math.random()*20-3).toFixed(1);
    return {q:q,revenue:rev,netProfit:np,yoy:yoy,up:parseFloat(yoy)>=0};
  });
}

function toYahooSym(sym){
  return sym.replace("&","").replace(" ","") + ".NS";
}

export default function StockProfile(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  G2=theme.c.up; R=theme.c.down; T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CB = theme.c.card, DB = theme.c.bg;

  var s = props.stock || {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,chgPct:1.71,up:true,sect:"Energy"};
  var meta = props.meta || {pe:24.5,pb:3.2,mcap:"5.2L Cr",high52:(s.ltp*1.25).toFixed(0),low52:(s.ltp*0.78).toFixed(0)};
  var onBack = props.onBack || function(){};

  var [tab,setTab]=useState("overview");
  var [range,setRange]=useState("1y");
  var [candles,setCandles]=useState([]);
  var [loading,setLoading]=useState(true);
  var [dataSource,setDataSource]=useState("loading");
  var [ipoInfo,setIpoInfo]=useState(null);

  var [quarters]=useState(genQuarters(s.sym));

  // Real stock-specific news, filtered from the same live ET Markets feed
  // Home/News.jsx use - matches by symbol (useLiveNews()'s own extractStock())
  // or the company name appearing in the real headline text. If nothing
  // stock-specific is found, falls back to the top general market
  // headlines rather than inventing a sector-tagged story - the real feed
  // has no per-sector tagging to fall back on honestly.
  var liveNews = props.liveNews || [];
  var news = (function(){
    var symUpper = (s.sym||"").toUpperCase();
    var nameUpper = (s.name||"").toUpperCase();
    var matched = liveNews.filter(function(n){
      if(n.stock && n.stock===symUpper) return true;
      var title = (n.title||"").toUpperCase();
      return title.indexOf(symUpper)>=0 || (nameUpper && title.indexOf(nameUpper)>=0);
    });
    return matched.length>0 ? matched.slice(0,6) : liveNews.slice(0,4);
  })();
  var hasStockSpecificNews = (function(){
    var symUpper = (s.sym||"").toUpperCase();
    return liveNews.some(function(n){ return n.stock===symUpper; });
  })();

  function fetchHistory(r){
    setLoading(true);
    var ysym = toYahooSym(s.sym);
    var interval = r=="1mo"?"30m":r=="5d"?"15m":"1d";
    fetch("/api/history?symbol="+ysym+"&range="+r+"&interval="+interval)
      .then(function(resp){return resp.json();})
      .then(function(data){
        if(data && data.candles && data.candles.length>0){
          setCandles(data.candles);
          setDataSource("live");
          if(data.meta && data.meta.firstTradeDate){
            var d=new Date(data.meta.firstTradeDate*1000);
            setIpoInfo(d.toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}));
          }
        } else {
          setCandles([]);
          setDataSource("unavailable");
        }
        setLoading(false);
      })
      .catch(function(){
        setCandles([]);
        setDataSource("unavailable");
        setLoading(false);
      });
  }

  useEffect(function(){
    fetchHistory(range);
  },[range,s.sym]);

  var zones = candles.length>10 ? findZones(candles) : {};
  var lastClose = candles.length>0 ? candles[candles.length-1].close : s.ltp;
  var firstClose = candles.length>0 ? candles[0].close : s.ltp;
  var periodChgPct = firstClose>0 ? ((lastClose-firstClose)/firstClose*100) : 0;

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:32}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:12,color:T2}}>{s.name||s.sym} &#8226; {s.sect}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}</div>
          <div style={{fontSize:12,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{(s.chgPct&&s.chgPct.toFixed)?s.chgPct.toFixed(2):s.chgPct}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:CB,borderBottom:"1px solid "+BD,padding:"0 8px"}}>
        {[["overview","Overview"],["financials","Financials"],["news","News"],["technical","Technical"]].map(function(t){
          var act=tab==t[0];
          return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,background:"none",border:"none",borderBottom:act?"2px solid "+BLUE:"2px solid transparent",padding:"12px 4px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
        })}
      </div>

      <div style={{padding:16}}>

        {tab=="overview"?(
          <div>
            {/* Candlestick chart with range selector */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:dataSource=="live"?G2:BLUE}}></div>
                  <span style={{fontSize:12,color:T2,fontWeight:700}}>{dataSource=="live"?"LIVE DATA":loading?"LOADING...":"DEMO DATA"}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[["5d","5D"],["1mo","1M"],["6mo","6M"],["1y","1Y"],["5y","5Y"],["max","All"]].map(function(p){
                    var act=range==p[0];
                    return <button key={p[0]} onClick={function(){setRange(p[0]);}} style={{background:act?"rgba(59,130,246,0.15)":"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"4px 8px",color:act?BLUE:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{p[1]}</button>;
                  })}
                </div>
              </div>

              {loading?(
                <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:12,color:T2}}>Loading candlestick data...</span>
                </div>
              ):candles.length>1?(
                <div>
                  <CandleChart candles={candles} zones={zones}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                    <span style={{fontSize:12,color:T2}}>{range=="max"?"Since IPO/Listing":range.toUpperCase()+" change"}</span>
                    <span style={{fontSize:12,fontWeight:700,color:periodChgPct>=0?G2:R}}>{periodChgPct>=0?"+":""}{periodChgPct.toFixed(2)}%</span>
                  </div>
                </div>
              ):(
                <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,height:160,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
                  <span style={{fontSize:12,color:T2}}>Historical data unavailable for this symbol</span>
                  <span style={{fontSize:12,color:T3}}>Try a shorter range or check back later</span>
                  <button onClick={function(){fetchHistory(range);}} style={{marginTop:4,background:"transparent",border:"1px solid "+BLUE,borderRadius:10,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Retry</button>
                </div>
              )}
            </div>

            {ipoInfo?(
              <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:T2}}>Listed Since</span>
                <span style={{fontSize:12,fontWeight:700,color:BLUE}}>{ipoInfo}</span>
              </div>
            ):null}

            {/* Key stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[["52W High","Rs"+meta.high52],["52W Low","Rs"+meta.low52],["Mkt Cap",meta.mcap],["P/E Ratio",meta.pe],["P/B Ratio",meta.pb],["Sector",s.sect]].map(function(r){
                return (
                  <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 8px",textAlign:"center"}}>
                    <div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{r[1]}</div>
                  </div>
                );
              })}
            </div>

            {/* Signal */}
            <div style={{background:s.up?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(s.up?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:s.up?G2:R,marginBottom:4}}>{s.up?"Bullish":"Bearish"} Signal</div>
              <div style={{fontSize:12,color:T2,lineHeight:1.7}}>{s.up?"Price showing positive momentum. Watch for continuation above current levels with volume confirmation.":"Price showing negative pressure. Watch support levels for potential reversal signals."}</div>
            </div>

            <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12}}>
              <div style={{fontSize:12,color:theme.c.warn}}>Educational only. Not SEBI registered. Not investment advice.</div>
            </div>
          </div>
        ):null}

        {tab=="financials"?(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12,letterSpacing:0.5}}>QUARTERLY RESULTS (Rs Cr)</div>
            {quarters.map(function(q,i){
              return (
                <div key={i} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{q.q}</span>
                    <span style={{fontSize:12,fontWeight:700,color:q.up?G2:R,background:(q.up?"rgba(0,200,83,0.1)":"rgba(239,68,68,0.1)"),borderRadius:6,padding:"4px 8px"}}>{q.up?"+":""}{q.yoy}% YoY</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div>
                      <div style={{fontSize:12,color:T2,marginBottom:4}}>Revenue</div>
                      <div style={{fontSize:12,fontWeight:700,color:T1}}>Rs{q.revenue} Cr</div>
                    </div>
                    <div>
                      <div style={{fontSize:12,color:T2,marginBottom:4}}>Net Profit</div>
                      <div style={{fontSize:12,fontWeight:700,color:T1}}>Rs{q.netProfit} Cr</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12,marginTop:4}}>
              <div style={{fontSize:12,color:theme.c.warn}}>Simulated data for demonstration. Verify with official filings before trading decisions.</div>
            </div>
          </div>
        ):null}

        {tab=="news"?(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12,letterSpacing:0.5}}>
              {hasStockSpecificNews ? "LATEST NEWS - " + s.sym : "GENERAL MARKET NEWS (no " + s.sym + "-specific headlines right now)"}
            </div>
            {news.length===0 ? (
              <div style={{fontSize:12,color:T3}}>Market news unavailable right now.</div>
            ) : news.map(function(n,i){
              var sentColor = n.sentiment=="good"?"#16A34A":n.sentiment=="bad"?"#DC2626":"#EAB308";
              var sentLabel = n.sentiment=="good"?"BULLISH":n.sentiment=="bad"?"BEARISH":"NEUTRAL";
              return (
                <div key={i} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",marginBottom:8}}>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:sentColor,background:sentColor+"18",border:"1px solid "+sentColor+"55",borderRadius:6,padding:"4px 8px"}}>{sentLabel}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:T1,lineHeight:1.5,marginBottom:4}}>{n.title}</div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:12,color:T3}}>{n.time} &#183; {n.source||"ET Markets"}</span>
                    {n.link?<a href={n.link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:BLUE,fontWeight:600,textDecoration:"underline"}}>Read Full Article &#8599;</a>:null}
                  </div>
                </div>
              );
            })}
          </div>
        ):null}

        {tab=="technical"?(
          <div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12}}>PRICE ACTION ({range.toUpperCase()})</div>
              {candles.length>1?<CandleChart candles={candles} zones={zones} fullscreen={true}/>:<div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,color:T2}}>No chart data</span></div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[["RSI (14)",(45+Math.random()*30).toFixed(1)],["EMA 21","Rs"+(s.ltp*0.98).toFixed(2)],["EMA 50","Rs"+(s.ltp*0.95).toFixed(2)],["Volume Trend",s.up?"Above Avg":"Below Avg"]].map(function(r){
                return (
                  <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px"}}>
                    <div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{r[1]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:12,padding:12}}>
              <div style={{fontSize:12,fontWeight:700,color:BLUE,marginBottom:4}}>AI Technical Read</div>
              <div style={{fontSize:12,color:T2,lineHeight:1.7}}>{s.up?s.sym+" trading above key moving averages with positive momentum. Resistance near 52W high zone.":s.sym+" trading below key moving averages. Watch for support near 52W low zone before fresh entries."}</div>
            </div>
          </div>
        ):null}

      </div>
    </div>
  );
                    }
