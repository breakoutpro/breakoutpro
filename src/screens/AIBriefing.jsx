import { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var GEMINI_KEY = typeof window != "undefined" && window.VITE_GEMINI_KEY
  ? window.VITE_GEMINI_KEY
  : (typeof import.meta != "undefined" && import.meta.env && import.meta.env.VITE_GEMINI_KEY)
  ? import.meta.env.VITE_GEMINI_KEY
  : "";

function buildPrompt() {
  var now = new Date();
  var dateStr = now.toLocaleDateString("en-IN", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
  var timeStr = now.toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"});
  return "You are an expert Indian stock market analyst. Generate a detailed AI Market Briefing for Indian traders for " + dateStr + " at " + timeStr + " IST. Analyze everything you know about: Global markets (US, Asia, Europe), Indian market conditions, FII/DII trends, SGX Nifty/Gift Nifty, Crude Oil, Gold, USD/INR, US Bond Yields, India VIX, recent earnings, IPO news, sector performance, and any breaking news affecting NSE/BSE. Generate the briefing in EXACTLY this format:\n\nAI MARKET BRIEFING\n\nDate: " + dateStr + "\n\nGLOBAL MARKET MOOD\n[Bullish/Neutral/Bearish with reason in 1 line]\n\nINDIAN MARKET OUTLOOK\n[Expected opening - gap up/down/flat with reason]\n\nTOP 5 IMPORTANT NEWS\n1. [News 1]\n2. [News 2]\n3. [News 3]\n4. [News 4]\n5. [News 5]\n\nSECTOR IMPACT\nBullish Sectors: [sector1, sector2, sector3]\nBearish Sectors: [sector1, sector2]\n\nFII/DII SUMMARY\n[FII and DII recent trend in 2 lines]\n\nHIGH IMPACT EVENTS TODAY\n[Key events, data releases, expiry, results]\n\nSTOCKS TO WATCH\n1. [SYMBOL] - [reason]\n2. [SYMBOL] - [reason]\n3. [SYMBOL] - [reason]\n4. [SYMBOL] - [reason]\n5. [SYMBOL] - [reason]\n\nNIFTY LEVELS\nSupport: [level1], [level2]\nResistance: [level1], [level2]\n\nBANK NIFTY LEVELS\nSupport: [level1], [level2]\nResistance: [level1], [level2]\n\nBULLISH SCORE: [XX]/100\nBEARISH SCORE: [XX]/100\n\nSCALPER NOTE\n[Key intraday levels, volatility expectation, important time slots]\n\nIMPORTANT: This is AI-generated for educational purposes only. Not investment advice.";
}

function parseSection(text, heading) {
  var lines = text.split("\n");
  var result = [];
  var capturing = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.toUpperCase().indexOf(heading.toUpperCase()) != -1) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (line == "") { if (result.length > 0) break; continue; }
      var nextHeadings = ["GLOBAL","INDIAN","TOP 5","SECTOR","FII","HIGH IMPACT","STOCKS","NIFTY","BANK","BULLISH","BEARISH","SCALPER","IMPORTANT"];
      var isNextHeading = false;
      for (var j = 0; j < nextHeadings.length; j++) {
        if (line.toUpperCase().indexOf(nextHeadings[j]) == 0 && line.length < 50) { isNextHeading = true; break; }
      }
      if (isNextHeading && result.length > 0) break;
      if (!isNextHeading) result.push(line);
    }
  }
  return result.join("\n").trim();
}

function ScoreBar(props) {
  var pct = Math.min(100, Math.max(0, props.score));
  var color = props.type == "bull" ? G : R;
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:10,fontWeight:700,color:color}}>{props.label}</span>
        <span style={{fontSize:12,fontWeight:900,color:color}}>{props.score}/100</span>
      </div>
      <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:pct+"%",background:color,borderRadius:4,transition:"width 1s ease"}}></div>
      </div>
    </div>
  );
}

function Section(props) {
  return (
    <div style={{background:props.bg||CB,border:"1px solid "+(props.bd||BD),borderRadius:14,padding:14,marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:16}}>{props.icon}</span>
        <div style={{fontSize:11,fontWeight:800,color:props.color||T1,letterSpacing:0.5}}>{props.title}</div>
      </div>
      {props.children}
    </div>
  );
}

export default function AIBriefing() {
  var [briefing, setBriefing] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [raw, setRaw] = useState("");
  var [lastTime, setLastTime] = useState("");

  function extract(label) {
    if (!raw) return "";
    return parseSection(raw, label);
  }

  function extractScore(label) {
    if (!raw) return 50;
    var lines = raw.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].toUpperCase();
      if (l.indexOf(label.toUpperCase()) != -1) {
        var m = lines[i].match(/(\d+)/);
        if (m) return parseInt(m[1]);
      }
    }
    return 50;
  }

  function extractList(label) {
    var text = extract(label);
    if (!text) return [];
    return text.split("\n").filter(function(l){ return l.trim().length > 0; }).slice(0, 5);
  }

  function getMood() {
    var text = extract("GLOBAL MARKET MOOD");
    if (!text) return {label:"Analyzing...", color:GOLD};
    var t = text.toUpperCase();
    if (t.indexOf("BULLISH") != -1) return {label:"Bullish", color:G2};
    if (t.indexOf("BEARISH") != -1) return {label:"Bearish", color:R};
    return {label:"Neutral", color:GOLD};
  }

  function fetchBriefing() {
    if (loading) return;
    if (!GEMINI_KEY) {
      setError("Gemini API key not configured. Add VITE_GEMINI_KEY in Vercel.");
      return;
    }
    setLoading(true);
    setError("");
    setBriefing(null);

    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        contents: [{parts: [{text: buildPrompt()}]}],
        generationConfig: {temperature:0.7, maxOutputTokens:2048}
      })
    })
    .then(function(r){return r.json();})
    .then(function(data){
      var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "";
      if (!text) throw new Error("Empty response");
      setRaw(text);
      setBriefing(true);
      setLastTime(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
      setLoading(false);
    })
    .catch(function(e){
      setError("Failed: " + e.message);
      setLoading(false);
    });
  }

  var now = new Date();
  var dateStr = now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  var mood = getMood();
  var bullScore = extractScore("BULLISH SCORE");
  var bearScore = extractScore("BEARISH SCORE");

  useEffect(function(){
    if(!document.getElementById("briefing-css")){
      var el=document.createElement("style");
      el.id="briefing-css";
      el.textContent="@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
      document.head.appendChild(el);
    }
  },[]);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0A1628,#0F2A1A)",padding:"16px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>AI Market <span style={{color:G}}>Briefing</span></div>
            <div style={{fontSize:9,color:T2,marginTop:2}}>{dateStr}</div>
            {lastTime ? <div style={{fontSize:8,color:G,marginTop:2}}>Last updated: {lastTime}</div> : null}
          </div>
          <button onClick={fetchBriefing} disabled={loading} style={{background:loading?"rgba(0,200,83,0.1)":G,border:"1px solid "+G,borderRadius:12,padding:"10px 16px",color:loading?G:"#fff",fontSize:11,fontWeight:700,cursor:loading?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            {loading ? (
              <span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>&#8635;</span>
            ) : "Get Briefing"}
          </button>
        </div>
      </div>

      <div style={{padding:"12px 14px"}}>

        {/* Idle state */}
        {!loading && !briefing && !error ? (
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:30,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>&#129504;</div>
            <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:6}}>Daily Market Intelligence</div>
            <div style={{fontSize:10,color:T2,lineHeight:1.7,marginBottom:20}}>Get AI-powered analysis of global markets, FII/DII data, key levels, stocks to watch and more  before market opens!</div>
            <button onClick={fetchBriefing} style={{background:G,border:"none",borderRadius:12,padding:"12px 28px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Generate Briefing</button>
          </div>
        ) : null}

        {/* Loading */}
        {loading ? (
          <div style={{background:CB,border:"1px solid rgba(0,200,83,0.2)",borderRadius:16,padding:30,textAlign:"center"}}>
            <div style={{width:48,height:48,border:"3px solid rgba(0,200,83,0.2)",borderTop:"3px solid "+G,borderRadius:"50%",margin:"0 auto 16px",animation:"spin 1s linear infinite"}}></div>
            <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:6}}>AI Analyzing Markets...</div>
            {["Checking global markets","Analyzing FII/DII data","Computing key levels","Identifying stocks to watch","Generating briefing"].map(function(s,i){
              return <div key={i} style={{fontSize:9,color:T2,marginBottom:3}}>{s}...</div>;
            })}
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:14,marginBottom:10}}>
            <div style={{fontSize:11,color:R,fontWeight:700,marginBottom:4}}>Error</div>
            <div style={{fontSize:10,color:T2}}>{error}</div>
          </div>
        ) : null}

        {/* Briefing Content */}
        {briefing && !loading ? (
          <div>
            {/* Mood Card */}
            <div style={{background:"linear-gradient(135deg,rgba(0,200,83,0.1),rgba(0,200,83,0.05))",border:"1px solid rgba(0,200,83,0.25)",borderRadius:16,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,color:T2,marginBottom:4}}>GLOBAL MARKET MOOD</div>
                <div style={{fontSize:22,fontWeight:900,color:mood.color}}>{mood.label}</div>
                <div style={{fontSize:10,color:T2,marginTop:4,maxWidth:220,lineHeight:1.5}}>{extract("GLOBAL MARKET MOOD").slice(0,80)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:T2,marginBottom:4}}>MARKET TODAY</div>
                <div style={{fontSize:11,fontWeight:700,color:T1,maxWidth:120,textAlign:"right",lineHeight:1.4}}>{extract("INDIAN MARKET OUTLOOK").slice(0,60)}</div>
              </div>
            </div>

            {/* Scores */}
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:10}}>Market Scores</div>
              <ScoreBar label="Bullish Score" score={bullScore} type="bull"/>
              <ScoreBar label="Bearish Score" score={bearScore} type="bear"/>
            </div>

            {/* Top News */}
            <Section icon="&#128240;" title="TOP 5 IMPORTANT NEWS" color={GOLD}>
              {extractList("TOP 5").map(function(n,i){
                return (
                  <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:20,height:20,borderRadius:6,background:"rgba(245,158,11,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,fontWeight:800,color:GOLD}}>{i+1}</div>
                    <div style={{fontSize:11,color:T2,lineHeight:1.6,flex:1}}>{n.replace(/^[0-9]+\.\s*/,"")}</div>
                  </div>
                );
              })}
            </Section>

            {/* Sector Impact */}
            <Section icon="&#128202;" title="SECTOR IMPACT">
              <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:G2,fontWeight:700,marginBottom:4}}>Bullish Sectors</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{extract("Bullish Sectors")}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:R,fontWeight:700,marginBottom:4}}>Bearish Sectors</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{extract("Bearish Sectors")}</div>
              </div>
            </Section>

            {/* FII/DII */}
            <Section icon="&#128176;" title="FII/DII SUMMARY" color={BLUE}>
              <div style={{fontSize:11,color:T2,lineHeight:1.7}}>{extract("FII/DII SUMMARY")}</div>
            </Section>

            {/* High Impact Events */}
            <Section icon="&#9889;" title="HIGH IMPACT EVENTS TODAY" color={"#F97316"} bg={"rgba(249,115,22,0.05)"} bd={"rgba(249,115,22,0.2)"}>
              <div style={{fontSize:11,color:T2,lineHeight:1.7}}>{extract("HIGH IMPACT EVENTS")}</div>
            </Section>

            {/* Stocks to Watch */}
            <Section icon="&#127919;" title="STOCKS TO WATCH" color={G2}>
              {extractList("STOCKS TO WATCH").map(function(s,i){
                var parts = s.replace(/^[0-9]+\.\s*/,"").split("-");
                var sym = parts[0] ? parts[0].trim() : "";
                var reason = parts[1] ? parts[1].trim() : "";
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:8,padding:"4px 8px",flexShrink:0}}>
                      <div style={{fontSize:9,fontWeight:800,color:G2}}>{sym}</div>
                    </div>
                    <div style={{fontSize:10,color:T2,flex:1}}>{reason}</div>
                  </div>
                );
              })}
            </Section>

            {/* Nifty & Bank Nifty Levels */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:12}}>
                <div style={{fontSize:10,fontWeight:800,color:T1,marginBottom:8}}>NIFTY 50</div>
                <div style={{fontSize:9,color:G2,fontWeight:600,marginBottom:2}}>Support</div>
                <div style={{fontSize:11,color:T1,fontFamily:"monospace",marginBottom:6}}>{extract("NIFTY LEVELS").split("\n")[0].replace("Support:","").trim()}</div>
                <div style={{fontSize:9,color:R,fontWeight:600,marginBottom:2}}>Resistance</div>
                <div style={{fontSize:11,color:T1,fontFamily:"monospace"}}>{extract("NIFTY LEVELS").split("\n")[1] ? extract("NIFTY LEVELS").split("\n")[1].replace("Resistance:","").trim() : ""}</div>
              </div>
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:12}}>
                <div style={{fontSize:10,fontWeight:800,color:T1,marginBottom:8}}>BANK NIFTY</div>
                <div style={{fontSize:9,color:G2,fontWeight:600,marginBottom:2}}>Support</div>
                <div style={{fontSize:11,color:T1,fontFamily:"monospace",marginBottom:6}}>{extract("BANK NIFTY LEVELS").split("\n")[0].replace("Support:","").trim()}</div>
                <div style={{fontSize:9,color:R,fontWeight:600,marginBottom:2}}>Resistance</div>
                <div style={{fontSize:11,color:T1,fontFamily:"monospace"}}>{extract("BANK NIFTY LEVELS").split("\n")[1] ? extract("BANK NIFTY LEVELS").split("\n")[1].replace("Resistance:","").trim() : ""}</div>
              </div>
            </div>

            {/* Scalper Note */}
            <Section icon="&#9889;" title="SCALPER NOTE" color={GOLD} bg={"rgba(245,158,11,0.05)"} bd={"rgba(245,158,11,0.2)"}>
              <div style={{fontSize:11,color:T2,lineHeight:1.8}}>{extract("SCALPER NOTE")}</div>
            </Section>

            {/* Refresh */}
            <button onClick={fetchBriefing} style={{width:"100%",background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:12,padding:"13px",color:G,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>Refresh Briefing</button>

            {/* Disclaimer */}
            <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12}}>
              <div style={{fontSize:9,color:"#F97316",lineHeight:1.7}}>This briefing is AI-generated for educational purposes only and is NOT investment advice. Predictions are speculative. Always do your own research before trading. Past performance is not indicative of future results.</div>
            </div>
          </div>
        ) : null}

      </div>

      
    </div>
  );
}
