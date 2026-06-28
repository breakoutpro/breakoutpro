import { useState } from "react";
import { ALERT_TYPES, alertType, getAlertEdu, getMarketStatus, getTimeline, loadObservation, saveObservation, ASSET_SUGGEST, NIFTY50, BANKNIFTY, POPULAR_INDICES, POPULAR_OPTIONS, parseOptionContract, addBasket, getAssetCard, getLiveFeed, getInsights, getInsightNotes, getAssetTimeline } from "./GuardianData";
import GuardianAsset from "./GuardianAsset";

// BreakoutPro - Guardian.jsx (AI Market Guardian)
// 4 tabs: My Watchlist (intelligent cards), Live Feed, AI Insights, Settings.
// Educational only. SEBI-safe. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",CYAN="#60A5FA",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function loadPrefs(){ try{ return JSON.parse(localStorage.getItem("bp_guardian_prefs")||"null")||{}; }catch(e){ return {}; } }
function savePrefs(p){ try{ localStorage.setItem("bp_guardian_prefs",JSON.stringify(p)); }catch(e){} }
function toneColor(t){ return t=="up"?UP:t=="down"?DOWN:t=="warn"?WARN:T2; }
function scoreColor(s){ return s>=75?UP:s>=55?GOLD:DOWN; }

export default function Guardian(props){
  var [tab,setTab]=useState("watch");
  var [watch,setWatch]=useState(loadObservation());
  var [query,setQuery]=useState("");
  var [prefs,setPrefs]=useState(loadPrefs());
  var [openAsset,setOpenAsset]=useState(null);
  var [feedFilter,setFeedFilter]=useState("all");

  function addAsset(a){
    if(watch.length>=50) return;
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return;
    var nl=watch.concat([a]); setWatch(nl); saveObservation(nl);
  }
  function addNifty50(){ var nl=addBasket(watch,NIFTY50,"Stock"); setWatch(nl); saveObservation(nl); }
  function addBankNifty(){ var nl=addBasket(watch,BANKNIFTY,"Stock"); setWatch(nl); saveObservation(nl); }
  function removeAsset(sym){ var nl=watch.filter(function(w){return w.sym!=sym;}); setWatch(nl); saveObservation(nl); }
  function clearAll(){ setWatch([]); saveObservation([]); }
  function togglePref(id){ var np=Object.assign({},prefs); np[id]=(prefs[id]==false)?true:false; setPrefs(np); savePrefs(np); }
  function prefOn(id){ return prefs[id]!==false; }

  if(openAsset) return <GuardianAsset asset={openAsset} onBack={function(){setOpenAsset(null);}} setTab={props.setTab}/>;

  var MKT=getMarketStatus();
  var suggestions=ASSET_SUGGEST.filter(function(a){
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return false;
    if(query && a.sym.toLowerCase().indexOf(query.toLowerCase())==-1) return false;
    return true;
  });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      {/* HEADER */}
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
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Your personal AI market observation engine</div>
          </div>
        </div>
        {/* 4 TABS */}
        <div style={{display:"flex",gap:6,marginTop:12}}>
          {[["watch","My Watchlist"],["feed","Live Feed"],["insights","AI Insights"],["settings","Settings"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"7px 6px",color:act?"#fff":T2,fontSize:10.5,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {/* MY WATCHLIST */}
        {tab=="watch"?(
          <div>
            {/* summary tiles */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:13}}>
              <Tile k="Watching" v={watch.length} sub="assets"/>
              <Tile k="New Alerts" v={watch.length?watch.length*2:0} sub="today"/>
              <Tile k="High Pri" v={watch.length?Math.ceil(watch.length/3):0} sub="alerts" tone="warn"/>
              <Tile k="Mood" v={MKT.mood} sub="market" tone="up" small={true}/>
            </div>

            {/* QUICK ADD indices */}
            <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>QUICK ADD &#8226; INDICES</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
              {POPULAR_INDICES.map(function(a){
                var added=watch.filter(function(w){return w.sym==a.sym;}).length>0;
                return <button key={a.sym} onClick={function(){addAsset(a);}} disabled={added} style={{background:added?"rgba(34,197,94,0.1)":"rgba(79,140,255,0.1)",border:"1px solid "+(added?"rgba(34,197,94,0.3)":"rgba(79,140,255,0.3)"),borderRadius:16,padding:"7px 12px",color:added?UP:BLUE,fontSize:10,fontWeight:700,cursor:added?"default":"pointer",fontFamily:"inherit"}}>{added?"\u2713 ":"+ "}{a.sym}</button>;
              })}
            </div>

            {/* QUICK ADD options */}
            <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>QUICK ADD &#8226; OPTIONS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
              {POPULAR_OPTIONS.map(function(a){
                var added=watch.filter(function(w){return w.sym==a.sym;}).length>0;
                return <button key={a.sym} onClick={function(){addAsset(a);}} disabled={added} style={{background:added?"rgba(34,197,94,0.08)":CARD,border:"1px solid "+(added?"rgba(34,197,94,0.3)":BD),borderRadius:10,padding:"9px 5px",cursor:added?"default":"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:9.5,fontWeight:800,color:added?UP:T1}}>{a.sym.replace("NIFTY ","")}</div><div style={{fontSize:6.5,color:T3,marginTop:1}}>{a.note}</div></button>;
              })}
            </div>

            {/* basket + search */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <button onClick={addNifty50} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Nifty 50</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All 50 stocks</div></button>
              <button onClick={addBankNifty} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Bank Nifty</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All banks</div></button>
            </div>
            <input value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search or type a contract e.g. NIFTY 25000 CE" style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:11.5,fontFamily:"inherit",marginBottom:10,outline:"none"}}/>
            {(function(){
              var oc=parseOptionContract(query);
              if(!oc) return null;
              var added=watch.filter(function(w){return w.sym==oc.sym;}).length>0;
              return <button onClick={function(){if(!added)addAsset(oc);}} disabled={added} style={{width:"100%",boxSizing:"border-box",background:added?"rgba(34,197,94,0.1)":"rgba(79,140,255,0.12)",border:"1px solid "+(added?"rgba(34,197,94,0.3)":"rgba(79,140,255,0.3)"),borderRadius:10,padding:"12px 13px",cursor:added?"default":"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,fontWeight:800,color:added?UP:BLUE}}>{oc.sym}</div><div style={{fontSize:8,color:T3}}>Option contract</div></div><span style={{fontSize:11,fontWeight:700,color:added?UP:BLUE}}>{added?"Added":"+ Add"}</span></button>;
            })()}
            {query && suggestions.length?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {suggestions.map(function(a){
                  return <button key={a.sym} onClick={function(){addAsset(a);setQuery("");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11.5,fontWeight:700,color:T1}}>{a.sym}</div><div style={{fontSize:8,color:T3}}>{a.type}</div></div><span style={{fontSize:16,color:BLUE}}>+</span></button>;
                })}
              </div>
            ):null}

            {/* INTELLIGENT ASSET CARDS */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:800,color:T1}}>Observing {watch.length} Assets</span>
              {watch.length?<button onClick={clearAll} style={{background:"none",border:"none",color:DOWN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
            </div>

            {watch.length==0?(
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:24,textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
                <div style={{fontSize:12.5,fontWeight:700,color:T1,marginBottom:4}}>Build your watchlist</div>
                <div style={{fontSize:9.5,color:T2}}>Use Quick Add above to start monitoring with educational AI alerts.</div>
              </div>
            ):(
              watch.map(function(a){ return <AssetCard key={a.sym} asset={a} onOpen={function(){setOpenAsset(a);}} onRemove={function(){removeAsset(a.sym);}}/>; })
            )}

            <div style={{marginTop:14}}><Disclaimer/></div>
          </div>
        ):null}

        {/* LIVE FEED */}
        {tab=="feed"?(
          <div>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:12,paddingBottom:2}}>
              {[["all","All"],["Stock","Stocks"],["Option","Options"],["Index","Indices"]].map(function(f){
                var act=feedFilter==f[0];
                return <button key={f[0]} onClick={function(){setFeedFilter(f[0]);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:14,padding:"6px 13px",color:act?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{f[1]}</button>;
              })}
            </div>
            <div style={{position:"relative"}}>
              {/* timeline rail */}
              {getLiveFeed(watch).map(function(f,i){
                var t=alertType(f.type);
                var tone=f.type.indexOf("down")!=-1||f.type=="breakdown"||f.type=="bearengulf"?"down":"up";
                return (
                  <div key={i} style={{display:"flex",gap:11,marginBottom:2}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <span style={{width:9,height:9,borderRadius:"50%",background:toneColor(tone),marginTop:14,boxShadow:"0 0 8px "+toneColor(tone)}}></span>
                      {i<getLiveFeed(watch).length-1?<span style={{width:1,flex:1,background:BD2,marginTop:2}}></span>:null}
                    </div>
                    <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"10px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:8.5,color:T3,fontFamily:"monospace",width:42,flexShrink:0}}>{f.time}</span>
                      <span style={{fontSize:15,flexShrink:0}} dangerouslySetInnerHTML={{__html:t.ic}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:11.5,fontWeight:800,color:T1}}>{f.sym}</span>
                        <span style={{fontSize:9,color:CYAN,fontWeight:700,marginLeft:7}}>{t.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Disclaimer/>
          </div>
        ):null}

        {/* AI INSIGHTS */}
        {tab=="insights"?(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {getInsights(watch).map(function(ins,i){
                return <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:11}}><div style={{fontSize:8.5,color:T2}}>{ins.k}</div><div style={{fontSize:13,fontWeight:800,color:toneColor(ins.tone),marginTop:4}}>{ins.v}</div></div>;
              })}
            </div>
            {(function(){
              var n=getInsightNotes();
              return (
                <div>
                  <Note t="Risk Warning" c={WARN} v={n.risk}/>
                  <Note t="Educational Lesson" c={CYAN} v={n.lesson}/>
                  <Note t="Today's Observation" c={UP} v={n.observation}/>
                </div>
              );
            })()}
            <Disclaimer/>
          </div>
        ):null}

        {/* SETTINGS */}
        {tab=="settings"?(
          <div>
            <div style={{fontSize:10,color:T2,marginBottom:11}}>Choose which educational alerts the Guardian observes. All on by default.</div>
            {ALERT_TYPES.map(function(g){
              return (
                <div key={g.group} style={{marginBottom:15}}>
                  <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>{g.group.toUpperCase()}</div>
                  <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
                    {g.items.map(function(t,i){
                      var on=prefOn(t.id);
                      return (
                        <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderBottom:i<g.items.length-1?"1px solid "+BD2:"none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:t.ic}}/><span style={{fontSize:11,color:T1}}>{t.name}</span></div>
                          <button onClick={function(){togglePref(t.id);}} style={{width:40,height:23,borderRadius:12,border:"none",background:on?BLUE:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative"}}><span style={{position:"absolute",top:3,left:on?20:3,width:17,height:17,borderRadius:"50%",background:"#fff"}}></span></button>
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

// Intelligent asset card - everything for one asset in ONE card.
function AssetCard(props){
  var a=props.asset;
  var c=getAssetCard(a);
  var sc=scoreColor(c.score);
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:15,padding:14,marginBottom:11}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontSize:13.5,fontWeight:900,color:T1}}>{c.sym}</span>
            <span style={{fontSize:7,fontWeight:800,color:c.up?UP:DOWN,background:c.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"2px 6px",borderRadius:4}}>{c.bias.toUpperCase()}</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:6.5,fontWeight:800,color:UP}}><span style={{width:4,height:4,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
          </div>
          <div style={{fontSize:8.5,color:T3,marginTop:3}}>{a.type} &#8226; {c.timeframe} &#8226; {c.updated}</div>
        </div>
        {/* AI score badge */}
        <div style={{textAlign:"center",flexShrink:0,marginLeft:10}}>
          <div style={{fontSize:8,color:T2}}>AI Score</div>
          <div style={{fontSize:19,fontWeight:900,color:sc,lineHeight:1}}>{c.score}</div>
          <div style={{fontSize:7,color:T3}}>of 100</div>
        </div>
      </div>

      {/* price row */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:11,paddingBottom:11,borderBottom:"1px solid "+BD2}}>
        <div><div style={{fontSize:7.5,color:T3}}>Price</div><div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{c.price}</div></div>
        <div><div style={{fontSize:7.5,color:T3}}>Change</div><div style={{fontSize:13,fontWeight:800,color:c.up?UP:DOWN}}>{c.change}</div></div>
        <div><div style={{fontSize:7.5,color:T3}}>Support</div><div style={{fontSize:11,fontWeight:700,color:UP,fontFamily:"monospace"}}>{c.support}</div></div>
        <div><div style={{fontSize:7.5,color:T3}}>Resistance</div><div style={{fontSize:11,fontWeight:700,color:DOWN,fontFamily:"monospace"}}>{c.resistance}</div></div>
      </div>

      {/* alert chips - ALL alerts inside this card */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:11}}>
        {c.alerts.map(function(al,i){
          return <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:8.5,fontWeight:700,color:toneColor(al.tone),background:"rgba(255,255,255,0.04)",border:"1px solid "+BD2,padding:"4px 8px",borderRadius:7}}><span dangerouslySetInnerHTML={{__html:al.ic}}/>{al.name}</span>;
        })}
      </div>

      {/* footer */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:8.5,color:T2}}>Confidence <b style={{color:UP}}>{c.confidence}%</b></span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={props.onRemove} style={{background:"none",border:"none",color:T3,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
          <button onClick={props.onOpen} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:9,padding:"7px 12px",color:BLUE,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>View AI Analysis &#8594;</button>
        </div>
      </div>
    </div>
  );
}

function Tile(props){
  var col=props.tone=="warn"?WARN:props.tone=="up"?UP:T1;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"10px 5px",textAlign:"center"}}>
      <div style={{fontSize:props.small?11:16,fontWeight:900,color:col}}>{props.v}</div>
      <div style={{fontSize:7.5,color:T2,marginTop:2}}>{props.k}</div>
      <div style={{fontSize:6.5,color:T3}}>{props.sub}</div>
    </div>
  );
}
function Note(props){
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:800,color:props.c,letterSpacing:0.3,marginBottom:6}}>{props.t}</div>
      <div style={{fontSize:11,color:T1,lineHeight:1.6}}>{props.v}</div>
    </div>
  );
}
function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:6}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Intelligence Only. The Guardian observes and explains markets for learning. Not investment advice or a trading recommendation.</div>
    </div>
  );
}
