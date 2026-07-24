import { useState } from "react";
import { DEMO_LABEL, DIVIDENDS, EDUCATIONAL_TEXT, dateFromOffset, generateInsight } from "./DividendTrackerData";
import { useDividendTrackerBookmarks } from "../hooks/useDividendTrackerBookmarks";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - DividendTrackerPro.jsx
// Educational / Demo Dividend Tracker - Breakout Pro has no real live
// dividend-announcement data source, so this uses fixed, hand-authored
// illustrative entries only, clearly and permanently labeled, never
// Math.random, never a live announcement claim, never a future-dividend
// prediction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

var STATUS_COLOR = { "Upcoming":BLUE, "Recent":UP, "History":T2 };

function fmtDate(d){
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}
function Explain(props){
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}
function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1; T2=theme.c.text2;
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

export default function DividendTrackerPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  var onBack = props.onBack || function(){};
  var bookmarks = useDividendTrackerBookmarks(); // single instance for this whole subtree

  var [detailId, setDetailId] = useState(null);
  var [filter, setFilter] = useState("All");
  var [search, setSearch] = useState("");

  if(detailId){
    var d = DIVIDENDS.filter(function(x){ return x.id==detailId; })[0];
    if(!d) return null;
    var saved = bookmarks.isBookmarked(d.id);
    return (
      <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={function(){setDetailId(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Dividend Details</div>
        </div>
        <div style={{padding:16}}>
          <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:16,display:"inline-block"}}>
            <span style={{fontSize:12,fontWeight:700,color:T2}}>{DEMO_LABEL.toUpperCase()}</span>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:800,color:T1,flex:1}}>{d.company}</div>
              <span onClick={function(){bookmarks.toggleBookmark(d.id);}} style={{fontSize:22,color:saved?T2:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:STATUS_COLOR[d.status],background:STATUS_COLOR[d.status]+"18",border:"1px solid "+STATUS_COLOR[d.status]+"40",borderRadius:6,padding:"4px 8px"}}>{d.status}</span>
            <div style={{marginTop:12}}>
              <Row label="Dividend Per Share" value={"Rs "+d.dps.toFixed(2)}/>
              <Row label="Dividend Yield" value={d.yieldPct.toFixed(2)+"%"}/>
              <Row label="Ex-Date" value={fmtDate(dateFromOffset(d.exDaysFromToday))}/>
              <Row label="Record Date" value={fmtDate(dateFromOffset(d.recordDaysFromToday))}/>
              <Row label="Payment Date" value={fmtDate(dateFromOffset(d.paymentDaysFromToday))} last={true}/>
            </div>
          </div>
          <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12}}>
            <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Illustrative educational entry, not a confirmed live dividend announcement. Breakout Pro has no real dividend data feed. Never a prediction of future dividends.</div>
          </div>
        </div>
      </div>
    );
  }

  var filtered = DIVIDENDS.filter(function(x){
    if(filter!="All" && x.status!=filter) return false;
    if(search.trim() && x.company.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    return true;
  });
  var sorted = filtered.slice().sort(function(a,b){ return a.exDaysFromToday-b.exDaysFromToday; });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Dividend Tracker Pro</div>
          <div style={{fontSize:12,color:T2}}>{DEMO_LABEL}</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Breakout Pro has no live dividend data feed connected. All entries below are illustrative examples for learning purposes, not a confirmed announcement. Never a prediction of future dividends, never investment advice.</div>
        </div>

        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search company..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {["All","Upcoming","Recent","History"].map(function(s){
            var act=s==filter;
            return <button key={s} onClick={function(){setFilter(s);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{s}</button>;
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{generateInsight(DIVIDENDS)}</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>DIVIDEND TIMELINE ({sorted.length})</div>
        {sorted.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No entries match your filters.</div>
        ) : sorted.map(function(d){
          var saved = bookmarks.isBookmarked(d.id);
          return (
            <div key={d.id} onClick={function(){setDetailId(d.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:4}}>{d.company}</div>
                  <div style={{fontSize:12,color:T3}}>DPS Rs {d.dps.toFixed(2)} &#8226; Yield {d.yieldPct.toFixed(2)}% &#8226; Ex-Date {fmtDate(dateFromOffset(d.exDaysFromToday))}</div>
                </div>
                <span onClick={function(e2){ e2.stopPropagation(); bookmarks.toggleBookmark(d.id); }} style={{fontSize:18,color:saved?T2:T3,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:STATUS_COLOR[d.status],background:STATUS_COLOR[d.status]+"18",border:"1px solid "+STATUS_COLOR[d.status]+"40",borderRadius:6,padding:"4px 8px",marginTop:8,display:"inline-block"}}>{d.status}</span>
            </div>
          );
        })}

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12,marginTop:16}}>EDUCATIONAL SECTION</div>
        <Explain title="What is a Dividend?" text={EDUCATIONAL_TEXT.whatIsDividend}/>
        <Explain title="Ex-Date" text={EDUCATIONAL_TEXT.exDate}/>
        <Explain title="Record Date" text={EDUCATIONAL_TEXT.recordDate}/>
        <Explain title="Dividend Yield" text={EDUCATIONAL_TEXT.dividendYield}/>
      </div>
    </div>
  );
}
