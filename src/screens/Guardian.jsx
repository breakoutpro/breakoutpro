import { useState } from "react";
import { loadObservation, saveObservation, ASSET_SUGGEST, NIFTY50, BANKNIFTY, POPULAR_INDICES, POPULAR_OPTIONS, parseOptionContract, addBasket, getAssetCard, DEMO_WATCHLIST, getMultiTF } from "./GuardianData";
import GuardianAsset from "./GuardianAsset";

// BreakoutPro - Guardian.jsx (AI Market Guardian) FLAGSHIP
// ONE page: summary cards + Uptrend Observation + Downtrend Observation (full-width, stacked).
// Auto organization engine. Educational only. SEBI-safe.
// Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",CYAN="#60A5FA",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var UP_OBS=["Higher High","Above EMA","Breakout","Bullish Engulfing","Above VWAP","Strong Volume","Higher Low","EMA Support","Volume Spike","Resistance Break"];
var DOWN_OBS=["M Pattern","Below EMA","Lower High","Below VWAP","Breakdown","Below Support","Weak Volume","Lower Low","Bearish Engulfing","Support Break"];

var FILTERS=[["all","All"],["Stock","Stocks"],["Index","Indices"],["Option","Options"],["Future","Futures"]];

export default function Guardian(props){
  var init=loadObservation();
  var [watch,setWatch]=useState(init.length?init:DEMO_WATCHLIST);
  var [openAsset,setOpenAsset]=useState(null);
  var [showAdd,setShowAdd]=useState(false);
  var [query,setQuery]=useState("");
  var [filter,setFilter]=useState("all");

  function addAsset(a){
    if(watch.length>=80) return;
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return;
    var nl=watch.concat([a]); setWatch(nl); saveObservation(nl);
  }
  function addNifty50(){ var nl=addBasket(watch,NIFTY50,"Stock"); setWatch(nl); saveObservation(nl); }
  function addBankNifty(){ var nl=addBasket(watch,BANKNIFTY,"Stock"); setWatch(nl); saveObservation(nl); }
  function removeAsset(sym){ var nl=watch.filter(function(w){return w.sym!=sym;}); setWatch(nl); saveObservation(nl); }

  if(openAsset) return <GuardianAsset asset={openAsset} onBack={function(){setOpenAsset(null);}} setTab={props.setTab}/>;

  // AUTO ORGANIZATION ENGINE: classify by observed structure + quick filter.
  var filtered=watch.filter(function(a){ return filter=="all"||a.type==filter; });
  var cards=filtered.map(function(a,idx){ return {asset:a, card:getAssetCard(a), idx:idx}; });
  var uptrend=cards.filter(function(x){ return x.card.up; });
  var downtrend=cards.filter(function(x){ return !x.card.up; });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      {/* HEADER */}
      <div style={{background:BG,padding:"14px 14px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
              <span style={{fontSize:15,fontWeight:900,color:T1}}>AI Market Guardian</span>
              <span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"2px 6px",borderRadius:4}}><span style={{width:5,height:5,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
            </div>
            <div style={{fontSize:8.5,color:T2,marginTop:2}}>Your personal AI market observation engine</div>
          </div>
          <button onClick={function(){props.setTab&&props.setTab("expiryalerts");}} title="Expiry Alerts" style={{background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.35)",borderRadius:9,width:34,height:34,color:GOLD,fontSize:15,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginRight:6}}><span dangerouslySetInnerHTML={{__html:"&#128276;"}}/></button>
          <button onClick={function(){setShowAdd(true);}} title="Add Asset" style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.35)",borderRadius:9,width:34,height:34,color:BLUE,fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
        {/* QUICK FILTERS */}
        <div style={{display:"flex",gap:6,marginTop:12,overflowX:"auto",paddingBottom:2}}>
          {FILTERS.map(function(f){
            var act=filter==f[0];
            return <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:14,padding:"6px 14px",color:act?"#fff":T2,fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{f[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:14}}>
        {/* SUMMARY CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:18}}>
          <Sum k="Watching" v={filtered.length} tone="t1"/>
          <Sum k="Uptrend" v={uptrend.length} tone="up"/>
          <Sum k="Downtrend" v={downtrend.length} tone="down"/>
          <Sum k="Updated" v="Just Now" tone="blue" small={true}/>
        </div>

        {watch.length==0?(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:28,textAlign:"center"}}>
            <div style={{fontSize:30,marginBottom:10}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
            <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:5}}>No assets observed yet</div>
            <div style={{fontSize:10,color:T2,marginBottom:16}}>Tap the + button to add stocks, indices, options, or futures. The Guardian organizes them by observed structure.</div>
            <button onClick={function(){setShowAdd(true);}} style={{background:BLUE,border:"none",borderRadius:10,padding:"11px 22px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+ Add Asset</button>
          </div>
        ):(
          <div>
            {/* UPTREND OBSERVATION */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:UP,display:"inline-block",boxShadow:"0 0 8px "+UP}}></span>
                <span style={{fontSize:13,fontWeight:900,color:T1}}>Uptrend Observation</span>
                <span style={{fontSize:9,fontWeight:700,color:UP,background:"rgba(34,197,94,0.1)",padding:"2px 8px",borderRadius:10}}>{uptrend.length}</span>
              </div>
              {uptrend.length>5?<span style={{fontSize:10,fontWeight:700,color:BLUE}}>View All &#8250;</span>:null}
            </div>
            {uptrend.length?uptrend.slice(0,5).map(function(x){
              return <ObsCard key={x.asset.sym} x={x} tone="up" obs={UP_OBS} onOpen={function(){setOpenAsset(x.asset);}} onRemove={function(){removeAsset(x.asset.sym);}}/>;
            }):<Empty tone="up"/>}

            {/* DOWNTREND OBSERVATION */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11,marginTop:22}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:DOWN,display:"inline-block",boxShadow:"0 0 8px "+DOWN}}></span>
                <span style={{fontSize:13,fontWeight:900,color:T1}}>Downtrend Observation</span>
                <span style={{fontSize:9,fontWeight:700,color:DOWN,background:"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:10}}>{downtrend.length}</span>
              </div>
              {downtrend.length>5?<span style={{fontSize:10,fontWeight:700,color:BLUE}}>View All &#8250;</span>:null}
            </div>
            {downtrend.length?downtrend.slice(0,5).map(function(x){
              return <ObsCard key={x.asset.sym} x={x} tone="down" obs={DOWN_OBS} onOpen={function(){setOpenAsset(x.asset);}} onRemove={function(){removeAsset(x.asset.sym);}}/>;
            }):<Empty tone="down"/>}

            <div style={{marginTop:16}}><Disclaimer/></div>
          </div>
        )}
      </div>

      {showAdd?<AddModal watch={watch} query={query} setQuery={setQuery} onAdd={addAsset} onNifty={addNifty50} onBank={addBankNifty} onClose={function(){setShowAdd(false);setQuery("");}}/>:null}
    </div>
  );
}

// Compact full-width observation card with multi-timeframe strip.
function ObsCard(props){
  var a=props.x.asset, c=props.x.card, tone=props.tone;
  var col=tone=="up"?UP:DOWN;
  var sc=c.score>=70?UP:c.score>=50?GOLD:DOWN;
  var o1=props.obs[props.x.idx%props.obs.length];
  var o2=props.obs[(props.x.idx+3)%props.obs.length];
  var initial=a.sym.charAt(0);
  var mtf=getMultiTF(a);
  return (
    <div onClick={props.onOpen} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 12px",marginBottom:8,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        {/* logo */}
        <div style={{width:36,height:36,background:CARD2,border:"1px solid "+BD2,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:900,color:T2}}>{initial}</span>
        </div>
        {/* name + type */}
        <div style={{minWidth:0,width:"28%"}}>
          <div style={{fontSize:11.5,fontWeight:800,color:T1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.sym}</div>
          <div style={{fontSize:8,color:T3,marginTop:2}}>{a.type}</div>
        </div>
        {/* price + change */}
        <div style={{minWidth:0,flexShrink:0}}>
          <div style={{fontSize:11.5,fontWeight:800,color:T1,fontFamily:"monospace"}}>{c.price}</div>
          <div style={{fontSize:9.5,fontWeight:700,color:c.up?UP:DOWN,marginTop:2}}>{c.change}</div>
        </div>
        {/* observations */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:9.5,fontWeight:700,color:col,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o1}</div>
          <div style={{fontSize:8.5,color:T2,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o2}</div>
        </div>
        {/* score */}
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:7,color:T3}}>Score</div>
          <div style={{fontSize:15,fontWeight:900,color:sc,lineHeight:1}}>{c.score}</div>
        </div>
        <span style={{fontSize:14,color:T3,flexShrink:0}}>&#8250;</span>
      </div>
      {/* MULTI-TIMEFRAME STRIP */}
      <div style={{display:"flex",gap:5,marginTop:9,paddingTop:9,borderTop:"1px solid "+BD2,overflowX:"auto"}}>
        {mtf.map(function(m,i){
          var dc=m.dir>0?UP:m.dir<0?DOWN:T3;
          var ar=m.dir>0?"&#9650;":m.dir<0?"&#9660;":"&#9644;";
          return (
            <div key={i} style={{flexShrink:0,textAlign:"center",minWidth:m.label?38:24}}>
              <div style={{fontSize:7,color:T3,fontWeight:700}}>{m.tf}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2,marginTop:2}}>
                <span style={{fontSize:6,color:dc}} dangerouslySetInnerHTML={{__html:ar}}/>
                {m.label?<span style={{fontSize:6,color:dc,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:34}}>{m.label.split(" ")[0]}</span>:null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Empty(props){
  return (
    <div style={{background:CARD,border:"1px dashed "+BD,borderRadius:12,padding:20,textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:6,opacity:0.5}} dangerouslySetInnerHTML={{__html:props.tone=="up"?"&#128200;":"&#128201;"}}/>
      <div style={{fontSize:9,color:T3,lineHeight:1.4}}>No assets in this section now. Assets move here automatically as structure changes.</div>
    </div>
  );
}

function Sum(props){
  var col=props.tone=="up"?UP:props.tone=="down"?DOWN:props.tone=="blue"?BLUE:T1;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 5px",textAlign:"center"}}>
      <div style={{fontSize:props.small?12:19,fontWeight:900,color:col}}>{props.v}</div>
      <div style={{fontSize:7.5,color:T2,marginTop:3}}>{props.k}</div>
    </div>
  );
}

function AddModal(props){
  var watch=props.watch, query=props.query;
  var suggestions=ASSET_SUGGEST.filter(function(a){
    if(watch.filter(function(w){return w.sym==a.sym;}).length) return false;
    if(query && a.sym.toLowerCase().indexOf(query.toLowerCase())==-1) return false;
    return true;
  });
  var oc=parseOptionContract(query);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:50,display:"flex",alignItems:"flex-end"}} onClick={props.onClose}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"#0A0D12",borderTop:"1px solid "+BD,borderRadius:"18px 18px 0 0",width:"100%",maxHeight:"85vh",overflowY:"auto",padding:16,boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:14,fontWeight:900,color:T1}}>Add Asset</span>
          <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:15,cursor:"pointer"}}>&#10005;</button>
        </div>
        <input value={query} onChange={function(e){props.setQuery(e.target.value);}} placeholder="Search or type e.g. NIFTY 25000 CE" autoFocus style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:11.5,fontFamily:"inherit",marginBottom:12,outline:"none"}}/>
        {oc?<button onClick={function(){props.onAdd(oc);props.onClose();}} style={{width:"100%",boxSizing:"border-box",background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:10,padding:"12px 13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,fontWeight:800,color:BLUE}}>{oc.sym}</div><div style={{fontSize:8,color:T3}}>Option contract</div></div><span style={{fontSize:11,fontWeight:700,color:BLUE}}>+ Add</span></button>:null}

        <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>INDICES</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
          {POPULAR_INDICES.map(function(a){
            var added=watch.filter(function(w){return w.sym==a.sym;}).length>0;
            return <button key={a.sym} onClick={function(){if(!added)props.onAdd(a);}} disabled={added} style={{background:added?"rgba(34,197,94,0.1)":"rgba(79,140,255,0.1)",border:"1px solid "+(added?"rgba(34,197,94,0.3)":"rgba(79,140,255,0.3)"),borderRadius:16,padding:"7px 12px",color:added?UP:BLUE,fontSize:10,fontWeight:700,cursor:added?"default":"pointer",fontFamily:"inherit"}}>{added?"\u2713 ":"+ "}{a.sym}</button>;
          })}
        </div>

        <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>OPTIONS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
          {POPULAR_OPTIONS.map(function(a){
            var added=watch.filter(function(w){return w.sym==a.sym;}).length>0;
            return <button key={a.sym} onClick={function(){if(!added)props.onAdd(a);}} disabled={added} style={{background:added?"rgba(34,197,94,0.08)":CARD,border:"1px solid "+(added?"rgba(34,197,94,0.3)":BD),borderRadius:10,padding:"9px 5px",cursor:added?"default":"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:9.5,fontWeight:800,color:added?UP:T1}}>{a.sym.replace("NIFTY ","")}</div><div style={{fontSize:6.5,color:T3,marginTop:1}}>{a.note}</div></button>;
          })}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <button onClick={function(){props.onNifty();}} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Nifty 50</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All 50 stocks</div></button>
          <button onClick={function(){props.onBank();}} style={{background:"rgba(79,140,255,0.12)",border:"1px solid rgba(79,140,255,0.3)",borderRadius:11,padding:"11px 8px",cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:11,fontWeight:800,color:BLUE}}>+ Bank Nifty</div><div style={{fontSize:7.5,color:T3,marginTop:1}}>All banks</div></button>
        </div>

        {suggestions.length?(
          <div>
            <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>STOCKS AND MORE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {suggestions.map(function(a){
                return <button key={a.sym} onClick={function(){props.onAdd(a);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11.5,fontWeight:700,color:T1}}>{a.sym}</div><div style={{fontSize:8,color:T3}}>{a.type}</div></div><span style={{fontSize:16,color:BLUE}}>+</span></button>;
              })}
            </div>
          </div>
        ):null}
      </div>
    </div>
  );
}

function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
      <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.5}}>Educational Market Observation Only. Breakout Pro organizes observed market structure for learning purposes. It does not provide investment advice, trading recommendations or future price predictions.</div>
    </div>
  );
}
