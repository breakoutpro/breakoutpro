import { useState } from "react";
import { usePortfolioAnalytics } from "../hooks/usePortfolioAnalytics";
import { SORT_OPTIONS, computeHealthScore, computeRiskMeter, generateInsights } from "./PortfolioAnalyticsData";
import AddHoldingForm from "./AddHoldingForm";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - PortfolioAnalyticsHome.jsx
// Portfolio Analytics main screen. Single usePortfolioAnalytics()
// instance for this whole subtree - no duplicate hook. Every number
// computed live from real holdings only. Current Price is always
// user-entered - never fetched, never fake.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#1B5E20",R="#C62828",WARN="#D4AF37";

var HEALTH_COLOR = { "Excellent":UP, "Good":UP, "Average":WARN, "Needs Improvement":R };
var RISK_COLOR = { "Low":UP, "Medium":WARN, "High":R };

function fmt(n){
  if(n==null || !isFinite(n)) return "--";
  return n.toLocaleString("en-IN",{maximumFractionDigits:2});
}

export default function PortfolioAnalyticsHome(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  // HEALTH_COLOR/RISK_COLOR are derived objects built once at module load -
  // reassigning the base vars above does not retroactively update them, so
  // their properties must be updated explicitly too.
  HEALTH_COLOR["Excellent"]=UP; HEALTH_COLOR["Good"]=UP; HEALTH_COLOR["Average"]=T2; HEALTH_COLOR["Needs Improvement"]=R;
  RISK_COLOR["Low"]=UP; RISK_COLOR["Medium"]=T2; RISK_COLOR["High"]=R;
  var onBack = props.onBack || function(){};
  var portfolio = usePortfolioAnalytics(); // single instance for this whole subtree

  var [mode, setMode] = useState("list");
  var [editingId, setEditingId] = useState(null);
  var [search, setSearch] = useState("");
  var [sortBy, setSortBy] = useState("Investment");

  if(mode=="create"){
    return <AddHoldingForm portfolio={portfolio} onDone={function(){setMode("list");}} onCancel={function(){setMode("list");}}/>;
  }
  if(mode=="edit"){
    var editing = portfolio.holdings.filter(function(h){ return h.id==editingId; })[0];
    return <AddHoldingForm portfolio={portfolio} editing={editing} onDone={function(){setMode("list"); setEditingId(null);}} onCancel={function(){setMode("list"); setEditingId(null);}}/>;
  }

  var dash = portfolio.computeDashboard();
  var cards = portfolio.computeCards();
  var sectorAlloc = portfolio.computeSectorAllocation();
  var assetAlloc = portfolio.computeAssetAllocation();
  var health = computeHealthScore(portfolio.holdings);
  var risk = computeRiskMeter(portfolio.holdings);
  var insights = generateInsights(portfolio.holdings);

  var filtered = portfolio.holdings.filter(function(h){
    if(!search.trim()) return true;
    return h.symbol.toLowerCase().indexOf(search.trim().toLowerCase())>=0;
  });
  var withPct = filtered.map(function(h){
    var pnlPct = h.avgBuyPrice>0 ? ((h.currentPrice-h.avgBuyPrice)/h.avgBuyPrice)*100 : 0;
    return Object.assign({}, h, { pnlPct:pnlPct, value:h.qty*h.currentPrice, invested:h.qty*h.avgBuyPrice });
  });
  var sorted = withPct.slice();
  if(sortBy=="Profit") sorted.sort(function(a,b){ return b.pnlPct-a.pnlPct; });
  else if(sortBy=="Loss") sorted.sort(function(a,b){ return a.pnlPct-b.pnlPct; });
  else if(sortBy=="Alphabetical") sorted.sort(function(a,b){ return a.symbol.localeCompare(b.symbol); });
  else if(sortBy=="Investment") sorted.sort(function(a,b){ return b.invested-a.invested; });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Portfolio Analytics</div>
          <div style={{fontSize:12,color:T2}}>Your real holdings, computed live. Educational only.</div>
        </div>
        <button onClick={function(){setMode("create");}} style={{background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>+ Add</button>
      </div>

      <div style={{padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>PORTFOLIO DASHBOARD</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <StatCard label="Total Investment" value={"Rs "+fmt(dash.totalInvestment)}/>
          <StatCard label="Current Value" value={"Rs "+fmt(dash.currentValue)}/>
          <StatCard label="Total P/L" value={(dash.pnl>=0?"+":"")+"Rs "+fmt(dash.pnl)} color={dash.pnl>=0?UP:R}/>
          <StatCard label="Profit %" value={(dash.pnlPct>=0?"+":"")+dash.pnlPct.toFixed(2)+"%"} color={dash.pnlPct>=0?UP:R}/>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:800,color:T1}}>{dash.count}</div>
          <div style={{fontSize:12,color:T2,marginTop:4}}>Number of Holdings</div>
        </div>

        {cards.best ? (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <MiniCard label="Best Performer" name={cards.best.symbol} sub={(cards.best.pnlPct>=0?"+":"")+cards.best.pnlPct.toFixed(2)+"%"} color={UP}/>
            <MiniCard label="Worst Performer" name={cards.worst.symbol} sub={cards.worst.pnlPct.toFixed(2)+"%"} color={R}/>
            <MiniCard label="Largest Holding" name={cards.largest.symbol} sub={"Rs "+fmt(cards.largest.value)}/>
            <MiniCard label="Highest Allocation" name={cards.highestAllocation.symbol} sub={cards.highestAllocation.allocPct.toFixed(1)+"%"}/>
          </div>
        ) : null}

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>PORTFOLIO HEALTH</div>
          <div style={{fontSize:16,fontWeight:800,color:HEALTH_COLOR[health.label]}}>{health.label}</div>
          <div style={{fontSize:12,color:T2,marginTop:4,lineHeight:1.5}}>{health.reason}</div>
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>RISK METER</div>
          <div style={{fontSize:16,fontWeight:800,color:RISK_COLOR[risk.label]}}>{risk.label}</div>
          <div style={{fontSize:12,color:T2,marginTop:4,lineHeight:1.5}}>{risk.reason}</div>
        </div>

        {sectorAlloc.length>0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>SECTOR ALLOCATION</div>
            {sectorAlloc.map(function(s){
              return (
                <div key={s.sector} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:T1}}>{s.sector}</span>
                    <span style={{color:T2,fontWeight:700}}>{s.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:s.pct+"%",height:"100%",background:BLUE,borderRadius:3}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {assetAlloc.length>0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>ASSET ALLOCATION (PER HOLDING)</div>
            {assetAlloc.map(function(a){
              return (
                <div key={a.symbol} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BD}}>
                  <span style={{fontSize:12,color:T1}}>{a.symbol}</span>
                  <span style={{fontSize:12,color:T2,fontWeight:700}}>{a.pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        ) : null}

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>PORTFOLIO INSIGHTS</div>
          {insights.map(function(line,i){
            return <div key={i} style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6,marginBottom:8}}>{line}</div>;
          })}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <input value={search} onChange={function(ev){setSearch(ev.target.value);}} placeholder="Search holdings..." style={{flex:1,minWidth:140,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}/>
          <select value={sortBy} onChange={function(ev){setSortBy(ev.target.value);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit"}}>
            {SORT_OPTIONS.map(function(o){ return <option key={o} value={o}>{o}</option>; })}
          </select>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>HOLDINGS ({sorted.length})</div>
        {sorted.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No holdings yet. Add your first one to get started.</div>
        ) : sorted.map(function(h){
          return (
            <div key={h.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:T1}}>{h.symbol}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{h.sector} &#8226; Qty {h.qty} &#8226; Avg Rs{fmt(h.avgBuyPrice)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:h.pnlPct>=0?UP:R}}>{(h.pnlPct>=0?"+":"")+h.pnlPct.toFixed(2)}%</div>
                  <div style={{fontSize:12,color:T2,marginTop:4}}>Rs {fmt(h.value)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setEditingId(h.id); setMode("edit");}} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:8,padding:"8px",color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Edit</button>
                <button onClick={function(){portfolio.deleteHolding(h.id);}} style={{flex:1,background:"transparent",border:"1px solid "+R,borderRadius:8,padding:"8px",color:R,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Delete</button>
              </div>
            </div>
          );
        })}

        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginTop:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational tool only. Current prices are values you entered yourself - not live market data. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function StatCard(props){
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
      <div style={{fontSize:16,fontWeight:800,color:props.color||T1}}>{props.value}</div>
      <div style={{fontSize:12,color:T2,marginTop:4}}>{props.label}</div>
    </div>
  );
}
function MiniCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
      <div style={{fontSize:12,color:T2,marginBottom:4}}>{props.label}</div>
      <div style={{fontSize:14,fontWeight:800,color:T1}}>{props.name}</div>
      <div style={{fontSize:12,fontWeight:700,color:props.color||T2,marginTop:4}}>{props.sub}</div>
    </div>
  );
}
