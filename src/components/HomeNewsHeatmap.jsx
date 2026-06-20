var CARD="#0D1B2A", BD="rgba(255,255,255,0.05)";
var BLUE="#3B82F6", CYAN="#22D3EE";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T3="#5B6B85";

var GOLD="#F59E0B";

export function AIBriefingCard(props){
  var setShowMorningPulse=props.setShowMorningPulse||function(){};
  var pulseInfo=props.pulseInfo||{icon:"&#9889;",label:"Market Pulse"};
  var mood=props.mood||{bull:70,fg:"Greed",conf:80};
  return (
    <div onClick={function(){setShowMorningPulse(true);}} style={{
      background:"linear-gradient(160deg, rgba(59,130,246,0.10), rgba(34,211,238,0.04))",
      border:"1px solid rgba(59,130,246,0.22)",
      backdropFilter:"blur(20px)",
      borderRadius:22,padding:"18px",cursor:"pointer",
      boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,"+BLUE+","+CYAN+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:pulseInfo.icon}}/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:T1}}>{pulseInfo.label}</div>
            <div style={{fontSize:9,color:T3}}>AI generated &bull; updates live</div>
          </div>
        </div>
        <span style={{fontSize:14,color:T3}}>&#8250;</span>
      </div>

      <div style={{fontSize:11,color:"#C9D4E5",lineHeight:1.7,marginBottom:14}}>
        FIIs buying aggressively, banking and IT sectors leading the rally. NIFTY testing key resistance at 24,050 — confirmation needed for next leg up.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          ["Market Mood", (mood.bull>=50?"Bullish":"Bearish"), mood.bull>=50?UP:DOWN],
          ["Fear &amp; Greed", mood.fg, mood.fg=="Greed"?UP:DOWN],
          ["FII/DII", "Net Buy", UP],
          ["AI Confidence", mood.conf+"%", CYAN],
          ["Today's Risk", "Moderate", GOLD],
          ["Trend", Math.round(mood.bull)+"%", mood.bull>=50?UP:DOWN],
        ].map(function(r){
          return (
            <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:12,padding:"9px 8px"}}>
              <div style={{fontSize:7,color:T3,marginBottom:3,lineHeight:1.2}} dangerouslySetInnerHTML={{__html:r[0]}}/>
              <div style={{fontSize:11,fontWeight:800,color:r[2]}}>{r[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var NEWS_ITEMS=[
  {headline:"RBI holds repo rate steady, signals dovish stance ahead", source:"ET Markets", time:"12 min ago", tag:"Breaking"},
  {headline:"FIIs turn net buyers for 8th straight session", source:"Moneycontrol", time:"38 min ago", tag:"Market"},
  {headline:"IT sector Q4 earnings beat street estimates", source:"Bloomberg", time:"1 hr ago", tag:"Economic"},
  {headline:"Crude oil slips on demand concerns, OMCs gain", source:"Reuters", time:"2 hr ago", tag:"Market"},
];

export function MarketHeatmapCard(props){
  var setTab=props.setTab||function(){};
  var stocks=props.stocks||[];
  return (
    <div onClick={function(){setTab("heatmap");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:20,padding:"14px",marginBottom:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginBottom:10}}>
        {stocks.slice(0,12).map(function(s){
          var intensity=Math.min(1,Math.abs(s.pct)/4);
          var col=s.up?UP:DOWN;
          var alpha=Math.floor(intensity*55+15).toString(16).padStart(2,"0");
          return (
            <div key={s.sym} style={{aspectRatio:"1",borderRadius:6,background:col+alpha,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:6,fontWeight:700,color:"#fff",textAlign:"center"}}>{s.sym.slice(0,4)}</span>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:T3}}>NIFTY 50 constituents by % change</span>
        <span style={{fontSize:9,color:CYAN,fontWeight:700}}>View Full &#8594;</span>
      </div>
    </div>
  );
}

export function LiveNewsCards(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{marginBottom:18}}>
      {NEWS_ITEMS.map(function(n,i){
        return (
          <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"13px 14px",marginBottom:8,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <span style={{background:n.tag=="Breaking"?"rgba(239,68,68,0.15)":"rgba(59,130,246,0.15)",border:"1px solid "+(n.tag=="Breaking"?DOWN:BLUE)+"44",borderRadius:6,padding:"2px 7px",fontSize:7,fontWeight:700,color:n.tag=="Breaking"?DOWN:CYAN,flexShrink:0}}>{n.tag}</span>
              <button onClick={function(e){e.stopPropagation();if(navigator.share){navigator.share({title:n.headline,url:"https://breakoutpro.in"});}}} style={{background:"none",border:"none",color:T3,fontSize:12,cursor:"pointer",padding:0}}>&#128257;</button>
            </div>
            <div style={{fontSize:11,fontWeight:600,color:T1,lineHeight:1.5,marginBottom:8}}>{n.headline}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:9,color:T3}}>{n.source}</span>
                <span style={{fontSize:9,color:T3}}>&bull;</span>
                <span style={{fontSize:9,color:T3}}>{n.time}</span>
              </div>
              <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:CYAN,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0}}>Read More</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
