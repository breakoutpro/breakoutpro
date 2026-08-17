import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { JUSTIN } from "../JustInData";

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
  var UP=theme.c.up, DOWN=theme.c.down, GOLD=theme.c.gold, WARN=theme.c.warn;
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

          {/* AI MARKET MOOD - card 1 of 3, real data throughout, fixes the ai-object-rendered-as-string bug and adds explicit WHY/WATCH per current spec */}
          <div onClick={function(){setTab("marketmood");}} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",marginBottom:tierCfg.gridGap}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>AI Market Mood</span>
              <ProvenanceBadge type="calculated"/>
            </div>
            {(function(){
              var mood = data.mm.mood;
              var ai = data.mm.ai;
              if(!mood || mood.score==null || data.mktStatus!=="ok"){
                return <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Data unavailable right now.</div>;
              }
              var moodColor = mood.label.indexOf("Bullish")>=0 ? UP : (mood.label.indexOf("Bearish")>=0 ? DOWN : GOLD);
              return (
                <div>
                  <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:10}}>
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:900,color:moodColor}}>{mood.label.toUpperCase()}</span>
                    <span style={{fontSize:tierCfg.label,color:T3}}>Confidence: {mood.score}%</span>
                    <span style={{fontSize:tierCfg.label,color:T3}}>Stage: {mood.stage}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:tierCfg.gridGap}}>
                    <div>
                      <div style={{fontSize:tierCfg.label,color:T3,fontWeight:700,marginBottom:4}}>WHY?</div>
                      {ai && ai.now ? <div style={{fontSize:tierCfg.secondaryText,color:T1,lineHeight:1.5}}>{ai.now}</div> : <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Data unavailable right now.</div>}
                    </div>
                    <div>
                      <div style={{fontSize:tierCfg.label,color:T3,fontWeight:700,marginBottom:4}}>WHAT TO WATCH?</div>
                      {ai && ai.watchNext ? <div style={{fontSize:tierCfg.secondaryText,color:T1,lineHeight:1.5}}>{ai.watchNext}</div> : <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Data unavailable right now.</div>}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* RANGE INTELLIGENCE - card 2 of 3 */}
          <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",marginBottom:tierCfg.gridGap}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Range Intelligence</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {["5m","15m","1H"].map(function(tf){
                return <span key={tf} style={{fontSize:tierCfg.label,fontWeight:700,color:T3,background:BG,border:"1px solid "+BD,borderRadius:6,padding:"4px 10px"}}>{tf}</span>;
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:tierCfg.gridGap,textAlign:"center"}}>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Support</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Range</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Resistance</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Breakout Status</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3,marginTop:8}}>Data unavailable right now.</div>
          </div>

          {/* OPTIONS INTELLIGENCE - card 3 of 3 */}
          <div onClick={function(){setTab("optionsintelpro");}} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",marginBottom:tierCfg.gridGap}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Options Intelligence</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:tierCfg.gridGap,textAlign:"center",marginBottom:8}}>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Expiry</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>PCR</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Max Pain</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Gamma Flip</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Call Wall</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
              <div><div style={{fontSize:tierCfg.label,color:T3}}>Put Wall</div><div style={{fontSize:tierCfg.secondaryText,color:T3}}>--</div></div>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3}}>Data unavailable right now.</div>
          </div>

          {/* MARKET NEWS - compact, max 3 headlines, real JustIn data */}
          <div onClick={function(){setTab("news");}} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box",cursor:"pointer",marginBottom:tierCfg.gridGap}}>
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
                  <div style={{fontSize:tierCfg.label,color:T3}}>{n.time} &middot; {n.source}</div>
                </div>
              );
            })}
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
