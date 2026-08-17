import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { JUSTIN } from "../JustInData";
import { Gauge } from "../MarketMoodParts";
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
  var mm = data.mm;

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

        <SummaryCard title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <SkeletonCard height={90}/>
          ) : !mm.mood || mm.mood.score==null || data.mktStatus!=="ok" ? <div style={{fontSize:12,color:T2}}>Data unavailable right now.</div> : (function(){
            var ai = mm.ai;
            return (
              <div>
                <div style={{marginBottom:16}}>
                  <Gauge mood={mm.mood}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:3}}>WHY?</div>
                    {ai && ai.now ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.now}</div> : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                  </div>
                  <div>
                    <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:3}}>WHAT TO WATCH?</div>
                    {ai && ai.watchNext ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.watchNext}</div> : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                  </div>
                </div>
              </div>
            );
          })()}
        </SummaryCard>

        <SummaryCard title="Range Intelligence" icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {["5m","15m","1H"].map(function(tf){
              return <span key={tf} style={{fontSize:11,fontWeight:700,color:T3,background:theme.c.card2,border:"1px solid "+BD,borderRadius:6,padding:"4px 9px"}}>{tf}</span>;
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center",marginBottom:8}}>
            <div><div style={{fontSize:10,color:T2}}>Support</div><div style={{fontSize:12,color:T2}}>--</div></div>
            <div><div style={{fontSize:10,color:T2}}>Range</div><div style={{fontSize:12,color:T2}}>--</div></div>
            <div><div style={{fontSize:10,color:T2}}>Resistance</div><div style={{fontSize:12,color:T2}}>--</div></div>
          </div>
          <div style={{fontSize:12,color:T2}}>Data unavailable right now.</div>
        </SummaryCard>

        <SummaryCard title="Options Intelligence" icon="&#128202;" onDetails={function(){setTab("optionsintelpro");}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center",marginBottom:8}}>
            <div><div style={{fontSize:10,color:T2}}>PCR</div><div style={{fontSize:12,color:T2}}>--</div></div>
            <div><div style={{fontSize:10,color:T2}}>Max Pain</div><div style={{fontSize:12,color:T2}}>--</div></div>
            <div><div style={{fontSize:10,color:T2}}>Gamma Flip</div><div style={{fontSize:12,color:T2}}>--</div></div>
          </div>
          <div style={{fontSize:12,color:T2}}>Data unavailable right now.</div>
        </SummaryCard>

        <SummaryCard title="Market News" icon="&#128240;" onDetails={function(){setTab("news");}}>
          {JUSTIN.length===0 ? (
            <div style={{fontSize:12,color:T2}}>Market news unavailable</div>
          ) : JUSTIN.slice(0,3).map(function(n){
            return (
              <div key={n.id} style={{padding:"6px 0",borderBottom:"1px solid "+BD}}>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                <div style={{fontSize:11,color:T2}}>{n.time} &middot; {n.source}</div>
              </div>
            );
          })}
        </SummaryCard>

      </div>
      <div style={{height:24}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
