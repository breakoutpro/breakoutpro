import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { openingBias } from "./MarketMoodEngine";
import MarketMood from "./MarketMood";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - MarketMoodCard.jsx
// AI MARKET MOOD - real engine. Deterministic score + AI commentary + honest freshness.
// No fake live data, no fabricated score, probabilistic opening language only.
// Rules: no backtick, no ===, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#20242D";
var UP="#1B5E20",DOWN="#EF4444",GOLD="#D4AF37",BLUE="#3B82F6",CYAN="#60A5FA",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function statusBadge(session, mood){
  if(session=="WEEKEND") return { text:"WEEKEND", col:T3, dot:"#9CA3AF" };
  if(session=="CLOSED"||session=="POST_CLOSE") return { text:"MARKET CLOSED", col:T3, dot:"#9CA3AF" };
  if(session=="PRE_OPEN") return { text:"PRE-OPEN", col:GOLD, dot:GOLD };
  var st="DELAYED", col=GOLD, dot=GOLD;
  try{
    var f = mood && mood._niftyStatus;
    if(f=="LIVE"){ st="LIVE"; col=UP; dot=UP; }
    else if(f=="STALE"){ st="STALE"; col=WARN; dot=WARN; }
  }catch(e){}
  return { text:st, col:col, dot:dot };
}

function moodColor(label){
  if(label=="Strong Bullish"||label=="Bullish") return UP;
  if(label=="Strong Bearish"||label=="Bearish") return DOWN;
  return GOLD;
}

function istTime(ts){
  if(!ts) return "";
  try{
    var d = new Date(ts);
    return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}) + " IST";
  }catch(e){ return ""; }
}

export default function MarketMoodCard(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.gold, BLUE=theme.c.blue, CYAN=theme.c.blue, T2=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.gold, BLUE=theme.c.blue, CYAN=theme.c.blue, T2=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var [open,setOpen] = useState(false);
  var mm = props.mm || {};
  var responsive = useResponsive();
  var mood = mm.mood;
  var ai = mm.ai;
  var session = mm.session || "";

  if(mood && mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.freshness){
    mood._niftyStatus = mm.data.indices.NIFTY.freshness.status;
  }

  var badge = statusBadge(session, mood);
  var scoreVal = mood && mood.score!=null ? mood.score : null;
  var label = mood ? mood.label : "Loading";
  var col = moodColor(label);
  var stage = mood ? mood.stage : "";
  var loadingOrError = mm.status=="loading" || mm.status=="error" || scoreVal==null;

  return (
    <div style={{padding:"16px 16px 0",maxWidth:responsive.shell.centerMax,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
      <div onClick={function(){setOpen(true);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,cursor:"pointer"}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:8,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <span style={{fontSize:14,flexShrink:0}} dangerouslySetInnerHTML={{__html:"&#129504;"}}/>
            <span style={{fontSize:14,fontWeight:800,color:T1}}>AI Market Mood</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,background:CARD2,borderRadius:16,padding:"4px 12px",flexShrink:0}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:badge.dot,display:"inline-block"}}></span>
            <span style={{fontSize:12,color:badge.col,fontWeight:700}}>{badge.text}</span>
          </div>
        </div>

        {loadingOrError ? (
          <div style={{padding:"16px 0"}}>
            <div style={{fontSize:12,fontWeight:700,color:mm.status=="error"?DOWN:T2}}>
              {mm.status=="error" ? "Market data temporarily unavailable" : (mm.status=="offline" ? "You are offline" : "Loading market mood...")}
            </div>
            <div style={{fontSize:12,color:T3,marginTop:4}}>No fabricated values are shown. Live data resumes automatically.</div>
          </div>
        ) : (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{width:54,height:54,borderRadius:"50%",border:"4px solid "+col,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16,fontWeight:900,color:col}}>{scoreVal}</span>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:900,color:col}}>{label}</div>
              <div style={{fontSize:12,color:T2,marginTop:4}}>Stage: {stage}</div>
              <div style={{fontSize:12,color:T3,marginTop:4}}>{openingBias(scoreVal)}</div>
            </div>
          </div>

          <div style={{background:CARD2,borderRadius:16,padding:"8px 12px",marginBottom:8}}>
            <div style={{fontSize:12,color:T3,fontWeight:700,marginBottom:4}}>NOW</div>
            <div style={{fontSize:12,color:T1,fontWeight:600}}>{ai && ai.now ? ai.now : "Deterministic reading from live indices. AI commentary loading."}</div>
          </div>

          {ai && ai.keyDrivers && ai.keyDrivers.length ? (
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:T3,fontWeight:700,marginBottom:4}}>KEY DRIVERS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {ai.keyDrivers.map(function(d,i){
                  return <span key={i} style={{fontSize:12,color:T2,background:CARD2,border:"1px solid "+BD,borderRadius:16,padding:"4px 8px"}}>{d}</span>;
                })}
              </div>
            </div>
          ) : null}

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:4,marginBottom:8}}>
            <span style={{fontSize:12,color:T3}}>Confidence: <span style={{color:mood.confidence=="High"?UP:mood.confidence=="Low"?DOWN:BLUE,fontWeight:700}}>{mood.confidence}</span></span>
            <span style={{fontSize:12,color:T3}}>{istTime(mm.lastUpdated)}</span>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,borderTop:"1px solid "+BD,paddingTop:8}}>
            <span style={{fontSize:12,color:T3,flex:"1 1 auto",minWidth:0}}>Educational Market Observation Only. Not Investment Advice.</span>
            <span style={{fontSize:12,color:CYAN,fontWeight:700,flexShrink:0}}>Details &#8594;</span>
          </div>
        </div>
        )}

      </div>

      {open?<MarketMood onClose={function(){setOpen(false);}} setTab={setTab} mm={mm}/>:null}
    </div>
  );
}
