import { useState } from "react";
import { ALERT_TYPES, alertType, getAlertEdu, loadObservation, saveObservation, ASSET_SUGGEST, getAlertFeed } from "./GuardianData";

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
  var [tab,setTab]=useState("alerts");
  var [watch,setWatch]=useState(loadObservation());
  var [query,setQuery]=useState("");
  var [prefs,setPrefs]=useState(loadPrefs());
  var [detail,setDetail]=useState(null);

  function addAsset(a){
    if(watch.length>=30) return;
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return;
    var nl=watch.concat([a]); setWatch(nl); saveObservation(nl);
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
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
              <span style={{fontSize:15,fontWeight:900,color:T1}}>AI Market Guardian</span>
              <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Smart observation and educational alerts</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:12}}>
          {[["alerts","Alerts"],["watch","Observation"],["settings","Settings"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:BD),borderRadius:9,padding:"6px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {/* ALERTS FEED */}
        {tab=="alerts"?(
          <div>
            {watch.length==0?(
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:24,textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:8}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
                <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:5}}>No assets observed yet</div>
                <div style={{fontSize:10,color:T2,marginBottom:14}}>Add stocks, indices, futures, options, or ETFs to start receiving educational alerts.</div>
                <button onClick={function(){setTab("watch");}} style={{background:CYAN,border:"none",borderRadius:10,padding:"11px 20px",color:"#04060D",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Add Assets</button>
              </div>
            ):(
              feed.length?feed.map(function(f,i){
                var t=alertType(f.type);
                return (
                  <div key={i} onClick={function(){setDetail(f);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:9,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,background:CARD2,border:"1px solid "+BD2,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:17}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:12.5,fontWeight:800,color:T1}}>{f.sym}</span>
                        <span style={{fontSize:9,color:CYAN,fontWeight:700}}>{t.name}</span>
                      </div>
                      <div style={{fontSize:9,color:T2,marginTop:2}}>{getAlertEdu(f.type).what}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:8,color:T3}}>{f.time}</div>
                      <span style={{fontSize:13,color:T3}}>&#8250;</span>
                    </div>
                  </div>
                );
              }):(
                <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:20,textAlign:"center"}}>
                  <div style={{fontSize:11,color:T2}}>No alerts match your current settings. Enable more alert types in Settings.</div>
                </div>
              )
            )}
            <Disclaimer/>
          </div>
        ):null}

        {/* OBSERVATION LIST */}
        {tab=="watch"?(
          <div>
            <div style={{fontSize:10,color:T2,marginBottom:9}}>Observing {watch.length} of 30 assets</div>
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
            {watch.length>=30?<div style={{fontSize:9,color:GOLD,marginTop:10}}>Observation limit reached (30 assets).</div>:null}
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
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:800,color:CYAN,marginBottom:5}}>WHAT HAPPENED</div>
          <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{e.what}</div>
        </div>
        <Sec t="WHY IT MATTERS" v={e.why}/>
        <Sec t="EDUCATIONAL EXPLANATION" v={e.edu}/>
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

function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:6}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Intelligence Only. Alerts highlight conditions for study. Not investment advice or a trading recommendation.</div>
    </div>
  );
}
