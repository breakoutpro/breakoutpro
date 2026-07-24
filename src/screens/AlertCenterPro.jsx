import { useState } from "react";
import { DEMO_LABEL, ALERT_TYPES, TYPE_EXPLANATIONS, generateInsight } from "./AlertCenterData";
import { useAlertCenter } from "../hooks/useAlertCenter";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - AlertCenterPro.jsx
// Real alert-RULE management only - no live triggering engine exists in
// Breakout Pro for these alert types, so this never claims an alert has
// fired. Alert History is shown honestly, clearly labeled "Educational /
// Demo Alerts". Never Math.random, never polling.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function inputStyle(){
  return {width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:9,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}
function Explain(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{props.title.toUpperCase()}</div>
      <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}

export default function AlertCenterPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  var onBack = props.onBack || function(){};
  var alerts = useAlertCenter(); // single instance for this whole subtree

  var [showCreate, setShowCreate] = useState(false);
  var [type, setType] = useState(ALERT_TYPES[0]);
  var [symbol, setSymbol] = useState("");
  var [threshold, setThreshold] = useState("");
  var [search, setSearch] = useState("");
  var [filterType, setFilterType] = useState("All");

  function submit(){
    if(!symbol.trim()) return;
    alerts.addRule({ type:type, symbol:symbol.trim().toUpperCase(), threshold:threshold.trim() });
    setSymbol(""); setThreshold(""); setShowCreate(false);
  }

  var filtered = alerts.rules.filter(function(r){
    if(filterType!="All" && r.type!=filterType) return false;
    if(search.trim() && r.symbol.toLowerCase().indexOf(search.trim().toLowerCase())<0) return false;
    return true;
  });

  if(showCreate){
    return (
      <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={function(){setShowCreate(false);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Create Alert Rule</div>
        </div>
        <div style={{padding:16}}>
          <label style={{fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:8}}>Alert Type</label>
          <select style={inputStyle()} value={type} onChange={function(e){setType(e.target.value);}}>
            {ALERT_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option>; })}
          </select>
          <label style={{fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:8}}>Symbol / Topic</label>
          <input style={inputStyle()} type="text" value={symbol} onChange={function(e){setSymbol(e.target.value);}} placeholder="e.g. RELIANCE"/>
          <label style={{fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:8}}>Threshold / Note (optional)</label>
          <input style={inputStyle()} type="text" value={threshold} onChange={function(e){setThreshold(e.target.value);}} placeholder="e.g. Above 2500"/>
          <button onClick={submit} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Save Alert Rule</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Alert Center Pro</div>
          <div style={{fontSize:12,color:T2}}>Your alert rules, managed locally</div>
        </div>
        <button onClick={function(){setShowCreate(true);}} style={{background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>+ Create</button>
      </div>

      <div style={{padding:16}}>
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search alerts..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={function(){setFilterType("All");}} style={{background:filterType=="All"?BLUE:"transparent",border:"1px solid "+(filterType=="All"?BLUE:BD),borderRadius:8,padding:"8px 12px",color:filterType=="All"?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>All</button>
          {ALERT_TYPES.map(function(t){
            var act=t==filterType;
            return <button key={t} onClick={function(){setFilterType(t);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{t}</button>;
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED INSIGHT</div>
          <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{generateInsight(alerts.rules)}</div>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>YOUR ALERT RULES ({filtered.length})</div>
        {filtered.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12,marginBottom:16}}>No alert rules yet. Tap Create to add one.</div>
        ) : filtered.map(function(r){
          return (
            <div key={r.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:4}}>{r.symbol}</div>
                  <div style={{fontSize:12,color:T3}}>{r.type}{r.threshold?(" \u2022 "+r.threshold):""}</div>
                </div>
                <span onClick={function(){alerts.toggleBookmark(r.id);}} style={{fontSize:18,color:r.bookmarked?T2:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{r.bookmarked?"\u2605":"\u2606"}</span>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={function(){alerts.toggleEnabled(r.id);}} style={{flex:1,background:"transparent",border:"1px solid "+(r.enabled?BLUE:T3),borderRadius:8,padding:"8px 4px",color:r.enabled?BLUE:T3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{r.enabled?"Enabled":"Disabled"}</button>
                <button onClick={function(){alerts.deleteRule(r.id);}} style={{flex:1,background:"transparent",border:"1px solid "+R,borderRadius:8,padding:"8px 4px",color:R,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Delete</button>
              </div>
            </div>
          );
        })}

        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:12,marginTop:16,display:"inline-block"}}>
          <span style={{fontSize:12,fontWeight:700,color:T2}}>{DEMO_LABEL.toUpperCase()}</span>
        </div>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>ALERT HISTORY</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12,marginBottom:16}}>No alerts have been triggered. Breakout Pro has no live triggering engine connected for these alert types - this history is honestly empty rather than showing fabricated past alerts.</div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>EDUCATIONAL SECTION</div>
        {ALERT_TYPES.map(function(t){
          return <Explain key={t} title={t} text={TYPE_EXPLANATIONS[t]}/>;
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational only. Alert rules are saved locally on your device. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
