import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - StockDetailTabs2.jsx
// Technical + Options + AI tab content. Pure black, green/red only for direction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Sec(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;

  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:9}}>{props.title}</div>
      {props.children}
    </div>
  );
}

export function TechnicalTab(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, GOLD = theme.c.gold, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var t=props.d.technical;
  var levels=[["R2",t.r2],["R1",t.r1],["Pivot",t.pivot],["S1",t.s1],["S2",t.s2]];
  return (
    <div>
      <Sec title="TREND">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:t.trend=="Uptrend"?UP:t.trend=="Downtrend"?DOWN:GOLD}}>{t.trend}</div>
        </div>
      </Sec>

      <Sec title="KEY LEVELS TODAY">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {levels.map(function(l,i){
            var isR=l[0].charAt(0)=="R",isS=l[0].charAt(0)=="S";
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 13px",borderBottom:i<levels.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11,color:isR?DOWN:isS?UP:T2,fontWeight:700}}>{l[0]}</span>
                <span style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>Rs {l[1].toLocaleString("en-IN")}</span>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="INDICATORS">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["EMA 20","Rs "+t.ema20],["EMA 50","Rs "+t.ema50],["VWAP","Rs "+t.vwap],["RSI",t.rsi],["MACD",t.macd]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 11px"}}>
                <div style={{fontSize:9,color:T2}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginTop:3}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
      </Sec>
    </div>
  );
}

export function OptionsTab(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, GOLD = theme.c.gold, T2 = theme.c.text2; T1=theme.c.text1;

  var o=props.d.options;
  return (
    <div>
      <Sec title="OPTIONS INTELLIGENCE">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {[["PCR",o.pcr],["Max Pain",o.maxPain],["Call Wall",o.callWall],["Put Wall",o.putWall],["IV",o.iv],["OI Trend",o.oiTrend]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 11px"}}>
                <div style={{fontSize:9,color:T2}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginTop:3}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="ADVANCED OPTION SIGNALS">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {o.signals.map(function(s,i){
            return (
              <div key={i} style={{padding:"11px 13px",borderBottom:i<o.signals.length-1?"1px solid "+BD:"none"}}>
                <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:10,color:T2,lineHeight:1.5}}>{s.note}</div>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="DELIVERY ANALYSIS">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          {[["Delivery %",props.d.delivery.delPct],["Volume",props.d.delivery.volume],["Avg Vol",props.d.delivery.avgVol]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:T2}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:800,color:T1,marginTop:3}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
          <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:4}}>Phase: {props.d.delivery.phase}</div>
          <div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{props.d.delivery.note}</div>
        </div>
      </Sec>
    </div>
  );
}

export function AITab(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, GOLD = theme.c.gold, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var d=props.d;
  var ai=d.ai;
  var probs=[["Bullish",ai.bull,UP],["Bearish",ai.bear,DOWN],["Sideways",ai.side,GOLD]];
  return (
    <div>
      <Sec title="AI PROBABILITY ANALYSIS">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14}}>
          {probs.map(function(p,i){
            return (
              <div key={i} style={{marginBottom:i<probs.length-1?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11.5,color:T1,fontWeight:600}}>{p[0]}</span>
                  <span style={{fontSize:12,fontWeight:800,color:p[2]}}>{p[1]}%</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                  <div style={{height:6,width:p[1]+"%",background:p[2],borderRadius:3}}></div>
                </div>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="TRADING STYLE SCORE">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {d.scores.map(function(s,i){
            var stars="";
            for(var k=0;k<5;k++){stars+=(k<s.stars?"&#9733;":"&#9734;");}
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 13px",borderBottom:i<d.scores.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11.5,color:T1}}>{s.label}</span>
                <span style={{fontSize:13,color:GOLD}} dangerouslySetInnerHTML={{__html:stars}}/>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="STRENGTHS">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
          {d.strengths.map(function(x,i){
            return <div key={i} style={{fontSize:11.5,color:T1,padding:"4px 0"}}><span style={{color:UP}}>&#10003;</span>  {x}</div>;
          })}
        </div>
      </Sec>

      <Sec title="RISKS">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
          {d.risks.map(function(x,i){
            return <div key={i} style={{fontSize:11.5,color:T1,padding:"4px 0"}}><span style={{color:DOWN}}>&#33;</span>  {x}</div>;
          })}
        </div>
      </Sec>

      <Sec title="STOCK CHARACTERISTICS">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["Volatility",d.opinion.longterm],["Liquidity",d.opinion.swing],["Trend Style",d.opinion.intraday]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 6px",textAlign:"center"}}>
                <div style={{fontSize:8.5,color:T2,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:11,fontWeight:800,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
      </Sec>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:4}}>
        <div style={{fontSize:9,color:theme.c.warn,lineHeight:1.5}}>Educational analysis only. Not SEBI registered. Not investment advice. No buy or sell recommendation.</div>
      </div>
    </div>
  );
}
