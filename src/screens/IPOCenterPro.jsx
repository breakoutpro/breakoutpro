import { useState } from "react";
import { DEMO_LABEL, STATUSES, IPOS, EDUCATIONAL_TEXT, daysFromTodayToDate, generateInsight } from "./IPOCenterData";
import { useIPOCenterBookmarks } from "../hooks/useIPOCenterBookmarks";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - IPOCenterPro.jsx
// Educational / Demo IPO Center - Breakout Pro has no real live IPO data
// source, so this uses fixed, hand-authored illustrative entries only,
// clearly and permanently labeled, never Math.random, never a live
// status claim, never a listing-gain prediction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

var STATUS_COLOR = { "Upcoming":BLUE, "Open":UP, "Closed":WARN, "Listed":T2 };

function fmtDate(d){
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}
function Explain(props){
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}
function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border;

  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:T1}}>{props.value}</span>
    </div>
  );
}

export default function IPOCenterPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.warn;
  // STATUS_COLOR is a derived object built once at module load - update
  // its properties too since reassigning the base vars alone won't.
  STATUS_COLOR["Upcoming"]=BLUE; STATUS_COLOR["Open"]=UP; STATUS_COLOR["Closed"]=T2; STATUS_COLOR["Listed"]=T2;
  var onBack = props.onBack || function(){};
  var bookmarks = useIPOCenterBookmarks(); // single instance for this whole subtree

  var [detailId, setDetailId] = useState(null);
  var [filter, setFilter] = useState("All");
  var [search, setSearch] = useState("");

  if(detailId){
    var ipo = IPOS.filter(function(i){ return i.id==detailId; })[0];
    if(!ipo) return null;
    var saved = bookmarks.isBookmarked(ipo.id);
    return (
      <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={function(){setDetailId(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>IPO Details</div>
        </div>
        <div style={{padding:16}}>
          <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:16,display:"inline-block"}}>
            <span style={{fontSize:12,fontWeight:700,color:T2}}>{DEMO_LABEL.toUpperCase()}</span>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:800,color:T1,flex:1}}>{ipo.company}</div>
              <span onClick={function(){bookmarks.toggleBookmark(ipo.id);}} style={{fontSize:22,color:saved?T2:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:STATUS_COLOR[ipo.status],background:STATUS_COLOR[ipo.status]+"18",border:"1px solid "+STATUS_COLOR[ipo.status]+"40",borderRadius:6,padding:"4px 8px"}}>{ipo.status}</span>
            <div style={{marginTop:12}}>
              <Row label="Exchange" value={ipo.exchange}/>
              <Row label="Issue Size" value={ipo.issueSize}/>
              <Row label="Price Band" value={ipo.priceBand}/>
              <Row label="Lot Size" value={ipo.lotSize}/>
              <Row label="Open Date" value={fmtDate(daysFromTodayToDate(ipo.openDaysFromToday))}/>
              <Row label="Close Date" value={fmtDate(daysFromTodayToDate(ipo.closeDaysFromToday))}/>
              <Row label="Listing Date" value={fmtDate(daysFromTodayToDate(ipo.listingDaysFromToday))} last={true}/>
            </div>
          </div>
          <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12}}>
            <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Illustrative educational entry, not a confirmed live IPO status. Breakout Pro has no real IPO data feed. Never a listing-gain prediction.</div>
          </div>
        </div>
      </div>
    );
  }

  var filtered = IPOS.filter(function(i){
    if(filter!="All" && i.status!=filter) return false;
    if(search.trim() && i.company.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    return true;
  });
  var sorted = filtered.slice().sort(function(a,b){ return a.openDaysFromToday-b.openDaysFromToday; });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>IPO Center Pro</div>
          <div style={{fontSize:12,color:T2}}>{DEMO_LABEL}</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Breakout Pro has no live IPO data feed connected. All entries below are illustrative examples for learning purposes, not a confirmed schedule. Never a listing-gain prediction, never investment advice.</div>
        </div>

        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search IPO..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {["All"].concat(STATUSES).map(function(s){
            var act=s==filter;
            return <button key={s} onClick={function(){setFilter(s);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{s}</button>;
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{generateInsight(IPOS)}</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>IPO TIMELINE ({sorted.length})</div>
        {sorted.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No IPOs match your filters.</div>
        ) : sorted.map(function(ipo){
          var saved = bookmarks.isBookmarked(ipo.id);
          return (
            <div key={ipo.id} onClick={function(){setDetailId(ipo.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:4}}>{ipo.company}</div>
                  <div style={{fontSize:12,color:T3}}>{ipo.priceBand} &#8226; Lot {ipo.lotSize} &#8226; {ipo.exchange}</div>
                </div>
                <span onClick={function(e2){ e2.stopPropagation(); bookmarks.toggleBookmark(ipo.id); }} style={{fontSize:18,color:saved?T2:T3,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:STATUS_COLOR[ipo.status],background:STATUS_COLOR[ipo.status]+"18",border:"1px solid "+STATUS_COLOR[ipo.status]+"40",borderRadius:6,padding:"4px 8px",marginTop:8,display:"inline-block"}}>{ipo.status}</span>
            </div>
          );
        })}

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12,marginTop:16}}>EDUCATIONAL SECTION</div>
        <Explain title="What is an IPO?" text={EDUCATIONAL_TEXT.whatIsIPO}/>
        <Explain title="How to Apply?" text={EDUCATIONAL_TEXT.howToApply}/>
        <Explain title="Risks" text={EDUCATIONAL_TEXT.risks}/>
        <Explain title="Listing Gains" text={EDUCATIONAL_TEXT.listingGains}/>
      </div>
    </div>
  );
}
