import { useState } from "react";
import { getScannerDetail } from "./ScannerDetailData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - ScannerDetailPro.jsx
// Professional Market Intelligence dashboard for each scanner. 10 sections, rich cards.
// Educational only. SEBI-safe. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function scoreColor(v){ return v>=70?UP:v>=45?T2:DOWN; }

export default function ScannerDetailPro(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var it=props.item;
  var d=getScannerDetail(it.id);
  var [copilot,setCopilot]=useState(false);

  function speak(txt){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(txt); u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Sec(p){ return <div style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:12,fontWeight:800,color:T1,letterSpacing:0.3}}>{p.t}</span>{p.right}</div>{p.children}</div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      {/* HEADER */}
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{it.title}</div>
          <div style={{fontSize:12,color:T2}}>Market Intelligence Dashboard</div>
        </div>
        <button onClick={function(){setCopilot(true);speak(d.copilot);}} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px 12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#129302; Copilot</button>
      </div>

      <div style={{padding:16}}>
        {/* 1. SCANNER SUMMARY */}
        <Sec t="SCANNER SUMMARY">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
            <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{d.summary}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:12}}>
              {d.metrics.map(function(m,i){
                return <div key={i} style={{background:CARD2,borderRadius:16,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:12,color:T3}}>{m.k}</div><div style={{fontSize:12,fontWeight:800,color:T1,marginTop:4}}>{m.v}</div></div>;
              })}
            </div>
          </div>
        </Sec>

        {/* 2. LIVE DETECTION LIST - rich cards */}
        <Sec t={"LIVE DETECTION ("+d.results.length+")"}>
          <div style={{fontSize:12,color:T3,marginBottom:8,marginTop:-4}}>Educational detection. Tap a stock for full company detail. Not a buy or sell list.</div>
          {d.results.map(function(s){
            return (
              <div key={s.sym} onClick={function(){if(props.onStock)props.onStock(s);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:8,cursor:"pointer"}}>
                {/* top row */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:12,color:T2,marginTop:4}}>{s.sector} &#8226; {s.mcap}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace"}}>Rs {s.ltp}</div>
                    <div style={{fontSize:12,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}% &#8226; {s.trend}</div>
                  </div>
                </div>
                {/* metrics row */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <Metric k="Volume" v={s.vol}/>
                  <Metric k="RVOL" v={s.rvol+"x"} hot={s.rvol>=2}/>
                  <Metric k="Sector" v={s.sector}/>
                </div>
                {/* scores */}
                <div style={{display:"flex",gap:8}}>
                  <Score k="Strength" v={s.strength}/>
                  <Score k="Liquidity" v={s.liquidity}/>
                  <Score k="Volatility" v={s.volatility}/>
                </div>
              </div>
            );
          })}
        </Sec>

        {/* 3. AI DEEP ANALYSIS */}
        <Sec t="AI DEEP ANALYSIS" right={<button onClick={function(){speak(d.ai);}} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,padding:"4px 12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>}>
          <div style={{background:theme.c.card,border:"1px solid rgba(59,130,246,0.25)",borderRadius:16,padding:16}}>
            <div style={{fontSize:12,color:T1,lineHeight:1.7}}>{d.ai}</div>
          </div>
        </Sec>

        {/* 4. LIVE TECHNICAL METRICS */}
        <Sec t="LIVE TECHNICAL METRICS">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Market Trend","Positive",UP],["Breadth","Adv > Dec",UP],["India VIX","13.8 Calm",T1],["Avg RVOL","1.8x",BLUE]].map(function(m,i){
              return <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}><div style={{fontSize:12,color:T2}}>{m[0]}</div><div style={{fontSize:14,fontWeight:800,color:m[2],marginTop:4}}>{m[1]}</div></div>;
            })}
          </div>
        </Sec>

        {/* 5. RELATED NEWS */}
        <Sec t="RELATED NEWS">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
            {d.news.map(function(n,i){
              return (
                <div key={i} style={{padding:"12px 12px",borderBottom:i<d.news.length-1?"1px solid "+BD2:"none"}}>
                  <div style={{fontSize:12,color:T1,lineHeight:1.45,marginBottom:4}}>{n.head}</div>
                  <div style={{fontSize:12,color:T3}}>{n.src} &#8226; {n.time}</div>
                </div>
              );
            })}
          </div>
        </Sec>

        {/* 6. HISTORICAL DETECTION PERFORMANCE */}
        <Sec t="HISTORICAL DETECTION PERFORMANCE">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
            <div style={{display:"flex",gap:12,marginBottom:8}}>
              <div style={{flex:1,background:CARD2,borderRadius:16,padding:"12px 12px"}}><div style={{fontSize:12,color:T3}}>Follow-through Rate</div><div style={{fontSize:16,fontWeight:800,color:UP,marginTop:4}}>{d.performance.rate}</div></div>
              <div style={{flex:1,background:CARD2,borderRadius:16,padding:"12px 12px"}}><div style={{fontSize:12,color:T3}}>Avg Move</div><div style={{fontSize:16,fontWeight:800,color:T1,marginTop:4}}>{d.performance.avg}</div></div>
            </div>
            <div style={{fontSize:12,color:T3,lineHeight:1.5}}>{d.performance.note}</div>
          </div>
        </Sec>

        {/* 7. LEARN SECTION */}
        <Sec t="LEARN THIS SCANNER">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
            <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{d.learn}</div>
          </div>
        </Sec>

        {/* 8. SIMILAR SCANNERS */}
        {d.similar.length?(
          <Sec t="SIMILAR SCANNERS">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {d.similar.map(function(s,i){
                return <span key={i} style={{fontSize:12,color:BLUE,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:14,padding:"8px 12px"}}>{s}</span>;
              })}
            </div>
          </Sec>
        ):null}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational Market Intelligence Only. Not Investment Advice. No buy, sell, entry, stop loss, or target.</div>
        </div>
      </div>

      {/* 9. AI COPILOT modal */}
      {copilot?(
        <div onClick={function(){setCopilot(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:theme.c.card2,borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",padding:"16px 16px 32px"}}>
            <div style={{width:36,height:4,background:"#2A3441",borderRadius:2,margin:"0 auto 16px"}}></div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
              <span style={{fontSize:14,fontWeight:800,color:BLUE}}>AI Copilot</span>
            </div>
            <div style={{fontSize:12,color:T3,marginBottom:8}}>Explain this Scanner</div>
            <div style={{fontSize:12,color:T1,lineHeight:1.7}}>{d.copilot}</div>
            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:9,padding:12,marginTop:16}}>
              <div style={{fontSize:12,color:theme.c.warn}}>Educational explanation only. Not investment advice.</div>
            </div>
          </div>
        </div>
      ):null}
    </div>
  );
}

function Metric(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD2 = theme.c.card2, BLUE=theme.c.blue, T3 = theme.c.text3; T1=theme.c.text1;

  return (
    <div style={{background:CARD2,borderRadius:16,padding:"8px 8px"}}>
      <div style={{fontSize:12,color:T3}}>{props.k}</div>
      <div style={{fontSize:12,fontWeight:700,color:props.hot?BLUE:T1,marginTop:4}}>{props.v}</div>
    </div>
  );
}
function Score(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T3 = theme.c.text3;

  var c=scoreColor(props.v);
  return (
    <div style={{flex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:T3}}>{props.k}</span>
        <span style={{fontSize:12,fontWeight:800,color:c}}>{props.v}</span>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
        <div style={{height:4,width:props.v+"%",background:c,borderRadius:2}}></div>
      </div>
    </div>
  );
}
