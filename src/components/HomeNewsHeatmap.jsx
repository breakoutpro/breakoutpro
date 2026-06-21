var CARD="#101318", BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6", CYAN="#60A5FA";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";
var GOLD="#F59E0B";

export function AIBriefingCard(props){
  var setShowMorningPulse=props.setShowMorningPulse||function(){};
  var pulseInfo=props.pulseInfo||{label:"AI Market Briefing"};
  var mood=props.mood||{bull:70,fg:"Greed",conf:80};
  return (
    <div style={{
      background:CARD,border:"1px solid "+BD,
      borderRadius:18,padding:"14px 16px",
    }}>
      <div onClick={function(){setShowMorningPulse(true);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:8,background:"rgba(59,130,246,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.8 8.6L20 10.4L13.8 12.2L12 18.8L10.2 12.2L4 10.4L10.2 8.6L12 2Z" fill={CYAN}/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:12.5,fontWeight:800,color:T1}}>&#129504; {pulseInfo.label}</div>
            <div style={{fontSize:8.5,color:T3}}>AI Generated &bull; Live Updates</div>
          </div>
        </div>
        <span style={{fontSize:13,color:T3}}>&#8250;</span>
      </div>

      <div style={{fontSize:10.5,color:"#C9D4E5",lineHeight:1.6,marginBottom:6,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
        FIIs buying aggressively, banking and IT sectors leading the rally. NIFTY testing key resistance at 24,050.
      </div>
      <button onClick={function(){setShowMorningPulse(true);}} style={{background:"none",border:"none",color:CYAN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12}}>Read More &#8594;</button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
        {[
          ["Mood", (mood.bull>=50?"Bullish":"Bearish"), mood.bull>=50?UP:DOWN],
          ["Fear/Greed", mood.fg, mood.fg=="Greed"?UP:DOWN],
          ["FII/DII", "Net Buy", UP],
          ["Confidence", mood.conf+"%", CYAN],
          ["Risk", "Moderate", GOLD],
          ["Trend", Math.round(mood.bull)+"%", mood.bull>=50?UP:DOWN],
        ].map(function(r){
          return (
            <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"7px 6px"}}>
              <div style={{fontSize:6.5,color:T3,marginBottom:3,fontWeight:600,letterSpacing:0.2}}>{r[0]}</div>
              <div style={{fontSize:10,fontWeight:800,color:r[2]}}>{r[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var NEWS_ITEMS=[
  {headline:"RBI holds repo rate steady, signals dovish stance ahead", source:"ET Markets", time:"12 min ago", sentiment:"up"},
  {headline:"FIIs turn net buyers for 8th straight session", source:"Moneycontrol", time:"38 min ago", sentiment:"up"},
  {headline:"Auto sector sales data disappoints street estimates", source:"Bloomberg", time:"1 hr ago", sentiment:"down"},
];

export function MarketHeatmapCard(props){
  var setTab=props.setTab||function(){};
  var stocks=props.stocks||[];
  return (
    <div onClick={function(){setTab("heatmap");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"14px",marginBottom:16,cursor:"pointer"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:3,marginBottom:10}}>
        {stocks.slice(0,24).map(function(s){
          var intensity=Math.min(1,Math.abs(s.pct)/4);
          var col=s.up?UP:DOWN;
          var alpha=Math.floor(intensity*60+18).toString(16).padStart(2,"0");
          return (
            <div key={s.sym} style={{aspectRatio:"1",borderRadius:5,background:col+alpha,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:5.5,fontWeight:700,color:"#fff",textAlign:"center"}}>{s.sym.slice(0,3)}</span>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:T3}}>NIFTY 50 &bull; live heatmap</span>
        <span style={{fontSize:9,color:CYAN,fontWeight:700}}>Full View &#8594;</span>
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
          <div key={i} onClick={function(){setTab("news");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:30,height:30,borderRadius:9,background:n.sentiment=="up"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:13}}>{n.sentiment=="up"?"\uD83D\uDFE2":"\uD83D\uDD34"}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10.5,fontWeight:600,color:T1,lineHeight:1.45,marginBottom:5}}>{n.headline}</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:8.5,color:T3,fontWeight:600}}>{n.source}</span>
                <span style={{fontSize:8.5,color:T3}}>&bull;</span>
                <span style={{fontSize:8.5,color:T3}}>{n.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
