import { useState } from "react";

// BreakoutPro - FuturesIntel.jsx
// Futures Intelligence + Gamma Blast (Premium). Educational market observation only.
// Compact on Home (full=false), deep page (full=true). Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// ---- DATA (educational, mock, API-ready) ----
function futData(sym){
  return {
    symbol:sym||"NIFTY", spot:"24,850", basis:"+38.5", premium:"Premium",
    dash:[
      {k:"Long Build-up",v:"Rising",tone:"up",note:"Price up + OI up"},
      {k:"Short Build-up",v:"Low",tone:"down",note:"Price down + OI up"},
      {k:"Long Unwinding",v:"Mild",tone:"down",note:"Price down + OI down"},
      {k:"Short Covering",v:"Active",tone:"up",note:"Price up + OI down"},
      {k:"OI Change",v:"+4.2%",tone:"up",note:"Open interest shift"},
      {k:"Price Change",v:"+0.62%",tone:"up",note:"Futures LTP move"},
      {k:"Volume",v:"High",tone:"up",note:"Traded contracts"},
      {k:"Premium / Discount",v:"Premium",tone:"up",note:"Futures vs spot"},
      {k:"Basis",v:"+38.5",tone:"up",note:"Futures minus spot"},
      {k:"Cost of Carry",v:"6.4%",tone:"neutral",note:"Annualised"}
    ],
    summary:"Long build-up is increasing with rising Open Interest and price. Educationally this indicates bullish futures participation. Observation only, not advice."
  };
}
function gammaData(sym){
  return {
    symbol:sym||"NIFTY", spot:"24,850",
    dash:[
      {k:"Gamma Blast Probability",v:"Moderate",tone:"warn"},
      {k:"Gamma Exposure",v:"Positive",tone:"up"},
      {k:"Gamma Flip Level",v:"24,600",tone:"neutral"},
      {k:"Max Pain",v:"24,800",tone:"neutral"},
      {k:"Call Wall",v:"25,000",tone:"down"},
      {k:"Put Wall",v:"24,500",tone:"up"},
      {k:"IV Crush Risk",v:"Elevated",tone:"warn"},
      {k:"PCR",v:"0.92",tone:"neutral"},
      {k:"Dealer Positioning",v:"Long Gamma",tone:"up"},
      {k:"OI Concentration",v:"24,800-25,000",tone:"neutral"}
    ],
    summary:"High positive gamma observed near the current strike. Educationally this may reduce volatility until major levels are crossed. Observation only, not advice."
  };
}
function tc(tone){ return tone=="up"?UP:tone=="down"?DOWN:tone=="warn"?WARN:T2; }

var BENEFITS=["High Liquidity","Lower Capital (Leverage)","Long & Short Trading","Hedging","Fast Execution","Intraday Trading","Positional Trading"];

// ---- FUTURES INTELLIGENCE ----
export default function FuturesIntel(props){
  var full=!!props.full;
  var d=futData(props.symbol);
  var [tab,setTab]=useState("dash");

  function Header(){
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:15,fontWeight:900,color:T1}}>Futures Intelligence</span>
            <span style={{fontSize:12}} dangerouslySetInnerHTML={{__html:"&#11088;"}}/>
          </div>
          {props.onOpen&&!full?<button onClick={props.onOpen} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full &#8594;</button>:null}
        </div>
        <div style={{fontSize:9,color:T3,marginBottom:12}}>{d.symbol} {d.spot} &#8226; Educational observation only</div>
      </div>
    );
  }

  // compact home view: header + AI summary + top dashboard chips
  if(!full){
    return (
      <div style={{padding:"0 14px",marginTop:22}}>
        <Header/>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:13}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:11}}>
            {d.dash.slice(0,6).map(function(m,i){
              return <div key={i} style={{background:CARD2,border:"1px solid "+BD2,borderRadius:9,padding:"6px 9px"}}><span style={{fontSize:8.5,color:T3}}>{m.k}</span><div style={{fontSize:11,fontWeight:800,color:tc(m.tone)}}>{m.v}</div></div>;
            })}
          </div>
          <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:10}}>
            <div style={{fontSize:8,fontWeight:800,color:BLUE,marginBottom:3}}>FUTURES AI SUMMARY</div>
            <div style={{fontSize:9.5,color:T2,lineHeight:1.5}}>{d.summary}</div>
          </div>
        </div>
      </div>
    );
  }

  // full page: education + benefits + direction + dashboard + summary
  return (
    <div style={{padding:"0 14px",marginTop:6}}>
      <Header/>
      {/* what is futures */}
      <Sec title="WHAT IS FUTURES?">
        <div style={{fontSize:10.5,color:T2,lineHeight:1.6}}>A futures contract is an agreement to buy or sell an asset at a set price on a future date. In markets like Nifty and Bank Nifty, futures let participants take long or short positions with leverage. This section is educational only.</div>
      </Sec>
      {/* benefits */}
      <Sec title="KEY BENEFITS">
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {BENEFITS.map(function(b,i){ return <span key={i} style={{fontSize:9.5,fontWeight:700,color:T1,background:CARD2,border:"1px solid "+BD2,padding:"5px 10px",borderRadius:8}}>{b}</span>; })}
        </div>
      </Sec>
      {/* market direction */}
      <Sec title="MARKET DIRECTION">
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:CARD,border:"1px solid rgba(34,197,94,0.25)",borderRadius:12,padding:11}}>
            <div style={{fontSize:11,fontWeight:900,color:UP,marginBottom:5}}>Bullish Market</div>
            <div style={{fontSize:9,color:T2,lineHeight:1.5}}>Long Futures &#8226; Expected Uptrend. Educationally, rising price with rising OI shows buying interest.</div>
          </div>
          <div style={{flex:1,background:CARD,border:"1px solid rgba(239,68,68,0.25)",borderRadius:12,padding:11}}>
            <div style={{fontSize:11,fontWeight:900,color:DOWN,marginBottom:5}}>Bearish Market</div>
            <div style={{fontSize:9,color:T2,lineHeight:1.5}}>Short Futures &#8226; Expected Downtrend. Educationally, falling price with rising OI shows selling pressure.</div>
          </div>
        </div>
      </Sec>
      {/* dashboard */}
      <Sec title="FUTURES DASHBOARD">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"4px 13px"}}>
          {d.dash.map(function(m,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<d.dash.length-1?"1px solid "+BD2:"none"}}>
                <div><div style={{fontSize:10.5,fontWeight:700,color:T1}}>{m.k}</div><div style={{fontSize:8,color:T3}}>{m.note}</div></div>
                <span style={{fontSize:11,fontWeight:800,color:tc(m.tone)}}>{m.v}</span>
              </div>
            );
          })}
        </div>
      </Sec>
      {/* ai summary */}
      <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:12,marginBottom:16}}>
        <div style={{fontSize:8.5,fontWeight:800,color:BLUE,marginBottom:4}}>FUTURES AI SUMMARY</div>
        <div style={{fontSize:10,color:T2,lineHeight:1.55}}>{d.summary}</div>
      </div>
      <Disc/>
    </div>
  );
}

// ---- GAMMA BLAST SCANNER (Premium) ----
export function GammaBlast(props){
  var full=!!props.full;
  var g=gammaData(props.symbol);
  return (
    <div style={{padding:"0 14px",marginTop:full?6:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15,fontWeight:900,color:T1}}>Gamma Blast Scanner</span>
          <span style={{fontSize:7.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>PRO</span>
        </div>
        {props.onOpen&&!full?<button onClick={props.onOpen} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full &#8594;</button>:null}
      </div>
      <div style={{fontSize:9,color:T3,marginBottom:12}}>{g.symbol} {g.spot} &#8226; Educational gamma observations</div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"4px 13px"}}>
        {(full?g.dash:g.dash.slice(0,6)).map(function(m,i,arr){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<arr.length-1?"1px solid "+BD2:"none"}}>
              <span style={{fontSize:10.5,fontWeight:700,color:T1}}>{m.k}</span>
              <span style={{fontSize:11,fontWeight:800,color:tc(m.tone)}}>{m.v}</span>
            </div>
          );
        })}
      </div>
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:12,padding:12,marginTop:11}}>
        <div style={{fontSize:8.5,fontWeight:800,color:WARN,marginBottom:4}}>GAMMA AI SUMMARY</div>
        <div style={{fontSize:10,color:T2,lineHeight:1.55}}>{g.summary}</div>
      </div>
      {full?<Disc/>:null}
    </div>
  );
}

function Sec(props){
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>{props.title}</div>
      {props.children}
    </div>
  );
}
function Disc(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginBottom:16}}>
      <div style={{fontSize:8.5,color:WARN,lineHeight:1.5}}>Educational Market Observation Only. Not Investment Advice.</div>
    </div>
  );
}
