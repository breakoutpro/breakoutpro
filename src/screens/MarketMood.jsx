import { useState, useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import { track } from "../state/analyticsRegistry";
import {
  getSessionMeta, buildIndexRow, buildEvolution,
  buildUnverifiedSection, buildVoiceSummary, rankSectors, buildVixHistory
} from "./MarketMoodData";
import {
  SectionHead, SectionHeadWithPill, UnavailableCard, IndexRow,
  Gauge, EvolutionCard, StageTimeline, GridWrap, AiCommentaryBlock, Sparkline, buildMT
} from "./MarketMoodParts";

// BreakoutPro - MarketMood.jsx
// AI Market Mood - full open page. Owns page COMPOSITION only.
// All numbers come from the real useMarketMood() state (mm prop, same
// object MarketMoodCard.jsx already uses) via MarketMoodEngine.js
// (deterministic score) and api/market-mood-ai.js (grounded AI text).
// No static/fake datasets. Missing data renders honest UNAVAILABLE.
// Rules: no backtick, no triple-equals, ASCII only.

function speakText(t){
  try{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = "en-IN"; u.rate = 1; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

export default function MarketMood(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var MT = buildMT(theme);
  var mm = props.mm || {};
  var mood = mm.mood || null;
  var ai = mm.ai || null;
  var data = mm.data || null;
  var session = mm.session || "";
  var status = mm.status || "loading";

  var responsive = useResponsive();
  var cols = responsive.columns || 1;

  var sMeta = getSessionMeta(session);
  var evolution = buildEvolution(data || {});

  var idx = (data && data.indices) || {};
  var niftyRow = buildIndexRow("NIFTY 50", idx.NIFTY);
  var sensexRow = buildIndexRow("SENSEX", idx.SENSEX);
  var bankRow = buildIndexRow("BANK NIFTY", idx.BANKNIFTY);
  var vixRow = buildIndexRow("INDIA VIX", idx.VIX);

  // Sector Rotation / Global Markets: real, server-populated groups as of
  // Step 5 (batched quote fetch, honest LIVE/DELAYED/STALE/PARTIAL/
  // UNAVAILABLE per group). Market Breadth / Important Events: still
  // honest UNAVAILABLE - no validated provider exists for them.
  var sectorSection = buildUnverifiedSection(data && data.sectors);
  var rankedSectors = sectorSection.available ? rankSectors(sectorSection.items) : [];
  var globalSection = buildUnverifiedSection(data && data.global);
  var vixHist = buildVixHistory(data && data.vixHistory);

  var [speaking, setSpeaking] = useState(false);

  // Fires exactly once per genuine open (component mount), not on
  // re-render - matches the ANALYTICS_EVENTS allow-list in
  // analyticsRegistry.js ("feature_open": ["feature"]), no new event type.
  useEffect(function(){
    track("feature_open", { feature:"marketMood" });
  }, []);

  function onVoice(){
    var t = buildVoiceSummary(mood, ai, session);
    setSpeaking(true);
    speakText(t);
    setTimeout(function(){ setSpeaking(false); }, 1000);
  }

  var showLoading = status=="loading" && !mood;
  var showOffline = status=="offline";

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:MT.BG,zIndex:350,overflowY:"auto"}}>

      {/* HEADER */}
      <div style={{background:MT.CARD,borderBottom:"1px solid "+MT.BD,position:"sticky",top:0,zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px",maxWidth:responsive.shell.centerMax,margin:"0 auto",boxSizing:"border-box"}}>
          <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:MT.T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:20,fontWeight:800,color:MT.T1}}>AI Market Mood</div>
            <div style={{fontSize:11,color:MT.T2,marginTop:2,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:sMeta.dot,display:"inline-block",flexShrink:0}}></span>
              <span>{sMeta.label} &#8226; {sMeta.sub}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"18px " + (responsive.shell.pad>16?responsive.shell.pad:16) + "px 40px",maxWidth:responsive.shell.centerMax,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {showLoading ? (
          <div style={{padding:"30px 0",textAlign:"center",color:MT.T2,fontSize:12.5}}>Loading market mood...</div>
        ) : showOffline ? (
          <div style={{padding:"30px 0",textAlign:"center",color:MT.T2,fontSize:12.5}}>You are offline. Showing last-known data where available.</div>
        ) : null}

        {/* 1. TODAY'S SUMMARY */}
        <SectionHead>TODAY'S SUMMARY</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:16,padding:"20px 16px 16px",marginBottom:6}}>
          <Gauge mood={mood}/>
        </div>
        <AiCommentaryBlock ai={ai}/>

        <button onClick={onVoice} style={{width:"100%",background:MT.BLUE,border:"none",borderRadius:13,padding:14,color:"#fff",fontSize:13.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:44}}>
          <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
          {speaking ? "Playing..." : "Listen: Market Mood Summary"}
        </button>

        {/* 2. 3-DAY EVOLUTION */}
        <SectionHead>3-DAY EVOLUTION</SectionHead>
        <EvolutionCard evolution={evolution}/>

        {/* 3-5. YESTERDAY / PREVIOUS SESSION / CURRENT SESSION */}
        <SectionHead>YESTERDAY, PREVIOUS SESSION AND CURRENT SESSION</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden",marginBottom:14}}>
          <IndexRow row={niftyRow}/>
          <IndexRow row={sensexRow}/>
          <IndexRow row={bankRow}/>
        </div>
        <div style={{fontSize:9.5,color:MT.T3,marginTop:-8,marginBottom:14}}>
          Yesterday and previous-session detail use the same live index feed above with session-aware freshness labels. A dedicated multi-day close history view will expand this once approved.
        </div>

        {/* 6. MARKET STAGE TIMELINE */}
        <SectionHead>MARKET STAGE TIMELINE</SectionHead>
        <StageTimeline mood={mood} evolution={evolution}/>

        {/* 7. SECTOR ROTATION */}
        {sectorSection.available ? (
          <div>
            <SectionHeadWithPill status={sectorSection.status}>SECTOR ROTATION</SectionHeadWithPill>
            <GridWrap columns={cols}>
              {rankedSectors.map(function(s,i){
                var color = s.up==null?MT.T2:(s.up?MT.GREEN:MT.RED);
                return (
                  <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:12,padding:12}}>
                    <div style={{fontSize:11,color:MT.T1,fontWeight:700}}>{s.name}</div>
                    <div style={{fontSize:10,color:color,marginTop:2}}>{s.chgPct!=null ? (s.chgPct>=0?"+":"")+s.chgPct+"%" : "--"}</div>
                    {s.tag ? <div style={{fontSize:8.5,color:MT.T3,marginTop:3}}>{s.tag}</div> : null}
                  </div>
                );
              })}
            </GridWrap>
            <div style={{fontSize:9,color:MT.T3,marginTop:6,marginBottom:8}}>Relative strength derived from the same live sector-index dataset above. Not institutional flow data.</div>
          </div>
        ) : (
          <div>
            <SectionHead>SECTOR ROTATION</SectionHead>
            <UnavailableCard title="Sector Rotation" note="No verified sector-index provider connected yet."/>
          </div>
        )}

        {/* 8. MARKET BREADTH */}
        <SectionHead>MARKET BREADTH</SectionHead>
        <UnavailableCard title="Market Breadth" note="No verified advance/decline provider connected yet."/>

        {/* 9. GLOBAL MARKETS */}
        {globalSection.available ? (
          <div>
            <SectionHeadWithPill status={globalSection.status}>GLOBAL MARKETS</SectionHeadWithPill>
            <GridWrap columns={cols}>
              {globalSection.items.map(function(g,i){
                var color = g.up==null?MT.T2:(g.up?MT.GREEN:MT.RED);
                return (
                  <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:12,padding:12}}>
                    <div style={{fontSize:11,color:MT.T1,fontWeight:700}}>{g.name}</div>
                    <div style={{fontSize:10,color:color,marginTop:2}}>{g.chgPct!=null ? (g.chgPct>=0?"+":"")+g.chgPct+"%" : "--"}</div>
                  </div>
                );
              })}
            </GridWrap>
            <div style={{fontSize:9,color:MT.T3,marginTop:6,marginBottom:8}}>Last available quote per market. May reflect a prior close outside that market's own trading hours.</div>
          </div>
        ) : (
          <div>
            <SectionHead>GLOBAL MARKETS</SectionHead>
            <UnavailableCard title="Global Markets" note="No verified global-index provider connected yet."/>
          </div>
        )}

        {/* 10. INDIA VIX */}
        <SectionHead>INDIA VIX</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden",marginBottom:vixHist.available?0:14}}>
          <IndexRow row={vixRow}/>
        </div>
        {vixHist.available ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"10px 14px 14px",marginBottom:14}}>
            <div style={{fontSize:9,color:MT.T3,marginBottom:4}}>Last {vixHist.sessions} sessions (daily close)</div>
            <Sparkline points={vixHist.points}/>
          </div>
        ) : null}

        {/* 11. IMPORTANT EVENTS */}
        <SectionHead>IMPORTANT EVENTS</SectionHead>
        <UnavailableCard title="Important Events" note="No verified economic-calendar source connected yet."/>

        {/* 12. EDUCATIONAL EXPLANATION */}
        <SectionHead>EDUCATIONAL EXPLANATION</SectionHead>
        <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{fontSize:11.5,color:MT.T2,lineHeight:1.7}}>
            Market Mood is a deterministic score (0 to 100) built from live index trend, India VIX, and multi-session structure, weighted by how much verified data is actually available right now. Components with no trustworthy data are excluded rather than guessed, and remaining weights are re-balanced. AI only explains this score in plain language; it never changes the number or adds outside facts.
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:6}}>
          <div style={{fontSize:8.5,color:MT.WARN,lineHeight:1.6}}>Educational Market Observation Only. Not Investment Advice.</div>
        </div>

      </div>
    </div>
  );
}
