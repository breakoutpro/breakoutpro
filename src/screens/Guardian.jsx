import { useState } from "react";
import { ALERT_TYPES, alertType, alertCategory, alertMeta, priorityColor, getAlertEdu, getAiInsights, getMarketStatus, getTimeline, loadObservation, saveObservation, ASSET_SUGGEST, getAlertFeed, NIFTY50, BANKNIFTY, addBasket } from "./GuardianData";

// BreakoutPro - Guardian.jsx
// AI Market Guardian (Smart Observation). Observation list + educational alerts + settings.
// Educational only. SEBI-safe. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function loadPrefs(){
  try{ return JSON.parse(localStorage.getItem("bp_guardian_prefs")||"null")||{}; }catch(e){ return {}; }
}
function savePrefs(p){ try{ localStorage.setItem("bp_guardian_prefs",JSON.stringify(p)); }catch(e){} }

export default function Guardian(props){
  var [tab,setTab]=useState("watch");
  var [watch,setWatch]=useState(loadObservation());
  var [query,setQuery]=useState("");
  var [prefs,setPrefs]=useState(loadPrefs());
  var [detail,setDetail]=useState(null);

  function addAsset(a){
    if(watch.length>=50) return;
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return;
    var nl=watch.concat([a]); setWatch(nl); saveObservation(nl);
  }
  function addNifty50(){
    var nl=addBasket(watch, NIFTY50, "Stock"); setWatch(nl); saveObservation(nl);
  }
  function addBankNifty(){
    var nl=addBasket(watch, BANKNIFTY, "Stock"); setWatch(nl); saveObservation(nl);
  }
  function clearAll(){
    setWatch([]); saveObservation([]);
  }
  function removeAsset(sym){
    var nl=watch.filter(function(w){return w.sym!=sym;}); setWatch(nl); saveObservation(nl);
  }
  function togglePref(id){
    var np=Object.assign({},prefs);
    np[id]=(prefs[id]==false)?true:false;
    setPrefs(np); savePrefs(np);
  }
  function prefOn(id){ return prefs[id]!==false; }

  if(detail) return <AlertDetail item={detail} onBack={function(){setDetail(null);}} setTab={props.setTab}/>;

  var feed=getAlertFeed(watch).filter(function(f){ return prefOn(f.type); });
  var MKT=getMarketStatus();
  var timeline=getTimeline(watch);
  var highCount=feed.filter(function(f){ var m=alertMeta(f.type); return m.priority=="High"||m.priority=="Critical"; }).length;
  var suggestions=ASSET_SUGGEST.filter(function(a){
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return false;
    if(query && a.sym.toLowerCase().indexOf(query.toLowerCase())==-1) return false;
    return true;
  });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"14px 14px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
              <span style={{fontSize:15,fontWeight:900,color:T1}}>AI Market Guardian</span>
              <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"2px 6px",borderRadius:4}}><span style={{width:5,height:5,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE MONITORING</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Smart observation and educational alerts</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
          {[["watch","My Watchlist"],["smart","Smart Alerts"],["pattern","Pattern Alerts"],["technical","Technical Alerts"],["options","Options Alerts"],["news","News Alerts"],["insights","AI Insights"],["settings","Settings"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:BD),borderRadius:9,padding:"6px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {/* LIVE SUMMARY + MARKET STATUS - on watchlist and smart tabs */}
        {(tab=="watch"||tab=="smart")?(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:T2,marginBottom:9,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:UP,display:"inline-block"}}></span>
              Your personal AI market observation engine &#8226; Last scan {MKT.lastScan}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:9}}>
              <Tile k="Watching" v={watch.length} sub="assets"/>
              <Tile k="Active Alerts" v={feed.length} sub="today"/>
              <Tile k="High Priority" v={highCount} sub="alerts" tone="warn"/>
            </div>
            <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.02))",border:"1px solid rgba(59,130,246,0.22)",borderRadius:14,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:11.5,fontWeight:800,color:T1}}>Today's Market Status</span>
                <span style={{fontSize:10,fontWeight:800,color:MKT.mood=="Bullish"?UP:MKT.mood=="Bearish"?DOWN:GOLD}}>{MKT.mood}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                <Ring value={MKT.score} label="Market Score"/>
                <div style={{flex:1}}>
                  <Gauge k="Health" v={MKT.health}/>
                  <Gauge k="Trend Strength" v={MKT.trendStrength}/>
                  <Gauge k="Sentiment" v={MKT.sentiment}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <Stat k="Trend" v={MKT.trend} tone="up"/>
                <Stat k="Momentum" v={MKT.momentum} tone="up"/>
                <Stat k="Volatility" v={MKT.volatility} tone="up"/>
                <Stat k="Risk" v={MKT.risk} tone="warn"/>
                <Stat k="Breadth" v={MKT.breadth} tone="up"/>
                <Stat k="India VIX" v={MKT.vix}/>
                <Stat k="FII / DII" v={MKT.fiidii} tone="up"/>
                <Stat k="Market Mood" v={MKT.mood} tone={MKT.mood=="Bullish"?"up":MKT.mood=="Bearish"?"down":"warn"}/>
              </div>
            </div>
            <div style={{marginTop:14}}>
              <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:10}}>TODAY'S TIMELINE</div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"4px 13px"}}>
                {timeline.map(function(tl,i){
                  var tt=alertType(tl.type);
                  return (
                    <div key={i} onClick={function(){setDetail(tl);}} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:i<timeline.length-1?"1px solid "+BD2:"none",cursor:"pointer"}}>
                      <span style={{fontSize:9.5,color:T3,fontFamily:"monospace",width:38,flexShrink:0}}>{tl.time}</span>
                      <span style={{fontSize:14,flexShrink:0}} dangerouslySetInnerHTML={{__html:tt.ic}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:11,fontWeight:700,color:T1}}>{tt.name}</span>
                        <span style={{fontSize:9,color:T2,marginLeft:6}}>{tl.sym}</span>
                      </div>
                      <span style={{fontSize:12,color:T3}}>&#8250;</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ):null}

        {/* ALERTS FEED */}
        {/* ALERT FEEDS - Smart (all) / Pattern / Technical / Options / News */}
        {(tab=="smart"||tab=="pattern"||tab=="technical"||tab=="options"||tab=="news")?(
          <div>
            {watch.length==0?(
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:24,textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:8}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
                <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:5}}>No assets observed yet</div>
                <div style={{fontSize:10,color:T2,marginBottom:14}}>Add stocks, indices, futures, options, or ETFs to start receiving educational alerts.</div>
                <button onClick={function(){setTab("watch");}} style={{background:CYAN,border:"none",borderRadius:10,padding:"11px 20px",color:"#04060D",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Add Assets</button>
              </div>
            ):(function(){
              var list=feed.filter(function(f){
                if(tab=="smart") return true;
                return alertCategory(f.type)==tab;
              });
              return list.length?list.map(function(f,i){
                var t=alertType(f.type);
                var m=alertMeta(f.type);
                var pc=priorityColor(m.priority);
                return (
                  <div key={i} onClick={function(){setDetail(f);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:9,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:42,height:42,background:CARD2,border:"1px solid "+BD2,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:12.5,fontWeight:800,color:T1}}>{f.sym}</span>
                          <span style={{fontSize:9,color:CYAN,fontWeight:700}}>{t.name}</span>
                        </div>
                        <div style={{fontSize:9,color:T2,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getAlertEdu(f.type).what}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:8,color:T3}}>{f.time}</div>
                        <span style={{fontSize:13,color:T3}}>&#8250;</span>
                      </div>
                    </div>
                    {/* badges row */}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:9,paddingTop:9,borderTop:"1px solid "+BD2}}>
                      <span style={{fontSize:7.5,fontWeight:800,color:pc,background:"rgba(255,255,255,0.04)",border:"1px solid "+pc,padding:"2px 7px",borderRadius:4}}>{m.priority.toUpperCase()}</span>
                      <span style={{fontSize:7.5,fontWeight:700,color:T2,background:CARD2,padding:"2px 7px",borderRadius:4}}>{m.timeframe}</span>
                      <span style={{fontSize:7.5,fontWeight:700,color:UP,background:"rgba(34,197,94,0.08)",padding:"2px 7px",borderRadius:4}}>{m.confidence}% confidence</span>
                    </div>
                  </div>
                );
              }):(
                <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:20,textAlign:"center"}}>
                  <div style={{fontSize:11,color:T2}}>No alerts in this category right now. Enable more alert types in Settings.</div>
                </div>
              );
            })()}
            <Disclaimer/>
          </div>
        ):null}

        {/* AI INSIGHTS */}
        {tab=="insights"?(
          <div>
            {watch.length==0?(
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:24,textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:8}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
                <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:5}}>Add assets for AI insights</div>
                <div style={{fontSize:10,color:T2,marginBottom:14}}>The Guardian generates educational insights from your observed assets.</div>
                <button onClick={function(){setTab("watch");}} style={{background:CYAN,border:"none",borderRadius:10,padding:"11px 20px",color:"#04060D",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Add Assets</button>
              </div>
            ):(
              getAiInsights(watch).map(function(ins,i){
                return (
                  <div key={i} style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                      <span style={{fontSize:12}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
                      <span style={{fontSize:11.5,fontWeight:800,color:CYAN}}>{ins.title}</span>
                    </div>
                    <div style={{fontSize:11,color:T1,lineHeight:1.65}}>{ins.body}</div>
                  </div>
                );
              })
            )}
            <Disclaimer/>
          </div>
        ):null}

        {/* OBSERVATION LIST */}
        {tab=="watch"?(
          <div>
            {/* AUTO-ALERTS banner */}
            <div style={{background:"linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.02))",border:"1px solid rgba(34,197,94,0.25)",borderRadius:12,padding:"12px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:UP,display:"inline-block",flexShrink:0}}></span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,fontWeight:800,color:UP}}>Auto-Alerts Active</div>
                <div style={{fontSize:9,color:T2,marginTop:1}}>Every asset here is monitored live during market hours. Alerts appear in the alert tabs automatically.</div>
              </div>
            </div>

            {/* POWER BUTTONS - one-tap baskets */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <button onClick={addNifty50} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:11,padding:"12px 8px",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{fontSize:11.5,fontWeight:800,color:CYAN}}>+ Add Nifty 50</div>
                <div style={{fontSize:8,color:T3,marginTop:2}}>All 50 stocks at once</div>
              </button>
              <button onClick={addBankNifty} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:11,padding:"12px 8px",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{fontSize:11.5,fontWeight:800,color:CYAN}}>+ Add Bank Nifty</div>
                <div style={{fontSize:8,color:T3,marginTop:2}}>All banking stocks</div>
              </button>
            </div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
              <span style={{fontSize:10,color:T2}}>Observing {watch.length} of 50 assets</span>
              {watch.length?<button onClick={clearAll} style={{background:"none",border:"none",color:DOWN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
            </div>
            {watch.length?(
              <div style={{marginBottom:16}}>
                {watch.map(function(w){
                  return (
                    <div key={w.sym} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 13px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <span style={{fontSize:12.5,fontWeight:700,color:T1}}>{w.sym}</span>
                        <span style={{fontSize:8,color:T3,marginLeft:8,background:CARD2,padding:"2px 7px",borderRadius:4}}>{w.type}</span>
                      </div>
                      <button onClick={function(){removeAsset(w.sym);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"6px 10px",color:DOWN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
                    </div>
                  );
                })}
              </div>
            ):null}

            <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:9}}>ADD ASSETS</div>
            <input value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search stocks, indices, ETFs, futures, options" style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:11.5,fontFamily:"inherit",marginBottom:10,outline:"none"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {suggestions.map(function(a){
                return (
                  <button key={a.sym} onClick={function(){addAsset(a);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:11.5,fontWeight:700,color:T1}}>{a.sym}</div>
                      <div style={{fontSize:8,color:T3,marginTop:1}}>{a.type}</div>
                    </div>
                    <span style={{fontSize:16,color:CYAN}}>+</span>
                  </button>
                );
              })}
            </div>
            {watch.length>=50?<div style={{fontSize:9,color:GOLD,marginTop:10}}>Observation limit reached (50 assets).</div>:null}
            <div style={{marginTop:16}}><Disclaimer/></div>
          </div>
        ):null}

        {/* SETTINGS - which alerts to receive */}
        {tab=="settings"?(
          <div>
            <div style={{fontSize:10,color:T2,marginBottom:11}}>Choose which educational alerts you receive. All are on by default.</div>
            {ALERT_TYPES.map(function(g){
              return (
                <div key={g.group} style={{marginBottom:16}}>
                  <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:9}}>{g.group.toUpperCase()}</div>
                  <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
                    {g.items.map(function(t,i){
                      var on=prefOn(t.id);
                      return (
                        <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderBottom:i<g.items.length-1?"1px solid "+BD2:"none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                            <span style={{fontSize:11.5,color:T1}}>{t.name}</span>
                          </div>
                          <button onClick={function(){togglePref(t.id);}} style={{width:42,height:24,borderRadius:12,border:"none",background:on?CYAN:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
                            <span style={{position:"absolute",top:3,left:on?21:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"all 0.2s"}}></span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
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

// Alert detail page - educational explanation.
function AlertDetail(props){
  var f=props.item;
  var t=alertType(f.type);
  var e=getAlertEdu(f.type);
  var m=alertMeta(f.type);
  var pc=priorityColor(m.priority);
  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(f.sym+". "+t.name+". "+e.what+" "+e.why+" "+e.edu);
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e2){}
  }
  function Sec(p){ return <div style={{marginBottom:14}}><div style={{fontSize:10,fontWeight:800,color:p.c||T2,letterSpacing:0.4,marginBottom:6}}>{p.t}</div><div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{p.v}</div></div>; }
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:t.ic}}/>
          <div><div style={{fontSize:14,fontWeight:900,color:T1}}>{f.sym}</div><div style={{fontSize:9,color:CYAN,fontWeight:700}}>{t.name} &#8226; {f.time}</div></div>
        </div>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"7px 11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:14}}>
        {/* priority badges */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
          <span style={{fontSize:8,fontWeight:800,color:pc,background:"rgba(255,255,255,0.04)",border:"1px solid "+pc,padding:"4px 10px",borderRadius:6}}>{m.priority.toUpperCase()}</span>
          <span style={{fontSize:8,fontWeight:700,color:T2,background:CARD,border:"1px solid "+BD,padding:"4px 10px",borderRadius:6}}>{m.timeframe}</span>
          <span style={{fontSize:8,fontWeight:700,color:UP,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",padding:"4px 10px",borderRadius:6}}>{m.confidence}% confidence</span>
        </div>
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:800,color:CYAN,marginBottom:5}}>WHAT HAPPENED</div>
          <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{e.what}</div>
        </div>
        <Sec t="WHY IT MATTERS" v={e.why}/>
        <Sec t="TECHNICAL EXPLANATION" v={e.edu}/>
        <Sec t="EDUCATIONAL MEANING" v={e.edu}/>
        <Sec t="HISTORICAL CONTEXT" v={"Similar conditions have appeared many times before. Studying how "+f.sym+" and other assets behaved afterward, without assuming history repeats, builds pattern recognition."}/>
        <Sec t="SIMILAR PAST EVENTS" v={"Comparable setups occurred on earlier sessions. Each played out differently depending on trend, volume, and news, which is why confirmation matters more than the label."}/>
        <Sec t="THINGS TO WATCH" v={"Watch whether the move holds with volume, how price behaves at the next key level, and whether broader market conditions support or oppose it."}/>
        <Sec t="LEARNING NOTES" v={"Treat this as a study prompt. The goal is to understand the condition and its risks, not to act on it. Confirmation over prediction is the habit to build."}/>
        <Sec t="RISK FACTORS" c={DOWN} v={e.risk}/>

        <div style={{display:"flex",gap:9,marginBottom:16}}>
          <button onClick={function(){if(props.setTab)props.setTab("markets");}} style={{flex:1,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"12px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Open Chart</button>
          <button onClick={function(){if(props.setTab)props.setTab("news");}} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"12px",color:T1,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Related News</button>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316",lineHeight:1.5}}>Educational Market Intelligence Only. Not Investment Advice. No buy, sell, entry, stop loss, or target.</div>
        </div>
      </div>
    </div>
  );
}

function Tile(props){
  var col=props.tone=="warn"?GOLD:T1;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 8px",textAlign:"center"}}>
      <div style={{fontSize:18,fontWeight:900,color:col}}>{props.v}</div>
      <div style={{fontSize:8,color:T2,marginTop:2}}>{props.k}</div>
      <div style={{fontSize:7,color:T3}}>{props.sub}</div>
    </div>
  );
}
function Ring(props){
  var v=props.value, r=26, c=2*Math.PI*r, off=c*(1-v/100);
  var col=v>=66?UP:v>=40?GOLD:DOWN;
  return (
    <div style={{position:"relative",width:66,height:66,flexShrink:0}}>
      <svg width="66" height="66" style={{transform:"rotate(-90deg)"}}>
        <circle cx="33" cy="33" r={r} fill="none" stroke="#1B2330" strokeWidth="5"/>
        <circle cx="33" cy="33" r={r} fill="none" stroke={col} strokeWidth="5" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:16,fontWeight:900,color:col}}>{v}</span>
      </div>
    </div>
  );
}
function Gauge(props){
  var v=props.v, col=v>=66?UP:v>=40?GOLD:DOWN;
  return (
    <div style={{marginBottom:7}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:8.5,color:T2}}>{props.k}</span>
        <span style={{fontSize:8.5,fontWeight:800,color:col}}>{v}</span>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
        <div style={{height:4,width:v+"%",background:col,borderRadius:2}}></div>
      </div>
    </div>
  );
}
function Stat(props){
  var col=props.tone=="up"?UP:props.tone=="down"?DOWN:props.tone=="warn"?GOLD:T1;
  return (
    <div style={{background:CARD2,borderRadius:8,padding:"8px 10px"}}>
      <div style={{fontSize:8,color:T3}}>{props.k}</div>
      <div style={{fontSize:11,fontWeight:800,color:col,marginTop:2}}>{props.v}</div>
    </div>
  );
}
function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:6}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Intelligence Only. Alerts highlight conditions for study. Not investment advice or a trading recommendation.</div>
    </div>
  );
}
