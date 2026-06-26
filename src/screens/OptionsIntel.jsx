import { useState } from "react";
import { getOptionsIntel, toneColor } from "./OptionsIntelData";
import { t } from "../i18n/translations";

// BreakoutPro - OptionsIntel.jsx
// Options Intelligence. Compact on Home (full=false), deep on dedicated page (full=true).
// Tap metric -> full explanation (what/why/now/beginner/advanced/history/risk).
// Pure black glass. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function OptionsIntel(props){
  var data=getOptionsIntel(props.symbol);
  var full=!!props.full;
  var [detail,setDetail]=useState(null);

  // flat list of all metrics for compact view + lookup
  var allMetrics=[];
  data.metrics.forEach(function(g){ g.items.forEach(function(m){ allMetrics.push(m); }); });

  function openDetail(m){ setDetail(m); }

  return (
    <div style={{padding:"0 14px",marginTop:full?6:22}}>
      {/* HEADER (only on Home compact) */}
      {!full?(
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:15,fontWeight:900,color:T1}}>{t("options_intel")}</span>
              <span style={{fontSize:7.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>PRO</span>
            </div>
            {props.onOpen?<button onClick={props.onOpen} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full &#8594;</button>:null}
          </div>
          <div style={{fontSize:9,color:T3,marginBottom:12}}>{data.symbol} {data.spot} &#8226; {data.expiry} &#8226; {t("tap_insight")}</div>
        </div>
      ):(
        <div style={{fontSize:9,color:T3,marginBottom:12}}>{data.symbol} {data.spot} &#8226; {data.expiry} expiry &#8226; Tap any metric for full explanation.</div>
      )}

      {/* COMPACT: top 6 metrics. FULL: all grouped. */}
      {!full?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {allMetrics.slice(0,6).map(function(m){ return <MetricCard key={m.key} m={m} onClick={function(){openDetail(m);}}/>; })}
        </div>
      ):(
        <div>
          {data.metrics.map(function(g){
            return (
              <div key={g.group} style={{marginBottom:16}}>
                <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>{g.group.toUpperCase()}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {g.items.map(function(m){ return <MetricCard key={m.key} m={m} onClick={function(){openDetail(m);}}/>; })}
                </div>
              </div>
            );
          })}

          {/* GREEKS */}
          <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>LIVE GREEKS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {data.greeks.map(function(g){
              return (
                <div key={g.key} onClick={function(){openDetail({label:g.label,val:g.val,tone:g.tone,what:g.what,now:g.advanced,beginner:g.beginner,advanced:g.advanced,risk:g.risk,why:"A core option Greek.",history:"Greeks shift with price, time, and volatility."});}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 7px",textAlign:"center",cursor:"pointer"}}>
                  <div style={{fontSize:8.5,color:T2}}>{g.label}</div>
                  <div style={{fontSize:13,fontWeight:800,color:toneColor(g.tone),marginTop:4,fontFamily:"monospace"}}>{g.val}</div>
                </div>
              );
            })}
          </div>

          {/* DEALER POSITIONING */}
          <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>DEALER POSITIONING</div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:16}}>
            {data.greeks.dealer.map(function(dl,i){
              return (
                <div key={dl.key} style={{padding:"12px 13px",borderBottom:i<data.greeks.dealer.length-1?"1px solid "+BD2:"none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,color:T1,fontWeight:700}}>{dl.label}</span>
                    <span style={{fontSize:11,fontWeight:800,color:toneColor(dl.tone),fontFamily:"monospace"}}>{dl.val}</span>
                  </div>
                  <div style={{fontSize:9.5,color:T2,lineHeight:1.5}}>{dl.desc}</div>
                </div>
              );
            })}
          </div>

          {/* OI SUPPORT / RESISTANCE */}
          <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>SUPPORT &amp; RESISTANCE (OI)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {data.levels.map(function(lv,i){
              var col=lv.type=="Support"?UP:DOWN;
              return (
                <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}>
                  <div style={{fontSize:8.5,color:col,fontWeight:700}}>{lv.type}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T1,marginTop:3,fontFamily:"monospace"}}>{lv.level}</div>
                  <div style={{fontSize:8,color:T3,marginTop:2}}>{lv.basis}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OI HEATMAP */}
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:3}}>Open Interest Heatmap</div>
        <div style={{fontSize:8.5,color:T3,marginBottom:11}}>Put OI (green) vs Call OI (red) by strike</div>
        {data.heatmap.map(function(h,i){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <span style={{fontSize:9,color:T2,width:42,fontFamily:"monospace",flexShrink:0}}>{h.strike}</span>
              <div style={{flex:1,display:"flex",gap:2,height:14}}>
                <div style={{flex:1,display:"flex",justifyContent:"flex-end",background:CARD2,borderRadius:"3px 0 0 3px",overflow:"hidden"}}>
                  <div style={{width:h.put+"%",background:"rgba(34,197,94,0.55)",height:"100%"}}></div>
                </div>
                <div style={{flex:1,background:CARD2,borderRadius:"0 3px 3px 0",overflow:"hidden"}}>
                  <div style={{width:h.call+"%",background:"rgba(239,68,68,0.55)",height:"100%"}}></div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:8,color:UP}}>&#9664; Put OI</span>
          <span style={{fontSize:8,color:DOWN}}>Call OI &#9654;</span>
        </div>
      </div>

      {/* AI OPTION ANALYSIS */}
      <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
          <span style={{fontSize:12,fontWeight:800,color:CYAN}}>{t("ai_option_analysis")}</span>
        </div>
        <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{data.aiSummary}</div>
        <div style={{fontSize:8.5,color:T3,marginTop:10,paddingTop:9,borderTop:"1px solid rgba(59,130,246,0.15)"}}>{t("not_advice")}</div>
      </div>

      {/* DETAIL MODAL */}
      {detail?<MetricDetail m={detail} onClose={function(){setDetail(null);}}/>:null}
    </div>
  );
}

function MetricCard(props){
  var m=props.m, col=toneColor(m.tone);
  return (
    <div onClick={props.onClick} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:11,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:9.5,color:T2,fontWeight:600}}>{m.label}</span>
        <span style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block"}}></span>
      </div>
      <div style={{fontSize:15,fontWeight:800,color:col,marginTop:5,fontFamily:"monospace"}}>{m.val}</div>
      <div style={{fontSize:8.5,color:CYAN,marginTop:5}}>Tap to learn</div>
    </div>
  );
}

function MetricDetail(props){
  var m=props.m, col=toneColor(m.tone);
  function speak(){
    try{
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(m.label+". "+m.what+" "+m.now+" "+(m.beginner||""));
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Row(p){ return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:9.5,fontWeight:800,color:p.c||T2,letterSpacing:0.4,marginBottom:4}}>{p.t}</div>
      <div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{p.v}</div>
    </div>
  ); }
  return (
    <div onClick={props.onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"#0B0E13",borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",maxHeight:"85vh",overflowY:"auto",padding:"16px 16px 30px"}}>
        <div style={{width:36,height:4,background:"#2A3441",borderRadius:2,margin:"0 auto 16px"}}></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:17,fontWeight:900,color:T1}}>{m.label}</div>
            <div style={{fontSize:20,fontWeight:800,color:col,fontFamily:"monospace",marginTop:2}}>{m.val}</div>
          </div>
          <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px 12px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266; Listen</button>
        </div>
        {m.what?<Row t={t("lbl_what")} v={m.what}/>:null}
        {m.why?<Row t={t("lbl_why")} v={m.why}/>:null}
        {m.now?<Row t={t("lbl_now")} c={CYAN} v={m.now}/>:null}
        {m.beginner?<Row t={t("lbl_beginner")} v={m.beginner}/>:null}
        {m.advanced?<Row t={t("lbl_advanced")} v={m.advanced}/>:null}
        {m.history?<Row t={t("lbl_history")} v={m.history}/>:null}
        {m.risk?<Row t={t("lbl_risk")} c={DOWN} v={m.risk}/>:null}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:9,padding:10,marginTop:6}}>
          <div style={{fontSize:8.5,color:"#F97316"}}>Educational only. Not a buy or sell recommendation.</div>
        </div>
      </div>
    </div>
  );
                }
