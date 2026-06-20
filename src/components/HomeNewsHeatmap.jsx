var CARD="#101318", BD="rgba(30,64,175,0.35)";
var BLUE="#3B82F6", CYAN="#60A5FA";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T3="#5B6472";

var GOLD="#F59E0B";

export function AIBriefingCard(props){
  var setShowMorningPulse=props.setShowMorningPulse||function(){};
  var pulseInfo=props.pulseInfo||{icon:"&#9889;",label:"Market Pulse"};
  var mood=props.mood||{bull:70,fg:"Greed",conf:80};
  return (
    <div onClick={function(){setShowMorningPulse(true);}} style={{
      background:CARD,
      border:"1px solid "+BD,
      borderRadius:20,padding:"18px",cursor:"pointer",
      boxShadow:"0 0 24px rgba(30,64,175,0.12)",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:9,background:"rgba(30,64,175,0.15)",border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.8 8.6L20 10.4L13.8 12.2L12 18.8L10.2 12.2L4 10.4L10.2 8.6L12 2Z" fill={CYAN}/>
              <circle cx="19" cy="5" r="1.4" fill={CYAN} opacity="0.7"/>
              <circle cx="5" cy="18" r="1" fill={CYAN} opacity="0.5"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:T1}}>&#129504; {pulseInfo.label}</div>
            <div style={{fontSize:9,color:T3}}>AI Generated &bull; Updates Live</div>
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
            <div key={r[0]} style={{background:"rgba(255,255,255,0.02)",border:"1px solid "+BD,borderRadius:12,padding:"9px 8px"}}>
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
  var items=NEWS_ITEMS.slice(0,3);
  return (
    <div style={{marginBottom:18}}>
      {items.map(function(n,i){
        return (
          <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"13px 14px",marginBottom:8,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{fontSize:11,fontWeight:600,color:T1,lineHeight:1.5,flex:1,paddingRight:10}}>{n.headline}</div>
              <span style={{fontSize:9,color:T3,flexShrink:0,whiteSpace:"nowrap"}}>{n.time}</span>
            </div>
            <div style={{fontSize:9,color:T3,marginTop:6}}>{n.source}</div>
          </div>
        );
      })}
    </div>
  );
}
