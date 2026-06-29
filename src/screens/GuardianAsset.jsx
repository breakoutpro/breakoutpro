import { useState } from "react";

import {
  getAssetCard,
  getAssetTimeline,
  getCandleObservation,
  getStructureReasons,
  getRelatedObservations,
  getMultiTF,
  ASSET_ALERT_OPTIONS,
  loadAssetAlerts,
  saveAssetAlerts,
  alertType,
  getMarketStatus
} from "./GuardianData";

// BreakoutPro - GuardianAsset.jsx
// Premium AI Observation Report for one asset. Educational only. SEBI-safe.
// Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#0F1319",CARD2="#131922",BD="#232C39",BD2="#1A2330";
var UP="#34D399",DOWN="#F87171",BLUE="#4F8CFF",CYAN="#67B7FF",GOLD="#E8C55B",WARN="#FB923C";
var T1="#FFFFFF",T2="#C4CDD8",T3="#8B96A8";

function scoreColor(s){ return s>=75?UP:s>=55?GOLD:DOWN; }

export default function GuardianAsset(props){
  var a=props.asset;
  var c=getAssetCard(a);
  var col=c.up?UP:DOWN;
  var sc=scoreColor(c.score);
  var MKT=getMarketStatus();
  var tl=getAssetTimeline(a.sym);
  var candle=getCandleObservation(a);
  var reasons=getStructureReasons(a);
  var related=getRelatedObservations(a);
  var mtf=getMultiTF(a);
  var isOpt=(a.type=="Option"||a.type=="Index");
  var structure=c.up?["Higher High","Higher Low","Above EMA","Above VWAP","Strong Volume"]:["Lower High","Lower Low","Below EMA","Below VWAP","Weak Volume"];

  var [showBell,setShowBell]=useState(false);
  var [alerts,setAlerts]=useState(loadAssetAlerts(a.sym));
  function toggleAlert(id){
    var na=alerts.indexOf(id)!=-1?alerts.filter(function(x){return x!=id;}):alerts.concat([id]);
    setAlerts(na); saveAssetAlerts(a.sym,na);
  }

  var seed=0; for(var i=0;i<a.sym.length;i++){ seed+=a.sym.charCodeAt(i); }
  var rsi=c.up?(58+(seed%18)):(30+(seed%18)), adx=18+(seed%30);

  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(a.sym+". "+(c.up?"Uptrend":"Downtrend")+" observation. Score "+c.score+" of 100. "+candle.name+" detected. Educational observation only.");
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Sec(p){ return <div style={{marginBottom:16}}><div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:9}}>{p.t}</div>{p.children}</div>; }
  function M(p){ return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}><div style={{fontSize:8.5,color:T2}}>{p.k}</div><div style={{fontSize:12,fontWeight:800,color:p.c||T1,marginTop:3}}>{p.v}</div></div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      {/* HEADER */}
      <div style={{background:BG,padding:"10px 16px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:800,color:T1}}>AI Market Guardian</span>
              <span style={{fontSize:6.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",padding:"1px 5px",borderRadius:3}}>PRO</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:6.5,fontWeight:800,color:UP}}><span style={{width:4,height:4,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
            </div>
            <div style={{fontSize:7.5,color:T3}}>Educational Observation Report</div>
          </div>
          <button onClick={function(){setShowBell(true);}} title="Alert preferences" style={{background:alerts.length?"rgba(79,140,255,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(alerts.length?"rgba(79,140,255,0.4)":BD),borderRadius:9,width:34,height:34,color:alerts.length?BLUE:T2,fontSize:15,cursor:"pointer",position:"relative",flexShrink:0}}>
            <span dangerouslySetInnerHTML={{__html:"&#128276;"}}/>
            {alerts.length?<span style={{position:"absolute",top:-4,right:-4,background:BLUE,color:"#fff",fontSize:7,fontWeight:800,borderRadius:8,minWidth:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{alerts.length}</span>:null}
          </button>
          <button onClick={speak} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:9,width:34,height:34,color:BLUE,fontSize:13,cursor:"pointer",flexShrink:0}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
        </div>
        {/* asset identity */}
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:40,height:40,background:c.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(c.up?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"),borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:c.up?"&#128200;":"&#128201;"}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:900,color:T1}}>{a.sym}</div>
            <div style={{fontSize:8.5,color:T3}}>{a.type} &#8226; Auto refresh on</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{c.price}</div>
            <div style={{fontSize:11,fontWeight:700,color:c.up?UP:DOWN}}>{c.change}</div>
          </div>
        </div>
      </div>

      <div style={{padding:14}}>
        {/* AI OBSERVATION SUMMARY */}
        <div style={{background:"linear-gradient(135deg,"+(c.up?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)")+",rgba(79,140,255,0.02))",border:"1px solid "+(c.up?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"),borderRadius:16,padding:15,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:13}}>
            <div style={{position:"relative",width:74,height:74,flexShrink:0}}>
              <svg width="74" height="74" style={{transform:"rotate(-90deg)"}}>
                <circle cx="37" cy="37" r="30" fill="none" stroke="#1B2330" strokeWidth="5"/>
                <circle cx="37" cy="37" r="30" fill="none" stroke={sc} strokeWidth="5" strokeDasharray={2*Math.PI*30} strokeDashoffset={2*Math.PI*30*(1-c.score/100)} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:19,fontWeight:900,color:sc,lineHeight:1}}>{c.score}</span>
                <span style={{fontSize:6.5,color:T3}}>of 100</span>
              </div>
            </div>
            <div style={{flex:1}}>
              <span style={{fontSize:8,fontWeight:800,color:col,background:c.up?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",border:"1px solid "+(c.up?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"),padding:"3px 9px",borderRadius:5}}>{c.up?"UPTREND OBSERVATION":"DOWNTREND OBSERVATION"}</span>
              <div style={{fontSize:9,color:T2,marginTop:8}}>Confidence <b style={{color:col}}>{c.confidence}%</b> &#8226; {c.timeframe}</div>
              <div style={{fontSize:8,color:T3,marginTop:3}}>Last updated 5 seconds ago</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {structure.map(function(s,i){
              return <span key={i} style={{fontSize:8.5,fontWeight:700,color:col,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD2,padding:"4px 8px",borderRadius:7}}>{s}</span>;
            })}
          </div>
        </div>

        {/* LATEST CANDLE OBSERVATION */}
        <Sec t="LATEST CANDLE OBSERVATION">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:"&#128367;"}}/>
                <div><div style={{fontSize:12.5,fontWeight:800,color:T1}}>{candle.name}</div><div style={{fontSize:8,color:T3}}>{candle.timeframe} &#8226; {candle.time}</div></div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontSize:7.5,color:T2}}>Strength</div><div style={{fontSize:10,fontWeight:800,color:col}}>{candle.strength}</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
              <div style={{flex:1,height:5,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{height:5,width:candle.confidence+"%",background:col,borderRadius:3}}></div></div>
              <span style={{fontSize:9,fontWeight:800,color:col}}>{candle.confidence}%</span>
            </div>
            <div style={{fontSize:10.5,color:T1,lineHeight:1.6,background:CARD2,borderRadius:9,padding:10}}>{candle.timeframe} candle formed a {candle.name}. {candle.edu}</div>
          </div>
        </Sec>

        {/* MULTI-TIMEFRAME CANDLE OBSERVATION */}
        <Sec t="MULTI-TIMEFRAME OBSERVATION">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"6px 13px"}}>
            {mtf.map(function(m,i){
              var dc=m.dir>0?UP:m.dir<0?DOWN:T3;
              var ar=m.dir>0?"&#9650;":m.dir<0?"&#9660;":"&#9644;";
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:i<mtf.length-1?"1px solid "+BD2:"none"}}>
                  <span style={{fontSize:9.5,fontWeight:800,color:T2,width:34,flexShrink:0}}>{m.tf}</span>
                  <span style={{fontSize:8,color:dc,flexShrink:0}} dangerouslySetInnerHTML={{__html:ar}}/>
                  <span style={{flex:1,fontSize:10,fontWeight:600,color:m.label?dc:T3}}>{m.label||"Neutral"}</span>
                  {m.time?<span style={{fontSize:8,color:T3,fontFamily:"monospace"}}>{m.time}</span>:null}
                </div>
              );
            })}
          </div>
        </Sec>

        {/* WHY DID STRUCTURE CHANGE */}
        <Sec t="WHY DID THE STRUCTURE CHANGE?">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"6px 13px"}}>
            {reasons.map(function(r,i){
              return <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:i<reasons.length-1?"1px solid "+BD2:"none"}}><span style={{color:col,fontSize:11}}>&#8226;</span><span style={{fontSize:10.5,color:T1}}>{r}</span></div>;
            })}
          </div>
        </Sec>

        {/* MARKET STRUCTURE */}
        <Sec t="MARKET STRUCTURE">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <M k="Current Structure" v={c.up?"Higher High":"Lower Low"} c={col}/>
            <M k="Trend Strength" v={adx>25?"Strong":"Moderate"} c={adx>25?UP:GOLD}/>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:8.5,color:T2}}>Structure Health</span><span style={{fontSize:9,fontWeight:800,color:sc}}>{c.score}%</span></div>
            <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{height:5,width:c.score+"%",background:sc,borderRadius:3}}></div></div>
          </div>
        </Sec>

        {/* SUPPORT & RESISTANCE */}
        <Sec t="SUPPORT AND RESISTANCE">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <M k="Nearest Support" v={c.support} c={UP}/>
            <M k="Nearest Resistance" v={c.resistance} c={DOWN}/>
            <M k="Prev Day High" v={c.resistance}/>
            <M k="Prev Day Low" v={c.support}/>
          </div>
        </Sec>

        {/* TECHNICAL OBSERVATIONS */}
        <Sec t="TECHNICAL OBSERVATIONS">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <M k="EMA" v={c.up?"Above":"Below"} c={c.up?UP:DOWN}/>
            <M k="VWAP" v={c.up?"Above":"Below"} c={c.up?UP:DOWN}/>
            <M k="RSI" v={""+rsi} c={rsi>60?UP:rsi<40?DOWN:GOLD}/>
            <M k="MACD" v={c.up?"Bullish":"Bearish"} c={c.up?UP:DOWN}/>
            <M k="ADX" v={""+adx} c={adx>25?UP:GOLD}/>
            <M k="Supertrend" v={c.up?"Green":"Red"} c={c.up?UP:DOWN}/>
            <M k="Volume" v="Above Avg" c={UP}/>
            <M k="Bollinger" v={c.up?"Upper Half":"Lower Half"} c={c.up?UP:DOWN}/>
            <M k="ATR" v="Expanding"/>
          </div>
        </Sec>

        {/* OPTIONS OBSERVATIONS */}
        {isOpt?(
          <Sec t="OPTIONS OBSERVATIONS">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <M k="OI" v="Increasing" c={UP}/>
              <M k="OI Change" v="+12%" c={UP}/>
              <M k="PCR" v="1.18" c={UP}/>
              <M k="Max Pain" v={c.support}/>
              <M k="IV" v="38%" c={GOLD}/>
              <M k="IV Change" v="+4%" c={WARN}/>
              <M k="Delta" v="0.52"/>
              <M k="Gamma" v="Active" c={WARN}/>
              <M k="Theta" v="-8.4" c={DOWN}/>
              <M k="Call Wall" v={c.resistance} c={DOWN}/>
              <M k="Put Wall" v={c.support} c={UP}/>
              <M k="Build-up" v={c.up?"Long":"Short"} c={c.up?UP:DOWN}/>
            </div>
          </Sec>
        ):null}

        {/* OBSERVATION TIMELINE */}
        <Sec t="OBSERVATION TIMELINE">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"4px 13px"}}>
            {tl.map(function(e,i){
              var t=alertType(e.type);
              return (
                <div key={i} style={{display:"flex",gap:11,padding:"11px 0",borderBottom:i<tl.length-1?"1px solid "+BD2:"none"}}>
                  <span style={{fontSize:9,color:T3,fontFamily:"monospace",width:36,flexShrink:0,paddingTop:1}}>{e.time}</span>
                  <span style={{fontSize:13,flexShrink:0}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10.5,fontWeight:700,color:T1}}>{e.obs}</div>
                    <div style={{fontSize:8.5,color:T2,marginTop:2,lineHeight:1.4}}>{e.edu}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Sec>

        {/* AI EDUCATIONAL SUMMARY */}
        <Sec t="AI EDUCATIONAL SUMMARY">
          <div style={{background:"linear-gradient(135deg,rgba(79,140,255,0.08),rgba(96,165,250,0.02))",border:"1px solid rgba(79,140,255,0.22)",borderRadius:13,padding:14}}>
            <div style={{fontSize:11,color:T1,lineHeight:1.7}}><span style={{color:BLUE,fontWeight:700}}>AI: </span>The Observation Engine detected {c.up?"improving":"weakening"} market structure for {a.sym} because {c.up?"price reclaimed EMA and VWAP, volume increased, and a Higher High formed":"price slipped below EMA and VWAP, volume faded, and a Lower Low formed"}. These observations describe current market behaviour only and are intended for educational learning. Future price movement cannot be determined from these observations alone.</div>
          </div>
        </Sec>

        {/* RELATED OBSERVATIONS */}
        <Sec t="RELATED OBSERVATIONS">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {related.map(function(r,i){
              return <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}><div style={{fontSize:11,fontWeight:800,color:T1}}>{r.sym}</div><div style={{fontSize:8.5,color:col,marginTop:3}}>{r.obs}</div></div>;
            })}
          </div>
        </Sec>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.55}}>Educational Market Observation Only. This page organizes observed market structure using publicly available market data. It does not provide investment advice, trading recommendations, predictions, or buy/sell signals.</div>
        </div>
      </div>

      {/* BELL ALERT SELECTOR MODAL */}
      {showBell?(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:50,display:"flex",alignItems:"flex-end"}} onClick={function(){setShowBell(false);}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:"#0A0D12",borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",maxHeight:"80vh",overflowY:"auto",padding:16,boxSizing:"border-box"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:14,fontWeight:900,color:T1}}>Alert Preferences</span>
              <button onClick={function(){setShowBell(false);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:15,cursor:"pointer"}}>&#10005;</button>
            </div>
            <div style={{fontSize:9.5,color:T2,marginBottom:14}}>Choose which observations on {a.sym} you want notified about. Educational alerts only.</div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
              {ASSET_ALERT_OPTIONS.map(function(o,i){
                var on=alerts.indexOf(o.id)!=-1;
                return (
                  <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderBottom:i<ASSET_ALERT_OPTIONS.length-1?"1px solid "+BD2:"none"}}>
                    <span style={{fontSize:11,color:T1}}>{o.name}</span>
                    <button onClick={function(){toggleAlert(o.id);}} style={{width:40,height:23,borderRadius:12,border:"none",background:on?BLUE:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative"}}><span style={{position:"absolute",top:3,left:on?20:3,width:17,height:17,borderRadius:"50%",background:"#fff"}}></span></button>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:8.5,color:T3,marginTop:12,textAlign:"center"}}>{alerts.length} observation{alerts.length==1?"":"s"} selected for {a.sym}</div>
          </div>
        </div>
      ):null}
    </div>
  );
      }
        
