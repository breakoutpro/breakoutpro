import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
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
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;
  var fearGreedColor = data.fearGreed=="Fear" ? DOWN : (data.fearGreed=="Greed" ? UP : T2);

  function Card(p){
    return (
      <div onClick={p.onDetails||undefined} style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:14,padding:p.hero?11:9,marginBottom:7,cursor:p.onDetails?"pointer":"default"}}>
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
        <Card title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <div style={{fontSize:11,color:T2}}>Loading...</div>
          ) : !mm.mood || mm.mood.score==null || data.mktStatus!=="ok" ? (
            <div style={{fontSize:11,color:T2}}>Market mood unavailable</div>
          ) : (function(){
            var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
            var ai = mm.ai;
            return (
              <div style={{width:"100%",boxSizing:"border-box"}}>
                <div style={{fontSize:15,fontWeight:900,color:moodColor,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:5}}>{mm.mood.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>Confidence: {mm.mood.confidence}</span>
                  {data.fearGreed ? (
                    <span style={{fontSize:10,fontWeight:700,color:fearGreedColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>{data.fearGreed}</span>
                  ) : null}
                </div>
                <div style={{fontSize:11,color:T2,lineHeight:1.3,marginBottom:8}}>{mm.mood.stage}</div>
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>WHY?</div>
                  {ai && ai.now ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.now}</div> : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                </div>
                <div>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>WHAT TO WATCH?</div>
                  {ai && ai.watchNext ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.watchNext}</div> : <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>}
                </div>
              </div>
            );
          })()}
        </Card>

        <Card title="Range Intelligence" icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
          <div style={{fontSize:11,color:T2}}>Multi-timeframe compression/expansion analysis.</div>
        </Card>

        <Card title="Options Intelligence" icon="&#128202;" onDetails={function(){setTab("optionsintelpro");}}>
          {/* PCR/Max Pain/Gamma/Call Wall/Put Wall are not shown here - no
              live options-chain API is connected. The prior source
              (getOptionsIntel) returned hardcoded demo strings, which is
              exactly the fabricated-data pattern this must not show. */}
          <div style={{fontSize:11,color:T2}}>Data unavailable right now.</div>
        </Card>

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
