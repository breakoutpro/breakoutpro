import { useState } from "react";
import { getOptionsIntel, toneColor } from "./OptionsIntelData";
import OptSellHubDetail from "./OptSellHubDetail";

// BreakoutPro - OptSellHub.jsx
// Option Sellers Daily Hub (educational). Reuses OptionsIntel data + daily commentary,
// expiry education, risk reminders. SEBI-safe. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Days to weekly expiry (Thursday) - educational countdown.
function daysToExpiry(){
  try{
    var now=new Date();
    var ist=new Date(now.getTime()+(now.getTimezoneOffset()*60000)+(330*60000));
    var day=ist.getDay(); // 0 Sun .. 4 Thu
    var d=(4-day+7)%7; if(d==0)d=0;
    return d;
  }catch(e){ return 0; }
}

var COMMENTARY=[
  {q:"What changed today?", a:"Spot held above max pain while put writing increased at lower strikes, a sign writers expect support to hold."},
  {q:"How did volatility behave?", a:"IV stayed in the lower-middle of its range, so option premiums were moderate, not rich."},
  {q:"How is Time Decay evolving?", a:"With expiry approaching, Theta is rising. Time decay now favours sellers more strongly each day."},
  {q:"How are option writers positioned?", a:"Two-sided writing is active, with heavy calls near the upper wall and puts near the lower wall, framing a range."},
  {q:"What is the OI structure?", a:"Highest call OI sits at the call wall above spot; highest put OI at the put wall below, a classic range setup."},
  {q:"What risks should learners understand?", a:"A sudden breakout from the range, an IV spike before events, and Gamma risk near expiry are the key things to study today."}
];

var EXPIRY_EDU=[
  {id:"weekly",h:"Weekly Expiry", p:"Weekly options expire every Thursday for indices. Theta decay is fast in the final days, and Gamma risk is highest on expiry day."},
  {id:"monthly",h:"Monthly Expiry", p:"Monthly options expire on the last Thursday. They carry more time value and react less violently than weeklies far from expiry."},
  {id:"timedecay",h:"Time Decay Behaviour", p:"Theta accelerates as expiry nears. The last two days see the steepest premium erosion, which sellers study closely."},
  {id:"gammarisk",h:"Gamma Risk", p:"Near expiry, small moves cause large Delta swings. This Gamma risk can turn a calm position volatile very quickly."},
  {id:"volchange",h:"Volatility Changes", p:"IV often falls into expiry on calm weeks but can spike around events, changing premiums sharply."},
  {id:"sellerconsider",h:"Seller Considerations", p:"Sellers commonly study margin, distance of strikes from spot, and event calendars before expiry."}
];

var RISK_REMINDERS=[
  {id:"possize",ic:"&#128207;",t:"Position Sizing",d:"Risk only a small part of capital so one move cannot hurt badly."},
  {id:"margin",ic:"&#128176;",t:"Margin Awareness",d:"Undefined-risk strategies need large margin and can see sudden margin calls."},
  {id:"eventrisk",ic:"&#128197;",t:"Event Risk",d:"Results, RBI, and global events can cause gaps that hurt sellers."},
  {id:"gaprisk",ic:"&#9889;",t:"Gap Risk",d:"Overnight gaps can move past your strikes before you can react."},
  {id:"volrisk",ic:"&#128200;",t:"Volatility Risk",d:"A sudden IV spike raises option prices and can hurt short positions."},
  {id:"emotion",ic:"&#129504;",t:"Emotional Discipline",d:"Stick to a written plan; do not adjust in panic."}
];

export default function OptSellHub(props){
  var data=getOptionsIntel("NIFTY");
  var [tab,setTab]=useState("dash");
  var [detail,setDetail]=useState(null);
  var [detail,setDetail]=useState(null);
  var dte=daysToExpiry();

  if(detail) return <OptSellHubDetail id={detail} onBack={function(){setDetail(null);}}/>;

  if(detail) return <OptSellHubDetail id={detail} onBack={function(){setDetail(null);}} onOpen={function(id){setDetail(id);}}/>;

  // pick key metrics for the daily dashboard
  var flat=[]; data.metrics.forEach(function(g){ g.items.forEach(function(m){ flat.push(m); }); });
  function find(k){ return flat.filter(function(m){return m.key==k;})[0]; }
  var dash=["pcr","maxpain","timedecay","ivrank","ivcrush","oibuild","oichange","callwall","putwall","writers","expmove"].map(find).filter(Boolean);

  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var txt=COMMENTARY.map(function(c){return c.q+" "+c.a;}).join(" ");
      var u=new SpeechSynthesisUtterance(txt); u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"14px 14px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:15,fontWeight:900,color:T1}}>Option Sellers Daily Hub</span>
              <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Daily educational market intelligence</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,overflowX:"auto"}}>
          {[["dash","Dashboard"],["ai","AI Commentary"],["expiry","Expiry"],["risk","Risk"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:BD),borderRadius:9,padding:"6px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {tab=="dash"?(
          <div>
            {/* expiry countdown */}
            <div style={{background:"linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.02))",border:"1px solid rgba(212,175,55,0.25)",borderRadius:13,padding:14,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,color:T2}}>Weekly Expiry Countdown</div>
                <div style={{fontSize:13,fontWeight:800,color:GOLD,marginTop:3}}>{dte==0?"Expiry Today":dte+(dte==1?" day left":" days left")}</div>
              </div>
              <div style={{fontSize:9,color:T3,textAlign:"right",maxWidth:140,lineHeight:1.4}}>Theta and Gamma effects grow stronger as expiry nears.</div>
            </div>

            {/* market mood + VIX */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12}}>
                <div style={{fontSize:9.5,color:T2}}>Market Mood</div>
                <div style={{fontSize:14,fontWeight:800,color:UP,marginTop:4}}>Range, Up Tilt</div>
              </div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12}}>
                <div style={{fontSize:9.5,color:T2}}>India VIX</div>
                <div style={{fontSize:14,fontWeight:800,color:T1,marginTop:4}}>13.8 <span style={{fontSize:9,color:UP}}>Calm</span></div>
              </div>
            </div>

            {/* key metrics grid (reused from OptionsIntel) */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {dash.map(function(m){
                var col=toneColor(m.tone);
                return (
                  <div key={m.key} onClick={function(){setDetail(m.key);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11,cursor:"pointer"}}>
                    <div style={{fontSize:9.5,color:T2}}>{m.label}</div>
                    <div style={{fontSize:14,fontWeight:800,color:col,marginTop:4,fontFamily:"monospace"}}>{m.val}</div>
                    <div style={{fontSize:8,color:CYAN,marginTop:4}}>Learn &#8594;</div>
                  </div>
                );
              })}
            </div>

            {/* OI heatmap */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:3}}>Open Interest Heatmap</div>
              <div style={{fontSize:8.5,color:T3,marginBottom:11}}>Put OI (green) vs Call OI (red) by strike</div>
              {data.heatmap.map(function(h,i){
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{fontSize:9,color:T2,width:42,fontFamily:"monospace",flexShrink:0}}>{h.strike}</span>
                    <div style={{flex:1,display:"flex",gap:2,height:13}}>
                      <div style={{flex:1,display:"flex",justifyContent:"flex-end",background:CARD2,borderRadius:"3px 0 0 3px",overflow:"hidden"}}><div style={{width:h.put+"%",background:"rgba(34,197,94,0.55)"}}></div></div>
                      <div style={{flex:1,background:CARD2,borderRadius:"0 3px 3px 0",overflow:"hidden"}}><div style={{width:h.call+"%",background:"rgba(239,68,68,0.55)"}}></div></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Disclaimer/>
          </div>
        ):null}

        {tab=="ai"?(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <span style={{fontSize:12,fontWeight:800,color:CYAN}}>AI Daily Commentary</span>
              <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"6px 11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266; Listen</button>
            </div>
            {COMMENTARY.map(function(c,i){
              return (
                <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:9}}>
                  <div style={{fontSize:11.5,fontWeight:700,color:T1,marginBottom:5}}>{c.q}</div>
                  <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{c.a}</div>
                </div>
              );
            })}
            <Disclaimer/>
          </div>
        ):null}

        {tab=="expiry"?(
          <div>
            {EXPIRY_EDU.map(function(e,i){
              return (
                <div key={i} onClick={function(){setDetail(e.id);}} style={{marginBottom:13,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:800,color:T1}}>{e.h}</div>
                    <span style={{fontSize:14,color:T3}}>&#8250;</span>
                  </div>
                  <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}><div style={{fontSize:11,color:T1,lineHeight:1.6}}>{e.p}</div></div>
                </div>
              );
            })}
            <Disclaimer/>
          </div>
        ):null}

        {tab=="risk"?(
          <div>
            <div style={{fontSize:9,color:T3,marginBottom:11}}>Daily reminders every option seller should study.</div>
            {RISK_REMINDERS.map(function(r,i){
              return (
                <div key={i} onClick={function(){setDetail(r.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:9,display:"flex",gap:11,alignItems:"flex-start",cursor:"pointer"}}>
                  <span style={{fontSize:16,flexShrink:0}} dangerouslySetInnerHTML={{__html:r.ic}}/>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:3}}>{r.t}</div><div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{r.d}</div></div>
                  <span style={{fontSize:15,color:T3,flexShrink:0}}>&#8250;</span>
                </div>
              );
            })}
            <Disclaimer/>
          </div>
        ):null}
      </div>
    </div>
  );
}

function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Intelligence Only. This content is designed to help users understand options markets. It is not investment advice or a trading recommendation.</div>
    </div>
  );
            }
          
