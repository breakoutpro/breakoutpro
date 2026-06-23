var BG="#050505",CARD="#101318",BD="#1B2330";
var BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var NEWS_ITEMS=[
  {headline:"RBI holds repo rate, signals dovish stance",source:"ET Markets",time:"12m"},
  {headline:"FIIs net buyers for 8th straight session",source:"Moneycontrol",time:"34m"},
  {headline:"IT sector Q4 earnings beat estimates",source:"Bloomberg",time:"1h"},
  {headline:"Crude oil falls on demand concerns",source:"Reuters",time:"2h"},
];

var QUICK=[
  {label:"Breakout Scanner",icon:"&#128269;",id:"scan"},
  {label:"Option Chain",icon:"&#128202;",id:"oi"},
  {label:"IPO Calendar",icon:"&#128640;",id:"ipo"},
  {label:"Earnings Cal.",icon:"&#128197;",id:"more"},
  {label:"Stock Compare",icon:"&#9878;&#65039;",id:"markets"},
];

function Section(props){
  return (
    <div style={{padding:"14px 14px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <span style={{fontSize:13,fontWeight:800,color:T1}}>{props.title}</span>
        {props.onAll&&<button onClick={props.onAll} style={{background:"none",border:"none",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>}
      </div>
      {props.children}
    </div>
  );
}

export default function HomeLower(props){
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var gainers=props.gainers||[];
  var losers=props.losers||[];
  var sectors=props.sectors||[];
  var global=props.global||[];
  var largecap=props.largecap||[];
  var midcap=props.midcap||[];

  function StockRow(p){
    var s=p.s;
    var up=s.up!=null?s.up:s.pct>=0;
    return (
      <div onClick={function(){setTab("markets");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid "+BD,cursor:"pointer"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym||s.name}</div>
          <div style={{fontSize:9,color:T3,marginTop:1}}>{s.sect||"NSE"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp?s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}):"--"}</div>
          <div style={{fontSize:10.5,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct!=null?s.pct.toFixed(2):"--"}%</div>
        </div>
      </div>
    );
  }

  var adv=1693,dec=812,total=adv+dec;

  return (
    <div>

      {/* TOP GAINERS */}
      <Section title="Top Gainers" onAll={function(){setTab("markets");}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"0 12px"}}>
          {(gainers.length>0?gainers:largecap.filter(function(s){return s.up;})).slice(0,5).map(function(s,i){return <StockRow key={i} s={s}/>;}) }
        </div>
      </Section>

      {/* TOP LOSERS */}
      <Section title="Top Losers" onAll={function(){setTab("markets");}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"0 12px"}}>
          {(losers.length>0?losers:largecap.filter(function(s){return !s.up;})).slice(0,5).map(function(s,i){return <StockRow key={i} s={s}/>;}) }
        </div>
      </Section>

      {/* SECTOR PERFORMANCE */}
      <Section title="Sector Performance" onAll={function(){setTab("markets");}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 12px"}}>
          {["IT","Banking","Auto","FMCG","Metal"].map(function(name){
            var s=sectors.find(function(x){return x.name==name;});
            if(!s)return null;
            var label=name=="Banking"?"Nifty Bank":"Nifty "+name;
            var bar=Math.min(100,Math.abs(s.pct)*25);
            return (
              <div key={name} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:T2}}>{label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                  <div style={{height:3,background:s.up?UP:DOWN,borderRadius:2,width:bar+"%"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* MARKET BREADTH */}
      <Section title="Market Breadth">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontSize:10,color:T3,marginBottom:3}}>Advances</div><div style={{fontSize:18,fontWeight:900,color:UP}}>{adv}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:T3,marginBottom:3}}>Declines</div><div style={{fontSize:18,fontWeight:900,color:DOWN}}>{dec}</div></div>
          </div>
          <div style={{height:6,borderRadius:3,overflow:"hidden",display:"flex"}}>
            <div style={{width:(adv/total*100)+"%",background:UP}}/>
            <div style={{flex:1,background:DOWN}}/>
          </div>
        </div>
      </Section>

      {/* FII / DII */}
      <Section title="FII / DII Activity">
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["FII Net","+2,840 Cr"],["DII Net","+1,120 Cr"],["FII Cash","8,234 Cr"],["DII Cash","3,891 Cr"]].map(function(r){return(
              <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px"}}>
                <div style={{fontSize:9,color:T3,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:13,fontWeight:700,color:UP}}>{r[1]}</div>
              </div>
            );})}
          </div>
        </div>
      </Section>

      {/* GLOBAL MARKETS */}
      <Section title="Global Markets">
        <div style={{display:"flex",gap:9,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {global.slice(0,6).map(function(g){return(
            <div key={g.sym} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 13px",minWidth:108,flexShrink:0}}>
              <div style={{fontSize:9.5,color:T2,marginBottom:4,fontWeight:600}}>{g.sym}</div>
              <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:3}}>{g.val}</div>
              <div style={{fontSize:10,fontWeight:700,color:g.up?UP:DOWN}}>{g.up?"+":""}{g.pct}%</div>
            </div>
          );})}
        </div>
      </Section>

      {/* LIVE MARKET NEWS */}
      <Section title="Live Market News" onAll={function(){setTab("news");}}>
        <div style={{display:"flex",gap:9,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {NEWS_ITEMS.map(function(n,i){return(
            <div key={i} onClick={function(){setTab("news");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px",minWidth:210,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:600,color:T1,lineHeight:1.5,marginBottom:7}}>{n.headline}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:9,color:T3}}>{n.source}</span>
                <span style={{fontSize:9,color:T3}}>{n.time}</span>
              </div>
            </div>
          );})}
        </div>
      </Section>

      {/* GO PRO CARD */}
      {!isPrem&&(
        <div style={{padding:"14px 14px 0"}}>
          <div onClick={function(){setTab("sub");}} style={{background:CARD,border:"1px solid "+GOLD,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
            <span style={{fontSize:18}}>&#9889;</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:800,color:T1}}>Upgrade to Pro</div>
              <div style={{fontSize:10,color:T2,marginTop:2}}>AI signals, unlimited alerts, advanced scanner</div>
            </div>
            <button style={{background:GOLD,border:"none",borderRadius:8,padding:"7px 13px",color:"#000",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Upgrade Now</button>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <Section title="Quick Actions">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {QUICK.map(function(q){return(
            <div key={q.id} onClick={function(){setTab(q.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"13px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer"}}>
              <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:q.icon}}/>
              <span style={{fontSize:9.5,color:T2,textAlign:"center",lineHeight:1.3}}>{q.label}</span>
            </div>
          );})}
        </div>
      </Section>

      <div style={{height:20}}/>
    </div>
  );
}
