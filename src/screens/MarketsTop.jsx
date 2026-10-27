import { useState } from "react";
import { TAGLINE, INDEX_STRIP, MOOD, FIIDII, GLOBAL } from "./MarketsTopData";
import { IndexDetailPage, VIXDetailPage, FlowDetailPage } from "./MarketsTopDetail";
import IndexFullPage from "./IndexFullPage";
import { useDensity } from "../theme/density";
import { useQuotes } from "../market/useQuotes";
import QuoteBadge from "../market/QuoteBadge";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - MarketsTop.jsx
// Premium intelligence header. Compact horizontal indices, clickable detail pages.
// Pure black, green/red only for direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Sections below still show static sample values (no verified provider for sentiment score, FII/DII or global
// markets in this project). They are labelled so they can never pass for live data.
function SampleTag(){
  var theme = useTheme();
  return <span style={{marginLeft:8,fontSize:10,fontWeight:800,color:theme.c.blue,background:theme.c.blueSoft,padding:"2px 6px",borderRadius:5,letterSpacing:0.4}}>SAMPLE DATA</span>;
}
function fmtIdx(v){ return v.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}); }

function Head(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;

  return <div style={{fontSize:12,color:T2,fontWeight:800,letterSpacing:0.6,margin:"0 0 9px"}}>{props.children}</div>;
}

export default function MarketsTop(props){
  var D = useDensity();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, CARD2 = theme.c.card2, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var [view,setView]=useState(null);
  // Live index strip: shared quote store, labelled per quote. GIFT NIFTY has no verified provider: always unavailable.
  var liveIdx = useQuotes(["NIFTY","SENSEX","BANKNIFTY","VIX"]).quotes;
  var strip = INDEX_STRIP.map(function(x){
    var q = liveIdx[x.key];
    if(!q || q.price == null) return {key:x.key,name:x.name,val:"--",chg:"",up:true,pct:null,q:null,noDir:true};
    var pct = q.changePct == null ? null : q.changePct;
    return {key:x.key,name:x.name,val:fmtIdx(q.price),chg:pct==null?"":(pct>0?"+":"")+pct.toFixed(2)+"%",up:(q.change||0)>=0,pct:pct,q:q,noDir:pct==null};
  });

  if(view&&view.type=="index") return <IndexFullPage idx={{key:view.key,label:view.label,ltp:view.val,up:view.up,pct:view.pct}} onBack={function(){setView(null);}}/>;
  if(view&&view.type=="gift")  return <IndexDetailPage idxKey="GIFT" onBack={function(){setView(null);}} onStock={props.onStock}/>;
  if(view&&view.type=="vix")   return <VIXDetailPage onBack={function(){setView(null);}}/>;
  if(view&&view.type=="flow")  return <FlowDetailPage onBack={function(){setView(null);}}/>;

  function openIdx(k){
    if(k=="VIX"){ setView({type:"vix"}); return; }
    if(k=="GIFT"){ setView({type:"gift"}); return; }
    var item=strip.filter(function(x){return x.key==k;})[0]||{};
    setView({type:"index",key:k,label:item.name,val:item.val,up:item.up,pct:item.pct});
  }

  return (
    <div style={{padding:D.on?"0 16px 0":"4px 16px 0"}}>

      {/* TAGLINE */}
      <div style={{marginBottom:D.on?8:12}}>
        <div style={{fontSize:16,fontWeight:900,color:T1}} dangerouslySetInnerHTML={{__html:TAGLINE.main}}/>
        <div style={{fontSize:12,color:T3,fontWeight:600,marginTop:4}} dangerouslySetInnerHTML={{__html:TAGLINE.sub}}/>
      </div>

      {/* INDEX STRIP - compact horizontal scroll */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:D.on?4:8,marginBottom:D.on?10:16}}>
        {strip.map(function(x){
          return (
            <div key={x.key} onClick={function(){openIdx(x.key);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:D.on?12:16,padding:"8px 12px",minWidth:108,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:12,color:T2,fontWeight:600,marginBottom:4}}>{x.name}</div>
              <div style={{fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:12,fontWeight:700,color:x.noDir?T2:(x.up?UP:DOWN),marginTop:4,minHeight:16}}>{x.chg}</div>
              <QuoteBadge quote={x.key=="GIFT" ? null : x.q} compact={true} size={10}/>
            </div>
          );
        })}
      </div>

      <div style={D.on ? {display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 380px), 1fr))",gap:D.gap,marginBottom:D.on?10:16,alignItems:"start"} : null}>
      <div style={{minWidth:0}}>
      {/* MARKET SENTIMENT */}
      <Head>MARKET SENTIMENT<SampleTag/></Head>
      <div style={{display:"flex",gap:8,marginBottom:D.on?0:16}}>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:D.on?12:16,padding:D.on?"8px 12px":12,textAlign:"center"}}>
          <div style={{fontSize:12,color:T2,marginBottom:4}}>Market Mood</div>
          <div style={{fontSize:18,fontWeight:900,color:MOOD.label=="Bullish"?UP:MOOD.label=="Bearish"?DOWN:BLUE}}>{MOOD.label}</div>
          <div style={{fontSize:12,color:T3,marginTop:4}}>Score {MOOD.score}/100</div>
        </div>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:D.on?12:16,padding:D.on?"8px 12px":12,textAlign:"center"}}>
          <div style={{fontSize:12,color:T2,marginBottom:4}}>Fear &amp; Greed</div>
          <div style={{fontSize:18,fontWeight:900,color:MOOD.fg>=55?UP:MOOD.fg<=45?DOWN:BLUE}}>{MOOD.fg}</div>
          <div style={{fontSize:12,color:T3,marginTop:4}}>{MOOD.fgLabel}</div>
        </div>
      </div>

      </div>
      {/* FII / DII - clickable to full details */}
      <div onClick={function(){setView({type:"flow"});}} style={{cursor:"pointer",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 0 9px"}}>
          <span style={{fontSize:12,color:T2,fontWeight:800,letterSpacing:0.6}}>INSTITUTIONAL FLOW  &#8226;  FII / DII<SampleTag/></span>
          <span style={{fontSize:12,color:BLUE,fontWeight:700}}>View details &#8250;</span>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:D.on?12:16,overflow:"hidden",marginBottom:D.on?0:16}}>
          {FIIDII.map(function(x,i){
            return (
              <div key={x.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:D.on?"6px 12px":"12px 12px",borderBottom:i<FIIDII.length-1?"1px solid "+BD:"none"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{x.name}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{x.note}</div>
                </div>
                <div style={{fontSize:14,fontWeight:800,color:x.up?UP:DOWN,fontFamily:"monospace"}}>{x.val}</div>
              </div>
            );
          })}
        </div>
      </div>

      </div>
      {/* GLOBAL MARKETS */}
      <Head>GLOBAL MARKETS<SampleTag/></Head>
      <div style={D.on ? {display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(92px, 1fr))",gap:8,marginBottom:8} : {display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:8}}>
        {GLOBAL.map(function(x){
          return (
            <div key={x.name} style={{background:CARD2,border:"1px solid "+BD,borderRadius:D.on?12:16,padding:"8px 12px",minWidth:D.on?0:96,flexShrink:0}}>
              <div style={{fontSize:12,color:T2,marginBottom:4}}>{x.name}</div>
              <div style={{fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:12,fontWeight:700,color:x.up?UP:DOWN,marginTop:4}}>{x.chg}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
