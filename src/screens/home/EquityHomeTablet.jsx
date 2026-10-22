import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { DEMO_MOOD, DEMO_AI } from "../MarketMoodDemoData";
import MarketBadge from "./MarketBadge";
import { SkeletonCard } from "../../components/Skeleton";
import { t, termHelp, useLang } from "../../i18n/translations";
import NextMoveHomeCard from "../NextMoveHomeCard";

// BreakoutPro - EquityHomeTablet.jsx
// Tablet Home layout - independent from Mobile and from Laptop/Desktop.
// Initially reuses the same dense-dashboard approach as Desktop as a
// starting point; this file can be re-tuned for tablet specifically later
// without touching any other device's layout.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeTablet(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  function SummaryCard(p){
    return (
      <div onClick={p.onDetails||undefined} style={{background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:16,padding:p.hero?18:16,boxSizing:"border-box",minWidth:0,overflow:"hidden",height:"100%",minHeight:p.minHeight||undefined,gridColumn:p.span?"1 / -1":undefined,display:"flex",flexDirection:"column",cursor:p.onDetails?"pointer":"default"}}>
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
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:16,color:T1,overflowX:"hidden"}}>
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



        <SummaryCard title={t("home.mood_title")} onDetails={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <SkeletonCard height={90}/>
          ) : <NextMoveHomeCard mm={mm} fs={12} wide={true}/>}
        </SummaryCard>

        <SummaryCard title={t("home.snapshot")}>
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
                  ) : <div style={{fontSize:11,color:T2}}>{t("c.data_unavailable")}</div>}
                </div>
              );
            })}
          </div>
        </SummaryCard>

        {(function(){
          var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
          var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
          if(!hasRange){
            return (
              <SummaryCard span={true} title={t("home.range_title")} onDetails={function(){setTab("rangeintel");}}>
                <div style={{fontSize:12,color:T2}}>{t("home.range_none")}</div>
              </SummaryCard>
            );
          }
          var width = nifty.high - nifty.low;
          var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
          var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
          var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
          var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
          var stateColor = state==="Breakout Watch"?UP:(state==="Breakdown Watch"?DOWN:T1);
          return (
            <SummaryCard span={true} title={t("home.range_title")} onDetails={function(){setTab("rangeintel");}}>
              <div style={{fontSize:12,color:T2,marginBottom:6}}>NIFTY 50 &middot; <span title={termHelp("CMP")}>CMP:</span> <b style={{color:T1}}>{nifty.ltp.toLocaleString("en-IN")}</b></div>
              <div style={{position:"relative",height:16,marginBottom:6}}>
                <div style={{position:"absolute",top:7,left:0,right:0,height:2,background:BD}}></div>
                <div style={{position:"absolute",top:2,left:"calc("+posPct+"% - 6px)",width:12,height:12,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
              </div>
              <div style={{fontSize:13,fontWeight:800,color:stateColor,marginBottom:8}}>{posPct}% &middot; {t("home.zone."+zone, zone)} &middot; {t("home.state."+state, state)}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,textAlign:"center"}}>
                <div><div style={{fontSize:10,color:T2}}>{t("home.support_bd")}</div><div style={{fontSize:12,color:UP,fontWeight:700}}>{nifty.low.toLocaleString("en-IN")}</div></div>
                <div><div style={{fontSize:10,color:T2}}>{t("home.res_bo")}</div><div style={{fontSize:12,color:DOWN,fontWeight:700}}>{nifty.high.toLocaleString("en-IN")}</div></div>
              </div>
            </SummaryCard>
          );
        })()}

      </div>
      <div style={{height:8}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
