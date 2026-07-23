import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

function buildPrompt() {
  var today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  var p = "You are an expert Indian stock market analyst. Give a comprehensive market briefing for "+today+" for Indian traders.";
  p += " Include: 1.Global Market Mood (US,Asia,Europe) 2.Indian Market Outlook (NIFTY,BANKNIFTY,SENSEX) 3.Top 5 News impacting markets";
  p += " 4.Sector Analysis (IT,Banking,Auto,Pharma,Energy) 5.FII/DII Activity 6.Key NIFTY levels support/resistance";
  p += " 7.Top 3 Stocks to Watch today 8.Scalper Note 9.Overall Sentiment Bullish/Bearish/Neutral with reason.";
  p += " Format with numbered sections. Be concise. End with SEBI disclaimer that this is educational only.";
  return p;
}

export default function AIBriefing() {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand; T1=theme.c.text1;

  var [briefing, setBriefing] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [lastFetch, setLastFetch] = useState("");

  var today = new Date().toLocaleDateString("en-IN", {weekday:"long", day:"numeric", month:"long"});

  function getBriefing() {
    setLoading(true);
    setError("");
    setBriefing("");

    var reqBody = JSON.stringify({
      messages: [{role:"user", content: buildPrompt()}],
      max_tokens: 1500
    });

    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: reqBody,
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data || !data.ok) {
        setError("AI briefing is temporarily unavailable. Please try again later.");
        setLoading(false);
        return;
      }
      var text = data.text;
      if (!text) {
        setError("Empty response. Please try again.");
        setLoading(false);
        return;
      }
      setBriefing(text);
      setLastFetch(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
      setLoading(false);
    })
    .catch(function() {
      setError("Network error. Please check your internet.");
      setLoading(false);
    });
  }

  function renderBriefing(text) {
    if (!text) return null;
    var lines = text.split(String.fromCharCode(10)).filter(function(l){return l.trim();});
    return lines.map(function(line, i) {
      var isHeader = line.startsWith("#") || (line.length < 60 && (line.includes(":") && !line.startsWith("-")) && line == line.toUpperCase());
      var isBullet = line.startsWith("-") || line.startsWith("*") || line.startsWith("");
      var isNumber = /^[0-9]+\./.test(line.trim());
      if (isHeader || (isNumber && line.length < 50)) {
        return (
          <div key={i} style={{fontSize:12,fontWeight:800,color:BLUE,marginTop:16,marginBottom:4,borderBottom:"1px solid rgba(245,158,11,0.2)",paddingBottom:4}}>
            {line.replace(/^#+\s*/,"").replace(/\*\*/g,"")}
          </div>
        );
      }
      if (isBullet) {
        return (
          <div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
            <span style={{color:G2,flexShrink:0,fontSize:12}}></span>
            <span style={{fontSize:12,color:T1,lineHeight:1.7}}>{line.replace(/^[-*]\s*/,"").replace(/\*\*/g,"")}</span>
          </div>
        );
      }
      return (
        <div key={i} style={{fontSize:12,color:T1,lineHeight:1.8,marginBottom:4}}>
          {line.replace(/\*\*/g,"")}
        </div>
      );
    });
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:theme.c.bg,padding:"16px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>AI Market <span style={{color:BLUE}}>Briefing</span></div>
            <div style={{fontSize:12,color:T2}}>{today}</div>
          </div>
          <div style={{textAlign:"right"}}>
            {lastFetch ? <div style={{fontSize:12,color:T2,marginBottom:4}}>Last: {lastFetch}</div> : null}
            <button onClick={getBriefing} disabled={loading} style={{background:loading?"rgba(0,200,83,0.2)":G,border:"none",borderRadius:12,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:loading?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
              {loading ? (
                <span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}></span>
              ) : null}
              {loading ? "Getting Briefing..." : "Get Briefing"}
            </button>
          </div>
        </div>

        {/* Powered by */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
          <div style={{background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:12,color:BLUE,fontWeight:700}}>Powered by Groq Llama 3.3</span>
          </div>
          <div style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:12,color:G2,fontWeight:700}}>Ultra Fast AI</span>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* Error */}
        {error ? (
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:R,marginBottom:4}}>Error</div>
            <div style={{fontSize:12,color:T1}}>{error}</div>
          </div>
        ) : null}

        {/* Loading skeleton */}
        {loading ? (
          <div>
            {[80,60,90,70,85,65].map(function(w,i){
              return <div key={i} style={{background:"rgba(255,255,255,0.06)",borderRadius:6,height:12,width:w+"%",marginBottom:12,animation:"pulse 1.5s ease-in-out infinite"}}></div>;
            })}
            <div style={{textAlign:"center",padding:"24px 0",color:T2,fontSize:12}}>Groq AI analyzing Indian markets...</div>
          </div>
        ) : null}

        {/* Briefing content */}
        {briefing && !loading ? (
          <div>
            <div style={{background:CB,border:"1px solid rgba(0,200,83,0.15)",borderRadius:16,padding:16,marginBottom:12}}>
              {renderBriefing(briefing)}
            </div>
            <button onClick={getBriefing} style={{width:"100%",background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:12,color:G2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>
              Refresh Briefing
            </button>
          </div>
        ) : null}

        {/* Empty state */}
        {!briefing && !loading && !error ? (
          <div style={{textAlign:"center",padding:"40px 24px"}}>
            <div style={{fontSize:32,marginBottom:16}}>&#129302;</div>
            <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>Your Daily Market Briefing</div>
            <div style={{fontSize:12,color:T2,lineHeight:1.8,marginBottom:24}}>Get AI-powered analysis of Indian markets, NIFTY levels, sector outlook, FII activity and stocks to watch  powered by Groq Llama 3.3</div>
            <button onClick={getBriefing} style={{background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Today Briefing</button>
          </div>
        ) : null}

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>AI generated content. For educational purposes only. Not SEBI registered investment advice. Always do your own research.</div>
        </div>
      </div>
    </div>
  );
}
