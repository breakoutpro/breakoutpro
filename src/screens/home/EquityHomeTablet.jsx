import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { JUSTIN } from "../JustInData";
import { GAINERS, LOSERS, SECTORS } from "../HomeData";
import { DEMO_STOCKS } from "../../data/marketsStocks";
import { formatMarketPrice, UNAVAILABLE_TEXT } from "../../utils/formatMarketPrice";
import MarketBadge from "./MarketBadge";
import { SkeletonCard } from "../../components/Skeleton";

// BreakoutPro - EquityHomeTablet.jsx
// Tablet Home layout - independent from Mobile and from Laptop/Desktop.
// Initially reuses the same dense-dashboard approach as Desktop as a
// starting point; this file can be re-tuned for tablet specifically later
// without touching any other device's layout.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeTablet(props){
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

  function SummaryCard(p){
    return (
      <div onClick={p.onDetails||undefined} style={{background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:16,padding:p.hero?18:16,boxSizing:"border-box",minWidth:0,overflow:"hidden",height:"100%",display:"flex",flexDirection:"column",cursor:p.onDetails?"pointer":"default"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {p.icon ? <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:p.hero?15:14,fontWeight:800,color:T1}}>{p.title}</span>
          </div>
        </div>
        <div style={{flex:1}}>{p.children}</div>
      </div>
    );
  }

  var breakoutCards = data.breakoutCardsPool.slice(0, 4);
  var breadth = (function(){
    var adv=0, dec=0, flat=0;
    DEMO_STOCKS.forEach(function(s){ if(s.chgPct>0) adv++; else if(s.chgPct<0) dec++; else flat++; });
    return {adv:adv, dec:dec, flat:flat, total:DEMO_STOCKS.length};
  })();

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:40,color:T1,overflowX:"hidden"}}>
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
          </div>
          <MarketBadge/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
      </div>

      <div onClick={function(){props.setSelArticle(JUSTIN[data.tickerIdx]);}} style={{background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",padding:"4px 8px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:0.6,whiteSpace:"nowrap"}}>JUST IN</span>
        </div>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"8px 12px"}}>
          <span style={{fontSize:12,color:T1,fontWeight:600}}>{data.ticker[data.tickerIdx]}</span>
        </div>
      </div>

      <div style={{padding:"12px 16px 0",display:"flex",gap:8,minWidth:0,boxSizing:"border-box"}}>
        {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["Option Chain","oi","&#128200;"]].map(function(q){
          return (
            <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{flex:1,minWidth:0,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:q[2]}}/>
              <span style={{fontSize:11,fontWeight:700,color:T2}}>{q[0]}</span>
            </button>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:16,padding:"16px 16px 0",minWidth:0,boxSizing:"border-box"}}>

        <SummaryCard title="Market Snapshot" icon="&#128202;">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",boxSizing:"border-box"}}>
            {data.spineRows.map(function(r){
              var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
              return (
                <div key={r.key} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:8,padding:8}}>
                  <div style={{fontSize:10,color:T2,fontWeight:600}}>{r.label}</div>
                  {r.live ? (
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{formatMarketPrice(r.ltp)}</div>
                      <div style={{fontSize:11,fontWeight:700,color:color}}>{r.dir=="up"?"+":""}{r.chgPct}%</div>
                    </div>
                  ) : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                </div>
              );
            })}
          </div>
        </SummaryCard>

        <SummaryCard title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
          {mm.status=="loading" && !mm.data ? (
            <SkeletonCard height={90}/>
          ) : !mm.mood || mm.mood.score==null || data.mktStatus!=="ok" ? <div style={{fontSize:12,color:T2}}>Market mood unavailable</div> : (function(){
            var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
            return (
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:15,fontWeight:900,color:moodColor}}>{mm.mood.label}</span>
                  <span style={{fontSize:11,color:T2}}>Confidence: <span style={{fontWeight:700,color:T1}}>{mm.mood.confidence}</span></span>
                </div>
                {data.fearGreed ? (
                  <div style={{display:"inline-block",background:theme.c.card2,border:"1px solid "+BD,borderRadius:20,padding:"3px 10px",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:fearGreedColor}}>{data.fearGreed}</span>
                  </div>
                ) : null}
                <div style={{fontSize:12,color:T2,lineHeight:1.4}}>{mm.mood.stage}</div>
              </div>
            );
          })()}
        </SummaryCard>

        <SummaryCard title="AI Intelligence Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
          {(function(){
            var signals = breakoutCards.filter(function(c){ return c.volumeConfirmed || c.category=="Strong Breakout"; }).slice(0,3);
            if(signals.length==0){
              return <div style={{fontSize:12,color:T2}}>Intelligence unavailable right now.</div>;
            }
            return signals.map(function(c){
              var tone = c.category=="Strong Breakout"?UP:(c.category=="Watching"?DOWN:theme.c.gold);
              return (
                <div key={c.sym} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                  <div style={{fontSize:12,fontWeight:800,color:tone}}>{c.category}</div>
                  <div style={{fontSize:11,color:T2}}>{c.sym} &middot; {c.volumeConfirmed?"Volume Confirmed":"Watch Volume"}</div>
                </div>
              );
            });
          })()}
        </SummaryCard>

        <SummaryCard title="Breakout Intelligence" icon="&#128640;" onDetails={function(){setTab("scan");}}>
          {breakoutCards.length===0 ? (
            <div style={{fontSize:12,color:T2}}>Breakout data unavailable right now.</div>
          ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:8,width:"100%",boxSizing:"border-box"}}>
            {breakoutCards.map(function(c){
              var up = c.chgPct>=0;
              var tone = c.category=="Strong Breakout"?UP:(c.category=="Watching"?DOWN:theme.c.gold);
              return (
                <div key={c.sym} onClick={function(e){e.stopPropagation(); data.selectStock(c.sym);}} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:8,cursor:"pointer"}}>
                  <div style={{fontSize:9,fontWeight:800,color:tone,marginBottom:4}}>{c.category.toUpperCase()}</div>
                  <div style={{fontSize:12,fontWeight:800,color:T1}}>{c.sym}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{formatMarketPrice(c.ltp,{maximumFractionDigits:0})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{c.chgPct}%</div>
                </div>
              );
            })}
          </div>
          )}
        </SummaryCard>

        <div style={{gridColumn:"span 2"}}>
          <SummaryCard title="Today's Key Levels" icon="&#128200;" hero={true} onDetails={function(){setTab("pazones");}}>
            {(function(){
              var syms = [["NIFTY 50", data.niftyZones], ["BANK NIFTY", data.bankZones]];
              var z = syms[levelsIdx][1];
              if(z.currentPrice==null){
                return <div style={{fontSize:12,color:T2}}>Data unavailable right now.</div>;
              }
              var trendColor = z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2);
              return (
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:12}} onClick={function(e){e.stopPropagation();}}>
                    {syms.map(function(s,i){
                      var active = i==levelsIdx;
                      return (
                        <button key={s[0]} onClick={function(){setLevelsIdx(i);}} style={{flex:1,minWidth:0,background:active?BLUE:theme.c.card2,border:"1px solid "+(active?BLUE:BD),borderRadius:9,padding:"7px 4px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s[0]}</button>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:17,fontWeight:900,color:T1,fontFamily:"monospace"}}>{formatMarketPrice(z.currentPrice)}</span>
                    <span style={{fontSize:11,fontWeight:700,color:trendColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"3px 9px"}}>{z.trend}</span>
                  </div>
                  {!z.priceIsLive ? <div style={{fontSize:11,color:T2,marginBottom:8}}>Data unavailable right now - showing last known reference</div> : <div style={{marginBottom:8}}></div>}
                  <div style={{width:"100%",boxSizing:"border-box"}}>
                    {z.resistance2 ? (
                      <div style={{display:"flex",justifyContent:"space-between",padding:"5px 10px"}}>
                        <span style={{fontSize:11,color:T2,fontWeight:700}}>R2</span>
                        <span style={{fontSize:12,fontWeight:800,color:DOWN}}>Rs {z.resistance2.price}</span>
                      </div>
                    ) : null}
                    {z.resistance ? (
                      <div style={{display:"flex",justifyContent:"space-between",padding:"5px 10px"}}>
                        <span style={{fontSize:11,color:T2,fontWeight:700}}>R1</span>
                        <span style={{fontSize:13,fontWeight:800,color:DOWN}}>Rs {z.resistance.price}</span>
                      </div>
                    ) : null}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:theme.c.gold+"1A",borderLeft:"3px solid "+theme.c.gold,borderRadius:4,margin:"4px 0"}}>
                      <span style={{fontSize:11,color:theme.c.gold,fontWeight:800}}>CURRENT</span>
                      <span style={{fontSize:13,fontWeight:900,color:theme.c.gold}}>{formatMarketPrice(z.currentPrice)}</span>
                    </div>
                    {z.support ? (
                      <div style={{display:"flex",justifyContent:"space-between",padding:"5px 10px"}}>
                        <span style={{fontSize:11,color:T2,fontWeight:700}}>S1</span>
                        <span style={{fontSize:13,fontWeight:800,color:UP}}>Rs {z.support.price}</span>
                      </div>
                    ) : null}
                    {z.support2 ? (
                      <div style={{display:"flex",justifyContent:"space-between",padding:"5px 10px"}}>
                        <span style={{fontSize:11,color:T2,fontWeight:700}}>S2</span>
                        <span style={{fontSize:12,fontWeight:800,color:UP}}>Rs {z.support2.price}</span>
                      </div>
                    ) : null}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10,marginBottom:12}}>
                    <div style={{fontSize:11,color:T2}}>Strength: <span style={{fontWeight:700,color:T1}}>{z.support?z.support.strength:"--"}</span></div>
                    <div style={{fontSize:11,color:T2}}>R:R: <span style={{fontWeight:700,color:T1}}>{z.riskReward!=null?z.riskReward+":1":"--"}</span></div>
                    <div style={{fontSize:11,color:T2,gridColumn:"1 / -1"}}>Next Key Level: <span style={{fontWeight:700,color:T1}}>{z.nextKeyLevel!=null?("Rs "+z.nextKeyLevel):"--"}</span></div>
                  </div>
                  <div style={{display:"flex",gap:8}} onClick={function(e){e.stopPropagation();}}>
                    <button onClick={function(){setTab("alerts");}} style={{flex:1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:"10px",color:T1,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128276; Alert</button>
                  </div>
                </div>
              );
            })()}
          </SummaryCard>
        </div>

        <SummaryCard title="Market Breadth" icon="&#128202;">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,textAlign:"center"}}>
            <div><div style={{fontSize:18,fontWeight:900,color:UP}}>{breadth.adv}</div><div style={{fontSize:10,color:T2}}>Advances</div></div>
            <div><div style={{fontSize:18,fontWeight:900,color:DOWN}}>{breadth.dec}</div><div style={{fontSize:10,color:T2}}>Declines</div></div>
            <div><div style={{fontSize:18,fontWeight:900,color:T1}}>{breadth.flat}</div><div style={{fontSize:10,color:T2}}>Unchanged</div></div>
          </div>
        </SummaryCard>

        <SummaryCard title="FII / DII Flow" icon="&#128176;">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,textAlign:"center"}}>
            <div><div style={{fontSize:15,fontWeight:900,color:UP}}>+3,245</div><div style={{fontSize:10,color:T2}}>FII (Cr)</div></div>
            <div><div style={{fontSize:15,fontWeight:900,color:DOWN}}>-1,890</div><div style={{fontSize:10,color:T2}}>DII (Cr)</div></div>
            <div><div style={{fontSize:15,fontWeight:900,color:UP}}>+1,355</div><div style={{fontSize:10,color:T2}}>Net (Cr)</div></div>
          </div>
        </SummaryCard>

        <SummaryCard title="Top Gainers" icon="&#128200;">
          {GAINERS.slice(0,4).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:UP}}>+{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>

        <SummaryCard title="Top Losers" icon="&#128201;">
          {LOSERS.slice(0,4).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:DOWN}}>{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>

        <SummaryCard title="Sector Performance" icon="&#127970;">
          {SECTORS.slice(0,5).map(function(s){
            var w = Math.min(100, Math.abs(s.pct)*20);
            return (
              <div key={s.name} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T2,marginBottom:3}}><span>{s.name}</span><span style={{color:s.up?UP:DOWN,fontWeight:700}}>{s.up?"+":""}{s.pct}%</span></div>
                <div style={{height:6,background:BD,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:w+"%",background:s.up?UP:DOWN}}/></div>
              </div>
            );
          })}
        </SummaryCard>

        <SummaryCard title="NIFTY 50 Heatmap" icon="&#128293;">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8}}>
            {DEMO_STOCKS.slice(0,8).map(function(s){
              var up = s.chgPct>=0;
              return (
                <div key={s.sym} style={{background:up?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",border:"1px solid "+(up?UP:DOWN),borderRadius:8,padding:6,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.chgPct}%</div>
                </div>
              );
            })}
          </div>
        </SummaryCard>

        <SummaryCard title="Range Intelligence" icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
          <div style={{fontSize:12,color:T2}}>Multi-timeframe compression/expansion analysis.</div>
        </SummaryCard>

        <div style={{gridColumn:"span 2",fontSize:10,color:T3,lineHeight:1.4,padding:"0 4px",textAlign:"center"}}>
          Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.
        </div>


        <SummaryCard title="Market Impact News" icon="&#128240;" onDetails={function(){setTab("news");}}>
          {JUSTIN.length==0 ? (
            <div style={{fontSize:12,color:T2}}>No major market-impacting news right now.</div>
          ) : JUSTIN.slice(0,3).map(function(n){
            var impactColor = n.impact=="Bullish"?UP:(n.impact=="Bearish"?DOWN:T2);
            return (
              <div key={n.id} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                <div style={{fontSize:11,fontWeight:700,color:impactColor}}>Impact: {n.impact}</div>
              </div>
            );
          })}
        </SummaryCard>

        <SummaryCard title="Options Intelligence" icon="&#128202;">
          {/* PCR/Max Pain/Gamma/Call Wall/Put Wall are not shown here - no
              live options-chain API is connected. The OptionsIntel
              component internally called the same hardcoded getOptionsIntel
              data used elsewhere, which is exactly the fabricated-data
              pattern this must not show. */}
          <div style={{fontSize:12,color:T2}}>Data unavailable right now.</div>
        </SummaryCard>

        <SummaryCard title="Futures Pulse" icon="&#128200;">
          <div style={{fontSize:12,color:T2}}>Futures data unavailable right now.</div>
        </SummaryCard>


      </div>
      <div style={{height:24}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
