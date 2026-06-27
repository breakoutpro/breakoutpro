import { useState } from "react";
import { STRATEGIES, LEARN_PATH } from "./OptSellData";
import OptSellStrategy from "./OptSellStrategy";

// BreakoutPro - OptSellAcademy.jsx
// Options Selling Academy (PRO) dashboard. Educational only. SEBI-safe.
// Pure black, green positive / red risk. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// AI strategy explainer by market condition (educational - which concepts are studied).
var CONDITIONS={
  Bullish:"In bullish conditions, traders often study Cash Secured Puts and Bull Put Spreads, where positive Theta and a rising market both help. Watch for sudden reversals and event risk.",
  Bearish:"In bearish conditions, Bear Call Spreads are commonly studied. They define risk while benefiting from time decay. Watch for sharp short-covering rallies.",
  Sideways:"In sideways markets, range strategies like Iron Condor, Short Strangle, and Short Straddle are studied for their strong Theta. The key risk is a sudden breakout from the range.",
  "High IV":"When IV is high, sellers study premium-rich setups because options are expensive. The reward is potential IV crush, but the risk is that high IV often comes with big moves.",
  "Low IV":"When IV is low, selling collects little premium, so calendar spreads that buy cheap longer-dated Vega are studied. Watch for IV expansion.",
  "Expiry Week":"In expiry week, Theta decay is fastest, which sellers study closely. Gamma risk is also highest, so small moves can cause big swings near expiry."
};

export default function OptSellAcademy(props){
  var [sel,setSel]=useState(null);
  var [cond,setCond]=useState("Sideways");
  var [tab,setTab]=useState("dash");

  if(sel) return <OptSellStrategy id={sel} onBack={function(){setSel(null);}}/>;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"14px 14px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16,fontWeight:900,color:T1}}>Options Selling Academy</span>
              <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Master option selling through education and intelligence</div>
          </div>
        </div>
        {/* tabs */}
        <div style={{display:"flex",gap:6,marginTop:12}}>
          {[["dash","Dashboard"],["strat","Strategies"],["learn","Learn"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:BD),borderRadius:9,padding:"6px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {tab=="dash"?(
          <div>
            {/* What is option selling */}
            <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:6}}>What is Option Selling?</div>
              <div style={{fontSize:11,color:T2,lineHeight:1.6}}>Option sellers collect premium upfront and profit when options lose value over time. Time decay (Theta) works in their favour, but risk can be large if the market moves sharply. This academy teaches the concepts, not trade calls.</div>
            </div>

            {/* Daily Hub entry */}
            <button onClick={function(){props.setTab&&props.setTab("optsellhub");}} style={{width:"100%",background:"linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.03))",border:"1px solid rgba(212,175,55,0.3)",borderRadius:13,padding:14,marginBottom:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:12.5,fontWeight:800,color:GOLD}}>Option Sellers Daily Hub</div>
                <div style={{fontSize:9.5,color:T2,marginTop:3}}>Today's metrics, AI commentary, expiry and risk</div>
              </div>
              <span style={{fontSize:16,color:GOLD}}>&#8250;</span>
            </button>

            {/* Meters */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
              <Meter label="Theta Decay" val="High" tone="up" note="Favours sellers today"/>
              <Meter label="IV Rank" val="38%" tone="neutral" note="Mid-range premium"/>
              <Meter label="IV Crush Risk" val="Medium" tone="down" note="Events ahead"/>
              <Meter label="Writers Activity" val="Active" tone="up" note="Two-sided writing"/>
            </div>

            {/* Risk meter */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T1}}>Risk Meter</span>
                <span style={{fontSize:11,fontWeight:800,color:GOLD}}>Moderate</span>
              </div>
              <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:8,width:"55%",background:"linear-gradient(90deg,"+UP+","+GOLD+")"}}></div>
              </div>
              <div style={{fontSize:9,color:T3,marginTop:7}}>Option selling carries undefined risk in some strategies. Always study risk first.</div>
            </div>

            {/* AI Strategy Explainer */}
            <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:9}}>AI STRATEGY EXPLAINER</div>
            <div style={{fontSize:9,color:T3,marginBottom:9}}>Pick a market condition to learn which concepts are commonly studied.</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:11}}>
              {Object.keys(CONDITIONS).map(function(c){
                var act=cond==c;
                return <button key={c} onClick={function(){setCond(c);}} style={{background:act?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:16,padding:"6px 12px",color:act?CYAN:T2,fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{c}</button>;
              })}
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:14}}>
              <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{CONDITIONS[cond]}</div>
            </div>

            <Disclaimer/>
          </div>
        ):null}

        {tab=="strat"?(
          <div>
            <div style={{fontSize:9,color:T3,marginBottom:11}}>Tap a strategy to see its payoff graph and full educational breakdown.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {STRATEGIES.map(function(s){
                return (
                  <button key={s.id} onClick={function(){setSel(s.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:800,color:T1}}>{s.name}</div>
                    <div style={{fontSize:9,color:CYAN,marginTop:3,fontWeight:600}}>{s.bias}</div>
                    <div style={{fontSize:8.5,color:T2,marginTop:6,lineHeight:1.4,height:34,overflow:"hidden"}}>{s.overview}</div>
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:14}}><Disclaimer/></div>
          </div>
        ):null}

        {tab=="learn"?(
          <div>
            {Object.keys(LEARN_PATH).map(function(level){
              return (
                <div key={level} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:9}}>{level}</div>
                  <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
                    {LEARN_PATH[level].map(function(topic,i){
                      return (
                        <div key={topic} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 13px",borderBottom:i<LEARN_PATH[level].length-1?"1px solid "+BD2:"none"}}>
                          <span style={{fontSize:11.5,color:T1}}>{topic}</span>
                          <span style={{fontSize:14,color:T3}}>&#8250;</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <Disclaimer/>
          </div>
        ):null}
      </div>
    </div>
  );
}

function Meter(props){
  var col=props.tone=="up"?UP:props.tone=="down"?DOWN:T2;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12}}>
      <div style={{fontSize:9.5,color:T2}}>{props.label}</div>
      <div style={{fontSize:15,fontWeight:800,color:col,marginTop:4}}>{props.val}</div>
      <div style={{fontSize:8,color:T3,marginTop:3}}>{props.note}</div>
    </div>
  );
}
function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Content Only. This platform is for learning and market intelligence. It does not provide investment advice or trading recommendations. Please consult a SEBI-registered investment adviser before making investment decisions.</div>
    </div>
  );
}
