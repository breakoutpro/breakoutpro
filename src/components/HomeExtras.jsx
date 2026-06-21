var CARD="#101318", BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6", CYAN="#60A5FA";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";

export function QuickActionBtn(props){
  var isGradient=props.col=="url(#heatGrad)";
  return (
    <button onClick={props.onClick} style={{
      background:CARD,border:"1px solid "+BD,
      borderRadius:16,padding:"13px 4px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:7,
      cursor:"pointer",fontFamily:"inherit",
    }}>
      <span style={{color:isGradient?"#A78BFA":props.col}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:9.5,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.2}}>{props.label}</span>
    </button>
  );
}

var SECTOR_ICONS={"Banking":"&#127974;","IT":"&#128187;","Auto":"&#128663;","Pharma":"&#128138;","FMCG":"&#128722;","Metal":"&#9881;&#65039;","Realty":"&#127968;","Energy":"&#9889;","Infra":"&#127959;&#65039;","Telecom":"&#128241;"};

export function SectorCard(props){
  var s=props.s;
  var label=props.label;
  return (
    <div onClick={props.onClick} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px",minWidth:108,flexShrink:0,cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:SECTOR_ICONS[s.name]||"&#128202;"}}/>
        <span style={{fontSize:11,color:s.up?UP:DOWN}}>{s.up?"\u25B2":"\u25BC"}</span>
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T1,marginBottom:6}}>{label}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,fontWeight:800,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</div>
        <svg width="32" height="14" viewBox="0 0 32 14">
          <path d={s.up?"M0,12 L6,9 L12,10 L18,5 L24,6 L32,1":"M0,2 L6,5 L12,4 L18,9 L24,8 L32,13"} fill="none" stroke={s.up?UP:DOWN} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

export function TrendingStocksCard(props){
  var setTab=props.setTab||function(){};
  var stocks=props.stocks||[];
  var sorted=stocks.slice().sort(function(a,b){return Math.abs(b.pct)-Math.abs(a.pct);}).slice(0,6);
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",gap:9,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
        {sorted.map(function(s){
          return (
            <div key={s.sym} onClick={function(){setTab("markets");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"11px 13px",minWidth:112,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:10,fontWeight:700,color:T1,marginBottom:5}}>{s.sym}</div>
              <div style={{fontSize:11.5,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:5}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:1})}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</span>
                <svg width="30" height="13" viewBox="0 0 30 13">
                  <path d={s.up?"M0,11 L6,8 L12,9 L18,4 L24,5 L30,1":"M0,2 L6,5 L12,4 L18,8 L24,7 L30,12"} fill="none" stroke={s.up?UP:DOWN} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopBreakoutsCard(props){
  var setTab=props.setTab||function(){};
  var breakouts=[
    {sym:"ZOMATO",   type:"Resistance Breakout", level:"230", col:UP},
    {sym:"TATASTEEL",type:"52W High Breakout",    level:"165", col:UP},
    {sym:"NYKAA",    type:"Support Breakdown",    level:"190", col:DOWN},
  ];
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:18}}>
      {breakouts.map(function(b,i){
        return (
          <div key={b.sym} onClick={function(){setTab("scan");}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<breakouts.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
            <div style={{width:30,height:30,borderRadius:9,background:b.col+"1A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:13,color:b.col}}>{b.col==UP?"\u26A1":"\u26A0\uFE0F"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:T1}}>{b.sym}</div>
              <div style={{fontSize:9,color:T3,marginTop:1}}>{b.type} &bull; {b.level}</div>
            </div>
            <span style={{fontSize:12,color:T3}}>&#8250;</span>
          </div>
        );
      })}
    </div>
  );
}

export function AITradeSetupCard(props){
  var setTab=props.setTab||function(){};
  return (
    <div onClick={function(){setTab("ai");}} style={{background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(34,211,238,0.04))",border:"1px solid "+BD,borderRadius:18,padding:"14px 16px",marginBottom:18,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:15}}>&#127919;</span>
        <span style={{fontSize:12.5,fontWeight:800,color:T1}}>AI Trade Setup</span>
        <span style={{marginLeft:"auto",fontSize:8,fontWeight:700,color:UP,background:"rgba(34,197,94,0.12)",borderRadius:6,padding:"2px 7px"}}>NIFTY</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[["Entry","24,000",CYAN],["Target","24,180",UP],["Stop Loss","23,880",DOWN]].map(function(r){
          return (
            <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 6px"}}>
              <div style={{fontSize:7,color:T3,marginBottom:3}}>{r[0]}</div>
              <div style={{fontSize:11,fontWeight:800,color:r[2]}}>{r[1]}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:8.5,color:T3,marginTop:9}}>Educational setup &bull; Not investment advice</div>
    </div>
  );
}

export function SmartAlertsCard(props){
  var setTab=props.setTab||function(){};
  var alerts=[
    {text:"NIFTY crossed 23,950 resistance",  time:"5 min ago", col:UP},
    {text:"RELIANCE volume spike detected",   time:"18 min ago",col:CYAN},
  ];
  return (
    <div onClick={function(){setTab("alerts");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"14px 16px",marginBottom:18,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:14}}>&#128276;</span>
        <span style={{fontSize:12.5,fontWeight:800,color:T1}}>Smart Alerts</span>
        <span style={{marginLeft:"auto",fontSize:9,color:CYAN,fontWeight:700}}>View All &#8594;</span>
      </div>
      {alerts.map(function(a,i){
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:i>0?"1px solid "+BD:"none"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:a.col,flexShrink:0}}/>
            <span style={{fontSize:10,color:T1,flex:1}}>{a.text}</span>
            <span style={{fontSize:8,color:T3,flexShrink:0}}>{a.time}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ExploreShortcuts(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18}}>
      <div onClick={function(){setTab("learn");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 10px",cursor:"pointer"}}>
        <span style={{fontSize:16}}>&#128218;</span>
        <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:7}}>Learn</div>
        <div style={{fontSize:7.5,color:T3,marginTop:2,lineHeight:1.3}}>Patterns &amp; strategies</div>
      </div>
      <div onClick={function(){setTab("ai");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 10px",cursor:"pointer"}}>
        <span style={{fontSize:16}}>&#129302;</span>
        <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:7}}>AI Assistant</div>
        <div style={{fontSize:7.5,color:T3,marginTop:2,lineHeight:1.3}}>Ask about markets</div>
      </div>
      <div onClick={function(){setTab("datahub");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 10px",cursor:"pointer"}}>
        <span style={{fontSize:16}}>&#128202;</span>
        <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:7}}>Data Hub</div>
        <div style={{fontSize:7.5,color:T3,marginTop:2,lineHeight:1.3}}>100+ data points</div>
      </div>
    </div>
  );
}

export function AINewsSummaryCard(props){
  return (
    <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(34,211,238,0.03))",border:"1px solid "+BD,borderRadius:18,padding:"14px 16px",marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
        <span style={{fontSize:14}}>&#129504;</span>
        <span style={{fontSize:12.5,fontWeight:800,color:T1}}>AI News Summary</span>
      </div>
      <div style={{fontSize:10.5,color:"#C9D4E5",lineHeight:1.65}}>
        Today's top theme: banking and IT stocks rallying on FII inflows and strong Q4 earnings. RBI's dovish stance is supporting rate-sensitive sectors. Auto sector remains weak on disappointing sales data.
      </div>
    </div>
  );
}
