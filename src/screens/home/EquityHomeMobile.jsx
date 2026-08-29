import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { JUSTIN } from "../JustInData";
import { DEMO_MOOD, DEMO_AI } from "../MarketMoodDemoData";
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
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  var SENT_GREEN="#087443", SENT_RED="#C62828", SENT_YELLOW="#C58A00";
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  function Card(p){
    return (
      <div onClick={p.onDetails||undefined} style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:14,padding:p.hero?11:9,marginBottom:7,cursor:p.onDetails?"pointer":"default",minHeight:p.minHeight||undefined}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
            {p.icon ? <span style={{fontSize:13,flexShrink:0,lineHeight:1}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:12,fontWeight:800,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
          </div>
        </div>
        {p.children}
      </div>
    );
  }

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

      <div style={{width:"100%",boxSizing:"border-box",padding:"7px 9px 0"}}>

        {/* 4. AI MARKET MOOD */}
        <Card title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("marketmood");}} minHeight={200}>
          {mm.status=="loading" && !mm.data ? (
            <div style={{fontSize:11,color:T2}}>Loading...</div>
          ) : (function(){
            var usingDemo = !mm.mood || mm.mood.score==null;
            var mood = usingDemo ? DEMO_MOOD : mm.mood;
            var ai = usingDemo ? DEMO_AI : mm.ai;
            var moodColor = mood.label.indexOf("Bullish")>=0?SENT_GREEN:(mood.label.indexOf("Bearish")>=0?SENT_RED:SENT_YELLOW);
            return (
              <div style={{width:"100%",boxSizing:"border-box"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:moodColor,flexShrink:0}}></span>
                  <span style={{fontSize:15,fontWeight:900,color:moodColor}}>{mood.label.toUpperCase()}</span>
                </div>
                <div style={{fontSize:11,color:T2,marginBottom:8}}>{mood.stage} &nbsp;&#183;&nbsp; {mood.confidence} Confidence &nbsp;&#183;&nbsp; AI Score: {mood.score}/100</div>
                {(function(){
                  var idx = mm.data && mm.data.indices;
                  var tiles = [["NIFTY 50","NIFTY"],["BANK NIFTY","BANKNIFTY"],["INDIA VIX","VIX"]];
                  return (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6,marginBottom:8}}>
                      {tiles.map(function(t){
                        var d = idx && idx[t[1]];
                        var up = d && d.chgPct!=null ? d.chgPct>=0 : null;
                        return (
                          <div key={t[1]} style={{background:BG,border:"1px solid "+BD,borderRadius:6,padding:"4px 6px"}}>
                            <div style={{fontSize:8,color:T3,fontWeight:700}}>{t[0]}</div>
                            {d && d.ltp!=null ? (
                              <div>
                                <div style={{fontSize:11,fontWeight:800,color:T1}}>{typeof d.ltp==="number"?d.ltp.toLocaleString("en-IN"):d.ltp}</div>
                                <div style={{fontSize:9,fontWeight:700,color:up==null?T2:(up?UP:DOWN)}}>{d.chgPct!=null?(d.chgPct>=0?"+":"")+d.chgPct+"%":"--"}</div>
                              </div>
                            ) : <div style={{fontSize:9,color:T3}}>Unavailable</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>KEY SIGNAL</div>
                  {ai && (ai.now || ai.whatChanged || (ai.keyDrivers && ai.keyDrivers.length)) ? (
                    <div>
                      {ai.now ? <div style={{fontSize:11,color:T1,lineHeight:1.4,marginBottom:4}}>{ai.now}</div> : null}
                      {ai.whatChanged ? <div style={{fontSize:11,color:T2,lineHeight:1.4,marginBottom:4}}><b style={{color:T1}}>What changed: </b>{ai.whatChanged}</div> : null}
                      {ai.keyDrivers && ai.keyDrivers.length ? (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {ai.keyDrivers.map(function(d,i){
                            return <span key={i} style={{fontSize:10,color:T2,background:theme.c.card2,border:"1px solid "+BD,borderRadius:6,padding:"2px 7px"}}>{d}</span>;
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                </div>
                <div>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>WHAT TO WATCH?</div>
                  {ai && ai.watchNext ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.watchNext}</div> : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                </div>
              </div>
            );
          })()}
        </Card>

        {(function(){
          var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
          var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
          if(!hasRange){
            return (
              <Card title="Range Intelligence" icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
                <div style={{fontSize:11,color:T2}}>No verified intraday range provider connected yet.</div>
              </Card>
            );
          }
          var width = nifty.high - nifty.low;
          var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
          var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
          var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
          var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
          var stateColor = state==="Breakout Watch"?UP:(state==="Breakdown Watch"?DOWN:T1);
          return (
            <Card title="Range Intelligence" icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
              <div style={{fontSize:11,color:T2,marginBottom:4}}>NIFTY: {nifty.low.toLocaleString("en-IN")}&ndash;{nifty.high.toLocaleString("en-IN")} &middot; CMP {nifty.ltp.toLocaleString("en-IN")}</div>
              <div style={{position:"relative",height:14,marginBottom:4}}>
                <div style={{position:"absolute",top:6,left:0,right:0,height:2,background:BD}}></div>
                <div style={{position:"absolute",top:2,left:"calc("+posPct+"% - 5px)",width:10,height:10,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
              </div>
              <div style={{fontSize:12,fontWeight:800,color:stateColor}}>{posPct}% &middot; {zone} &middot; {state}</div>
            </Card>
          );
        })()}

        <Card title="Options Intelligence" icon="&#128202;" onDetails={function(){setTab("optionsintelpro");}}>
          <div style={{fontSize:11,color:T2}}>No verified options-chain provider connected yet.</div>
        </Card>

        <Card title="Market News" icon="&#128240;" onDetails={function(){setTab("news");}}>
          {JUSTIN.length===0 ? (
            <div style={{fontSize:11,color:T2}}>Market news unavailable</div>
          ) : JUSTIN.slice(0,3).map(function(n){
            return (
              <div key={n.id} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                <div style={{fontSize:10,color:T2}}>{n.time} &#183; {n.source}</div>
              </div>
            );
          })}
        </Card>

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
