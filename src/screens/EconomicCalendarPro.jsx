import { useState } from "react";
import { CALENDAR_LABEL, CATEGORIES, COUNTRIES, IMPACT_LEVELS, EVENTS } from "./EconomicCalendarData";
import { useEconomicCalendarBookmarks } from "../hooks/useEconomicCalendarBookmarks";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - EconomicCalendarPro.jsx
// Educational / Demo Calendar - Breakout Pro has no real live economic-
// calendar data source, so this is clearly and permanently labeled as
// such, per spec. Illustrative event dates are computed from the real
// current date (real Date math) - never Math.random, never presented as
// a confirmed live schedule. Rule-based impact text only - never a
// market-direction prediction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

var IMPACT_COLOR = { "High":R, "Medium":WARN, "Low":UP };

function eventDate(ev){
  var d = new Date();
  d.setDate(d.getDate()+ev.daysFromToday);
  return d;
}
function fmtDate(d){
  return d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
}
function bucketOf(ev){
  if(ev.daysFromToday==0) return "Today";
  if(ev.daysFromToday==1) return "Tomorrow";
  if(ev.daysFromToday<=7) return "This Week";
  return "Later";
}

export default function EconomicCalendarPro(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T3 = theme.c.text3, WARN = theme.c.gold; T1=theme.c.text1;

  var onBack = props.onBack || function(){};
  var bookmarks = useEconomicCalendarBookmarks(); // single instance for this whole subtree

  var [detailId, setDetailId] = useState(null);
  var [search, setSearch] = useState("");
  var [country, setCountry] = useState("All");
  var [impact, setImpact] = useState("All");
  var [category, setCategory] = useState("All");
  var [tab, setTab] = useState("Today");

  if(detailId){
    var ev = EVENTS.filter(function(e){ return e.id==detailId; })[0];
    if(!ev) return null;
    var d = eventDate(ev);
    var saved = bookmarks.isBookmarked(ev.id);
    return (
      <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setDetailId(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Event Details</div>
        </div>
        <div style={{padding:14}}>
          <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:8,padding:"6px 10px",marginBottom:14,display:"inline-block"}}>
            <span style={{fontSize:12,fontWeight:700,color:WARN}}>{CALENDAR_LABEL.toUpperCase()}</span>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{fontSize:16,fontWeight:800,color:T1,flex:1}}>{ev.title}</div>
              <span onClick={function(){bookmarks.toggleBookmark(ev.id);}} style={{fontSize:20,color:saved?WARN:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
            </div>
            <div style={{fontSize:12,color:T2,marginBottom:10}}>{fmtDate(d)} &#8226; {ev.country} &#8226; {ev.category}</div>
            <span style={{fontSize:12,fontWeight:700,color:IMPACT_COLOR[ev.impact],background:IMPACT_COLOR[ev.impact]+"18",border:"1px solid "+IMPACT_COLOR[ev.impact]+"40",borderRadius:6,padding:"3px 9px"}}>{ev.impact} Impact</span>
          </div>

          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>WHY THIS EVENT MATTERS</div>
            <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{ev.whyMatters}</div>
          </div>

          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED IMPACT EXPLANATION</div>
            <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{ev.ruleBasedImpact}</div>
          </div>

          <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:11}}>
            <div style={{fontSize:12,color:WARN,lineHeight:1.5}}>This is an illustrative educational entry, not a confirmed live schedule. Breakout Pro has no real economic-calendar data feed. Never a market-direction prediction.</div>
          </div>
        </div>
      </div>
    );
  }

  var filtered = EVENTS.filter(function(ev){
    if(search.trim() && ev.title.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    if(country!="All" && ev.country!=country) return false;
    if(impact!="All" && ev.impact!=impact) return false;
    if(category!="All" && ev.category!=category) return false;
    if(tab!="All" && bucketOf(ev)!=tab && !(tab=="This Week" && (bucketOf(ev)=="Today"||bucketOf(ev)=="Tomorrow"))) return false;
    return true;
  });
  var sorted = filtered.slice().sort(function(a,b){ return a.daysFromToday-b.daysFromToday; });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Economic Calendar Pro</div>
          <div style={{fontSize:12,color:WARN}}>{CALENDAR_LABEL}</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:11,marginBottom:14}}>
          <div style={{fontSize:12,color:WARN,lineHeight:1.5}}>Breakout Pro has no real live economic-calendar feed. All events below are illustrative examples for learning purposes, not a confirmed schedule. Never investment advice, never a market-direction prediction.</div>
        </div>

        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search events..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:9,padding:"10px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>

        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {["Today","Tomorrow","This Week","All"].map(function(t){
            var act=t==tab;
            return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"9px 4px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{t}</button>;
          })}
        </div>

        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          <select value={country} onChange={function(e){setCountry(e.target.value);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px",color:T1,fontSize:12,fontFamily:"inherit"}}>
            <option value="All">All Countries</option>
            {COUNTRIES.map(function(c){ return <option key={c} value={c}>{c}</option>; })}
          </select>
          <select value={impact} onChange={function(e){setImpact(e.target.value);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px",color:T1,fontSize:12,fontFamily:"inherit"}}>
            <option value="All">All Impact</option>
            {IMPACT_LEVELS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <select value={category} onChange={function(e){setCategory(e.target.value);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px",color:T1,fontSize:12,fontFamily:"inherit"}}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(function(c){ return <option key={c} value={c}>{c}</option>; })}
          </select>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:10,marginTop:8}}>TIMELINE ({sorted.length})</div>
        {sorted.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T3,fontSize:12}}>No events match your filters.</div>
        ) : sorted.map(function(ev){
          var d = eventDate(ev);
          var saved = bookmarks.isBookmarked(ev.id);
          return (
            <div key={ev.id} onClick={function(){setDetailId(ev.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:4}}>{ev.title}</div>
                  <div style={{fontSize:12,color:T3}}>{fmtDate(d)} &#8226; {ev.country} &#8226; {ev.category}</div>
                </div>
                <span onClick={function(e2){ e2.stopPropagation(); bookmarks.toggleBookmark(ev.id); }} style={{fontSize:18,color:saved?WARN:T3,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:IMPACT_COLOR[ev.impact],background:IMPACT_COLOR[ev.impact]+"18",border:"1px solid "+IMPACT_COLOR[ev.impact]+"40",borderRadius:6,padding:"3px 9px",marginTop:8,display:"inline-block"}}>{ev.impact} Impact</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
