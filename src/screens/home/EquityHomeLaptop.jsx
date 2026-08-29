import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { JUSTIN } from "../JustInData";
import { DEMO_MOOD, DEMO_AI, DEMO_FNO, DEMO_DATA } from "../MarketMoodDemoData";

// BreakoutPro - EquityHomeLaptop.jsx
// The Desktop Workstation, built per the approved Design Specification
// (BREAKOUT_INTELLIGENCE_LAPTOP_SPEC.md). Market-first architecture:
// Market Spine (4 permanent indices) is the default focus; selecting a
// stock switches the whole workspace into Stock Mode; selecting an index
// again returns instantly to Market Mode. Breakout Intelligence is the
// dominant center panel, not a card. Every displayed metric renders through
// MarketMetric/ProvenanceBadge - the mandatory, enforced provenance rule.
// The left nav rail is provided by the app shell (DesktopLeftSidebar in
// App.jsx) - this file does not render its own nav.
// Rules: no backtick, no triple-equals, ASCII.
export default function EquityHomeLaptop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
  // theme.c.up/down/warn, which are used elsewhere for price ticks and
  // general warnings, not sentiment specifically.
  var SENT_GREEN="#22C55E", SENT_RED="#EF4444", SENT_YELLOW="#EAB308";
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* MARKET SPINE - permanent 4 indices, always visible, the primary selector */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD2}}>
        {data.spineRows.map(function(r,i){
          var active = !data.workspaceIsStock && data.selectedIndex===r.key;
          var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
          return (
            <div key={r.key} onClick={function(){data.selectIndex(r.key);}} style={{padding:"6px 16px",cursor:"pointer",borderRight:i<data.spineRows.length-1?"1px solid "+BD2:"none",background:active?"rgba(59,130,246,0.10)":"transparent",borderBottom:active?"2px solid "+BLUE:"2px solid transparent",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:tierCfg.label,color:T2}}>{r.label}</span>
              {r.live ? (
                <span style={{fontSize:tierCfg.primaryNumber,fontWeight:900,fontFamily:"monospace",color:T1}}>{formatMarketPrice(r.ltp)}</span>
              ) : mm.status=="loading" ? (
                <span style={{fontSize:tierCfg.secondaryText,color:T3,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:T3,display:"inline-block",animation:"bp-pulse 1.4s ease-in-out infinite"}}></span>
                  Connecting
                </span>
              ) : (
                <ProvenanceBadge type="unavailable"/>
              )}
              {r.live ? <span style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:color}}>{r.dir==="up"?"+":""}{r.chgPct}%</span> : null}
            </div>
          );
        })}
        {data.workspaceIsStock ? (
          <div style={{padding:"6px 16px",display:"flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.10)",borderBottom:"2px solid "+BLUE}}>
            <span style={{fontSize:tierCfg.label,color:T2}}>Stock Mode</span>
            <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{data.workspaceSymbol}</span>
            <button onClick={data.returnToMarketMode} style={{background:"none",border:"none",cursor:"pointer",color:BLUE,fontSize:tierCfg.label,fontWeight:700}}>&times; Back to Market</button>
          </div>
        ) : null}
      </div>
      <div style={{padding:"3px 16px",fontSize:10,color:T3,background:CARD2,borderBottom:"1px solid "+BD}}>
        {data.mktSnapshot && data.mktSnapshot.timestamp ? "Last updated: "+new Date(data.mktSnapshot.timestamp).toLocaleTimeString("en-IN") : "Data unavailable right now."}
      </div>

      {/* MAIN AREA - center workspace */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* CENTER WORKSPACE - Final locked Home architecture: exactly 3 cards.
            1. AI Market Mood  2. Range Intelligence  3. Options Intelligence
            Every other Home widget from prior rounds (Breakout Intelligence,
            AI Alerts, Key Levels, Market Breadth, FII/DII, Gainers, Losers,
            Sector Performance, Heatmap, Market Impact News, Futures Pulse,
            JUST IN news ticker) was explicitly removed from Home per this
            round's instruction - their underlying pages remain intact and
            reachable, only the Home duplication was removed. */}
        <div style={{flex:1,minWidth:0,padding:"12px 16px",overflowY:"auto"}}>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:tierCfg.gridGap,alignItems:"start"}}>

          {/* AI MARKET MOOD - card 1 of 3. Uses the same BEARISH/SIDEWAYS/
              BULLISH segment + small score-badge pattern as the full-screen
              page (no large score circle) - kept consistent between Home
              and the full page. Content-driven height throughout - no fixed
              height anywhere on this card. */}
          <div onClick={function(){setTab("marketmood");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BLUE+"55",boxShadow:"0 0 24px "+BLUE+"22",borderRadius:14,padding:tierCfg.cardPadding+6,boxSizing:"border-box",cursor:"pointer",maxHeight:400,overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <span style={{fontSize:tierCfg.widgetTitle+1,fontWeight:800,color:T1}}>&#129504; AI Market Mood</span>
              <ProvenanceBadge type="calculated"/>
            </div>
            {(function(){
              var usingDemo = !data.mm.mood || data.mm.mood.score==null;
              var mood = usingDemo ? DEMO_MOOD : data.mm.mood;
              var ai = usingDemo ? DEMO_AI : data.mm.ai;
              var moodColor = mood.label.indexOf("Bullish")>=0?SENT_GREEN:(mood.label.indexOf("Bearish")>=0?SENT_RED:SENT_YELLOW);
              return (
                <div style={{display:"flex",gap:20}}>
                  <div style={{flex:usingDemo?"0 0 45%":"1 1 auto",minWidth:0}}>
                    <div style={{display:"flex",gap:5,marginBottom:8}}>
                      {[["BEARISH",SENT_RED],["SIDEWAYS",SENT_YELLOW],["BULLISH",SENT_GREEN]].map(function(seg){
                        var active = mood.label.toUpperCase().indexOf(seg[0])>=0 || (seg[0]==="SIDEWAYS" && mood.label.indexOf("Bull")<0 && mood.label.indexOf("Bear")<0);
                        return <div key={seg[0]} style={{fontSize:9,fontWeight:800,padding:"3px 7px",borderRadius:5,color:active?"#fff":seg[1],background:active?seg[1]:seg[1]+"14",border:"1px solid "+seg[1]}}>{seg[0]}</div>;
                      })}
                    </div>
                    <div style={{fontSize:16,fontWeight:900,color:moodColor,marginBottom:4}}>{mood.label.toUpperCase()}</div>
                    <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:2}}>Stage: <span style={{color:T1,fontWeight:700}}>{mood.stage}</span></div>
                    <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:8}}>Confidence: <span style={{color:T1,fontWeight:700}}>{mood.confidence}</span></div>
                    <div style={{fontSize:9,color:T3,background:BG,border:"1px solid "+BD,borderRadius:5,padding:"2px 7px",display:"inline-block",marginBottom:10}}>AI Confidence Score: {mood.score}/100</div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:T2,fontWeight:800,marginBottom:2}}>KEY SIGNAL</div>
                      <div style={{fontSize:tierCfg.secondaryText,color:ai&&ai.now?T1:T2,lineHeight:1.6}}>{ai && ai.now ? ai.now : "Analysis update in progress. Core market score remains available."}</div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:T2,fontWeight:800,marginBottom:2}}>WHAT TO WATCH</div>
                      <div style={{fontSize:tierCfg.secondaryText,color:ai&&ai.watchNext?T1:T2,lineHeight:1.5}}>{ai && ai.watchNext ? ai.watchNext : "No verified watch-level data available right now."}</div>
                    </div>
                    <div style={{textAlign:"right",fontSize:tierCfg.label,color:BLUE,fontWeight:700}}>View Full Analysis &#8594;</div>
                  </div>
                  {usingDemo ? (
                    <div style={{flex:"0 0 55%",background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:10}}>
                      <div style={{fontSize:9,fontWeight:800,color:WARN,background:WARN+"18",border:"1px solid "+WARN+"55",borderRadius:5,padding:"2px 6px",display:"inline-block",marginBottom:8}}>F&amp;O SNAPSHOT (DEMO)</div>
                      <div style={{marginBottom:6}}><div style={{fontSize:9,color:T3}}>PCR</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{DEMO_FNO.pcr} <span style={{fontSize:10,fontWeight:700,color:DEMO_FNO.pcrLabel==="Bullish"?SENT_GREEN:(DEMO_FNO.pcrLabel==="Bearish"?SENT_RED:SENT_YELLOW)}}>{DEMO_FNO.pcrLabel}</span></div></div>
                      <div style={{marginBottom:6}}><div style={{fontSize:9,color:T3}}>Max Pain</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{DEMO_FNO.maxPain.toLocaleString("en-IN")}</div></div>
                      <div style={{marginBottom:6}}><div style={{fontSize:9,color:T3}}>India VIX</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{DEMO_DATA.indices.VIX.ltp} <span style={{fontSize:10,fontWeight:700,color:DEMO_DATA.indices.VIX.chgPct<0?SENT_GREEN:SENT_YELLOW}}>{DEMO_DATA.indices.VIX.chgPct}%</span></div></div>
                      <div><div style={{fontSize:9,color:T3}}>FII Derivatives</div><div style={{fontSize:12,fontWeight:800,color:SENT_GREEN}}>+&#8377;{DEMO_FNO.fiiFlow.toLocaleString("en-IN")} Cr</div></div>
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </div>

          {/* RANGE INTELLIGENCE - card 2 of 3. Built from data already
              fetched by api/market-mood-data.js (indices.NIFTY.high/low -
              today's real session high/low, since the most recent daily
              candle in that pipeline IS today's session). No new fetching,
              no generateDemoCandles()/analyzeZones() - those are explicitly
              synthetic and not used here. Full intraday chart/5m-15m-1H
              timeframes are NOT possible from this data (only one H/L/C
              point per day exists, not an intraday bar sequence) - only
              today's range/position/state are shown, honestly. */}
          {(function(){
            var nifty = data.mm && data.mm.data && data.mm.data.indices && data.mm.data.indices.NIFTY;
            var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
            if(!hasRange){
              return (
                <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BLUE+"55",boxShadow:"0 0 24px "+BLUE+"22",borderRadius:14,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",maxHeight:400,overflowY:"auto"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Range Intelligence</span>
                    <ProvenanceBadge type="unavailable"/>
                  </div>
                  <div style={{fontSize:tierCfg.label,color:T3}}>No verified intraday range provider connected yet.</div>
                </div>
              );
            }
            var width = nifty.high - nifty.low;
            var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
            var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
            var distToHigh = Math.round((nifty.high - nifty.ltp)*100)/100;
            var distToLow = Math.round((nifty.ltp - nifty.low)*100)/100;
            var distToHighPct = Math.round((distToHigh/nifty.ltp)*10000)/100;
            var distToLowPct = Math.round((distToLow/nifty.ltp)*10000)/100;
            var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
            var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
            var watchText = posPct>=80?"Price approaching today's high. A sustained move above it would indicate potential range expansion.":(posPct<=20?"Price approaching today's low. A sustained move below it would indicate potential range expansion downward.":"Price trading in the "+zone.toLowerCase()+" of today's range.");
            var stateColor = state==="Breakout Watch"?UP:(state==="Breakdown Watch"?DOWN:T1);
            return (
              <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BLUE+"55",boxShadow:"0 0 24px "+BLUE+"22",borderRadius:14,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",maxHeight:400,overflowY:"auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Range Intelligence</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:2}}>NIFTY 50</div>
                <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:6}}>{nifty.ltp.toLocaleString("en-IN")} <span style={{fontSize:tierCfg.label,fontWeight:700,color:T3}}>Range: {nifty.low.toLocaleString("en-IN")}&ndash;{nifty.high.toLocaleString("en-IN")}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:16,fontWeight:900,color:stateColor}}>{posPct}%</span>
                  <span style={{fontSize:tierCfg.label,fontWeight:700,color:stateColor,background:stateColor+"14",border:"1px solid "+stateColor+"55",borderRadius:5,padding:"2px 7px"}}>{zone}</span>
                </div>
                <div style={{position:"relative",height:16,marginBottom:8}}>
                  <div style={{position:"absolute",top:7,left:0,right:0,height:2,background:BD}}></div>
                  <div style={{position:"absolute",top:2,left:"calc("+posPct+"% - 6px)",width:12,height:12,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD2}}></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                  <div><div style={{fontSize:tierCfg.label,color:T3}}>Resistance / Breakout</div><div style={{fontSize:tierCfg.secondaryText,color:DOWN,fontWeight:700}}>{nifty.high.toLocaleString("en-IN")} <span style={{color:T3,fontWeight:400}}>({distToHighPct}% away)</span></div></div>
                  <div><div style={{fontSize:tierCfg.label,color:T3}}>Support / Breakdown</div><div style={{fontSize:tierCfg.secondaryText,color:UP,fontWeight:700}}>{nifty.low.toLocaleString("en-IN")} <span style={{color:T3,fontWeight:400}}>({distToLowPct}% away)</span></div></div>
                </div>
                <div style={{fontSize:tierCfg.label,color:T2,lineHeight:1.5,marginBottom:6}}>{watchText}</div>
                <div style={{textAlign:"right",fontSize:tierCfg.label,color:BLUE,fontWeight:700}}>View Full Range Intelligence &#8594;</div>
              </div>
            );
          })()}
          {/* OPTIONS INTELLIGENCE - card 3 of 3 */}
          <div onClick={function(){setTab("optionsintelpro");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BLUE+"55",boxShadow:"0 0 24px "+BLUE+"22",borderRadius:14,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",maxHeight:400,overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Options Intelligence</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3}}>No verified options-chain provider connected yet.</div>
          </div>

          {/* MARKET NEWS - compact, max 3 headlines, real JustIn data */}
          <div onClick={function(){setTab("news");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BLUE+"55",boxShadow:"0 0 24px "+BLUE+"22",borderRadius:14,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",maxHeight:400,overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Market News</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <span style={{fontSize:tierCfg.label,color:BLUE,fontWeight:700}}>View all news &#8594;</span>
            </div>
            {JUSTIN.length===0 ? (
              <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Market news unavailable</div>
            ) : JUSTIN.slice(0,3).map(function(n){
              return (
                <div key={n.id} style={{padding:"6px 0",borderBottom:"1px solid "+BD2}}>
                  <div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                  <div style={{fontSize:tierCfg.label,color:T3}}>{n.time} &#183; {n.source}</div>
                </div>
              );
            })}
          </div>

          </div>

        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"5px 20px",borderTop:"1px solid "+BD}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>Educational market intelligence only. Not investment advice. Not a recommendation to buy or sell.</div>
      </div>
    </div>
  );
}
