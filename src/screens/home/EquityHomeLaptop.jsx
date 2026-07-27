import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { GAINERS, LOSERS } from "../HomeData";
import OptionsIntel from "../OptionsIntel";
import { JUSTIN } from "../JustInData";
import MarketBadge from "./MarketBadge";
import { SkeletonCard } from "../../components/Skeleton";

// BreakoutPro - EquityHomeLaptop.jsx
// Laptop Home layout - independent from Mobile, Tablet, and Desktop.
// Production dashboard for 1366x768 / 1440x900 laptop screens: 4 explicit
// dashboard rows matching the approved row structure, laptop-tuned type
// scale (slightly more compact than Desktop). Same cards, same shared
// useHomeData() hook, same colors/branding - only arrangement + type scale.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeLaptop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;
  var fearGreedColor = data.fearGreed=="Fear" ? DOWN : (data.fearGreed=="Greed" ? UP : T2);

  // Laptop type scale - compact, tuned for ~1366-1440px width.
  var CARD_TITLE = 13.5, HERO_TITLE = 15, BODY = 12, LABEL = 11, PRICE = 17;

  function SummaryCard(p){
    return (
      <div style={{background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:16,padding:p.hero?18:14,boxSizing:"border-box",minWidth:0,overflow:"hidden",height:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            {p.icon ? <span style={{fontSize:p.hero?17:15}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:p.hero?HERO_TITLE:CARD_TITLE,fontWeight:800,color:T1}}>{p.title}</span>
          </div>
          {p.onDetails ? (
            <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:LABEL,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:32,padding:"0 2px",flexShrink:0}}>View Details &#8594;</button>
          ) : null}
        </div>
        <div style={{flex:1}}>{p.children}</div>
      </div>
    );
  }

  function LevelsPair(sym, zones){
    return (
      <div>
        <div style={{fontSize:CARD_TITLE-1,fontWeight:800,color:T1,marginBottom:6}}>{sym}</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:LABEL-1,color:T2,marginBottom:2}}>S1</div>
            <div style={{fontSize:PRICE-4,fontWeight:800,color:UP}}>{zones.support?("Rs "+zones.support.price):"--"}</div>
          </div>
          <div>
            <div style={{fontSize:LABEL-1,color:T2,marginBottom:2}}>R1</div>
            <div style={{fontSize:PRICE-4,fontWeight:800,color:DOWN}}>{zones.resistance?("Rs "+zones.resistance.price):"--"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:28,color:T1,overflowX:"hidden"}}>

      {/* HEADER */}
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:21,fontWeight:900,letterSpacing:-0.5}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
          </div>
          <MarketBadge/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>

      {/* LIVE NEWS TICKER - full width */}
      <div onClick={function(){props.setSelArticle(JUSTIN[data.tickerIdx]);}} style={{background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",padding:"4px 9px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:CARD_TITLE-1,fontWeight:800,color:"#fff",letterSpacing:0.6,whiteSpace:"nowrap"}}>JUST IN</span>
        </div>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"8px 12px"}}>
          <span style={{fontSize:BODY,color:T1,fontWeight:600}}>{data.ticker[data.tickerIdx]}</span>
        </div>
      </div>

      {/* ROW 1 - Market Snapshot | Quick Actions | AI Market Mood */}
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 0.8fr 1fr",gap:14,padding:"16px 18px 0",minWidth:0,boxSizing:"border-box",alignItems:"stretch"}}>

        <SummaryCard title="Today's Market Snapshot" onDetails={function(){setTab("markets");}}>
          {data.idxRows.length==0 ? <div style={{fontSize:BODY,color:T2}}>Snapshot unavailable</div> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:10}}>
              {data.idxRows.map(function(r){
                var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
                return (
                  <div key={r.key} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:10}}>
                    <div style={{fontSize:LABEL-1,color:T2,marginBottom:3,fontWeight:600}}>{r.label}</div>
                    <div style={{fontSize:PRICE-2,fontWeight:900,color:T1,fontFamily:"monospace"}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:LABEL-1,fontWeight:700,color:color,marginTop:1}}>{r.chgPct!=null?((r.dir=="up"?"+":"")+r.chgPct+"%"):"--"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </SummaryCard>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:14,height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:CARD_TITLE,fontWeight:800,color:T1,marginBottom:10}}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flex:1}}>
            {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["Options","oi","&#128200;"]].map(function(q){
              return (
                <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:"9px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:q[2]}}/>
                  <span style={{fontSize:LABEL-1,fontWeight:700,color:T2}}>{q[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <SummaryCard title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
          {mm.status=="loading" && !mm.data ? (
            <SkeletonCard height={90}/>
          ) : !mm.mood || mm.mood.score==null ? <div style={{fontSize:BODY,color:T2}}>Market mood unavailable</div> : (function(){
            var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
            return (
              <div>
                <div style={{fontSize:HERO_TITLE,fontWeight:900,color:moodColor,marginBottom:7}}>{mm.mood.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:LABEL-1,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>Conf: {mm.mood.confidence}</span>
                  {data.fearGreed ? (
                    <span style={{fontSize:LABEL-1,fontWeight:700,color:fearGreedColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>{data.fearGreed}</span>
                  ) : null}
                </div>
                <div style={{fontSize:BODY,color:T2,lineHeight:1.4}}>{mm.mood.stage}</div>
              </div>
            );
          })()}
        </SummaryCard>

      </div>

      {/* ROW 2 - Today's Key Levels (Hero) | Trading Opportunities | Top Gainers | Top Losers */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 0.9fr 0.9fr",gap:14,padding:"14px 18px 0",minWidth:0,boxSizing:"border-box",alignItems:"stretch"}}>

        <SummaryCard title="Today's Key Levels" icon="&#128200;" hero={true}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {LevelsPair("NIFTY", data.niftyZones)}
            {LevelsPair("BANK NIFTY", data.bankZones)}
          </div>
          <div style={{borderTop:"1px solid "+BD,margin:"0 0 10px"}}></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){setTab("alerts");}} style={{flex:1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:9,padding:"9px",color:T1,fontSize:LABEL-1,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:13}}>&#128276;</span>Alert</button>
            <button onClick={function(){setTab("pazones");}} style={{flex:1,background:BLUE,border:"none",borderRadius:9,padding:"9px",color:"#fff",fontSize:LABEL-1,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:13}}>&#128202;</span>Details</button>
          </div>
        </SummaryCard>

        <SummaryCard title="Trading Opportunities" icon="&#128640;" onDetails={function(){setTab("scan");}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {[["Breakout","&#128200;"],["Breakdown","&#128201;"],["High Volume","&#128266;"],["Gap Up","&#11014;"],["Gap Down","&#11015;"]].map(function(o){
              return (
                <button key={o[0]} onClick={function(){setTab("scan");}} style={{background:theme.c.card2,border:"1px solid "+BD,borderRadius:18,padding:"7px 11px",display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:12}} dangerouslySetInnerHTML={{__html:o[1]}}/>
                  <span style={{fontSize:LABEL-1,fontWeight:700,color:T1,whiteSpace:"nowrap"}}>{o[0]}</span>
                </button>
              );
            })}
          </div>
        </SummaryCard>

        <SummaryCard title="Top Gainers" icon="&#128200;" onDetails={function(){setTab("markets");}}>
          {GAINERS.slice(0,5).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:BODY,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:BODY,fontWeight:700,color:UP}}>+{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>
        <SummaryCard title="Top Losers" icon="&#128201;" onDetails={function(){setTab("markets");}}>
          {LOSERS.slice(0,5).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:BODY,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:BODY,fontWeight:700,color:DOWN}}>{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>

      </div>

      {/* ROW 3 - Options Intelligence | Market Heatmap | FII/DII Flow | Latest Alerts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:14,padding:"14px 18px 0",minWidth:0,boxSizing:"border-box",alignItems:"stretch"}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",minWidth:0}}>
          <OptionsIntel symbol="NIFTY" onOpen={function(){props.setShowOptions(true);}}/>
        </div>
        <SummaryCard title="Market Heatmap" icon="&#128293;" onDetails={function(){setTab("heatmap");}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:6}}>
            {GAINERS.concat(LOSERS).slice(0,6).map(function(s){
              var up = s.pct>=0;
              return (
                <div key={s.sym} style={{background:up?"rgba(0,143,57,0.12)":"rgba(220,38,38,0.12)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                  <div style={{fontSize:LABEL-2,fontWeight:800,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:LABEL-2,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                </div>
              );
            })}
          </div>
        </SummaryCard>
        <SummaryCard title="FII / DII Flow" icon="&#128176;" onDetails={function(){setTab("fiidiipro");}}>
          <div style={{fontSize:BODY,color:T2,lineHeight:1.4}}>Institutional buy/sell trends - see today's flow and recent history.</div>
        </SummaryCard>
        <SummaryCard title="Latest Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
          <div style={{fontSize:BODY,color:T2,lineHeight:1.4}}>No alerts yet - set one up from any chart or scanner result.</div>
        </SummaryCard>
      </div>

      {/* ROW 4 - Global Markets | Today's Events | Watchlist Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:14,padding:"14px 18px 0",minWidth:0,boxSizing:"border-box",alignItems:"stretch"}}>
        <SummaryCard title="Global Markets" icon="&#127760;" onDetails={function(){setTab("global");}}>
          <div style={{fontSize:BODY,color:T2,lineHeight:1.4}}>Dow, Nasdaq, Nikkei and more - see the full global snapshot.</div>
        </SummaryCard>
        <SummaryCard title="Today's Events" icon="&#128197;" onDetails={function(){setTab("econcalendar");}}>
          <div style={{fontSize:BODY,color:T2,lineHeight:1.4}}>RBI, Fed, CPI, earnings and expiry dates - see the full calendar.</div>
        </SummaryCard>
        <SummaryCard title="Watchlist Summary" icon="&#11088;" onDetails={function(){setTab("watchlist");}}>
          {!data.wl.hasStoredWatchlist ? (
            <div style={{fontSize:BODY,color:T2}}>No watchlist symbols added yet</div>
          ) : data.wl.list.length==0 ? (
            <div style={{fontSize:BODY,color:T2}}>Your watchlist is empty</div>
          ) : (
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {data.wl.list.slice(0,6).map(function(sym){
                return <span key={sym} style={{fontSize:LABEL-1,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:14,padding:"5px 9px"}}>{sym}</span>;
              })}
            </div>
          )}
        </SummaryCard>
      </div>

      <div style={{height:24}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
                }
      
