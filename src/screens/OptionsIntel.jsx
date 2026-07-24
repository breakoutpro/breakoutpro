import { useState } from "react";
import { getOptionsIntel, toneColor } from "./OptionsIntelData";
import { t } from "../i18n/translations";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - OptionsIntel.jsx
// Options Intelligence. Compact on Home (full=false), deep on dedicated page (full=true).
// Tap metric -> full explanation (what/why/now/beginner/advanced/history/risk).
// Pure black glass. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function OptionsIntel(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BLUE = theme.c.blue, CARD = theme.c.card, CARD2 = theme.c.card2, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

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
              <span style={{fontSize:16,fontWeight:900,color:T1}}>{t("options_intel")}</span>
              <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>PRO</span>
            </div>
            {props.onOpen?<button onClick={props.onOpen} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full &#8594;</button>:null}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
            <span style={{fontSize:12,color:T3}}>Simulated for preview. Not live options data.</span>
          </div>
          <div style={{fontSize:12,color:T3,marginBottom:12}}>{data.symbol} {data.spot} &#8226; {data.expiry} &#8226; {t("tap_insight")}</div>
        </div>
      ):(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
            <span style={{fontSize:12,color:T3}}>Simulated for preview. Not live options data.</span>
          </div>
          <div style={{fontSize:12,color:T3,marginBottom:12}}>{data.symbol} {data.spot} &#8226; {data.expiry} expiry &#8226; Tap any metric for full explanation.</div>
        </div>
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
                <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:8}}>{g.group.toUpperCase()}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {g.items.map(function(m){ return <MetricCard key={m.key} m={m} onClick={function(){openDetail(m);}}/>; })}
                </div>
              </div>
            );
          })}

          {/* GREEKS */}
          <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:8}}>GREEKS (SIMULATED)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {data.greeks.map(function(g){
              return (
                <div key={g.key} onClick={function(){openDetail({label:g.label,val:g.val,tone:g.tone,what:g.what,now:g.advanced,beginner:g.beginner,advanced:g.advanced,risk:g.risk,why:"A core option Greek.",history:"Greeks shift with price, time, and volatility."});}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 8px",textAlign:"center",cursor:"pointer"}}>
                  <div style={{fontSize:12,color:T2}}>{g.label}</div>
                  <div style={{fontSize:14,fontWeight:800,color:toneColor(g.tone),marginTop:4,fontFamily:"monospace"}}>{g.val}</div>
                </div>
              );
            })}
          </div>

          {/* DEALER POSITIONING */}
          <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:8}}>DEALER POSITIONING</div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:16}}>
            {data.greeks.dealer.map(function(dl,i){
              return (
                <div key={dl.key} style={{padding:"12px 12px",borderBottom:i<data.greeks.dealer.length-1?"1px solid "+BD2:"none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:T1,fontWeight:700}}>{dl.label}</span>
                    <span style={{fontSize:12,fontWeight:800,color:toneColor(dl.tone),fontFamily:"monospace"}}>{dl.val}</span>
                  </div>
                  <div style={{fontSize:12,color:T2,lineHeight:1.5}}>{dl.desc}</div>
                </div>
              );
            })}
          </div>

          {/* OI SUPPORT / RESISTANCE */}
          <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:8}}>SUPPORT &amp; RESISTANCE (OI)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {data.levels.map(function(lv,i){
              var col=lv.type=="Support"?UP:DOWN;
              return (
                <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
                  <div style={{fontSize:12,color:col,fontWeight:700}}>{lv.type}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T1,marginTop:4,fontFamily:"monospace"}}>{lv.level}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{lv.basis}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OI HEATMAP */}
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:4}}>Open Interest Heatmap</div>
        <div style={{fontSize:12,color:T3,marginBottom:12}}>Put OI (green) vs Call OI (red) by strike</div>
        {data.heatmap.map(function(h,i){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:12,color:T2,width:42,fontFamily:"monospace",flexShrink:0}}>{h.strike}</span>
              <div style={{flex:1,display:"flex",gap:4,height:14}}>
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
          <span style={{fontSize:12,color:UP}}>&#9664; Put OI</span>
          <span style={{fontSize:12,color:DOWN}}>Call OI &#9654;</span>
        </div>
      </div>

      {/* AI OPTION ANALYSIS */}
      <div style={{background:theme.c.card,border:"1px solid rgba(59,130,246,0.25)",borderRadius:16,padding:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
          <span style={{fontSize:12,fontWeight:800,color:BLUE}}>{t("ai_option_analysis")}</span>
          <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>SAMPLE</span>
        </div>
        <div style={{fontSize:12,color:T3,marginBottom:8}}>Sample commentary - not live AI analysis.</div>
        <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{data.aiSummary}</div>
        <div style={{fontSize:12,color:T3,marginTop:12,paddingTop:8,borderTop:"1px solid rgba(59,130,246,0.15)"}}>{t("not_advice")}</div>
      </div>

      {/* DETAIL MODAL */}
      {detail?<MetricDetail m={detail} onClose={function(){setDetail(null);}}/>:null}
    </div>
  );
}

function MetricCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2;

  var m=props.m, col=toneColor(m.tone);
  return (
    <div onClick={props.onClick} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:12,color:T2,fontWeight:600}}>{m.label}</span>
        <span style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block"}}></span>
      </div>
      <div style={{fontSize:16,fontWeight:800,color:col,marginTop:4,fontFamily:"monospace"}}>{m.val}</div>
      <div style={{fontSize:12,color:BLUE,marginTop:4}}>Tap to learn</div>
    </div>
  );
}

function MetricDetail(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2; T1=theme.c.text1;

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
      <div style={{fontSize:12,fontWeight:800,color:p.c||T2,letterSpacing:0.4,marginBottom:4}}>{p.t}</div>
      <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{p.v}</div>
    </div>
  ); }
  return (
    <div onClick={props.onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:theme.c.card2,borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",maxHeight:"85vh",overflowY:"auto",padding:"16px 16px 32px"}}>
        <div style={{width:36,height:4,background:"#2A3441",borderRadius:2,margin:"0 auto 16px"}}></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{m.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:col,fontFamily:"monospace",marginTop:4}}>{m.val}</div>
          </div>
          <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px 12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266; Listen</button>
        </div>
        {m.what?<Row t={t("lbl_what")} v={m.what}/>:null}
        {m.why?<Row t={t("lbl_why")} v={m.why}/>:null}
        {m.now?<Row t={t("lbl_now")} c={BLUE} v={m.now}/>:null}
        {m.beginner?<Row t={t("lbl_beginner")} v={m.beginner}/>:null}
        {m.advanced?<Row t={t("lbl_advanced")} v={m.advanced}/>:null}
        {m.history?<Row t={t("lbl_history")} v={m.history}/>:null}
        {m.risk?<Row t={t("lbl_risk")} c={DOWN} v={m.risk}/>:null}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:9,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn}}>Educational only. Not a buy or sell recommendation.</div>
        </div>
      </div>
    </div>
  );
                }
