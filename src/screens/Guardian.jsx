import { useState } from "react";
import { alertType, getMarketStatus, loadObservation, saveObservation, ASSET_SUGGEST, NIFTY50, BANKNIFTY, POPULAR_INDICES, POPULAR_OPTIONS, parseOptionContract, addBasket, getAssetCard } from "./GuardianData";
import GuardianAsset from "./GuardianAsset";

// BreakoutPro - Guardian.jsx (AI Market Guardian)
// 3 sections: My Watchlist, Uptrend Observation, Downtrend Observation.
// Auto observation engine organizes assets by observed structure. Educational only.
// Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",CYAN="#60A5FA",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function scoreColor(s){ return s>=75?UP:s>=55?GOLD:DOWN; }
function loadFav(){ try{ return JSON.parse(localStorage.getItem("bp_guardian_fav")||"[]"); }catch(e){ return []; } }
function saveFav(a){ try{ localStorage.setItem("bp_guardian_fav",JSON.stringify(a)); }catch(e){} }
function loadRecent(){ try{ return JSON.parse(localStorage.getItem("bp_guardian_recent")||"[]"); }catch(e){ return []; } }
function pushRecent(sym){ try{ var r=loadRecent().filter(function(x){return x!=sym;}); r.unshift(sym); r=r.slice(0,6); localStorage.setItem("bp_guardian_recent",JSON.stringify(r)); }catch(e){} }

// uptrend observations / downtrend observations text per asset (educational).
var UP_OBS=["Higher High forming","Breakout above resistance","Above VWAP","Above key EMA","Strong volume","Positive OI build-up","Bullish candlestick pattern","Positive PCR change"];
var DOWN_OBS=["Lower Low forming","Breakdown below support","Below VWAP","Below key EMA","Weak volume","Negative OI build-up","Bearish candlestick pattern","Negative PCR change"];

export default function Guardian(props){
  var [tab,setTab]=useState("watch");
  var [watch,setWatch]=useState(loadObservation());
  var [query,setQuery]=useState("");
  var [fav,setFav]=useState(loadFav());
  var [openAsset,setOpenAsset]=useState(null);

  function addAsset(a){
    if(watch.length>=50) return;
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return;
    var nl=watch.concat([a]); setWatch(nl); saveObservation(nl);
  }
  function addNifty50(){ var nl=addBasket(watch,NIFTY50,"Stock"); setWatch(nl); saveObservation(nl); }
  function addBankNifty(){ var nl=addBasket(watch,BANKNIFTY,"Stock"); setWatch(nl); saveObservation(nl); }
  function removeAsset(sym){ var nl=watch.filter(function(w){return w.sym!=sym;}); setWatch(nl); saveObservation(nl); }
  function clearAll(){ setWatch([]); saveObservation([]); }
  function toggleFav(sym){ var f=fav.indexOf(sym)!=-1?fav.filter(function(x){return x!=sym;}):fav.concat([sym]); setFav(f); saveFav(f); }
  function openDetail(a){ pushRecent(a.sym); setOpenAsset(a); }

  if(openAsset) return <GuardianAsset asset={openAsset} onBack={function(){setOpenAsset(null);}} setTab={props.setTab}/>;

  // AUTO OBSERVATION ENGINE: classify each asset by its observed structure.
  var cards=watch.map(function(a){ return {asset:a, card:getAssetCard(a)}; });
  var uptrend=cards.filter(function(x){ return x.card.up; });
  var downtrend=cards.filter(function(x){ return !x.card.up; });

  var recent=loadRecent();
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
              <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"2px 6px",borderRadius:4}}><span style={{width:5,height:5,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Continuously organizing your watchlist by observed structure</div>
          </div>
        </div>
        {/* 3 TABS */}
        <div style={{display:"flex",gap:6,marginTop:12}}>
          {[["watch","My Watchlist"],["up","Uptrend"],["down","Downtrend"]].map(function(t){
            var act=tab==t[0];
            var ac=t[0]=="up"?UP:t[0]=="down"?DOWN:BLUE;
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,background:act?ac:"rgba(255,255,255,0.05)",border:"1px solid "+(act?ac:BD),borderRadius:9,padding:"8px 6px",color:act?"#fff":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}{t[0]=="up"&&uptrend.length?" "+uptrend.length:""}{t[0]=="down"&&downtrend.length?" "+downtrend.length:""}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {/* MY WATCHLIST */}
        {tab=="watch"?(
          <div>
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

            {/* baskets */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <button onClick={addNifty50} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Nifty 50</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All 50 stocks</div></button>
              <button onClick={addBankNifty} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Bank Nifty</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All banks</div></button>
            </div>

            {/* search */}
            <input value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search or type a contract e.g. NIFTY 25000 CE" style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:11.5,fontFamily:"inherit",marginBottom:10,outline:"none"}}/>
            {(function(){
              var oc=parseOptionContract(query);
              if(!oc) return null;
              var added=watch.filter(function(w){return w.sym==oc.sym;}).length>0;
              return <button onClick={function(){if(!added)addAsset(oc);}} disabled={added} style={{width:"100%",boxSizing:"border-box",background:added?"rgba(34,197,94,0.1)":"rgba(79,140,255,0.12)",border:"1px solid "+(added?"rgba(34,197,94,0.3)":"rgba(79,140,255,0.3)"),borderRadius:10,padding:"12px 13px",cursor:added?"default":"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,fontWeight:800,color:added?UP:BLUE}}>{oc.sym}</div><div style={{fontSize:8,color:T3}}>Option contract</div></div><span style={{fontSize:11,fontWeight:700,color:added?UP:BLUE}}>{added?"Added":"+ Add"}</span></button>;
            })()}
            {query && suggestions.length?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {suggestions.map(function(a){
                  return <button key={a.sym} onClick={function(){addAsset(a);setQuery("");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11.5,fontWeight:700,color:T1}}>{a.sym}</div><div style={{fontSize:8,color:T3}}>{a.type}</div></div><span style={{fontSize:16,color:BLUE}}>+</span></button>;
                })}
              </div>
            ):null}

            {/* recently viewed */}
            {!query && recent.length?(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>RECENTLY VIEWED</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {recent.map(function(sym){ return <span key={sym} style={{fontSize:9.5,color:T2,background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"6px 11px"}}>{sym}</span>; })}
                </div>
              </div>
            ):null}

            {/* watchlist items */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:800,color:T1}}>Watching {watch.length} Assets</span>
              {watch.length?<button onClick={clearAll} style={{background:"none",border:"none",color:DOWN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
            </div>
            {watch.length==0?(
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:24,textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
                <div style={{fontSize:12.5,fontWeight:700,color:T1,marginBottom:4}}>Build your watchlist</div>
                <div style={{fontSize:9.5,color:T2}}>Add assets above. The Guardian will organize them into Uptrend and Downtrend by observed structure.</div>
              </div>
            ):(
              watch.map(function(a){
                var c=getAssetCard(a);
                var isFav=fav.indexOf(a.sym)!=-1;
                return (
                  <div key={a.sym} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                    <button onClick={function(){toggleFav(a.sym);}} style={{background:"none",border:"none",color:isFav?GOLD:T3,fontSize:15,cursor:"pointer",flexShrink:0}} dangerouslySetInnerHTML={{__html:isFav?"&#9733;":"&#9734;"}}/>
                    <div style={{flex:1,minWidth:0}} onClick={function(){openDetail(a);}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:12,fontWeight:800,color:T1}}>{a.sym}</span>
                        <span style={{fontSize:6.5,fontWeight:800,color:c.up?UP:DOWN,background:c.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"2px 6px",borderRadius:4}}>{c.up?"UPTREND":"DOWNTREND"}</span>
                      </div>
                      <div style={{fontSize:8.5,color:T3,marginTop:2}}>{a.type} &#8226; Score {c.score} &#8226; {c.change}</div>
                    </div>
                    <button onClick={function(){removeAsset(a.sym);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"6px 10px",color:DOWN,fontSize:9.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Remove</button>
                  </div>
                );
              })
            )}
            <div style={{marginTop:14}}><Disclaimer/></div>
          </div>
        ):null}

        {/* UPTREND OBSERVATION */}
        {tab=="up"?(
          <ObsList items={uptrend} tone="up" obs={UP_OBS} onOpen={openDetail} empty="No assets currently show uptrend structure. The Guardian moves assets here automatically when structure turns positive."/>
        ):null}

        {/* DOWNTREND OBSERVATION */}
        {tab=="down"?(
          <ObsList items={downtrend} tone="down" obs={DOWN_OBS} onOpen={openDetail} empty="No assets currently show downtrend structure. The Guardian moves assets here automatically when structure weakens."/>
        ):null}
      </div>
    </div>
  );
}

// Observation list (uptrend or downtrend).
function ObsList(props){
  var col=props.tone=="up"?UP:DOWN;
  if(!props.items.length){
    return (
      <div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:24,textAlign:"center"}}>
          <div style={{fontSize:26,marginBottom:8}} dangerouslySetInnerHTML={{__html:props.tone=="up"?"&#128200;":"&#128201;"}}/>
          <div style={{fontSize:10,color:T2,lineHeight:1.5}}>{props.empty}</div>
        </div>
        <div style={{marginTop:14}}><Disclaimer/></div>
      </div>
    );
  }
  return (
    <div>
      <div style={{fontSize:9,color:T2,marginBottom:11,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block"}}></span>
        Auto-organized by the observation engine. {props.items.length} asset{props.items.length>1?"s":""}.
      </div>
      {props.items.map(function(x,idx){
        var a=x.asset, c=x.card;
        var sc=scoreColor(c.score);
        var obs=props.obs[idx%props.obs.length];
        return (
          <div key={a.sym} onClick={function(){props.onOpen(a);}} style={{background:CARD,border:"1px solid "+BD,borderLeft:"3px solid "+col,borderRadius:13,padding:13,marginBottom:10,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:9}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:900,color:T1}}>{a.sym}</span>
                  <span style={{fontSize:6.5,fontWeight:800,color:col,background:props.tone=="up"?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(props.tone=="up"?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"),padding:"2px 7px",borderRadius:4}}>{props.tone=="up"?"UPTREND":"DOWNTREND"}</span>
                </div>
                <div style={{fontSize:8.5,color:T3,marginTop:3}}>{a.type} &#8226; {c.timeframe} &#8226; {c.updated}</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0,marginLeft:10}}>
                <div style={{fontSize:7.5,color:T2}}>Score</div>
                <div style={{fontSize:18,fontWeight:900,color:sc,lineHeight:1}}>{c.score}</div>
                <div style={{fontSize:6.5,color:T3}}>of 100</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:9,paddingBottom:9,borderBottom:"1px solid "+BD2}}>
              <div><div style={{fontSize:7.5,color:T3}}>Price</div><div style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{c.price}</div></div>
              <div><div style={{fontSize:7.5,color:T3}}>Change</div><div style={{fontSize:12,fontWeight:800,color:c.up?UP:DOWN}}>{c.change}</div></div>
              <div style={{flex:1}}></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
              <span style={{fontSize:13,flexShrink:0}} dangerouslySetInnerHTML={{__html:props.tone=="up"?"&#128640;":"&#128201;"}}/>
              <div><div style={{fontSize:7.5,color:T3}}>Latest Observation</div><div style={{fontSize:10.5,fontWeight:700,color:T1}}>{obs}</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:8.5,color:T2}}>Confidence <b style={{color:col}}>{c.confidence}%</b></span>
              <span style={{fontSize:10,fontWeight:800,color:BLUE}}>View Details &#8594;</span>
            </div>
          </div>
        );
      })}
      <div style={{marginTop:6}}><Disclaimer/></div>
    </div>
  );
}

function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Observation Only. Not Investment Advice.</div>
    </div>
  );
}
