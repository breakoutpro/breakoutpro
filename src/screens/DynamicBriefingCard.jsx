import { getBriefingSession, BRIEFING_META } from "../utils/briefingSession";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - DynamicBriefingCard.jsx
// STANDALONE Step 1 build - NOT wired into EquityHome/Home/App yet.
// Narrative/session owner only. Never recomputes or redisplays Market
// Mood's score/stage/confidence - only references the label in prose.
// Consumes real data via props only (the same shape useMarketMood()
// already returns: {data, mood, session, lastUpdated}) - no own fetch,
// no own timer, no duplicate polling pipeline.
// Rules: no backtick, no ===, ASCII only.

var MT = {
  BG:"#050505", CARD:"#101318", BD:"#20242D",
  T1:"#FFFFFF", T2:"#A0A7B4", T3:"#5B6472",
  BLUE:"#3B82F6", GREEN:"#1B5E20", RED:"#EF4444", GOLD:"#D4AF37"
};

function fmtTime(ts){
  if(!ts) return null;
  try{ return new Date(ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}); }
  catch(e){ return null; }
}

function IndexLine(props){
  var row = props.row;
  if(!row || row.ltp==null) return null;
  var color = row.chgPct==null ? MT.T2 : (row.chgPct>=0 ? MT.GREEN : MT.RED);
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
      <span style={{fontSize:12,fontWeight:700,color:MT.T1}}>{props.label}</span>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14,fontWeight:800,color:MT.T1}}>{row.ltp}</span>
        <span style={{fontSize:12,fontWeight:700,color:color}}>{row.chgPct!=null?((row.chgPct>=0?"+":"")+row.chgPct+"%"):"--"}</span>
      </div>
    </div>
  );
}

function UnavailableLine(props){
  return <div style={{fontSize:12,color:MT.T3,lineHeight:1.6,marginTop:4}}>{props.children}</div>;
}

export default function DynamicBriefingCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Mutate the shared MT object's properties (not a local shadow) so the
  // module-level helper components below (IndexLine, Field), which read
  // MT via closure, also see the current theme's colors.
  MT.BG=theme.c.bg; MT.CARD=theme.c.card; MT.BD=theme.c.border;
  MT.T1=theme.c.text1; MT.T2=theme.c.text2; MT.T3=theme.c.text3;
  MT.BLUE=theme.c.blue; MT.GREEN=theme.c.up; MT.RED=theme.c.down; MT.BLUE=theme.c.gold;
  var mm = props.mm || {};
  var data = mm.data || null;
  var mood = mm.mood || null;

  // Same loading/error semantics MarketMoodCard.jsx already uses (mm.status
  // plus a data-readiness check) - not a new threshold, the same one.
  var loadingOrError = mm.status=="loading" || mm.status=="error" || !data;

  // Same freshness classification MarketMoodCard.jsx derives from the real
  // NIFTY freshness field (LIVE / STALE / default DELAYED) - read directly
  // from the shared real data here instead of depending on the sibling
  // card having already mutated a shared object first.
  var freshStatus = "DELAYED";
  try{
    var f = data && data.indices && data.indices.NIFTY && data.indices.NIFTY.freshness && data.indices.NIFTY.freshness.status;
    if(f=="LIVE") freshStatus="LIVE";
    else if(f=="STALE") freshStatus="STALE";
  }catch(e){}
  var freshColor = freshStatus=="LIVE" ? MT.GREEN : (freshStatus=="STALE" ? theme.c.warn : MT.BLUE);

  var session = getBriefingSession();
  var meta = BRIEFING_META[session];
  var freshness = fmtTime(mm.lastUpdated);
  var idx = (data && data.indices) || {};

  var body = null;

  if(loadingOrError){
    body = (
      <div style={{padding:"8px 0"}}>
        <div style={{fontSize:12,fontWeight:700,color:mm.status=="error"?MT.RED:MT.T2}}>
          {mm.status=="error" ? "Briefing data temporarily unavailable" : (mm.status=="offline" ? "You are offline" : "Loading briefing...")}
        </div>
        <div style={{fontSize:12,color:MT.T3,marginTop:4}}>No fabricated values are shown. Live data resumes automatically.</div>
      </div>
    );
  } else if(session=="MORNING"){
    body = (
      <div>
        <IndexLine label="NIFTY 50" row={idx.NIFTY}/>
        <IndexLine label="SENSEX" row={idx.SENSEX}/>
        <UnavailableLine>Overnight global cues and key events: unavailable - no verified source connected yet.</UnavailableLine>
      </div>
    );
  } else if(session=="LIVE"){
    body = (
      <div>
        <IndexLine label="NIFTY 50" row={idx.NIFTY}/>
        <IndexLine label="BANK NIFTY" row={idx.BANKNIFTY}/>
        {mood && mood.label ? (
          <div style={{fontSize:12,color:MT.T2,marginTop:8}}>Market mood is {mood.label}.</div>
        ) : (
          <UnavailableLine>Market mood: unavailable right now.</UnavailableLine>
        )}
      </div>
    );
  } else if(session=="CLOSE"){
    var sectors = (data && data.sectors && data.sectors.items) || [];
    body = (
      <div>
        <IndexLine label="NIFTY 50" row={idx.NIFTY}/>
        <IndexLine label="SENSEX" row={idx.SENSEX}/>
        {sectors.length ? (
          <div style={{fontSize:12,color:MT.T2,marginTop:4}}>
            {sectors.slice(0,2).map(function(s,i){
              return (i>0?" / ":"") + s.name + " " + (s.chgPct>=0?"+":"") + s.chgPct + "%";
            }).join("")}
          </div>
        ) : <UnavailableLine>Sector performance: unavailable.</UnavailableLine>}
        <UnavailableLine>FII/DII and top gainer/loser: unavailable - no verified source connected yet.</UnavailableLine>
      </div>
    );
  } else if(session=="PREP"){
    body = (
      <UnavailableLine>Tomorrow preparation data is unavailable until verified events and expiry sources are connected.</UnavailableLine>
    );
  } else { // GLOBAL
    var global = (data && data.global && data.global.items) || [];
    body = global.length ? (
      <div>
        {global.slice(0,3).map(function(g,i){
          var color = g.chgPct==null ? MT.T2 : (g.chgPct>=0 ? MT.GREEN : MT.RED);
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
              <span style={{fontSize:12,color:MT.T1,fontWeight:700}}>{g.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:color}}>{(g.chgPct>=0?"+":"")+g.chgPct+"%"}</span>
            </div>
          );
        })}
      </div>
    ) : <UnavailableLine>Global markets: unavailable right now.</UnavailableLine>;
  }

  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:16,padding:16,minHeight:150,boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:meta.icon}}/>
          <span style={{fontSize:14,fontWeight:800,color:MT.T1}}>{meta.title}</span>
        </div>
        {freshness && !loadingOrError ? (
          <span style={{fontSize:12,color:freshColor,fontWeight:700}}>{freshStatus} &bull; {freshness}</span>
        ) : null}
      </div>
      <div style={{minHeight:60}}>{body}</div>
    </div>
  );
}
