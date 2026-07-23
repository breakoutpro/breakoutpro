import { useState } from "react";
import { DATA_LABEL, DAILY_FLOWS, netFlow, aggregate, METRIC_EXPLANATIONS, generateInsight } from "./FiiDiiData";
import { useFiiDiiBookmarks } from "../hooks/useFiiDiiBookmarks";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - FiiDiiIntelligencePro.jsx
// Educational / Demo Data - Breakout Pro's real API already marks
// fiiDii:"UNAVAILABLE" (no live source connected), so this module uses
// fixed, hand-authored illustrative figures only, clearly and permanently
// labeled, never Math.random, never presented as live institutional data.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function dateOf(daysAgo){
  var d = new Date();
  d.setDate(d.getDate()-daysAgo);
  return d;
}
function fmtDate(d){
  return d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
}
function fmtCr(n){
  return (n>=0?"+":"")+n.toLocaleString("en-IN")+" Cr";
}

function Explain(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}
function NetCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, R = theme.c.down, UP = theme.c.up;

  var col = props.value>=0 ? UP : R;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,flex:1}}>
      <div style={{fontSize:12,color:T2,marginBottom:8}}>{props.label}</div>
      <div style={{fontSize:16,fontWeight:800,color:col}}>{fmtCr(props.value)}</div>
    </div>
  );
}

export default function FiiDiiIntelligencePro(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, R = theme.c.down, T3 = theme.c.text3, UP = theme.c.up, T2=theme.c.text2; T1=theme.c.text1;

  var onBack = props.onBack || function(){};
  var bookmarks = useFiiDiiBookmarks(); // single instance for this whole subtree

  var [period, setPeriod] = useState("Daily");
  var [search, setSearch] = useState("");
  var [dateFilter, setDateFilter] = useState("");

  var periodEntries =
    period=="Daily" ? DAILY_FLOWS.slice(0,1) :
    period=="Weekly" ? DAILY_FLOWS.slice(0,7) :
    DAILY_FLOWS;

  var agg = aggregate(periodEntries);
  var insight = generateInsight(agg);

  var filteredTimeline = DAILY_FLOWS.filter(function(e){
    var d = dateOf(e.daysAgo);
    var label = fmtDate(d);
    if(search.trim() && label.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    if(dateFilter){
      var iso = d.toISOString().slice(0,10);
      if(iso!=dateFilter) return false;
    }
    return true;
  });

  var viewId = "period_"+period;
  var saved = bookmarks.isBookmarked(viewId);

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>FII / DII Intelligence Pro</div>
          <div style={{fontSize:12,color:T2}}>{DATA_LABEL}</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Breakout Pro has no live FII/DII data feed connected. All figures below are fixed illustrative examples for learning purposes, not live institutional data. Never investment advice, never a market-direction prediction.</div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["Daily","Weekly","Monthly"].map(function(p){
            var act=p==period;
            return <button key={p} onClick={function(){setPeriod(p);}} style={{flex:1,background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 4px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{p} Flow</button>;
          })}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:800,color:T2}}>FII DASHBOARD</div>
          <span onClick={function(){bookmarks.toggleBookmark(viewId);}} style={{fontSize:18,color:saved?T2:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{saved?"\u2605":"\u2606"}</span>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <NetCard label="FII Buy" value={agg.fiiBuy}/>
          <NetCard label="FII Sell" value={-agg.fiiSell}/>
        </div>
        <div style={{marginBottom:16}}>
          <NetCard label="FII Net Flow" value={agg.fiiNet}/>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>DII DASHBOARD</div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <NetCard label="DII Buy" value={agg.diiBuy}/>
          <NetCard label="DII Sell" value={-agg.diiSell}/>
        </div>
        <div style={{marginBottom:16}}>
          <NetCard label="DII Net Flow" value={agg.diiNet}/>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>BUY VS SELL COMPARISON</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <Row label="FII Gross Buy" value={fmtCr(agg.fiiBuy)}/>
          <Row label="FII Gross Sell" value={fmtCr(agg.fiiSell)}/>
          <Row label="DII Gross Buy" value={fmtCr(agg.diiBuy)}/>
          <Row label="DII Gross Sell" value={fmtCr(agg.diiSell)} last={true}/>
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          {insight.map(function(line,i){
            return <div key={i} style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6,marginBottom:8}}>{line}</div>;
          })}
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>EDUCATIONAL EXPLANATIONS</div>
        <Explain title="FII Net Flow" text={METRIC_EXPLANATIONS.fiiNet}/>
        <Explain title="DII Net Flow" text={METRIC_EXPLANATIONS.diiNet}/>
        <Explain title="Buy vs Sell" text={METRIC_EXPLANATIONS.buyVsSell}/>
        <Explain title={period+" Flow"} text={METRIC_EXPLANATIONS[period.toLowerCase()+"Flow"]}/>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12,marginTop:8}}>TIMELINE</div>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search date (e.g. Mon, Tue)..." style={{flex:1,minWidth:160,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}/>
          <input value={dateFilter} onChange={function(e){setDateFilter(e.target.value);}} type="date" style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}/>
        </div>

        {filteredTimeline.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No entries match your filters.</div>
        ) : filteredTimeline.map(function(e,i){
          var d = dateOf(e.daysAgo);
          var nf = netFlow(e);
          return (
            <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{fontSize:12,color:T3,marginBottom:8}}>{fmtDate(d)}</div>
              <Row label="FII Net" value={fmtCr(nf.fiiNet)} color={nf.fiiNet>=0?UP:R}/>
              <Row label="DII Net" value={fmtCr(nf.diiNet)} color={nf.diiNet>=0?UP:R} last={true}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border; T1=theme.c.text1;

  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:props.color||T1}}>{props.value}</span>
    </div>
  );
}
