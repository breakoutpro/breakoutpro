import { useState } from "react";
import { useTradingJournal } from "../hooks/useTradingJournal";
import { STRATEGIES, MISTAKE_TAGS, generateMistakeSummary } from "./TradingJournalData";
import AddTradeForm from "./AddTradeForm";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - TradingJournalHome.jsx
// Trading Journal main screen. Single useTradingJournal() instance for
// this whole subtree - no duplicate hook. All statistics computed live
// from real trades only.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444";

export default function TradingJournalHome(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down;
  var onBack = props.onBack || function(){};
  var journal = useTradingJournal(); // single instance for this whole subtree

  var [showAdd, setShowAdd] = useState(false);
  var [expandedId, setExpandedId] = useState(null);
  var [filterStrategy, setFilterStrategy] = useState("All");
  var [filterResult, setFilterResult] = useState("All");
  var [filterSymbol, setFilterSymbol] = useState("");
  var [filterDate, setFilterDate] = useState("");

  if(showAdd){
    return <AddTradeForm journal={journal} onDone={function(){setShowAdd(false);}} onCancel={function(){setShowAdd(false);}}/>;
  }

  var filtered = journal.trades.filter(function(t){
    if(filterStrategy!="All" && t.strategy!=filterStrategy) return false;
    if(filterResult=="Win" && !t.isWin) return false;
    if(filterResult=="Loss" && t.isWin) return false;
    if(filterSymbol.trim() && t.symbol.indexOf(filterSymbol.trim().toUpperCase())<0) return false;
    if(filterDate && t.date!=filterDate) return false;
    return true;
  });

  var stats = journal.computeStats(filtered);
  var summary = generateMistakeSummary(filtered);

  return (
    <div style={{background:"#050505",minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:40,height:40,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:T1}}>Trading Journal</div>
          <div style={{fontSize:9,color:T2}}>Real trades, real statistics. Educational only.</div>
        </div>
        <button onClick={function(){setShowAdd(true);}} style={{background:BLUE,border:"none",borderRadius:9,padding:"9px 14px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>+ Add</button>
      </div>

      <div style={{padding:14}}>
        <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10}}>PERFORMANCE DASHBOARD</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <StatCard label="Total Trades" value={stats.total}/>
          <StatCard label="Win Rate" value={stats.winRate+"%"} color={stats.winRate>=50?UP:R}/>
          <StatCard label="Avg Risk:Reward" value={stats.avgRR!=null?("1 : "+stats.avgRR.toFixed(2)):"--"}/>
          <StatCard label="Best Strategy" value={stats.bestStrategy||"--"}/>
        </div>
        {stats.mostCommonMistake ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:16}}>
            <div style={{fontSize:9,fontWeight:800,color:T2,marginBottom:4}}>MOST COMMON MISTAKE</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{stats.mostCommonMistake}</div>
          </div>
        ) : null}

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10}}>AI MISTAKE SUMMARY (rule-based, from your real trades)</div>
          {summary.lines.map(function(line,i){
            return <div key={i} style={{fontSize:11,color:"#C9D4E5",lineHeight:1.6,marginBottom:6}}>{line}</div>;
          })}
        </div>

        <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10}}>FILTERS</div>
        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          <select value={filterStrategy} onChange={function(ev){setFilterStrategy(ev.target.value);}} style={{background:"#0B0E13",border:"1px solid "+BD,borderRadius:8,padding:"7px 8px",color:T1,fontSize:10,fontFamily:"inherit"}}>
            <option value="All">All Strategies</option>
            {STRATEGIES.map(function(s){ return <option key={s} value={s}>{s}</option>; })}
          </select>
          <select value={filterResult} onChange={function(ev){setFilterResult(ev.target.value);}} style={{background:"#0B0E13",border:"1px solid "+BD,borderRadius:8,padding:"7px 8px",color:T1,fontSize:10,fontFamily:"inherit"}}>
            <option value="All">Win/Loss: All</option>
            <option value="Win">Win Only</option>
            <option value="Loss">Loss Only</option>
          </select>
          <input value={filterSymbol} onChange={function(ev){setFilterSymbol(ev.target.value);}} placeholder="Symbol" style={{background:"#0B0E13",border:"1px solid "+BD,borderRadius:8,padding:"7px 8px",color:T1,fontSize:10,fontFamily:"inherit",width:90}}/>
          <input value={filterDate} onChange={function(ev){setFilterDate(ev.target.value);}} type="date" style={{background:"#0B0E13",border:"1px solid "+BD,borderRadius:8,padding:"7px 8px",color:T1,fontSize:10,fontFamily:"inherit"}}/>
        </div>

        <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10,marginTop:8}}>TRADE HISTORY ({filtered.length})</div>
        {filtered.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T3,fontSize:11}}>No trades match. Add your first trade to get started.</div>
        ) : filtered.map(function(t){
          var expanded = expandedId==t.id;
          return (
            <div key={t.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}>
              <div onClick={function(){setExpandedId(expanded?null:t.id);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{t.symbol} <span style={{fontSize:9,color:T3,fontWeight:600}}>{t.side} &#8226; {t.date}</span></div>
                  <div style={{fontSize:9,color:T3,marginTop:2}}>{t.strategy} &#8226; {t.timeframe}</div>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:t.isWin?UP:R}}>{t.pnl>=0?"+":""}{t.pnl.toFixed(2)}</div>
              </div>
              {expanded ? (
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+BD}}>
                  <Row label="Entry" value={t.entry}/>
                  <Row label="Exit" value={t.exit}/>
                  <Row label="Stoploss" value={t.stoploss!=null?t.stoploss:"--"}/>
                  <Row label="Target" value={t.target!=null?t.target:"--"}/>
                  <Row label="Quantity" value={t.qty}/>
                  <Row label="R:R" value={t.rr!=null?("1 : "+t.rr.toFixed(2)):"--"} last={!t.notes}/>
                  {t.notes ? <div style={{fontSize:10,color:T2,marginTop:6,fontStyle:"italic"}}>{t.notes}</div> : null}

                  <div style={{fontSize:9,fontWeight:800,color:T2,marginTop:10,marginBottom:6}}>MISTAKE TAGS</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                    {MISTAKE_TAGS.map(function(tag){
                      var active = (t.mistakeTags||[]).indexOf(tag)>=0;
                      return (
                        <span key={tag} onClick={function(){journal.toggleMistakeTag(t.id, tag);}} style={{fontSize:9,fontWeight:700,color:active?"#fff":T3,background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>{tag}</span>
                      );
                    })}
                  </div>
                  <button onClick={function(){journal.deleteTrade(t.id);}} style={{background:"none",border:"1px solid "+R,borderRadius:8,padding:"7px 12px",color:R,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Delete Trade</button>
                </div>
              ) : null}
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational journal only. All statistics are computed from your own logged trades. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function StatCard(props){
  var T2="#A0A7B4", T1="#FFFFFF", BD="#20242D", CARD="#101318";
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12}}>
      <div style={{fontSize:15,fontWeight:800,color:props.color||T1}}>{props.value}</div>
      <div style={{fontSize:9,color:T2,marginTop:2}}>{props.label}</div>
    </div>
  );
}
function Row(props){
  var T2="#A0A7B4", T1="#FFFFFF", BD="#20242D";
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:10,color:T2}}>{props.label}</span>
      <span style={{fontSize:11,fontWeight:700,color:T1}}>{props.value}</span>
    </div>
  );
}
