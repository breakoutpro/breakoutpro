import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { JUSTIN } from "../JustInData";
import MarketBadge from "./MarketBadge";

// BreakoutPro - EquityHomeMobile.jsx
// The Mobile Home layout - UI only. All data comes from useHomeData(), the
// single shared hook also used by Tablet/Laptop/Desktop. This file owns its
// own presentational Card/Sparkline helpers so it can be edited
// freely without ever affecting the other device layouts.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeMobile(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var [levelsIdx, setLevelsIdx] = useState(0); // 0 = NIFTY, 1 = BANK NIFTY - Key Levels card tab
  var mm = data.mm;
  var fearGreedColor = data.fearGreed=="Fear" ? DOWN : (data.fearGreed=="Greed" ? UP : T2);

  function Card(p){
    return (
      <div style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:14,padding:p.hero?11:9,marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
            {p.icon ? <span style={{fontSize:13,flexShrink:0,lineHeight:1}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:12,fontWeight:800,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
          </div>
          {p.onDetails ? (
            <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:32,padding:"0 2px",flexShrink:0}}>Details &#8594;</button>
          ) : null}
        </div>
        {p.children}
      </div>
    );
  }

  var breakoutCards = data.breakoutCardsPool.slice(0, 3);

  return (
    <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",overflowX:"hidden",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* 1. HEADER */}
      <div style={{width:"100%",boxSizing:"border-box",background:BG,borderBottom:"1px solid "+BD,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
            <button onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:2,cursor:"pointer",flexShrink:0,minWidth:36,minHeight:36}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,whiteSpace:"nowrap",flexShrink:0}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
            <div style={{minWidth:0,overflow:"hidden"}}><MarketBadge/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",position:"relative",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:0,right:0,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
            </button>
          </div>
        </div>
      </div>

      {/* 2. JUST IN */}
      <div onClick={function(){props.setSelArticle(JUSTIN[data.tickerIdx]);}} style={{width:"100%",boxSizing:"border-box",background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",padding:"3px 6px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginRight:4,animation:"pulse-dot 1.4s infinite"}}/>
          <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:0.4,whiteSpace:"nowrap"}}>JUST IN</span>
        </div>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"6px 8px"}}>
          <span key={data.tickerIdx} style={{fontSize:11,color:T1,fontWeight:600,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden",animation:"ticker-fade 0.4s ease"}}>{data.ticker[data.tickerIdx]}</span>
        </div>
      </div>

      <div style={{width:"100%",boxSizing:"border-box",padding:"7px 9px 0"}}>

        {/* 3. MARKET SNAPSHOT - 5 indices, real data only */}
        <Card title="Market Snapshot" icon="&#128202;">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,width:"100%",boxSizing:"border-box"}}>
            {data.spineRows.map(function(r){
              var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
              return (
                <div key={r.key} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:8,padding:6}}>
                  <div style={{fontSize:9,color:T2,fontWeight:600}}>{r.label}</div>
                  {r.live ? (
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                      <div style={{fontSize:10,fontWeight:700,color:color}}>{r.dir=="up"?"+":""}{r.chgPct}%</div>
                    </div>
                  ) : <div style={{fontSize:10,color:T2}}>Data unavailable right now.</div>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. AI MARKET MOOD */}
        <Card title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
          {mm.status=="loading" && !mm.data ? (
            <div style={{fontSize:11,color:T2}}>Loading...</div>
          ) : !mm.mood || mm.mood.score==null || data.mktStatus!=="ok" ? (
            <div style={{fontSize:11,color:T2}}>Market mood unavailable</div>
          ) : (function(){
            var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
            return (
              <div style={{width:"100%",boxSizing:"border-box"}}>
                <div style={{fontSize:15,fontWeight:900,color:moodColor,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:5}}>{mm.mood.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>Confidence: {mm.mood.confidence}</span>
                  {data.fearGreed ? (
                    <span style={{fontSize:10,fontWeight:700,color:fearGreedColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>{data.fearGreed}</span>
                  ) : null}
                </div>
                <div style={{fontSize:11,color:T2,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mm.mood.stage}</div>
              </div>
            );
          })()}
        </Card>

        {/* 5. TODAY'S KEY LEVELS - HERO CARD - professional price-action ladder */}
        {/* 3. AI INTELLIGENCE ALERTS - derived from the same real Breakout
             Intelligence data below, not a separate fabricated engine */}
        <Card title="AI Intelligence Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
          {(function(){
            var signals = breakoutCards.filter(function(c){ return c.volumeConfirmed || c.category=="Strong Breakout"; }).slice(0,3);
            if(signals.length==0){
              return <div style={{fontSize:11,color:T2}}>Intelligence unavailable right now.</div>;
            }
            return signals.map(function(c){
              var tone = c.category=="Strong Breakout"?UP:(c.category=="Watching"?DOWN:theme.c.gold);
              return (
                <div key={c.sym} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                  <div style={{fontSize:11,fontWeight:800,color:tone}}>{c.category}</div>
                  <div style={{fontSize:10,color:T2}}>{c.sym} &middot; {c.volumeConfirmed?"Volume Confirmed":"Watch Volume"}</div>
                </div>
              );
            });
          })()}
        </Card>

        {/* 4. BREAKOUT INTELLIGENCE - real cards, same engine as Laptop/Desktop */}
        <Card title="Breakout Intelligence" icon="&#128640;" onDetails={function(){setTab("scan");}}>
          {breakoutCards.length===0 ? (
            <div style={{fontSize:11,color:T2}}>Breakout data unavailable right now.</div>
          ) : (
          <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",width:"100%",boxSizing:"border-box"}}>
            {breakoutCards.map(function(c){
              var up = c.chgPct>=0;
              var tone = c.category=="Strong Breakout"?UP:(c.category=="Watching"?DOWN:theme.c.gold);
              return (
                <div key={c.sym} onClick={function(){data.selectStock(c.sym);}} style={{flexShrink:0,minWidth:120,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:8,cursor:"pointer"}}>
                  <div style={{fontSize:9,fontWeight:800,color:tone,marginBottom:4}}>{c.category.toUpperCase()}</div>
                  <div style={{fontSize:12,fontWeight:800,color:T1}}>{c.sym}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{c.ltp.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{c.chgPct}%</div>
                </div>
              );
            })}
          </div>
          )}
        </Card>

        <Card title="Today's Key Levels" icon="&#128200;" hero={true}>
          {(function(){
            var syms = [["NIFTY 50", data.niftyZones], ["BANK NIFTY", data.bankZones]];
            var z = syms[levelsIdx][1];
            if(z.currentPrice==null){
              return <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>;
            }
            var trendColor = z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2);
            return (
              <div>
                {/* Tabs */}
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {syms.map(function(s,i){
                    var active = i==levelsIdx;
                    return (
                      <button key={s[0]} onClick={function(){setLevelsIdx(i);}} style={{flex:1,minWidth:0,background:active?BLUE:theme.c.card2,border:"1px solid "+(active?BLUE:BD),borderRadius:8,padding:"6px 4px",color:active?"#fff":T2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s[0]}</button>
                    );
                  })}
                </div>

                {/* Current price + trend */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:15,fontWeight:900,color:T1,fontFamily:"monospace"}}>Rs {z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
                  <span style={{fontSize:10,fontWeight:700,color:trendColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:14,padding:"2px 8px"}}>{z.trend}</span>
                </div>
                {!z.priceIsLive ? <div style={{fontSize:10,color:T2,marginBottom:6}}>Data unavailable right now - showing last known reference</div> : null}

                {/* Ladder: R2, R1, Current Price (highlighted), S1, S2 */}
                <div style={{width:"100%",boxSizing:"border-box"}}>
                  {z.resistance2 ? (
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px"}}>
                      <span style={{fontSize:10,color:T2,fontWeight:700}}>R2</span>
                      <span style={{fontSize:11,fontWeight:800,color:DOWN}}>Rs {z.resistance2.price}</span>
                    </div>
                  ) : null}
                  {z.resistance ? (
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px"}}>
                      <span style={{fontSize:10,color:T2,fontWeight:700}}>R1</span>
                      <span style={{fontSize:12,fontWeight:800,color:DOWN}}>Rs {z.resistance.price}</span>
                    </div>
                  ) : null}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:theme.c.gold+"1A",borderLeft:"3px solid "+theme.c.gold,borderRadius:4,margin:"3px 0"}}>
                    <span style={{fontSize:10,color:theme.c.gold,fontWeight:800}}>CURRENT</span>
                    <span style={{fontSize:12,fontWeight:900,color:theme.c.gold}}>Rs {z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
                  </div>
                  {z.support ? (
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px"}}>
                      <span style={{fontSize:10,color:T2,fontWeight:700}}>S1</span>
                      <span style={{fontSize:12,fontWeight:800,color:UP}}>Rs {z.support.price}</span>
                    </div>
                  ) : null}
                  {z.support2 ? (
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px"}}>
                      <span style={{fontSize:10,color:T2,fontWeight:700}}>S2</span>
                      <span style={{fontSize:11,fontWeight:800,color:UP}}>Rs {z.support2.price}</span>
                    </div>
                  ) : null}
                </div>

                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8,marginBottom:10}}>
                  <div style={{fontSize:10,color:T2}}>Strength: <span style={{fontWeight:700,color:T1}}>{z.support?z.support.strength:"--"}</span></div>
                  <div style={{fontSize:10,color:T2}}>R:R: <span style={{fontWeight:700,color:T1}}>{z.riskReward!=null?z.riskReward+":1":"--"}</span></div>
                  <div style={{fontSize:10,color:T2,gridColumn:"1 / -1"}}>Next Key Level: <span style={{fontWeight:700,color:T1}}>{z.nextKeyLevel!=null?("Rs "+z.nextKeyLevel):"--"}</span></div>
                </div>

                <div style={{borderTop:"1px solid "+BD,margin:"0 0 10px"}}></div>
                <div style={{display:"flex",gap:8,width:"100%",boxSizing:"border-box"}}>
                  <button onClick={function(){setTab("alerts");}} style={{flex:1,minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:9,padding:"9px 4px",color:T1,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:12}}>&#128276;</span>Alert</button>
                  <button onClick={function(){setTab("pazones");}} style={{flex:1,minWidth:0,background:BLUE,border:"none",borderRadius:9,padding:"9px 4px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:12}}>&#128202;</span>View Full Price Action &#8594;</button>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* SEBI-compliant disclaimer for the Key Levels card - small, subtle, not visually dominant */}
        <div style={{fontSize:9,color:T3,lineHeight:1.4,padding:"0 2px 8px",textAlign:"center"}}>
          Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.
        </div>

        <Card title="Market Impact News" icon="&#128240;" onDetails={function(){setTab("news");}}>
          {JUSTIN.length==0 ? (
            <div style={{fontSize:11,color:T2}}>No major market-impacting news right now.</div>
          ) : JUSTIN.slice(0,3).map(function(n){
            var impactColor = n.impact=="Bullish"?UP:(n.impact=="Bearish"?DOWN:T2);
            return (
              <div key={n.id} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                <div style={{fontSize:10,fontWeight:700,color:impactColor}}>Impact: {n.impact}</div>
              </div>
            );
          })}
        </Card>

        <Card title="Options Intelligence" icon="&#128202;">
          {/* PCR/Max Pain/Gamma/Call Wall/Put Wall are not shown here - no
              live options-chain API is connected. The prior source
              (getOptionsIntel) returned hardcoded demo strings, which is
              exactly the fabricated-data pattern this must not show. */}
          <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>
        </Card>

        {/* 7. FUTURES PULSE - no real futures price/OI data source exists
             anywhere in this codebase (FuturesIntel/FuturesData are purely
             educational glossary content), so this shows honestly rather
             than inventing futures prices */}
        <Card title="Futures Pulse" icon="&#128200;">
          <div style={{fontSize:11,color:T2}}>Futures data unavailable right now.</div>
        </Card>

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
