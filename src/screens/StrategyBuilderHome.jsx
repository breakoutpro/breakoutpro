import { useState } from "react";
import { useStrategyBuilder } from "../hooks/useStrategyBuilder";
import { SORT_OPTIONS, CHECKLIST_ITEMS } from "./StrategyBuilderData";
import StrategyForm from "./StrategyForm";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - StrategyBuilderHome.jsx
// Strategy Builder main screen. Single useStrategyBuilder() instance for
// this whole subtree - no duplicate hook. All dashboard stats computed
// live from real strategies only.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",WARN="#F97316";

export default function StrategyBuilderHome(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; T2=theme.c.text2; BLUE=theme.c.blue;
  var onBack = props.onBack || function(){};
  var builder = useStrategyBuilder(); // single instance for this whole subtree

  var [mode, setMode] = useState("list"); // "list" | "create" | "edit"
  var [editingId, setEditingId] = useState(null);
  var [checklistId, setChecklistId] = useState(null);
  var [checked, setChecked] = useState({});
  var [search, setSearch] = useState("");
  var [sortBy, setSortBy] = useState("Newest");

  if(mode=="create"){
    return <StrategyForm builder={builder} onDone={function(){setMode("list");}} onCancel={function(){setMode("list");}}/>;
  }
  if(mode=="edit"){
    var editing = builder.strategies.filter(function(s){ return s.id==editingId; })[0];
    return <StrategyForm builder={builder} editing={editing} onDone={function(){setMode("list"); setEditingId(null);}} onCancel={function(){setMode("list"); setEditingId(null);}}/>;
  }

  var stats = builder.computeStats();

  var filtered = builder.strategies.filter(function(s){
    if(!search.trim()) return true;
    return s.name.toLowerCase().indexOf(search.trim().toLowerCase())>=0;
  });
  var sorted = filtered.slice();
  if(sortBy=="Newest") sorted.sort(function(a,b){ return b.createdAt-a.createdAt; });
  else if(sortBy=="Oldest") sorted.sort(function(a,b){ return a.createdAt-b.createdAt; });
  else if(sortBy=="Favourite") sorted.sort(function(a,b){ return (b.favourite?1:0)-(a.favourite?1:0); });
  else if(sortBy=="Most Used") sorted.sort(function(a,b){ return (b.usageCount||0)-(a.usageCount||0); });

  function openChecklist(id){
    setChecklistId(id);
    setChecked({});
    builder.incrementUsage(id);
  }
  function toggleCheck(item){
    setChecked(function(prev){
      var next = Object.assign({}, prev);
      next[item] = !next[item];
      return next;
    });
  }

  if(checklistId){
    var s = builder.strategies.filter(function(x){ return x.id==checklistId; })[0];
    var allChecked = CHECKLIST_ITEMS.every(function(item){ return checked[item]; });
    return (
      <div style={{padding:16}}>
        <button onClick={function(){setChecklistId(null);}} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:16}}>&#8592; Back to Strategies</button>
        <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:4}}>Pre-Trade Checklist</div>
        <div style={{fontSize:12,color:T3,marginBottom:16}}>For: {s?s.name:"Strategy"}</div>
        {CHECKLIST_ITEMS.map(function(item){
          var isChecked = !!checked[item];
          return (
            <div key={item} onClick={function(){toggleCheck(item);}} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:"1px solid "+(isChecked?BLUE:BD),borderRadius:16,padding:"12px 16px",marginBottom:8,cursor:"pointer"}}>
              <div style={{width:20,height:20,borderRadius:5,border:"1px solid "+(isChecked?BLUE:BD),background:isChecked?BLUE:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,color:"#fff"}}>{isChecked?"\u2713":""}</div>
              <span style={{fontSize:12,color:T1}}>{item}</span>
            </div>
          );
        })}
        <div style={{background:allChecked?"rgba(37,99,235,0.08)":"rgba(249,115,22,0.06)",border:"1px solid "+(allChecked?"rgba(37,99,235,0.2)":"rgba(249,115,22,0.15)"),borderRadius:10,padding:12,marginTop:12}}>
          <div style={{fontSize:12,color:allChecked?BLUE:T2,lineHeight:1.5}}>{allChecked?"All checks complete - this is a personal readiness checklist, not a trade recommendation.":"Complete all checks before proceeding, or proceed at your own judgement. This checklist is educational only."}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Strategy Builder</div>
          <div style={{fontSize:12,color:T2}}>Your own rules, saved locally. Educational only.</div>
        </div>
        <button onClick={function(){setMode("create");}} style={{background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>+ Create</button>
      </div>

      <div style={{padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>DASHBOARD</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <StatCard label="Total Strategies" value={stats.total}/>
          <StatCard label="Favourites" value={stats.favouriteCount} color={BLUE}/>
          <StatCard label="Most Used" value={stats.mostUsed?stats.mostUsed.name:"--"}/>
          <StatCard label="Avg Risk %" value={stats.avgRisk!=null?stats.avgRisk.toFixed(2)+"%":"--"}/>
        </div>
        {stats.lastEdited ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:4}}>LAST EDITED</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{stats.lastEdited.name}</div>
          </div>
        ) : null}

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <input value={search} onChange={function(ev){setSearch(ev.target.value);}} placeholder="Search strategies..." style={{flex:1,minWidth:140,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}/>
          <select value={sortBy} onChange={function(ev){setSortBy(ev.target.value);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}>
            {SORT_OPTIONS.map(function(o){ return <option key={o} value={o}>{o}</option>; })}
          </select>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>STRATEGIES ({sorted.length})</div>
        {sorted.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No strategies yet. Create your first one to get started.</div>
        ) : sorted.map(function(s){
          return (
            <div key={s.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T1}}>{s.name}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{s.market} &#8226; {s.timeframe} &#8226; Risk {s.riskPerTrade}% &#8226; Used {s.usageCount||0}x</div>
                </div>
                <span onClick={function(){builder.toggleFavourite(s.id);}} style={{fontSize:18,color:s.favourite?BLUE:T3,cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.favourite?"\u2605":"\u2606"}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <ActionBtn label="Select for Trade" onClick={function(){openChecklist(s.id);}} primary={true}/>
                <ActionBtn label="Edit" onClick={function(){setEditingId(s.id); setMode("edit");}}/>
                <ActionBtn label="Duplicate" onClick={function(){builder.duplicateStrategy(s.id);}}/>
                <ActionBtn label="Delete" onClick={function(){builder.deleteStrategy(s.id);}} danger={true}/>
              </div>
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational tool only. Strategies and statistics are yours - stored locally on your device. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function StatCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2 = theme.c.text2;

  var T2=theme.c.text2, T1="#FFFFFF", BD=theme.c.border, CARD=theme.c.card;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
      <div style={{fontSize:14,fontWeight:800,color:props.color||T1}}>{props.value}</div>
      <div style={{fontSize:12,color:T2,marginTop:4}}>{props.label}</div>
    </div>
  );
}
function ActionBtn(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, T2 = theme.c.text2;

  var T2=theme.c.text2, BD=theme.c.border, BLUE=theme.c.blue, R="#EF4444";
  var col = props.danger ? R : (props.primary ? BLUE : T2);
  return (
    <button onClick={props.onClick} style={{background:props.primary?BLUE:"transparent",border:"1px solid "+(props.primary?BLUE:col),borderRadius:8,padding:"8px 12px",color:props.primary?"#fff":col,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:36}}>{props.label}</button>
  );
}
