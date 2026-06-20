import { useState, useEffect } from "react";

var DB = "#050816";
var CB = "#0B1224";
var BD = "#1B2A4D";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var PURPLE = "#8B5CF6";
var T1 = "#FFFFFF";
var T2 = "#8FA2C9";

var GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
var GROQ_MODEL = "llama-3.3-70b-versatile";

function getKey() {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_GROQ_KEY) {
      return import.meta.env.VITE_GROQ_KEY;
    }
  } catch(e) {}
  return "";
}

function buildPrompt() {
  var today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  var p = "You are an expert Indian stock market analyst. It is morning of " + today + ". Give a Morning Market Pulse for Indian traders.";
  p += " Include these sections with clear headers:";
  p += " 1. OVERNIGHT SUMMARY: What happened globally last night (US markets, SGX Nifty, crude oil, gold, dollar index).";
  p += " 2. TODAY MARKET OUTLOOK: Expected opening for NIFTY and BANKNIFTY (gap up/down/flat), key levels.";
  p += " 3. GEOPOLITICAL IMPACT: Any ongoing geopolitical events affecting markets today.";
  p += " 4. STOCKS TO WATCH: 5 stocks with reason why they may move today (educational - not buy/sell advice).";
  p += " 5. OPTIONS STRATEGY EDUCATION: Educational note on whether market setup favors Call buyers or Put buyers today (based on technical setup only, not advice).";
  p += " 6. SECTOR FOCUS: Which sectors look strong/weak today and why.";
  p += " 7. KEY EVENTS TODAY: Any results, RBI news, FII data, important events.";
  p += " 8. MORNING CHECKLIST: 5 things trader must check before market opens.";
  p += " Format clearly with numbered sections. Be specific with NIFTY levels. End with disclaimer this is educational only, not SEBI registered advice.";
  return p;
}

var GLOBAL_DATA = [
  {label:"SGX Nifty",  val:"24,035",  chg:"+65", up:true,  icon:"IN"},
  {label:"Dow Jones",  val:"42,750",  chg:"+234",up:true,  icon:"US"},
  {label:"Nasdaq",     val:"18,920",  chg:"+87", up:true,  icon:"US"},
  {label:"Nikkei 225", val:"38,450",  chg:"-120",up:false, icon:"JP"},
  {label:"Hang Seng",  val:"18,234",  chg:"-89", up:false, icon:"HK"},
  {label:"Crude Oil",  val:"$82.4",   chg:"-0.3%",up:false,icon:"OIL"},
  {label:"Gold",       val:"$2,312",  chg:"+0.2%",up:true, icon:"AU"},
  {label:"Dollar Idx", val:"104.2",   chg:"-0.1%",up:false,icon:"$"},
];

var STOCKS_WATCH = [
  {sym:"RELIANCE", reason:"Q4 results today. Strong refining margins expected. Volume buildup seen.", type:"Event", color:BLUE},
  {sym:"HDFCBANK", reason:"FII buying seen yesterday. Strong support at 1720. Watch for breakout above 1760.", type:"Technical", color:G2},
  {sym:"TATAMOTORS", reason:"EV sales data positive. Global auto sector strong overnight.", type:"Sector", color:GOLD},
  {sym:"INFY", reason:"US tech sector up overnight. IT sector may see buying. ADR premium.", type:"Global", color:PURPLE},
  {sym:"SBIN", reason:"RBI policy positive for PSU banks. Strong OI buildup in 820 CE.", type:"OI Data", color:"#EC4899"},
];

export default function MorningPulse(props) {
  var [pulse, setPulse] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [tab, setTab] = useState("overview");
  var [lastFetch, setLastFetch] = useState("");

  var now = new Date();
  var dateStr = now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
  var timeStr = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  function getPulse() {
    var key = getKey();
    if (!key) { setError("Add VITE_GROQ_KEY in Vercel settings!"); return; }
    setLoading(true); setError(""); setPulse("");
    fetch(GROQ_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer "+key},
      body: JSON.stringify({model:GROQ_MODEL,messages:[{role:"user",content:buildPrompt()}],temperature:0.7,max_tokens:2000}),
    })
    .then(function(r){return r.json();})
    .then(function(data){
      if (data.error) { setError("Error: "+data.error.message); setLoading(false); return; }
      var txt = data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
      if (!txt) { setError("Empty response"); setLoading(false); return; }
      setPulse(txt);
      setLastFetch(timeStr);
      setLoading(false);
    })
    .catch(function(e){ setError("Network error: "+e.message); setLoading(false); });
  }

  function renderPulse(text) {
    if (!text) return null;
    var lines = text.split(String.fromCharCode(10)).filter(function(l){return l.trim();});
    return lines.map(function(line,i){
      var clean = line.replace(/\*\*/g,"").replace(/^#+\s*/,"");
      var isH = /^[0-9]+\./.test(clean.trim()) || (clean.length<60&&clean.toUpperCase()==clean&&clean.length>3);
      var isBullet = /^[-*]/.test(line.trim());
      if (isH) return <div key={i} style={{fontSize:12,fontWeight:800,color:GOLD,marginTop:14,marginBottom:5,paddingBottom:4,borderBottom:"1px solid rgba(245,158,11,0.2)"}}>{clean}</div>;
      if (isBullet) return <div key={i} style={{display:"flex",gap:6,marginBottom:4}}><span style={{color:G2,flexShrink:0}}></span><span style={{fontSize:11,color:T1,lineHeight:1.7}}>{clean.replace(/^[-*]\s*/,"")}</span></div>;
      return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.8,marginBottom:2}}>{clean}</div>;
    });
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#050816,#0A1020)",padding:"14px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:T1}}>AI Market <span style={{color:G}}>Briefing</span></div>
            <div style={{fontSize:9,color:T2}}>{dateStr}  {timeStr}</div>
          </div>
          <button onClick={getPulse} disabled={loading} style={{background:loading?"rgba(0,200,83,0.15)":G,border:"none",borderRadius:12,padding:"10px 16px",color:"#fff",fontSize:11,fontWeight:700,cursor:loading?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            {loading?<span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%"}}></span>:null}
            {loading?"Getting AI Pulse...":"Get AI Pulse"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:5}}>
          {[["overview","Overview"],["global","Global"],["stocks","Stocks"],["ai","AI Analysis"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,background:act?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?G:BD),borderRadius:8,padding:"5px 4px",color:act?G2:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {error?<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:12,marginBottom:12}}><div style={{fontSize:11,color:R}}>{error}</div></div>:null}

        {/* OVERVIEW TAB */}
        {tab=="overview"?(
          <div>
            {/* Market opening prediction */}
            <div style={{background:"linear-gradient(135deg,#0A1A0F,#0B1224)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:8}}>TODAY OPENING PREDICTION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.15)",borderRadius:12,padding:12}}>
                  <div style={{fontSize:8,color:T2,marginBottom:3}}>NIFTY Expected</div>
                  <div style={{fontSize:16,fontWeight:900,color:G2}}>Gap Up</div>
                  <div style={{fontSize:9,color:G2}}>+40 to +80 pts</div>
                  <div style={{fontSize:8,color:T2,marginTop:4}}>SGX Nifty +65</div>
                </div>
                <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:12,padding:12}}>
                  <div style={{fontSize:8,color:T2,marginBottom:3}}>BANKNIFTY Expected</div>
                  <div style={{fontSize:16,fontWeight:900,color:BLUE}}>Flat-Positive</div>
                  <div style={{fontSize:9,color:BLUE}}>+50 to +120 pts</div>
                  <div style={{fontSize:8,color:T2,marginTop:4}}>FII buying support</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {[["Sentiment","Bullish 68%",G2],["VIX","14.2 Low",G2],["PCR","1.18 Bullish",G2]].map(function(r){
                  return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"7px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:9,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
                })}
              </div>
            </div>

            {/* Key levels */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Key Levels Today</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  ["NIFTY Resistance","24,050 / 24,150",R],
                  ["NIFTY Support","23,850 / 23,750",G2],
                  ["BANKNIFTY Res","52,500 / 53,000",R],
                  ["BANKNIFTY Sup","51,800 / 51,500",G2],
                ].map(function(r){
                  return <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:10}}><div style={{fontSize:8,color:T2,marginBottom:3}}>{r[0]}</div><div style={{fontSize:11,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
                })}
              </div>
            </div>

            {/* Morning checklist */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Morning Checklist</div>
              {["Check SGX Nifty direction","Review overnight US markets","Check crude oil price","See any breaking news","Plan your trades - set SL & Target"].map(function(item,i){
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:20,height:20,borderRadius:6,background:"rgba(0,200,83,0.15)",border:"1px solid rgba(0,200,83,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:9,fontWeight:700,color:G2}}>{i+1}</span>
                    </div>
                    <span style={{fontSize:11,color:T1}}>{item}</span>
                  </div>
                );
              })}
            </div>

            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
              <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Do your own research before trading.</div>
            </div>
          </div>
        ):null}

        {/* GLOBAL TAB */}
        {tab=="global"?(
          <div>
            <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:14,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:BLUE,marginBottom:4}}>Overnight Global Summary</div>
              <div style={{fontSize:11,color:T1,lineHeight:1.7}}>US markets closed positive. Tech stocks led gains. FII buying expected to continue. Dollar index slightly down which is positive for emerging markets like India.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {GLOBAL_DATA.map(function(g){
                return (
                  <div key={g.label} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:9,fontWeight:700,color:T2}}>{g.icon}</span>
                      <span style={{fontSize:9,fontWeight:700,color:g.up?G2:R}}>{g.chg}</span>
                    </div>
                    <div style={{fontSize:9,color:T2,marginBottom:2}}>{g.label}</div>
                    <div style={{fontSize:13,fontWeight:800,color:T1}}>{g.val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ):null}

        {/* STOCKS TAB */}
        {tab=="stocks"?(
          <div>
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:4}}>Stocks to Watch Today</div>
              <div style={{fontSize:9,color:T2}}>Educational analysis only. Not buy/sell advice. Always do your own research.</div>
            </div>
            {STOCKS_WATCH.map(function(s){
              return (
                <div key={s.sym} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:8,borderLeft:"3px solid "+s.color}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:900,color:T1}}>{s.sym}</div>
                    <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:8,fontWeight:700}}>{s.type}</span>
                  </div>
                  <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{s.reason}</div>
                </div>
              );
            })}
            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10,marginTop:4}}>
              <div style={{fontSize:8,color:"#F97316"}}>These are educational observations only. Not SEBI registered advice.</div>
            </div>
          </div>
        ):null}

        {/* AI ANALYSIS TAB */}
        {tab=="ai"?(
          <div>
            {!pulse&&!loading?(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:40,marginBottom:16}}>&#129302;</div>
                <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>AI Morning Pulse</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.8,marginBottom:20}}>Get complete AI analysis  overnight events, geopolitics, stocks to watch, options setup, today market prediction  all powered by Groq Llama 3.3</div>
                <button onClick={getPulse} style={{background:G,border:"none",borderRadius:14,padding:"14px 30px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Morning AI Pulse</button>
              </div>
            ):null}

            {loading?(
              <div style={{padding:"20px 0"}}>
                {[90,70,85,60,75].map(function(w,i){
                  return <div key={i} style={{background:"rgba(255,255,255,0.06)",borderRadius:6,height:12,width:w+"%",marginBottom:10}}></div>;
                })}
                <div style={{textAlign:"center",color:T2,fontSize:11,marginTop:10}}>AI analyzing overnight markets...</div>
              </div>
            ):null}

            {pulse&&!loading?(
              <div>
                {lastFetch?<div style={{fontSize:8,color:T2,marginBottom:8}}>Last updated: {lastFetch}</div>:null}
                <div style={{background:CB,border:"1px solid rgba(0,200,83,0.15)",borderRadius:14,padding:14,marginBottom:10}}>
                  {renderPulse(pulse)}
                </div>
                <button onClick={getPulse} style={{width:"100%",background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:10,color:G2,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Refresh Analysis</button>
              </div>
            ):null}
          </div>
        ):null}

      </div>
    </div>
  );
}
