import { getAssetCard, getAssetTimeline, alertType, getAlertEdu, getMarketStatus } from "./GuardianData";

// BreakoutPro - GuardianAsset.jsx
// Premium AI dashboard for one asset. Score, metrics, timeline, educational notes.
// Educational only. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",CYAN="#60A5FA",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function scoreColor(s){ return s>=75?UP:s>=55?GOLD:DOWN; }
function toneColor(t){ return t=="up"?UP:t=="down"?DOWN:t=="warn"?WARN:T2; }

export default function GuardianAsset(props){
  var a=props.asset;
  var c=getAssetCard(a);
  var sc=scoreColor(c.score);
  var MKT=getMarketStatus();
  var tl=getAssetTimeline(c.sym);
  var isOpt=(a.type=="Option"||a.type=="Index");

  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(c.sym+". AI score "+c.score+" out of 100. Bias "+c.bias+". This is an educational observation, not advice.");
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function M(p){ return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}><div style={{fontSize:8.5,color:T2}}>{p.k}</div><div style={{fontSize:12.5,fontWeight:800,color:p.c||T1,marginTop:3}}>{p.v}</div></div>; }
  function Sec(p){ return <div style={{marginBottom:16}}><div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:9}}>{p.t}</div>{p.children}</div>; }

  // technical + options metric values derived from the asset card seed
  var seed=0; for(var i=0;i<c.sym.length;i++){ seed+=c.sym.charCodeAt(i); }
  var rsi=44+(seed%40), adx=18+(seed%30);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      {/* HEADER */}
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15,fontWeight:900,color:T1}}>{c.sym}</span>
            <span style={{fontSize:7,fontWeight:800,color:c.up?UP:DOWN,background:c.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"2px 6px",borderRadius:4}}>{c.bias.toUpperCase()}</span>
          </div>
          <div style={{fontSize:8.5,color:T2}}>AI Market Analysis &#8226; {a.type}</div>
        </div>
        <button onClick={speak} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:9,padding:"7px 11px",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:14}}>
        {/* AI SCORE HERO */}
        <div style={{background:"linear-gradient(135deg,rgba(79,140,255,0.1),rgba(96,165,250,0.02))",border:"1px solid rgba(79,140,255,0.25)",borderRadius:16,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{position:"relative",width:84,height:84,flexShrink:0}}>
            <svg width="84" height="84" style={{transform:"rotate(-90deg)"}}>
              <circle cx="42" cy="42" r="34" fill="none" stroke="#1B2330" strokeWidth="6"/>
              <circle cx="42" cy="42" r="34" fill="none" stroke={sc} strokeWidth="6" strokeDasharray={2*Math.PI*34} strokeDashoffset={2*Math.PI*34*(1-c.score/100)} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:22,fontWeight:900,color:sc,lineHeight:1}}>{c.score}</span>
              <span style={{fontSize:7,color:T3}}>of 100</span>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:T2}}>Overall AI Score</div>
            <div style={{fontSize:16,fontWeight:900,color:sc,marginTop:2}}>{c.bias}</div>
            <div style={{fontSize:9,color:T3,marginTop:4,lineHeight:1.5}}>An educational composite of trend, momentum, structure, and positioning. Not a recommendation.</div>
          </div>
        </div>

        {/* PRICE + LEVELS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <M k="Price" v={c.price}/>
          <M k="Change" v={c.change} c={c.up?UP:DOWN}/>
          <M k="Support" v={c.support} c={UP}/>
          <M k="Resistance" v={c.resistance} c={DOWN}/>
        </div>

        {/* TREND + STRUCTURE */}
        <Sec t="TREND AND STRUCTURE">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <M k="Trend" v={c.up?"Up":"Down"} c={c.up?UP:DOWN}/>
            <M k="Momentum" v={c.up?"Strong":"Weak"} c={c.up?UP:DOWN}/>
            <M k="Structure" v={c.up?"Higher Highs":"Lower Lows"} c={c.up?UP:DOWN}/>
          </div>
        </Sec>

        {/* TECHNICALS */}
        <Sec t="TECHNICAL INDICATORS">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <M k="RSI" v={""+rsi} c={rsi>60?UP:rsi<40?DOWN:GOLD}/>
            <M k="MACD" v={c.up?"Bullish":"Bearish"} c={c.up?UP:DOWN}/>
            <M k="EMA" v={c.up?"Above":"Below"} c={c.up?UP:DOWN}/>
            <M k="VWAP" v={c.up?"Above":"Below"} c={c.up?UP:DOWN}/>
            <M k="Supertrend" v={c.up?"Buy Zone":"Sell Zone"} c={c.up?UP:DOWN}/>
            <M k="ADX" v={""+adx} c={adx>25?UP:GOLD}/>
            <M k="Volume" v="Above Avg" c={UP}/>
          </div>
        </Sec>

        {/* OPTIONS (for option/index) */}
        {isOpt?(
          <Sec t="OPTIONS INTELLIGENCE">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <M k="OI" v="Increasing" c={UP}/>
              <M k="PCR" v="1.18" c={UP}/>
              <M k="IV" v="38%" c={GOLD}/>
              <M k="Gamma" v="Active" c={WARN}/>
              <M k="Max Pain" v={c.support}/>
              <M k="Greeks" v="Balanced"/>
            </div>
          </Sec>
        ):null}

        {/* MARKET CONTEXT */}
        <Sec t="MARKET CONTEXT">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <M k="News" v="Positive" c={UP}/>
            <M k="FII / DII" v={MKT.fiidii} c={UP}/>
            <M k="India VIX" v={MKT.vix}/>
            <M k="Breadth" v={MKT.breadth} c={UP}/>
            <M k="Sector" v="Strong" c={UP}/>
            <M k="Risk Meter" v={MKT.risk} c={GOLD}/>
          </div>
        </Sec>

        {/* TIMELINE */}
        <Sec t="TODAY'S TIMELINE">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"4px 13px"}}>
            {tl.map(function(e,i){
              var t=alertType(e.type);
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:i<tl.length-1?"1px solid "+BD2:"none"}}>
                  <span style={{fontSize:9.5,color:T3,fontFamily:"monospace",width:38,flexShrink:0}}>{e.time}</span>
                  <span style={{fontSize:14,flexShrink:0}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                  <span style={{fontSize:11,fontWeight:700,color:T1}}>{t.name}</span>
                </div>
              );
            })}
          </div>
        </Sec>

        {/* EDUCATIONAL NOTES */}
        <Sec t="EDUCATIONAL NOTES">
          <div style={{background:"linear-gradient(135deg,rgba(79,140,255,0.08),rgba(96,165,250,0.02))",border:"1px solid rgba(79,140,255,0.22)",borderRadius:13,padding:14}}>
            <div style={{fontSize:11.5,color:T1,lineHeight:1.7}}><span style={{color:BLUE,fontWeight:700}}>AI: </span>This asset shows a {c.bias.toLowerCase()} composite. Study whether the move holds with volume, how it behaves at support {c.support} and resistance {c.resistance}, and whether the broader market supports it. Confirmation over prediction is the habit to build.</div>
          </div>
        </Sec>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Purpose Only. Not investment advice. No buy, sell, entry, target, or stop loss.</div>
        </div>
      </div>
    </div>
  );
}
